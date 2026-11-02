import { Router } from "express";
import {
  createBooking,
  getMyBookings,
} from "../controllers/booking.controller.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

// Create a booking (Login required)
router.post("/", verifyAuth, createBooking);

// Get my bookings (Login required)
router.get("/my-bookings", verifyAuth, getMyBookings);

export default router;
