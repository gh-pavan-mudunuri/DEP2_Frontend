"use client";
import { useEffect, useState } from "react";
import EventCard from "@/components/cards/event-card";
import axios from "axios";

// Define the event type based on your API and EventCard props
export interface TrendingEvent {
  eventId: string | number;
  title: string;
  coverImageUrl?: string;
  organizerName?: string;
  eventStart?: string;
  eventEnd?: string;
  location?: string;
  // Add other fields used by EventCard here
}

interface TrendingEventsApiResponse {
  success: boolean;
  data: TrendingEvent[];
}

export default function TrendingEventsPage() {
  const [events, setEvents] = useState<TrendingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get<TrendingEventsApiResponse>("https://dep2-backend.onrender.com/api/Home/trending");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
          setError("No trending events found.");
        }
      } catch {
        setEvents([]);
        setError("Failed to fetch trending events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="px-6 py-12 flex flex-col items-center bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">All Trending Events</h1>
      {loading ? (
        <div className="text-gray-500 mb-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 w-full max-w-7xl items-start auto-rows-fr">
          {events.map((event, index) => (
            <EventCard event={event} key={event.eventId + "-trending-" + index} />
          ))}
        </div>
      )}
    </div>
  );
}