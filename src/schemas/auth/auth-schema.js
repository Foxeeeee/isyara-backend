import { z } from "zod";

export const registrationSchema = z.object({
  username: z
    .string()
    .min(1, "Username must be filled in")
    .min(6, "Username must be at least 6 character")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscore"
    ),
  email: z
    .string()
    .min(1, "Email must be filled in")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password must be filled in")
    .min(8, "Password must be at least 8-16 character")
    .max(16, "Password must be at least 8-16 character")
    .regex(/[0-9]/, "Password must include number")
    .regex(/[A-Z]/, "Password must include uppercase letter")
    .regex(/[@!#$%^&*]/, "Password must include special character"),
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Username or Email must be filled in")
    .min(6, "Must be valid email or username")
    .refine(
      (value) => /\S+@\S+\.\S+/.test(value) || /^[a-zA-Z0-9_]+$/.test(value),
      "Must be a valid email or username"
    ),
  password: z.string().min(1, "Password must be filled in"),
});

export const verifyOtpSchema = z.object({
  otp: z.string().min(6, "Must be a valid OTP"),
});
