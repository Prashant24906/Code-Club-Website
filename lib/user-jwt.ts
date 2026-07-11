import jwt from "jsonwebtoken";

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || (
  process.env.NODE_ENV === "production" 
    ? (() => { throw new Error("Please define USER_JWT_SECRET in your production environment variables") })() 
    : "user-dev-secret-change-in-production"
);
const USER_JWT_EXPIRY = "7d";

export interface UserJwtPayload {
  id: string;
  email: string;
  username: string;
}

export function signUserToken(payload: UserJwtPayload): string {
  return jwt.sign(payload, USER_JWT_SECRET, { expiresIn: USER_JWT_EXPIRY });
}

export function verifyUserToken(token: string): UserJwtPayload | null {
  try {
    return jwt.verify(token, USER_JWT_SECRET) as UserJwtPayload;
  } catch {
    return null;
  }
}
