"use client";
import { useEffect, useState } from "react";
import EventCard from "@/components/cards/event-card";
import axios from "axios";
import { FaSpinner } from "react-icons/fa"; // Added for the updated loading state

// Define the event type based on your API and EventCard props (Retained from V1)
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
  // Use strict typing from V1
  const [events, setEvents] = useState<TrendingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError("");
      try {
        // Use the deployed API URL and strict typing from V1
        const res = await axios.get<TrendingEventsApiResponse>("https://dep2-backend.onrender.com/api/Home/trending");
        
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
          setError("No trending events found.");
        }
      } catch (e) {
        setEvents([]);
        setError("Failed to fetch trending events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    // Updated background and layout styling (from V2)
    <div className="min-h-screen bg-gradient-to-b from-[#f5f8ff] to-[#eaf0fa] py-12 flex flex-col items-center w-full">
      
      {/* Updated header styling (from V2) */}
      <h1 className="text-3xl px-4 font-bold mb-6 text-left w-full max-w-7xl md:max-w-full">
        All Trending Events
      </h1>
      
      {loading ? (
        // Updated loading UI with spinner (from V2)
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading events...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        // Updated grid styling (from V2, adjusted slightly for responsiveness)
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 px-4 py-2 w-full max-w-7xl">
          {events.map((event, index) => (
            <EventCard event={event} key={event.eventId + "-trending-" + index} />
          ))}
        </div>
      )}
    </div>
  );
}