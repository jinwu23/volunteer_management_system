import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      type: "error",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(400).json({
      type: "error",
      message: "Invalid token.",
    });
  }
}
