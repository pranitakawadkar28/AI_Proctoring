import { registerSchema } from "../validators/auth.validators.js";
import { registerUser } from "../services/auth.service.js";

export const registerController = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error); 
  }
};
