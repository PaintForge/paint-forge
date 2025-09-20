import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user || !user.emailVerified) {
      return res.status(401).json({ message: "User not found or email not verified" });
    }

    // Update last login time
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
}

export function generateVerificationToken(): string {
  return crypto.randomUUID();
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const { sendVerificationEmail: sendEmail } = await import('./email');
  return await sendEmail(email, token);
}

export async function sendEmailChangeVerification(email: string, token: string): Promise<void> {
  const { sendVerificationEmail: sendEmail } = await import('./email');
  await sendEmail(email, token);
}
