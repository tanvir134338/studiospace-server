import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

export async function verifyAuth(
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
        message: "Unauthorized access. Please login first.",
      });
      return;
    }

    res.locals.user = session.user;
    res.locals.session = session.session;

    next();
  } catch (error) {
    next(error);
  }
}
