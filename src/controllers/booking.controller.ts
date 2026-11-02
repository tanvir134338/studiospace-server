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
