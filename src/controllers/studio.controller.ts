import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import type { Studio } from "../models/studio.model.js";

// Allowed fields that users can update
const allowedUpdateFields = [
  "name",
  "description",
  "location",
  "pricePerHour",
  "securityDeposit",
  "capacity",
  "image",
  "images",
  "amenities",
  "category",
] as const;

// Create a new studio
export async function createStudio(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const studio = {
      ...req.body,
      ownerId: res.locals.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("studios").insertOne(studio);

    res.status(201).json({
      success: true,
      message: "Studio created successfully",
      studio: {
        _id: result.insertedId,
        ...studio,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get all studios
export async function getAllStudios(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const studios = await db.collection("studios").find().toArray();

    res.status(200).json({
      success: true,
      total: studios.length,
      studios,
    });
  } catch (error) {
    next(error);
  }
}

// Get studios created by the logged-in user
export async function getMyStudios(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const studios = await db
      .collection<Studio>("studios")
      .find({ ownerId: res.locals.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: studios.length,
      studios,
    });
  } catch (error) {
    next(error);
  }
}

// Get a single studio
export async function getStudioById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();
    const id = req.params.id;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      studio,
    });
  } catch (error) {
    next(error);
  }
}

// Update a studio
export async function updateStudio(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();
    const id = req.params.id;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const updateData: Record<string, unknown> = {};

    for (const field of allowedUpdateFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
      return;
    }

    updateData.updatedAt = new Date();

    const result = await db.collection("studios").updateOne(
      {
        _id: new ObjectId(id),
        ownerId: res.locals.user.id,
      },
      {
        $set: updateData,
      },
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Studio not found or you are not the owner",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Delete a studio
export async function deleteStudio(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();
    const id = req.params.id;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const result = await db.collection("studios").deleteOne({
      _id: new ObjectId(id),
      ownerId: res.locals.user.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Studio not found or you are not the owner",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Get 6 newest studios for homepage
export async function getFeaturedStudios(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const studios = await db
      .collection<Studio>("studios")
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      total: studios.length,
      studios,
    });
  } catch (error) {
    next(error);
  }
}
