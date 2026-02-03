import express from "express";
import {
  registerController,
  verifyEmailController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/user/register", registerController);
router.get("/verify-email/:token", verifyEmailController);

export default router;
