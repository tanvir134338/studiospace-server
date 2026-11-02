import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./config/auth.js";
import { verifyAuth } from "./middleware/verifyAuth.js";

import studioRoutes from "./routes/studio.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// BetterAuth routes
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("StudioSpace API is running!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudioSpace server is healthy",
  });
});

// Protected test route
app.get("/api/protected", verifyAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated!",
    user: res.locals.user,
  });
});

// Studio routes
app.use("/api/studios", studioRoutes);

// Image upload routes
app.use("/api/upload", uploadRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error("Server Error:", error);

  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode =
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 600
      ? error.status
      : 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message || "Something went wrong",
  });
};

app.use(errorHandler);

export default app;
