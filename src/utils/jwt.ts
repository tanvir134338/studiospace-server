import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

// Get JWT Secret
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return secret;
}

const JWT_EXPIRES_IN: SignOptions["expiresIn"] = "1d";

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email: string;
}

// Generate JWT
export function generateToken(user: { id: string; email: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
}

// Verify JWT
export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "string" ||
    typeof decoded.email !== "string"
  ) {
    throw new Error("Invalid JWT payload");
  }

  return {
    ...decoded,
    id: decoded.id,
    email: decoded.email,
  };
}
