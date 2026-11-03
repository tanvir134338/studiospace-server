import { Router } from "express";

import {
  createStudio,
  getAllStudios,
  getMyStudios,
  getStudioById,
  updateStudio,
  deleteStudio,
  getFeaturedStudios,
} from "../controllers/studio.controller.js";

import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// Public routes
router.get("/", getAllStudios);
router.get("/featured", getFeaturedStudios);

// Authenticated routes
// Keep specific routes before dynamic :id routes
router.get("/my-listings", verifyAuth, getMyStudios);

// JWT protected mutations
router.post("/", verifyJWT, createStudio);
router.patch("/:id", verifyJWT, updateStudio);
router.delete("/:id", verifyJWT, deleteStudio);

// Dynamic route must be last
router.get("/:id", getStudioById);

export default router;
