import { Router } from "express";
import { authHandler } from "../middleware/auth/auth-middleware.js";
import { authController } from "../controllers/auth/auth-controller.js";

export const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verification-otp", authController.verifyOtp);
router.post("/resend-otp", authHandler, authController.resendOtp);

router.use(authHandler);
