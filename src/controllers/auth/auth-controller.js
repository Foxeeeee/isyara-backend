import {
  changePassword,
  forgotPassword,
  login,
  register,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../../services/auth/auth-service.js";
import {
  forgotPassowrdSchema,
  loginSchema,
  registrationSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../../schemas/auth/auth-schema.js";
import { HttpException } from "../../middleware/error.js";

export const authController = {
  register: async (req, res, next) => {
    try {
      const { fullname, username, email, password, otp, otp_expired_at } =
        registrationSchema.parse(req.body);
      const result = await register({
        fullname,
        username,
        email,
        password,
        otp,
        otp_expired_at,
      });
      return res.status(201).json(result);
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
      const { email, type } = req.user;
      const result = await resendOtp(email, type);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { email, type } = req.user;
      const { otp } = verifyOtpSchema.parse(req.body);
      const result = await verifyOtp({ email, otp, type });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = forgotPassowrdSchema.parse(req.body);
      const result = await forgotPassword({ email });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { email } = req.user;
      const { password } = resetPasswordSchema.parse(req.body);
      const result = await resetPassword({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { id } = req.user;
      const { oldPass, newPass } = req.body;
      const result = await changePassword({ id, oldPass, newPass });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
