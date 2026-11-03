import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/booking.controller.js";

import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// JWT protected mutation
router.post("/", verifyJWT, createBooking);

// Existing authenticated routes
router.get("/my-bookings", verifyAuth, getMyBookings);
router.patch("/:id/cancel", verifyJWT, cancelBooking);

export default router;
