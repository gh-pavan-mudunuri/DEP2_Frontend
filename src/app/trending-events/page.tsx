"use client";
import { useEffect, useState } from "react";
import EventCard from "@/components/cards/event-card";
import SwipeableCard from "@/components/cards/swipable-card";
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
    <div className="min-h-screen bg-blue-2 py-12 flex flex-col items-center w-full">
      <h1 className="text-3xl px-4 font-bold mb-6 text-left w-full max-w-7xl md:max-w-full">
        All Trending Events
      </h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading events...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 text-center py-8 w-full">No trending events found.</div>
      ) : (
        <>
          {/* Mobile view: swipeable cards */}
          <div className="sm:hidden w-full flex flex-col items-center justify-center space-y-4 px-2" style={{ minHeight: '100%' }}>
            <SwipeableCard
              items={events}
              render={(event, idx) => <EventCard event={event} key={event.eventId + "-trending-" + idx} />}
            />
          </div>
          {/* Desktop/tablet view: grid */}
          <div className="hidden sm:block w-full">
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {events.map((event, index) => (
                <div key={event.eventId + "-trending-" + index} className="flex justify-center items-center w-full mb-6">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}