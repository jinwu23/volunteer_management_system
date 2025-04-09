import { EventFunctionType, EventData } from "../types/types";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEffect } from "react";

type CalendarProps = {
  events: EventData[];
  setSelectedEvent: (event: EventData | null) => void;
  setEventFunction: (func: EventFunctionType) => void;
};

export default function Calendar({
  events,
  setSelectedEvent,
  setEventFunction,
}: CalendarProps) {
  const formattedEvents = events.map((event) => ({
    title: event.title,
    start: event.date,
    allDay: true,
    extendedProps: {
      location: event.location.city,
      description: event.description,
      originalId: event.id,
    },
  }));

  useEffect(() => {
    // Apply styles to month text and dates
    const style = document.createElement("style");
    style.innerHTML = `
      .fc .fc-toolbar-title {
        color: var(--color-dark-text);
      }
      .fc .fc-col-header-cell-cushion {
        color: var(--color-dark-text); 
      }
      .fc .fc-daygrid-day-number {
        color: var(--color-dark-text);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="p-1">
        <p className="font-semibold overflow-hidden">{eventInfo.event.title}</p>
        {eventInfo.event.extendedProps.location && (
          <p className="text-sm overflow-hidden">
            {eventInfo.event.extendedProps.location}
          </p>
        )}
      </div>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    const originalEvent = events.find(
      (event) => event.id === clickInfo.event.extendedProps.originalId
    );
    setEventFunction("register");
    setSelectedEvent(originalEvent || null);
  };

  return (
    <div className="mx-4 bg-secondary">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={formattedEvents}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        height="auto"
        aspectRatio={1.5}
      />
    </div>
  );
}
