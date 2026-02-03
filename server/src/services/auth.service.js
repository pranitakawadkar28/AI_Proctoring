import { userModel } from "../models/user.model.js";
import { hashPassword } from "../utils/hash.js";
import { AppError } from "../utils/AppError.js";

export const registerUser = async ({ username, email, password, role = "student" }) => {
  username = username.trim();
  email = email.toLowerCase().trim();

  // check for existing user
  const userExist = await userModel.findOne({ $or: [{ username }, { email }] });
  if (userExist) throw new AppError("User already exists", 409);

  // hash password
  const hashedPassword = await hashPassword(password);

  // create user
  const user = await userModel.create({ username, email, password: hashedPassword, role });

  console.log(user.toJSON());
  // return safe object
  return user.toJSON();
};
