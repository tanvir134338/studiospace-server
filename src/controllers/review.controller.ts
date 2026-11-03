import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import type { Review } from "../models/review.model.js";

// Get all reviews for a specific studio
export async function getStudioReviews(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const studioId = req.params.studioId;

    if (typeof studioId !== "string" || !ObjectId.isValid(studioId)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const db = await connectDB();

    const reviews = await db
      .collection<Review>("reviews")
      .find({ studioId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
}

// Create a new review
export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { studioId, rating, comment } = req.body;

    if (!studioId || !rating || !comment) {
      res.status(400).json({
        success: false,
        message: "Studio ID, rating and comment are required",
      });
      return;
    }

    if (typeof studioId !== "string" || !ObjectId.isValid(studioId)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
      return;
    }

    if (typeof comment !== "string" || !comment.trim()) {
      res.status(400).json({
        success: false,
        message: "Please write a valid review comment",
      });
      return;
    }

    const user = res.locals.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const db = await connectDB();

    const review: Review = {
      studioId,
      userId: user.id,
      userName: user.name || user.email || "User",
      rating,
      comment: comment.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Review>("reviews").insertOne(review);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: {
        ...review,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    next(error);
  }
}
