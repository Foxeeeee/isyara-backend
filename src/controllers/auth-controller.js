import { login, register, verifyOTP } from "../services/auth-service.js";
import { HttpException } from "../middleware/error.js"; 

export const authController = {
  register: async (req, res, next) => {
    try {
      const user = await register(req.body);

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  verifyOTP: async (req, res, next) => {
    try {
      const { userId, otp } = req.body;
      if (!userId || !otp) {
        return res.status(400).json({ message: "userId and otp are required" });
      }
      const result = await verifyOTP(userId, otp);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },  

};
