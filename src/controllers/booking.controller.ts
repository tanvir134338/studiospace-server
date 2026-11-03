import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

import { connectDB } from "../config/db.js";
import type { Booking } from "../models/booking.model.js";
import type { Studio } from "../models/studio.model.js";

// Create a new booking
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();

    const { studioId, date, startTime, endTime } = req.body;

    // Validate required fields
    if (
      typeof studioId !== "string" ||
      !studioId.trim() ||
      typeof date !== "string" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
      return;
    }

    // Validate Studio ID
    if (!ObjectId.isValid(studioId)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
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

    // Prevent past bookings
    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (date < todayString) {
      res.status(400).json({
        success: false,
        message: "Past dates cannot be booked",
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

    // Find studio from MongoDB
    const studio = await db.collection<Studio>("studios").findOne({
      _id: new ObjectId(studioId),
    });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });
      return;
    }

    // Validate studio hourly rate
    if (
      typeof studio.pricePerHour !== "number" ||
      !Number.isFinite(studio.pricePerHour) ||
      studio.pricePerHour <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid studio rental price",
      });
      return;
    }

    // Calculate booking duration
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const duration = (endMinutes - startMinutes) / 60;

    // Calculate rental price on the server
    const totalPrice = Number((duration * studio.pricePerHour).toFixed(2));

    // Check for existing pending or confirmed bookings
    const existingBooking = await db.collection<Booking>("bookings").findOne({
      studioId,
      date,
      status: { $in: ["Pending", "Confirmed"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    // Reject overlapping bookings
    if (existingBooking) {
      res.status(409).json({
        success: false,
        message:
          "This studio is already booked or has a pending request for the selected time.",
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

// Cancel a pending booking
export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const db = await connectDB();
    const id = req.params.id;

    // Validate booking ID
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    // Cancel only the logged-in user's pending booking
    const result = await db.collection<Booking>("bookings").updateOne(
      {
        _id: new ObjectId(id),
        userId: res.locals.user.id,
        status: "Pending",
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
        message: "Pending booking not found or cannot be cancelled",
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
