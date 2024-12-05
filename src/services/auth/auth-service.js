import { prisma } from "../../application/database.js";
import { HttpException } from "../../middleware/error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { request } from "express";
import { generator } from "../../utilities/otp/otp-generator.js";
import { sendEmail } from "../../utilities/mailer/mailer.js";
import { emailTemplate } from "../../utilities/mailer/email-template.js";

export const register = async (request) => {
  const otp = generator.otp();
  const expired = generator.expired();

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
      profile: {
        create: {
          fullname: request.fullname,
        },
      },
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
      id: createUser.id,
      email: request.email,
      type: "register",
    },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  const html = emailTemplate(request.fullname, otp, "registrasi");

  const mail = await sendEmail(request.email, "Verifikasi akun", html);

  if (!mail.success) {
    throw new HttpException(500, "Failed send OTP to email");
  }

  return {
    message: "User created successfully, check your email for verification",
    data: createUser,
    token: token,
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
  const user = await prisma.users.findFirst({
    where: {
      email: request.email,
    },
  });

  if (user.isVerifed) {
    throw new HttpException(400, "Account has been verified");
  }
  const otp = generator.otp();
  const expired = generator.expired();

  if (request.type === "register") {
    const subject = "register";
  }

  if (request.type === "forgot-password") {
    const subject = "atur ulang kata sandi";
  }

  const html = emailTemplate(request.fullname, otp, subject);

  const mail = await sendEmail(request.email, "Verifikasi akun", html);

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
      email: request.email,
    },
  });

  if (request.otp !== user.otp) {
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

  if (request.type === "register") {
    return {
      message: "Verification success",
    };
  }

  if (request.type === "forgot-password") {
    return {
      message: "Verification success. Proceed to reset password",
    };
  }
};

export const forgotPassword = async (request) => {
  const otp = generator.otp();
  const expired = generator.expired();
  const user = await prisma.users.findUnique({
    where: {
      email: request.email,
    },
  });

  if (!user) {
    throw new Error(404, "Email not found");
  }

  await prisma.users.update({
    where: {
      email: request.email,
    },
    data: {
      otp: otp,
      otp_expired_at: expired,
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      email: request.email,
      type: "forgot-password",
    },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  const html = emailTemplate(user.fullname, otp, "atur ulang kata sandi");
  const mail = await sendEmail(request.email, "Atur ulang kata sandi", html);

  if (!mail.success) {
    throw new Error(500, "Failed to sent email");
  }

  return {
    message: "OTP sent to email",
    token: token,
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
