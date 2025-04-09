import { useState } from "react";
import { EventData, EventFunctionType, UserData } from "../types/types";
import EventAttendeesModal from "./EventAttendeesModal";

type EventModalProps = {
  event: EventData;
  setSelectedEvent: (event: EventData | null) => void;
  eventFunction: EventFunctionType;
  setEventFunction: (func: EventFunctionType) => void;
  userEvents: Array<EventData>;
  setUserEvents: (events: Array<EventData>) => void;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  authToken: string;
  isAdmin: boolean;
  events?: Array<EventData>;
  setEvents?: React.Dispatch<React.SetStateAction<EventData[]>>;
};

function EventModal({
  event,
  setSelectedEvent,
  eventFunction,
  setEventFunction,
  userEvents,
  setUserEvents,
  userData,
  setUserData,
  authToken,
  isAdmin,
  events,
  setEvents,
}: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] =
    useState<boolean>(false);

  const eventIsCompleted = event.completed;
  console.log(event);

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedEvent(null);
    }
    setEventFunction("none");
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userData?.id) {
      setError("You must be logged in to register for events");
      return;
    }

    // Check if already registered locally to prevent unnecessary API calls
    if (userData.eventsAttending?.some((eventId) => eventId === event.id)) {
      console.log(`Already registered for ${event.title}`);
      handleClose(e);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Call API to register user for the event
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ userId: userData.id }),
      });

      const data = await response.json();

      if (data.type === "success") {
        setUserEvents([...userEvents, event]);

        // Update userData.eventsAttending
        const updatedEventsAttending = userData.eventsAttending
          ? [...userData.eventsAttending, event.id]
          : [event.id];

        setUserData({
          ...userData,
          eventsAttending: updatedEventsAttending,
        });

        console.log(`Successfully registered for ${event.title}`);
        handleClose(e);
      } else {
        setError(data.message || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userData?.id) {
      setError("You must be logged in to cancel event registration");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${event.id}/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ userId: userData.id }),
      });

      const data = await response.json();

      if (data.type === "success") {
        // Update local state
        setUserEvents(
          userEvents.filter((userEvent) => userEvent.id !== event.id)
        );
        setSelectedEvent(data.event);

        // Update userData.eventsAttending
        const updatedEventsAttending = userData.eventsAttending
          ? userData.eventsAttending.filter((eventId) => eventId !== event.id)
          : [];

        setUserData({
          ...userData,
          eventsAttending: updatedEventsAttending,
        });

        console.log(`Successfully canceled registration for ${event.title}`);
        handleClose(e);
      } else {
        setError(data.message || "Failed to cancel event registration");
      }
    } catch (error) {
      console.error("Error canceling event registration:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate event duration in hours
  const calculateEventDuration = (): number => {
    if (!event.startTime || !event.endTime) return 0;

    const [startHours, startMinutes] = event.startTime.split(":").map(Number);
    const [endHours, endMinutes] = event.endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Calculate duration in hours (rounded to 2 decimal places)
    return parseFloat(((endTotalMinutes - startTotalMinutes) / 60).toFixed(2));
  };

  const handleMarkAsCompleted = async (e: React.MouseEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${event.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ user: userData }),
      });

      const data = await response.json();
      console.log(data);

      if (data.type === "success") {
        const updatedEvent = { ...event, completed: true };
        const updatedEvents =
          events?.map((e) => (e.id === event.id ? updatedEvent : e)) || [];

        setEvents && setEvents(updatedEvents);

        setTimeout(() => {
          handleClose(e);
        }, 2000);
      } else {
        setError(data.message || "Failed to mark event as completed");
      }
    } catch (error) {
      console.error("Error marking event as completed:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 bg-gray-500/70 flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div className="bg-secondary rounded-xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={() => setSelectedEvent(null)}
          className="absolute top-4 right-4 text-dark-text hover:text-gray-700"
        >
          ✖
        </button>

        {/* Event Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <h2 className="text-3xl font-semibold text-dark-text mb-4">
            {event.title}
          </h2>
          <h3 className="text-2xl font-medium mb-2 text-dark-text">Date</h3>
          <p className="text-dark-text">{event.date.toDateString()}</p>

          <h3 className="text-2xl font-medium mb-2 text-dark-text">Location</h3>
          <p className="text-dark-text">{event.location.city}</p>

          <h3 className="text-2xl font-medium mb-2 text-dark-text">
            Description
          </h3>
          <p className="text-dark-text">{event.description}</p>

          {/* Error message display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded w-full">
              <p>{error}</p>
            </div>
          )}

          {/* Register Button */}
          {eventFunction === "register" && !eventIsCompleted && (
            <button
              className="bg-background-dark text-light-text px-6 py-3 rounded-md w-full mt-4"
              onClick={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Register for Event"}
            </button>
          )}

          {/* Cancel Button */}
          {eventFunction === "cancel" && (
            <button
              className="bg-background-dark text-light-text px-6 py-3 rounded-md w-full mt-4"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Cancel Registration"}
            </button>
          )}

          {/* View Attendees Button (Admin Only) */}
          {isAdmin && (
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-md w-full mt-4"
              onClick={() => setIsAttendeesModalOpen(true)}
            >
              View Attendees
            </button>
          )}

          {/* Mark as Completed Button (Admin Only) */}
          {isAdmin && !eventIsCompleted && (
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-md w-full mt-4"
              onClick={handleMarkAsCompleted}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Mark Event as Completed"}
            </button>
          )}
        </div>
      </div>
      {isAttendeesModalOpen && (
        <EventAttendeesModal
          eventId={event.id}
          onClose={() => setIsAttendeesModalOpen(false)}
          authToken={authToken}
        />
      )}
    </div>
  );
}

export default EventModal;
