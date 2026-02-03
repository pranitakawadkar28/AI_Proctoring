import crypto from "node:crypto";
import { registerUser } from "../services/auth.service.js";
import { registerSchema } from "../validators/auth.validators.js";
import { userModel } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const registerController = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: "User registered. Please verify email.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailController = async (req, res, next) => {
  try {
    const hashToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await userModel.findOne({
      emailVerificationToken: hashToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) throw new AppError("Token invalid or expired", 400);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    next(err);
  }
};
