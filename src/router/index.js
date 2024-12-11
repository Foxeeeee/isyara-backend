import { Router } from "express";
import { authMiddleware } from "../middleware/auth/auth-middleware.js";
import { authController } from "../controllers/auth/auth-controller.js";
import { profileController } from "../controllers/profile/profile-controller.js";
import { upload } from "../middleware/multer/multer-middleware.js";
import { handleFeedback, historiesFeedback } from '../controllers/feedback/feedback-handler.js';

export const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post(
  "/verification-otp/:token",
  authMiddleware.paramHandler,
  authController.verifyOtp
);
router.post(
  "/resend-otp/:token",
  authMiddleware.paramHandler,
  authController.resendOtp
);

router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/reset-password/:token",
  authMiddleware.paramHandler,
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
  "/edit-profile",
  upload,
  authMiddleware.authHandler,
  profileController.editProfile
);

router.post('/feedback', handleFeedback);

router.get('/feedback/histories', historiesFeedback);

router.use(authMiddleware.authHandler);
router.use(authMiddleware.paramHandler);
