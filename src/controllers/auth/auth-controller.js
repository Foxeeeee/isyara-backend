import {
  login,
  register,
  resendOtp,
  verifyOtp,
} from "../../services/auth/auth-service.js";
import {
  loginSchema,
  registrationSchema,
  verifyOtpSchema,
} from "../../schemas/auth/auth-schema.js";
import { HttpException } from "../../middleware/error.js";

export const authController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password, otp, otp_expired_at } =
        registrationSchema.parse(req.body);
      const user = await register({
        username,
        email,
        password,
        otp,
        otp_expired_at,
      });
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);
      const result = await login({ identifier, password });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  resendOtp: async (req, res, next) => {
    try {
      const result = await resendOtp(req.user);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { otp } = verifyOtpSchema.parse(req.body);
      const result = await verifyOtp({ otp });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
