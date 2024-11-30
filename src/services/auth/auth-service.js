import { prisma } from "../../application/database.js";
import { HttpException } from "../../middleware/error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { request } from "express";
import { generator } from "../../utilities/otp/otp-generator.js";
import { sendEmail } from "../../utilities/mailer/mailer.js";
import { otpTemplate } from "../../utilities/mailer/template-otp.js";
import { resetPasswordTemplate } from "../../utilities/mailer/template-reset-password.js";

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
      email: request.email,
      fullname: request.fullname,
    },
    process.env.JWT_KEY
  );

  const html = otpTemplate(request.fullname, otp);

  const mail = await sendEmail(request.email, "Verifikasi akun", html);

  if (!mail.success) {
    throw new HttpException(500, "Failed send OTP to email");
  }

  return {
    message: "User created successfully, check your email for verification",
    data: createUser,
    resend_otp: `${request.protocol}://${request.host}/resend-otp/${token}`,
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

  const html = otpTemplate(request.fullname, otp);

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
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  const link = `${request.protocol}://${request.host}/reset-password/${token}`;
  const html = resetPasswordTemplate(findEmail.fullname, link);
  const mail = await sendEmail(request.email, "Atur ulang kata sandi", html);

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
