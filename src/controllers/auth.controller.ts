import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../config/auth.js";
import { generateToken } from "../utils/jwt.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
} as const;

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

    res.cookie("studio_jwt", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

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
  res.clearCookie("studio_jwt", cookieOptions);

  res.status(200).json({
    success: true,
    message: "JWT cookie cleared successfully",
  });
}
