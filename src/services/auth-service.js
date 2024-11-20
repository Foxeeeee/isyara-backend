import { prisma } from "../application/database.js";
import { HttpException } from "../middleware/error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { request } from "express";
import nodemailer from "nodemailer";

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});


export const register = async (request) => {
  const findUser = await prisma.users.findFirst({
    where: {
      username: request.username,
    },
  });

  if (findUser) {
    throw new HttpException(409, "User already exists");
  }

  const findEmail = await prisma.users.findFirst({
    where: {
      email: request.email,
    },
  });

  if (findEmail) {
    throw new HttpException(409, "Email already exists");
  }

  request.password = await hash(request.password);

  const createUser = await prisma.users.create({
    data: {
      username: request.username,
      password: request.password,
      email: request.email,
    },
    select: {
      id: true,
      email: true,
      password: true,
      created_at: true,
    },
  });

  // send otp and sistorem in database
  await generateAndSendOTP(createUser);

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

export const generateAndSendOTP = async (user) => {
  try {
    console.log("Generating OTP for user:", user.email);

    // Generate OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log("Generated OTP:", otp);

    // expiration 5 minutes
    const expiresAt = new Date(Date.now() + 300000);
    console.log("OTP expiration time:", expiresAt);

    // Save OTP in the database (as plain text)
    await prisma.otp_verifications.create({
      data: {
        userId: user.id,
        otp: otp,
        createdAt: new Date(),
        expiresAt: expiresAt,
      },
    });
    console.log("OTP saved successfully in database.");

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "Verify your email with OTP",
      html: `
        <p>Hi ${user.username},</p>
        <p>Your OTP for email verification is: <b>${otp}</b>.</p>
        <p>Please use this code to complete your registration. It will expire in 5 minutes.</p>
        <p>Thank you!</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully.");
  } catch (error) {
    console.error("Error in generateAndSendOTP:", error);
    throw new HttpException(500, "Failed to generate and send OTP");
  }
};

export const verifyOTP = async (userId, otp) => {
  console.log("Verifying OTP for userId:", userId);
  console.log("Provided OTP:", otp);

  // Cek OTP di database
  const otpRecord = await prisma.otp_verifications.findFirst({
    where: {
      userId: userId,
      otp: otp,
    },
  });

  console.log("Retrieved OTP record:", otpRecord);

  if (!otpRecord) {
    throw new HttpException(404, "No OTP record found for this user");
  }

  console.log("Stored OTP:", otpRecord.otp);
  console.log("Expiration time:", otpRecord.expiresAt);

  // Cek apakah OTP masih berlaku
  if (otpRecord.expiresAt < new Date()) {
    throw new HttpException(400, "OTP has expired");
  }

  // Validasi OTP
  if (otpRecord.otp !== otp) {
    throw new HttpException(400, "Invalid OTP");
  }

  console.log("OTP is valid, proceeding to delete the record.");

  // Delete OTP after verif success
  await prisma.otp_verifications.delete({
    where: {
      id: otpRecord.id,
    },
  });

  console.log("OTP verification successful.");
  return { message: "OTP verified successfully." };
};
