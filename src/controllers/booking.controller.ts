import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import type { Booking } from "../models/booking.model.js";

// Create a new booking
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const { studioId, date, startTime, endTime, totalPrice } = req.body;

    // Validate required fields
    if (
      typeof studioId !== "string" ||
      !studioId.trim() ||
      typeof date !== "string" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      totalPrice === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      !datePattern.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
      return;
    }

    // Validate time format (HH:mm)
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking time format",
      });
      return;
    }

    // Validate booking time
    if (startTime >= endTime) {
      res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
      return;
    }

    // Validate total price
    if (
      typeof totalPrice !== "number" ||
      !Number.isFinite(totalPrice) ||
      totalPrice <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Total price must be a valid positive number",
      });
      return;
    }

    // Check for existing confirmed bookings
    const existingBooking = await db.collection<Booking>("bookings").findOne({
      studioId,
      date,
      status: "Confirmed",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      res.status(409).json({
        success: false,
        message: "This studio is already booked for the selected time",
      });
      return;
    }

    // Create booking
    const booking: Booking = {
      studioId,
      userId: res.locals.user.id,
      date,
      startTime,
      endTime,
      totalPrice,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Booking>("bookings").insertOne(booking);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: {
        _id: result.insertedId,
        ...booking,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get bookings of the logged-in user
export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const bookings = await db
      .collection<Booking>("bookings")
      .find({ userId: res.locals.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

// Cancel a booking
export async function cancelBooking(
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
        message: "Invalid booking ID",
      });
      return;
    }

    const result = await db.collection<Booking>("bookings").updateOne(
      {
        _id: new ObjectId(id),
        userId: res.locals.user.id,
        status: { $ne: "Cancelled" },
      },
      {
        $set: {
          status: "Cancelled",
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Booking not found or cannot be cancelled",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
}
