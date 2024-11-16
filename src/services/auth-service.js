import { prisma } from "../application/database.js";
import { HttpException } from "../middleware/error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const register = async (request) => {
  const findUser = await prisma.users.findFirst({
    where: {
      username: request.username,
    },
  });

  if (findUser) {
    throw new HttpException(409, "User already exists");
  }

  request.password = await hash(request.password);

  const createUser = await prisma.users.create({
    data: {
      username: request.username,
      fullname: request.fullname,
      password: request.password,
    },
    select: {
      id: true,
      fullname: true,
      password: true,
      created_at: true,
    },
  });

  return {
    message: "User created successfully!",
    data: createUser,
  };
};

export const login = async (request) => {
  const user = await prisma.users.findUnique({
    where: {
      username: request.username,
    },
  });
  if (!user) {
    throw new HttpException(401, "Invalid credentials");
  }
  const isPasswordValid = await verify(user.password, request.password);
  if (!isPasswordValid) {
    throw new HttpException(401, "Invalid credentials");
  }
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_KEY
  );
  return {
    message: "Login successful",
    access_token: token,
  };
};
