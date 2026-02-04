import express from "express";
import {
  loginController,
  refreshTokenController,
  registerController,
  resendVerificationController,
  verifyEmailController,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/user/register", registerController);
router.get("/verify-email/:token", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.post("/user/login", loginController)
router.post("/refresh-token", refreshTokenController);

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;