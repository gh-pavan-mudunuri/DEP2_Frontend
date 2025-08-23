"use client";

import { useEffect, useState } from "react";
import EventCard from "../cards/event-card";
import axios from "axios";
import { EventInterface } from "@/interfaces/home";

// Interface for the expected API response structure
interface EventsApiResponse {
  success: boolean;
  data: EventInterface[];
}

/**
 * A type-safe function to retrieve the verification timestamp.
 * It supports both 'adminVerifiedAt' and 'AdminVerifiedAt' property names.
 * @param e The event object.
 * @returns The verification date string or null.
 */
function getVerifiedAt(e: EventInterface): string | null {
  // Support both adminVerifiedAt and AdminVerifiedAt as string or undefined
  if ("adminVerifiedAt" in e && typeof (e as { adminVerifiedAt?: string }).adminVerifiedAt === "string") {
    return (e as { adminVerifiedAt?: string }).adminVerifiedAt ?? null;
  }
  if ("AdminVerifiedAt" in e && typeof (e as { AdminVerifiedAt?: string }).AdminVerifiedAt === "string") {
    return (e as { AdminVerifiedAt?: string }).AdminVerifiedAt ?? null;
  }
  return null;
}

export default function ApprovedEvents() {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchApprovedEvents() {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        // Updated API endpoint to the local development server
        const res = await axios.get<EventsApiResponse>("https://dep2-backend.onrender.com/api/events", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          // 1. Filter events that are verified by an admin
          const approvedRaw = res.data.data.filter((e: EventInterface) => e.isVerifiedByAdmin);

          // 2. [Added] Debugging log to check filtered events and their verification dates
          console.log('Approved events and their adminVerifiedAt:', approvedRaw.map((e: EventInterface) => ({ id: e.eventId, adminVerifiedAt: getVerifiedAt(e) })));

          // 3. Sort the approved events by verification date in descending order
          const approved = approvedRaw.sort((a: EventInterface, b: EventInterface) => {
            const dateA = getVerifiedAt(a) ? new Date(getVerifiedAt(a)!).getTime() : 0;
            const dateB = getVerifiedAt(b) ? new Date(getVerifiedAt(b)!).getTime() : 0;
            
            // Primary sort: newest verified first
            if (dateA !== dateB) return dateB - dateA;
            
            // Secondary sort for stability: by eventId
            return Number(b.eventId || 0) - Number(a.eventId || 0);
          });
          setEvents(approved);

        } else {
          setEvents([]);
          setError("No approved events found.");
        }
      } catch (err) { // Catch block now includes the error object for potential logging
        setEvents([]);
        setError("Failed to fetch approved events.");
        // Optional: log the actual error to the console for more details
        // console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApprovedEvents();
  }, []);

  // The JSX with Tailwind CSS remains unchanged as it was identical in both versions
  return (
    <div className="w-full">
      {loading ? (
        <div className="text-gray-500 p-8">Loading approved events...</div>
      ) : error ? (
        <div className="text-red-500 p-8">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 p-8">No approved events found.</div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {events.map((event, idx) => (
            <EventCard event={event} key={event.eventId || idx} />
          ))}
        </div>
      )}
    </div>
  );
}