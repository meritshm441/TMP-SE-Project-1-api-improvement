import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getRevenues,
  getRevenueById,
  createRevenue,
} from "../controllers/revenueController.js";

const router = express.Router();

// Get all revenues (protected route)
router.get("/", verifyToken, getRevenues);

// Get a revenue by ID (protected route)
router.get("/:id", verifyToken, getRevenueById);

// Create revenues (protected route)
router.post("/", verifyToken, createRevenue);

export default router;
