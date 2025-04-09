import { useState, useEffect } from "react";
import { ObjectId } from "mongodb";

interface EventAttendeesModalProps {
  eventId: ObjectId;
  onClose: () => void;
  authToken: string;
}

interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
}

function EventAttendeesModal({
  eventId,
  onClose,
  authToken,
}: EventAttendeesModalProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const responseData = await response.json();

        if (responseData.type === "success") {
          // Based on your API response structure, attendees are in registeredVolunteers
          setAttendees(responseData.data.registeredVolunteers || []);
          setEventTitle(responseData.data.title || "Event");
        } else {
          setError(responseData.message || "Failed to fetch attendees");
        }
      } catch (error) {
        console.error("Error fetching attendees:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchAttendees();
    }
  }, [eventId, authToken]);

  return (
    <div className="fixed inset-0 z-20 bg-background-dark bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-secondary rounded-xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-text hover:text-gray-700"
        >
          ✖
        </button>

        {/* Attendees List */}
        <h2 className="text-2xl font-semibold text-dark-text mb-4">
          {eventTitle} - Attendees
        </h2>

        {loading && <p className="text-dark-text">Loading attendees...</p>}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && attendees.length > 0 ? (
          <ul className="space-y-2">
            {attendees.map((attendee) => (
              <li
                key={attendee.id}
                className="text-dark-text p-2 bg-gray-100 rounded-md"
              >
                {attendee.firstName} {attendee.lastName}
              </li>
            ))}
          </ul>
        ) : (
          !loading &&
          !error && (
            <p className="text-dark-text">No attendees registered yet.</p>
          )
        )}

        <div className="mt-4 text-sm text-gray-500">
          Total attendees: {attendees.length}
        </div>
      </div>
    </div>
  );
}

export default EventAttendeesModal;
