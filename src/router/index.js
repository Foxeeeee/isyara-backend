import { Router } from "express";
import { authMiddleware } from "../middleware/auth/auth-middleware.js";
import { authController } from "../controllers/auth/auth-controller.js";
import { profileController } from "../controllers/profile/profile-controller.js";
import { upload } from "../middleware/multer/multer-middleware.js";

export const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verification-otp", authController.verifyOtp);
router.post(
  "/resend-otp",
  authMiddleware.authHandler,
  authController.resendOtp
);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/reset-password/:token",
  authMiddleware.passHandler,
  authController.resetPassword
);
router.patch(
  "/change-password",
  authMiddleware.authHandler,
  authController.changePassword
);

router.get(
  "/get-profile",
  authMiddleware.authHandler,
  profileController.getProfile
);

router.post(
  "/upload-picture",
  upload,
  authMiddleware.authHandler,
  profileController.uploadFile
);

router.post(
  "/update-bio",
  authMiddleware.authHandler,
  profileController.updateBio
);

router.use(authMiddleware.authHandler);
router.use(authMiddleware.passHandler);
