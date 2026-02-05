import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/rbac.middleware.js";

const router = express.Router();

// Admin can create teachers/admins
router.post("/users", protect, restrictTo("admin"), );

// Teacher can create tests
router.post("/tests", protect, restrictTo("teacher"), );

// Teacher -> view results
router.get("/tests/:id/results", protect, restrictTo("teacher"), );

// Student can attempt tests
router.post("/tests/:id/attempt", protect, restrictTo("student"), );

export default router