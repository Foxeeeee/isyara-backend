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
  const expired = expiredAt();

  const findUser = await prisma.users.findFirst({
    where: {
      OR: [{ username: request.username }, { email: request.email }],
    },
  });

  if (findUser) {
    throw new HttpException(409, "User already exists");
  }

  request.password = await hash(request.password);

  const createUser = await prisma.users.create({
    data: {
      fullname: request.fullname,
      username: request.username,
      email: request.email,
      password: request.password,
      email: request.email,
      otp: otp,
      otp_expired_at: expired,
    },
    select: {
      id: true,
      fullname: true,
      username: true,
      email: true,
      password: true,
      created_at: true,
    },
  });

  const token = jwt.sign(
    {
      email: createUser.email,
      fullname: createUser.fullname,
    },
    process.env.JWT_KEY
  );

  const mail = await sendEmail(
    request.email,
    "Verification account",
    `Your OTP is: ${otp}`,
    `<h1>Welcome ${request.fullname}!</h1><p>Your OTP is: <b>${otp}</b>. It expires in 2 minutes.</p>`
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
    `<h1>Welcome ${request.fullname}!</h1><p>Your OTP is: <b>${otp}</b>. It expires in 2 minutes.</p>`
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

export const forgotPassword = async (request) => {
  const findEmail = await prisma.users.findUnique({
    where: {
      email: request.email,
    },
  });

  if (!findEmail) {
    throw new Error(404, "Email not found");
  }

  const token = jwt.sign(
    {
      email: request.email,
    },
    process.env.JWT_KEY
  );

  const link = `${request.protocol}://${request.host}/reset-password/${token}`;
  const mail = await sendEmail(
    request.email,
    "Reset Password",
    `Hello, ${findEmail.fullname}`,
    `<h1>Hello, ${findEmail.fullname}</h1><p>Here link to reset password: <b><a href="${link}">${link}</a></b></p>`
  );

  if (!mail.success) {
    throw new Error(500, "Failed to sent email");
  }

  return {
    message: "Reset password link sent to your email",
  };
};

export const resetPassword = async (request) => {
  const password = await hash(request.password);
  await prisma.users.update({
    where: {
      email: request.email,
    },
    data: {
      password: password,
    },
  });

  return {
    message: "Reset password succesfuly",
  };
};

export const changePassword = async (request) => {
  const user = await prisma.users.findFirst({
    where: {
      id: request.id,
    },
  });

  if (!user) {
    throw new HttpException(404, "User not found");
  }

  const isOldPassword = await verify(user.password, request.oldPass);
  if (!isOldPassword) {
    throw new HttpException(400, "Old password is incorrect");
  }

  const newPassword = await hash(request.newPass);

  await prisma.users.update({
    where: {
      id: user.id,
    },
    data: {
      password: newPassword,
    },
  });

  return {
    message: "Change password succesfully",
  };
};
