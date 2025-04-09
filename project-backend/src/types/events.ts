import { ObjectId } from "mongodb";

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
  commpletedAt: Date;
}
