import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

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

export default app;
