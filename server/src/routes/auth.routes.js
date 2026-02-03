import express from "express";
import {
  loginController,
  registerController,
  resendVerificationController,
  verifyEmailController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/user/register", registerController);
router.get("/verify-email/:token", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.post("/user/login", loginController)

export default router;