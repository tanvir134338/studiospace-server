import { Router } from "express";
import {
  getStudioReviews,
  createReview,
} from "../controllers/review.controller.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

// Get all reviews for a specific studio
router.get("/:studioId", getStudioReviews);

// Create a new review
router.post("/", verifyAuth, createReview);

export default router;
