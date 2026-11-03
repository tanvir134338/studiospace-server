import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../config/auth.js";
import { generateToken } from "../utils/jwt.js";

// Cookie options for production and development
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// Generate JWT
export async function issueJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
      return;
    }

    const token = generateToken({
      id: session.user.id,
      email: session.user.email,
    });

    res.cookie("studio_jwt", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "JWT issued successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Clear JWT Cookie
export function clearJWT(req: Request, res: Response) {
  res.clearCookie("studio_jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "JWT cookie cleared successfully",
  });
}
