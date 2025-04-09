import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { UserProvider } from "../providers/UserProvider";
import { EventProvider } from "../providers/EventProvider";
import { verifyAuthToken } from "./auth";
import { ObjectId } from "mongodb";

// Register user routes
export function registerEventRoutes(
  app: express.Application,
  mongoClient: MongoClient
) {
  const userProvider = new UserProvider(mongoClient);
  const eventProvider = new EventProvider(mongoClient);

  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = await eventProvider.getAllEvents();

      // Transform to IEventData format
      const eventData = events.map((event) => ({
        id: event.id?.toString() || "",
        title: event.title,
        date: event.date,
        location: {
          country: event.location.country,
          city: event.location.city,
          address: event.location.address,
        },
        startTime: event.startTime,
        endTime: event.endTime,
        registeredVolunteers: event.registeredVolunteers.map((id) =>
          id.toString()
        ),
        description: event.description,
        completed: event.completed || false,
        completedDate: event.completedDate || null,
      }));

      res.status(200).json({
        type: "success",
        data: eventData,
      });
    } catch (error) {
      console.error("Error getting upcoming events:", error);
      res.status(500).json({
        type: "error",
        message: "Internal server error",
      });
    }
  });

  // Create event endpoint - POST /api/events
  app.post(
    "/api/events",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        // Validate required fields
        const {
          title,
          date,
          location,
          startTime,
          endTime,
          description,
          createdBy,
        } = req.body;

        // Get the authenticated user's ID from the request
        const userId = createdBy;
        if (!userId) {
          res.status(401).json({
            type: "error",
            message: "Unauthorized: User not authenticated",
          });
          return;
        }

        // Verify user is an admin
        const userObjectId = new ObjectId(userId);
        const user = await userProvider.getUserById(userObjectId);

        if (!user || user.type !== "admin") {
          res.status(403).json({
            type: "error",
            message: "Forbidden: Only admins can create events",
          });
          return;
        }

        if (
          !title ||
          !date ||
          !location ||
          !startTime ||
          !endTime ||
          !description
        ) {
          res.status(400).json({
            type: "error",
            message: "Missing required event fields",
          });
          return;
        }

        // Validate location fields
        if (!location.country || !location.city || !location.address) {
          res.status(400).json({
            type: "error",
            message: "Missing required location fields",
          });
          return;
        }

        // Create the event
        const newEvent = await eventProvider.createEvent({
          title,
          date: new Date(date),
          location: {
            country: location.country,
            city: location.city,
            address: location.address,
          },
          startTime,
          endTime,
          registeredVolunteers: [], // Start with empty array
          description,
        });

        if (!newEvent) {
          res.status(500).json({
            type: "error",
            message: "Failed to create event",
          });
          return;
        }

        res.status(201).json({
          type: "success",
          message: "Event created successfully",
          data: newEvent,
        });
        return;
      } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
        return;
      }
    }
  );

  // Get event details given id
  app.get(
    "/api/events/:id",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        const eventId = req.params.id;

        if (!eventId) {
          res.status(400).json({
            type: "error",
            message: "Missing event ID",
          });
          return;
        }

        const eventObjectId = new ObjectId(eventId);

        // Fetch the event
        const event = await eventProvider.getEventById(eventObjectId);

        if (!event) {
          res.status(404).json({
            type: "error",
            message: "Event not found",
          });
          return;
        }

        // Fetch attendee details (first and last names)
        const attendeeIds = event.registeredVolunteers.map(
          (id) => new ObjectId(id)
        );
        const attendees = await userProvider.getUsersByIds(attendeeIds);

        // Transform attendee data
        const attendeeData = attendees.map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        }));

        res.status(200).json({
          type: "success",
          data: {
            ...event,
            registeredVolunteers: attendeeData,
            completed: event.completed || false,
            completedDate: event.completedDate || null,
          },
        });
        return;
      } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
        return;
      }
    }
  );

  // Register for event endpoint
  app.post(
    "/api/events/:id/register",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        const eventId = req.params.id;
        const { userId } = req.body;

        if (!eventId || !userId) {
          res.status(400).json({
            type: "error",
            message: "Missing event ID or user ID",
          });
          return;
        }

        // Convert string IDs to ObjectId
        const eventObjectId = new ObjectId(eventId);
        const userObjectId = new ObjectId(userId);

        // Verify the user exists
        const user = await userProvider.getUserById(userObjectId);
        if (!user) {
          res.status(404).json({
            type: "error",
            message: "User not found",
          });
          return;
        }

        // Verify the event exists
        const event = await eventProvider.getEventById(eventObjectId);
        if (!event) {
          res.status(404).json({
            type: "error",
            message: "Event not found",
          });
          return;
        }

        // Check if user is already registered
        if (event.registeredVolunteers.some((id) => id.toString() === userId)) {
          res.status(400).json({
            type: "error",
            message: "User is already registered for this event",
          });
          return;
        }

        // Register the user for the event - this updates the event's registeredVolunteers list
        const updatedEvent = await eventProvider.registerUserForEvent(
          eventObjectId,
          userObjectId
        );

        if (!updatedEvent) {
          res.status(500).json({
            type: "error",
            message: "Failed to register for event",
          });
          return;
        }

        // Update the user's eventsAttending array
        const userUpdated = await userProvider.addEventToUser(
          userObjectId,
          eventObjectId
        );

        if (!userUpdated) {
          // If user update fails, roll back the event update
          await eventProvider.cancelUserRegistration(
            eventObjectId,
            userObjectId
          );

          res.status(500).json({
            type: "error",
            message: "Failed to update user's events",
          });
          return;
        }

        res.status(200).json({
          type: "success",
          message: "Successfully registered for event",
          data: updatedEvent,
        });
      } catch (error) {
        console.error("Error registering for event:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
      }
    }
  );

  // Cancel registration for event endpoint
  app.post(
    "/api/events/:id/unregister",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        const eventId = req.params.id;
        const { userId } = req.body;

        if (!eventId || !userId) {
          res.status(400).json({
            type: "error",
            message: "Missing event ID or user ID",
          });
          return;
        }

        // Convert string IDs to ObjectId
        const eventObjectId = new ObjectId(eventId);
        const userObjectId = new ObjectId(userId);

        // Verify the user exists
        const user = await userProvider.getUserById(userObjectId);
        if (!user) {
          res.status(404).json({
            type: "error",
            message: "User not found",
          });
          return;
        }

        // Verify the event exists
        const event = await eventProvider.getEventById(eventObjectId);
        if (!event) {
          res.status(404).json({
            type: "error",
            message: "Event not found",
          });
          return;
        }

        // Check if user is actually registered
        if (
          !event.registeredVolunteers.some((id) => id.toString() === userId)
        ) {
          res.status(400).json({
            type: "error",
            message: "User is not registered for this event",
          });
          return;
        }

        // Cancel the user's registration - this updates the event's registeredVolunteers list
        const updatedEvent = await eventProvider.cancelUserRegistration(
          eventObjectId,
          userObjectId
        );

        if (!updatedEvent) {
          res.status(500).json({
            type: "error",
            message: "Failed to cancel event registration",
          });
          return;
        }

        // Remove the event from the user's eventsAttending array
        const userUpdated = await userProvider.removeEventFromUser(
          userObjectId,
          eventObjectId
        );

        if (!userUpdated) {
          // If user update fails, roll back the event update
          await eventProvider.registerUserForEvent(eventObjectId, userObjectId);

          res.status(500).json({
            type: "error",
            message: "Failed to update user's events",
          });
          return;
        }

        res.status(200).json({
          type: "success",
          message: "Successfully canceled event registration",
          data: updatedEvent,
        });
      } catch (error) {
        console.error("Error canceling event registration:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
      }
    }
  );

  // Mark event as completed endpoint
  app.post(
    "/api/events/:id/complete",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      try {
        const eventId = req.params.id;

        if (!eventId) {
          res.status(400).json({
            type: "error",
            message: "Missing event ID",
          });
          return;
        }

        // Get the authenticated user from the request
        const authUser = req.body.user;

        if (!authUser || !authUser.id) {
          res.status(401).json({
            type: "error",
            message: "Unauthorized: User not authenticated",
          });
          return;
        }

        // Verify user is an admin
        const userObjectId = new ObjectId(authUser.id);
        const user = await userProvider.getUserById(userObjectId);

        if (!user || user.type !== "admin") {
          res.status(403).json({
            type: "error",
            message: "Forbidden: Only admins can mark events as completed",
          });
          return;
        }

        // Convert event ID to ObjectId
        const eventObjectId = new ObjectId(eventId);

        // Verify the event exists and get its details
        const event = await eventProvider.getEventById(eventObjectId);
        if (!event) {
          res.status(404).json({
            type: "error",
            message: "Event not found",
          });
          return;
        }

        console.log(`Event is completed:${event.completed}`);

        // Check if the event is already marked as completed
        if (event.completed) {
          res.status(400).json({
            type: "error",
            message: "Event is already marked as completed",
          });
          return;
        }

        // Calculate event duration in hours
        const calculateEventDuration = (
          startTime: string,
          endTime: string
        ): number => {
          const [startHours, startMinutes] = startTime.split(":").map(Number);
          const [endHours, endMinutes] = endTime.split(":").map(Number);

          const startTotalMinutes = startHours * 60 + startMinutes;
          const endTotalMinutes = endHours * 60 + endMinutes;

          // Calculate duration in hours (rounded to 2 decimal places)
          return parseFloat(
            ((endTotalMinutes - startTotalMinutes) / 60).toFixed(2)
          );
        };

        const eventDuration = calculateEventDuration(
          event.startTime,
          event.endTime
        );

        // Get all registered volunteers for this event
        const registeredVolunteers = event.registeredVolunteers.map(
          (id) => new ObjectId(id)
        );

        // Process each registered volunteer
        let successCount = 0;
        if (registeredVolunteers.length > 0) {
          // Implementation option 1: Individual updates (more error handling control but slower)
          for (const volunteerId of registeredVolunteers) {
            try {
              // Get current user data
              const volunteer = await userProvider.getUserById(volunteerId);

              if (volunteer) {
                // Update user's statistics and event arrays
                const updatedUser = await userProvider.updateUserStatsAndEvents(
                  volunteerId,
                  eventObjectId,
                  eventDuration
                );

                if (updatedUser) {
                  successCount++;
                }
              }
            } catch (error) {
              console.error(`Error updating volunteer ${volunteerId}:`, error);
              // Continue with other volunteers even if one fails
            }
          }
        }

        // Mark the event as completed in the events collection
        const updatedEvent = await eventProvider.markEventAsCompleted(
          eventObjectId
        );

        if (!updatedEvent) {
          res.status(500).json({
            type: "error",
            message: "Failed to mark event as completed",
          });
          return;
        }

        res.status(200).json({
          type: "success",
          message: "Event marked as completed",
          data: {
            event: updatedEvent,
            volunteersUpdated: successCount,
            totalVolunteers: registeredVolunteers.length,
          },
        });
      } catch (error) {
        console.error("Error marking event as completed:", error);
        res.status(500).json({
          type: "error",
          message: "Internal server error",
        });
      }
    }
  );
}
