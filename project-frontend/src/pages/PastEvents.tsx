import { useState, useEffect } from "react";

import Event from "../components/Event";
import EventModal from "../components/EventModal";
import { EventData, UserData } from "../types/types";
import { Upload } from "lucide-react";

type PastEventsProps = {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  authToken: any;
};

function PastEvents({ userData, setUserData, authToken }: PastEventsProps) {
  const [pastEvents, setPastEvents] = useState<Array<EventData>>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const safeUserData = userData as UserData;

  useEffect(() => {
    // Fetch past events
    const fetchPastEvents = async () => {
      setLoading(true);
      try {
        // Get the user ID from userData
        const safeUserData = userData as UserData;
        const userId = safeUserData?.id;

        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        // Fetch past events
        const response = await fetch(`/api/user/${userId}/events/past`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.type === "success") {
          // Convert string dates to Date objects
          const eventsWithDates = data.data.map((event: any) => ({
            ...event,
            date: new Date(event.date),
          }));

          // Sort events from most recent to oldest
          const sortedEvents = eventsWithDates.sort(
            (a: EventData, b: EventData) => b.date.getTime() - a.date.getTime()
          );

          setPastEvents(sortedEvents);
        } else {
          console.error("Failed to fetch past events:", data.message);
        }
      } catch (error) {
        console.error("Error fetching past events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [userData, authToken]);

  // Group events by month and year
  const groupEventsByMonth = () => {
    const groupedEvents: Record<string, EventData[]> = {};

    pastEvents.forEach((event) => {
      const monthYear = event.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!groupedEvents[monthYear]) {
        groupedEvents[monthYear] = [];
      }

      groupedEvents[monthYear].push(event);
    });

    return groupedEvents;
  };

  const groupedEvents = groupEventsByMonth();

  return (
    <>
      <div className="bg-primary min-h-screen">
        <div className="flex flex-col items-center px-4">
          <h1 className="mt-8 mb-6 text-4xl text-dark-text font-semibold">
            Past Events
          </h1>

          {/* Loading State */}
          {loading && <p className="text-dark-text">Events Loading...</p>}

          {/* No past events */}
          {!loading && pastEvents.length === 0 && (
            <div className="flex justify-center">
              <p className="text-dark-text">No past events found</p>
            </div>
          )}

          {/* Display events grouped by month */}
          <div className="flex flex-col gap-6 max-w-2xl w-full mb-16">
            {Object.entries(groupedEvents).map(([monthYear, events]) => (
              <div key={monthYear} className="w-full">
                <h2 className="text-2xl text-dark-text font-medium mb-3">
                  {monthYear}
                </h2>
                <div className="flex flex-col gap-4">
                  {events.map((event) => (
                    <Event
                      key={event.id.toString()}
                      event={event}
                      setSelectedEvent={setSelectedEvent}
                      eventFunction="none"
                      setEventFunction={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          eventFunction="none"
          setEventFunction={() => {}}
          userEvents={pastEvents}
          setUserEvents={setPastEvents}
          userData={safeUserData}
          setUserData={setUserData}
          authToken={authToken}
          isAdmin={false}
        />
      )}
    </>
  );
}

export default PastEvents;
