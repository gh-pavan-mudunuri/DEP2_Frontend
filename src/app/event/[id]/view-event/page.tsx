"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/cards/Navbar";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  EventFormView,
  EventLivePreviewProps,
  Occurrence,
  Speaker,
  Faq,
  MappedOccurrence,
} from "@/interfaces/event-form";

const EventLivePreview = dynamic(
  () => import("@/components/event-live-preview"),
  { ssr: false }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";

// Map occurrences so occurrenceId is always present and required
function mapOccurrences(occurrences: Occurrence[]): MappedOccurrence[] {
  return occurrences.map((occ, idx) => ({
    ...occ,
    occurrenceId: typeof occ.occurrenceId === "number" ? occ.occurrenceId : idx,
    startTime: occ.startTime ?? occ.start ?? "",
    endTime: occ.endTime ?? occ.end ?? "",
    eventTitle: occ.eventTitle ?? "",
    isCancelled: occ.isCancelled ?? false,
  }));
}

// Use mapped occurrences in your props
function mapEventToPreviewProps(event: EventFormView): EventLivePreviewProps {
  return {
    title: event.title,
    coverImageUrl: event.coverImageUrl,
    vibeVideoUrl: typeof event.vibeVideo === "string" ? event.vibeVideo : undefined,
    organizerName: event.OrganizerName,
    organizerEmail: event.organizerEmail,
    eventStart: event.eventStart,
    eventEnd: event.eventEnd,
    registrationDeadline: event.registrationDeadline,
    recurrenceType: event.recurrenceType,
    recurrenceDates: undefined,
    occurrences: mapOccurrences(event.occurrences ?? []), // <-- mapped occurrences
    type: event.type,
    eventType: event.type,
    location: event.location,
    eventLink: event.eventLink,
    category: event.category,
    isPaid: event.isPaid,
    price: event.price,
    maxAttendees: event.maxAttendees,
    description: event.description,
    speakers: event.speakers,
    faqs: event.faqs,
    vibeVideoPreview: event.vibeVideoPreview,
    eventId: event.eventId,
    id: undefined,
    _id: undefined,
    ticketsBooked: undefined,
    registrationCount: undefined,
  };
}

const ViewEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventData, setEventData] = useState<EventLivePreviewProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data: EventFormView = await response.json();
        setEventData(mapEventToPreviewProps(data));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No event data found.</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <EventLivePreview event={{ ...eventData }} />
      </div>
    </div>
  );
};

export default ViewEventPage;