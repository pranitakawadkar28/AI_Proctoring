import crypto from "node:crypto";
import { userModel } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateEmailToken } from "../utils/token.js";
import { FRONTEND_URL } from "../config/env.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

const EMAIL_TOKEN_EXPIRY = 10 * 60 * 1000;

export const registerService = async ({ username, email, password, role }) => {
  username = username.trim();
  email = email.toLowerCase().trim();

  const userExist = await userModel.findOne({ $or: [{ username }, { email }] });
  if (userExist) throw new AppError("USER_ALREADY_EXISTS", 409);

  const hashedPassword = await hashPassword(password);

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  await sendVerification(user);

  return user;
};

export const resendVerificationService = async (email) => {
  email = email.toLowerCase().trim();

  const user = await userModel.findOne({ email });
  console.log("USER FOUND:", user);

  if (!user) throw new AppError("USER_NOT_FOUND", 404);
  if (user.isEmailVerified) throw new AppError("EMAIL_ALREADY_VERIFIED", 400);

  await sendVerification(user);

  return true;
};

export const verifyEmailService = async (token) => {
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel.findOne({
    emailVerificationToken: hashToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError("TOKEN_INVALID_OR_EXPIRED", 400);

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  return true;
};

const sendVerification = async (user) => {
  const { token, hashToken } = generateEmailToken();

  user.emailVerificationToken = hashToken;
  user.emailVerificationExpires = Date.now() + EMAIL_TOKEN_EXPIRY;

  await user.save();

  const verifyURL = `${FRONTEND_URL}/verify-email/${token}`;
  console.log("verify URL ---->", verifyURL);

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `<a href="${verifyURL}">Verify Account</a>`,
  });
};

export const loginService = async ({ email, password }) => {
  email = email.toLowerCase().trim();

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) throw new AppError("INVALID_CREDENTIALS", 401);

  if (!user.isEmailVerified)
    throw new AppError("EMAIL_NOT_VERIFIED", 403);

  const isMatched = await comparePassword(password, user.password);

  if (!isMatched) throw new AppError("INVALID_CREDENTIALS", 401);


  const payload = {
    userId: user._id,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
   const refreshToken = generateRefreshToken(payload);

   // store refresh in DB
  user.refreshToken = refreshToken;
  await user.save();

  user.password = undefined;

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (token) => {
  if (!token) throw new AppError("UNAUTHORIZED", 401);

  const decoded = verifyRefreshToken(token);

  const user = await userModel
    .findById(decoded.userId)
    .select("+refreshToken");

  if (!user || user.refreshToken !== token)
    throw new AppError("FORBIDDEN", 403);

  const newAccessToken = generateAccessToken({
    userId: user._id,
    role: user.role,
  });

  return newAccessToken;
};

export const forgotPasswordService = async (email) => {
  const user = await userModel.findOne({ email });

  if(!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex")

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`

  await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: `<p>Reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  });
}

export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
  throw new AppError("Invalid or expired reset token", 400);
}

// Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);


  user.password = hashedPassword;

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // LOGOUT ALL DEVICES
  user.refreshToken = undefined;

  await user.save();
}