import { Router } from "express";
import { middleware } from "../middleware/auth/auth-middleware.js";
import { authController } from "../controllers/auth/auth-controller.js";

export const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verification-otp", authController.verifyOtp);
router.post("/resend-otp", middleware.authHandler, authController.resendOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/reset-password/:token",
  middleware.passHandler,
  authController.resetPassword
);
router.post(
  "/change-password",
  middleware.authHandler,
  authController.changePassword
);

router.use(middleware.authHandler);
router.use(middleware.passHandler);
