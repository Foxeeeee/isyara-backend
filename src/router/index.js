import { Router } from "express";
import { authHandler } from "../middleware/auth-middleware.js";
import { authController } from "../controllers/auth-controller.js";

export const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authHandler);
