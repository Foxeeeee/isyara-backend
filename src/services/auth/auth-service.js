import { prisma } from "../../application/database.js";
import { HttpException } from "../../middleware/error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { request } from "express";
import { generatorOtp, expiredAt } from "../../utilities/otp/otp-generator.js";
import { sendEmail } from "../../utilities/mailer/mailer.js";

export const register = async (request) => {
  const otp = generatorOtp();
  const expiredOtp = expiredAt();

  const findUser = await prisma.users.findUnique({
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
      email: request.email,
      password: request.password,
      email: request.email,
      otp: otp,
      otp_expired_at: expiredOtp,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      created_at: true,
    },
  });

  const token = jwt.sign(
    {
      email: createUser.email,
    },
    process.env.JWT_KEY
  );

  const mail = await sendEmail(
    request.email,
    "Verification account",
    `Your OTP is: ${otp}`,
    `<h1>Welcome ${request.email}!</h1><p>Your OTP is: <b>${otp}</b>. It expires in 15 minutes.</p>`
  );

  if (!mail.success) {
    throw new HttpException(500, "Failed send OTP to email");
  }

  return {
    message: "User created successfully, check your email for verification",
    data: createUser,
    temporary_token: token,
  };
};

export const login = async (request) => {
  const user = await prisma.users.findFirst({
    where: {
      OR: [{ email: request.identifier }, { username: request.identifier }],
    },
  });

  if (!user) {
    throw new HttpException(401, "Invalid credentials");
  }

  if (!user.isVerifed) {
    throw new HttpException(403, "Account not verified");
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

export const resendOtp = async (request) => {
  const otp = generatorOtp();
  const expired = expiredAt();

  const mail = await sendEmail(
    request.email,
    "Verification account",
    `Your OTP is: ${otp}`,
    `<h1>Welcome ${request.email}!</h1><p>Your OTP is: <b>${otp}</b>. It expires in 15 minutes.</p>`
  );

  if (!mail.success) {
    throw new HttpException(500, "Failed send OTP to email");
  }

  await prisma.users.update({
    where: { email: request.email },
    data: {
      otp: otp,
      otp_expired_at: expired,
    },
  });

  return {
    message: "OTP sent successfully, check your email for verification",
  };
};

export const verifyOtp = async (request) => {
  const user = await prisma.users.findFirst({
    where: {
      otp: request.otp,
    },
  });

  if (!user) {
    throw new HttpException(400, "Invalid OTP");
  }

  if (new Date() > user.otp_expired_at) {
    throw new HttpException(400, "OTP has expired");
  }

  await prisma.users.update({
    where: {
      id: user.id,
    },
    data: {
      isVerifed: true,
      otp: null,
      otp_expired_at: null,
    },
  });

  return {
    message: "Verification success",
  };
};
