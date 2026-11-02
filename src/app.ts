import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { verifyAuth } from "./middleware/verifyAuth.js";
import studioRoutes from "./routes/studio.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

app.use(cors());

// BetterAuth routes
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("StudioSpace API is running!");
});

// Health check route
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

export default app;
