import express, { NextFunction, Request, Response } from "express";
import { MongoClient } from "mongodb";
import { CredentialsProvider } from "../providers/CredentialsProvider";
import jwt from "jsonwebtoken";
import { UserProvider } from "../providers/UserProvider";

// Middleware to verify JWT token
export function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const signatureKey = process.env.JWT_SECRET;
  if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
  }

  const authHeader = req.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    res.status(401).json({ type: "error", message: "No token provided" });
  } else {
    jwt.verify(token, signatureKey, (error, decoded) => {
      if (error) {
        res
          .status(403)
          .json({ type: "error", message: "Invalid or expired token" });
      } else {
        next(); // Proceed to the next middleware or route handler
      }
    });
  }
}

// Helper function to generate JWT token
function generateAuthToken(email: string): Promise<string> {
  const signatureKey = process.env.JWT_SECRET;
  if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
  }

  return new Promise<string>((resolve, reject) => {
    jwt.sign({ email }, signatureKey, { expiresIn: "1d" }, (error, token) => {
      if (error) reject(error);
      else resolve(token as string);
    });
  });
}

// Helper function to validate request body
function validateRequestBody(req: Request, res: Response, fields: string[]) {
  for (const field of fields) {
    if (!req.body[field]) {
      res.status(400).json({
        type: "error",
        message: `Missing required field: ${field}`,
      });
      return false;
    }
  }
  return true;
}

// Register authentication routes
export function registerAuthRoutes(
  app: express.Application,
  mongoClient: MongoClient
) {
  const credentialsProvider = new CredentialsProvider(mongoClient);
  const userProvider = new UserProvider(mongoClient);

  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    // Validate request body
    if (
      !validateRequestBody(req, res, [
        "email",
        "password",
        "firstName",
        "lastName",
      ])
    ) {
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      // Register the user
      const success = await credentialsProvider.registerUser(
        email,
        password,
        firstName,
        lastName
      );
      if (!success) {
        res.status(400).json({
          type: "error",
          message: "Email already taken. Please choose a different email.",
        });
        return;
      }

      // Generate and return a JWT token
      const token = await generateAuthToken(email);
      res.status(200).json({
        type: "success",
        message: "User registered successfully",
        data: { token },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        type: "error",
        message: "Internal server error during registration",
      });
    }
  });

  // Login an existing user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    // Validate request body
    if (!validateRequestBody(req, res, ["email", "password"])) {
      return;
    }

    const { email, password } = req.body;

    try {
      // Verify user credentials
      const success = await credentialsProvider.verifyPassword(email, password);
      if (!success) {
        res.status(401).json({
          type: "error",
          message: "Incorrect email or password",
        });
        return;
      }

      // Fetch user data from MongoDB
      const userData = await userProvider.getUserByEmail(email);
      if (!userData) {
        res.status(500).json({
          type: "error",
          message: "User authenticated but data retrieval failed",
        });
        return;
      }

      // Generate and return a JWT token
      const token = await generateAuthToken(email);
      res.status(200).json({
        type: "success",
        message: "Login successful",
        token,
        user: userData,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        type: "error",
        message: "Internal server error during login",
      });
    }
  });
}
