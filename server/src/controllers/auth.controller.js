import { NODE_ENV } from "../config/env.js";
import {
  forgotPasswordService,
  loginService,
  refreshTokenService,
  registerService,
  resendVerificationService,
  resetPasswordService,
  verifyEmailService,
  logoutService,
} from "../services/auth.service.js";

import { loginSchema, registerSchema } from "../validators/auth.validators.js";

export const registerController = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerService(data);

    console.log("USER REGISTERED", user);

    res.status(201).json({
      success: true,
      message: "User registered. Verify email.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailController = async (req, res, next) => {
  try {
    await verifyEmailService(req.params.token);

    res.status(200).json({
      success: true,
      message: "Email verified",
    });
  } catch (err) {
    next(err);
  }
};

export const resendVerificationController = async (req, res, next) => {
  try {
    await resendVerificationService(req.body.email);

    res.status(200).json({
      success: true,
      message: "Verification email resent",
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await loginService(data);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "none",
      maxAge: 2 * 60 * 1000,
    });

    console.log("User logged in:", user.email);

    res.json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    const accessToken = await refreshTokenService(token);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "none",
      maxAge: 2 * 60 * 1000,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    await forgotPasswordService(req.body.email);

    res.json({
      success: true,
      message: "If account exists, reset link sent",
    })
  } catch (err) {
    next(err); 
  }
}

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    await resetPasswordService(token, password);

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Password reset successful. Please login again.",
    });
  } catch (err) {
    next(err);   
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await logoutService(refreshToken);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error)
  }
};
