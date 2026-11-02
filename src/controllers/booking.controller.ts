import type { Request, Response, NextFunction } from "express";
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
      !studioId ||
      !date ||
      !startTime ||
      !endTime ||
      totalPrice === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "All booking fields are required",
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
