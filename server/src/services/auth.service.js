import { userModel } from "../models/user.model.js";
import { hashPassword } from "../utils/hash.js";
import { AppError } from "../utils/AppError.js";
import { generateEmailToken } from "../utils/token.js";
import { FRONTEND_URL } from "../config/env.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerUser = async ({ username, email, password, role = "student" }) => {

  username = username.trim();
  email = email.toLowerCase().trim();

  const userExist = await userModel.findOne({ $or: [{ username }, { email }] });
  if (userExist) throw new AppError("User already exists", 409);

  const hashedPassword = await hashPassword(password);

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  const { token, hashToken } = generateEmailToken();

  user.emailVerificationToken = hashToken;
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const verifyURL = `${FRONTEND_URL}/verify-email/${token}`;

  console.log("VERIFY LINK 👉", verifyURL);

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `
      <h3>Verify your account</h3>
      <a href="${verifyURL}">Click here</a>
    `,
  });

  return user.toJSON();
};
