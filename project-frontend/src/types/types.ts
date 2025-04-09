import { ObjectId } from "mongodb";

export interface UserData {
  id: ObjectId;
  type: string;
  email: string;
  firstName: string;
  lastName: string;
  totalEvents: number;
  totalHours: number;
  eventsAttended: Array<ObjectId>;
  eventsAttending: Array<ObjectId>;
}

export interface Location {
  country: string;
  city: string;
  address: string;
}

export interface EventData {
  id: ObjectId;
  title: string;
  date: Date;
  location: Location;
  startTime: string;
  endTime: string;
  registeredVolunteers: Array<ObjectId>;
  description: string;
  completed: boolean;
  completedDate: Date;
}

export type EventFunctionType = "none" | "register" | "cancel";
