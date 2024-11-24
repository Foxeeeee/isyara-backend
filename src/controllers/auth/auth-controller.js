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
      const user = await register({
        fullname,
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

  forgotPassword: async (req, res, next) => {
    try {
      const host = req.headers.host;
      const protocol = req.protocol;
      const { email } = forgotPassowrdSchema.parse(req.body);
      const result = await forgotPassword({ email, host, protocol });
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
      console.log(id);
      console.log(oldPass);
      const result = await changePassword({ id, oldPass, newPass });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
