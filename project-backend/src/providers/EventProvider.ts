import { Collection, MongoClient, ObjectId } from "mongodb";

export interface IEventDocument {
  _id?: ObjectId;
  title: string;
  date: Date;
  location: {
    country: string;
    city: string;
    address: string;
  };
  startTime: string;
  endTime: string;
  registeredVolunteers: Array<ObjectId>;
  description: string;
  completed?: boolean;
  completedDate?: Date;
}

export interface IEventData {
  id: string;
  title: string;
  date: Date;
  location: {
    country: string;
    city: string;
    address: string;
  };
  startTime: string;
  endTime: string;
  registeredVolunteers: Array<string>;
  description: string;
  completed?: boolean;
  completedDate?: Date;
}

export class EventProvider {
  private readonly collection: Collection<IEventDocument>;

  constructor(mongoClient: MongoClient) {
    const COLLECTION_NAME = process.env.EVENTS_COLLECTION_NAME;
    if (!COLLECTION_NAME) {
      throw new Error("Missing EVENTS_COLLECTION_NAME from env file");
    }
    this.collection = mongoClient
      .db()
      .collection<IEventDocument>(COLLECTION_NAME);
  }

  async getEventById(_id: ObjectId): Promise<IEventData | null> {
    try {
      const event = await this.collection.findOne({ _id });

      if (!event) {
        return null;
      }

      // Transform to IEventData format
      return {
        id: event._id?.toString() || "",
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
        completed: event.completed,
        completedDate: event.completedDate,
      };
    } catch (error) {
      console.error("Error fetching event data:", error);
      throw new Error("Failed to retrieve event data");
    }
  }

  async getEventsByIds(eventIds: ObjectId[]): Promise<IEventData[]> {
    try {
      if (!eventIds || eventIds.length === 0) {
        return [];
      }

      const events = await this.collection
        .find({
          _id: { $in: eventIds },
        })
        .toArray();

      // Transform to IEventData format
      return events.map((event) => ({
        id: event._id?.toString() || "",
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
        completed: event.completed,
        completedDate: event.completedDate,
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to retrieve events");
    }
  }

  async getAllEvents(): Promise<IEventData[]> {
    try {
      const events = await this.collection.find().toArray();
      // Transform to IEventData format
      return events.map((event) => ({
        id: event._id?.toString() || "",
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
        completed: event.completed,
        completedDate: event.completedDate,
      }));
    } catch (error) {
      console.error("Error fetching all events:", error);
      throw new Error("Failed to retrieve events");
    }
  }

  async registerUserForEvent(
    eventId: ObjectId,
    userId: ObjectId
  ): Promise<IEventData | null> {
    try {
      // Update the event by adding the user ID to registeredVolunteers if not already there
      const result = await this.collection.findOneAndUpdate(
        { _id: eventId },
        { $addToSet: { registeredVolunteers: userId } },
        { returnDocument: "after" }
      );

      if (!result) {
        return null;
      }

      // Transform to IEventData format
      return {
        id: result._id?.toString() || "",
        title: result.title,
        date: result.date,
        location: {
          country: result.location.country,
          city: result.location.city,
          address: result.location.address,
        },
        startTime: result.startTime,
        endTime: result.endTime,
        registeredVolunteers: result.registeredVolunteers.map((id) =>
          id.toString()
        ),
        description: result.description,
      };
    } catch (error) {
      console.error("Error registering user for event:", error);
      throw new Error("Failed to register user for event");
    }
  }

  async cancelUserRegistration(
    eventId: ObjectId,
    userId: ObjectId
  ): Promise<IEventData | null> {
    try {
      // Update the event by removing the user ID from registeredVolunteers
      const result = await this.collection.findOneAndUpdate(
        { _id: eventId },
        { $pull: { registeredVolunteers: userId } },
        { returnDocument: "after" }
      );

      if (!result) {
        return null;
      }

      // Transform to IEventData format
      return {
        id: result._id?.toString() || "",
        title: result.title,
        date: result.date,
        location: {
          country: result.location.country,
          city: result.location.city,
          address: result.location.address,
        },
        startTime: result.startTime,
        endTime: result.endTime,
        registeredVolunteers: result.registeredVolunteers.map((id) =>
          id.toString()
        ),
        description: result.description,
      };
    } catch (error) {
      console.error("Error canceling user registration:", error);
      throw new Error("Failed to cancel user registration");
    }
  }

  async createEvent(
    eventData: Omit<IEventDocument, "_id">
  ): Promise<IEventData | null> {
    try {
      const result = await this.collection.insertOne(eventData);

      if (!result.acknowledged) {
        return null;
      }

      // Get the newly created event
      const newEvent = await this.collection.findOne({
        _id: result.insertedId,
      });

      if (!newEvent) {
        return null;
      }

      // Transform to IEventData format
      return {
        id: newEvent._id?.toString() || "",
        title: newEvent.title,
        date: newEvent.date,
        location: {
          country: newEvent.location.country,
          city: newEvent.location.city,
          address: newEvent.location.address,
        },
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        registeredVolunteers: newEvent.registeredVolunteers.map((id) =>
          id.toString()
        ),
        description: newEvent.description,
        completed: false,
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  }

  async markEventAsCompleted(eventId: ObjectId): Promise<IEventData | null> {
    try {
      // Update the event to mark it as completed
      const result = await this.collection.findOneAndUpdate(
        { _id: eventId },
        {
          $set: {
            completed: true,
            completedDate: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return null;
      }

      // Transform to IEventData format
      return {
        id: result._id?.toString() || "",
        title: result.title,
        date: result.date,
        location: {
          country: result.location.country,
          city: result.location.city,
          address: result.location.address,
        },
        startTime: result.startTime,
        endTime: result.endTime,
        registeredVolunteers: result.registeredVolunteers.map((id) =>
          id.toString()
        ),
        description: result.description,
        completed: result.completed,
        completedDate: result.completedDate,
      };
    } catch (error) {
      console.error("Error marking event as completed:", error);
      throw new Error("Failed to mark event as completed");
    }
  }
}
