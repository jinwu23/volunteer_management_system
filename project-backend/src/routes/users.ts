import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { IUserData, UserProvider } from "../providers/UserProvider";
import { EventProvider } from "../providers/EventProvider";
import { verifyAuthToken } from "./auth";
import { ObjectId } from "mongodb";

// Register user routes
export function registerUserRoutes(
  app: express.Application,
  mongoClient: MongoClient
) {
  const userProvider = new UserProvider(mongoClient);
  const eventProvider = new EventProvider(mongoClient);

  // Update user information endpoint
  app.post(
    "/api/user/edit",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      const { id, email, firstName, lastName } = req.body;

      // Validate input
      if (!id || !email || !firstName || !lastName) {
        res.status(400).json({
          type: "error",
          message: "Missing required fields: id, email, firstName, lastName",
        });
        return;
      }

      try {
        const userId = new ObjectId(id);
        const updates = { email, firstName, lastName };

        // Update user information
        const updatedUser = await userProvider.updateUserInfo(userId, updates);

        if (!updatedUser) {
          res.status(404).json({
            type: "error",
            message: "User not found",
          });
          return;
        }

        res.status(200).json({
          type: "success",
          message: "User information updated successfully",
          data: updatedUser,
        });
      } catch (error) {
        console.error("Error updating user information:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
      }
    }
  );

  // Get users attending events
  app.get(
    "/api/user/:id/events/attending",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        const userId = new ObjectId(req.params.id);

        // Get the events the user is attending
        const events = await userProvider.getUserEventsAttending(
          userId,
          eventProvider
        );

        res.status(200).json({
          type: "success",
          data: events,
        });
      } catch (error) {
        console.error("Error fetching user's attending events:", error);
        res.status(500).json({
          type: "error",
          message: "Failed to retrieve user's attending events",
        });
      }
    }
  );

  // Get users events attended
  app.get(
    "/api/user/:userId/events/past",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        const userId = req.params.userId;

        if (!userId) {
          res.status(400).json({
            type: "error",
            message: "User ID is required",
          });
        }

        // Get all events the user has attended
        const user = await userProvider.getUserById(new ObjectId(userId));

        if (!user) {
          res.status(404).json({
            type: "error",
            message: "User not found",
          });
        }

        // Get event IDs from user's attended events
        const attendedEventIds = (user as IUserData).eventsAttended || [];

        // Get event details for each attended event
        const eventIds = attendedEventIds.map((id) => new ObjectId(id));
        let events = await eventProvider.getEventsByIds(eventIds);

        // Filter for past events (date is before current date)
        const now = new Date();
        events = events.filter((event) => new Date(event.date) < now);

        res.status(200).json({
          type: "success",
          data: events,
        });
      } catch (error) {
        console.error("Error getting past events:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
      }
    }
  );
}
