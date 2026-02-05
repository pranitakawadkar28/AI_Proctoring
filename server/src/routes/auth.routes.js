import express from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerificationController,
  resetPasswordController,
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
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/logout", logoutController);



export default router;