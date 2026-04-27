import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const signToken = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Same as requireAuth but for normal customer-user JWTs (kind = "user")
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = auth.slice(7);
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (payload?.kind !== "user") return res.status(401).json({ error: "Invalid token" });
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
