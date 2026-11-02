import { Router } from "express";
import {
  createStudio,
  getAllStudios,
  getStudioById,
  updateStudio,
  deleteStudio,
} from "../controllers/studio.controller.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

// Get all studios
router.get("/", getAllStudios);

// Get a single studio
router.get("/:id", getStudioById);

// Create a studio (Login required)
router.post("/", verifyAuth, createStudio);

// Update a studio (Login required)
router.patch("/:id", verifyAuth, updateStudio);

// Delete a studio (Login required)
router.delete("/:id", verifyAuth, deleteStudio);

export default router;
