import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.studio_jwt;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first.",
      });
      return;
    }

    const decoded = verifyToken(token);

    res.locals.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}
