import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === "production" 
    ? (() => { throw new Error("Please define JWT_SECRET in your production environment variables") })() 
    : "dev-secret-change-in-production"
);
const JWT_EXPIRY = "7d";

export interface JwtPayload {
  id: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
