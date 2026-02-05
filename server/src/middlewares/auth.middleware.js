import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { userModel } from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies); 
    let token;

    // cookie
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // header
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new AppError("UNAUTHORIZED", 401);

    // verify jwt
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // find user
    const user = await userModel.findById(decoded.userId);

    if (!user) throw new AppError("USER_NOT_FOUND", 401);

    req.user = user;

    next();
  } catch (err) {
     // Handle expired token cleanly
    if (err.name === "TokenExpiredError") {
      return next(new AppError("ACCESS_TOKEN_EXPIRED", 401));
    }
    next(err);
  }
};
