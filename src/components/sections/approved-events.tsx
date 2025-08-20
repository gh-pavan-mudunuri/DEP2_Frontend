"use client";

import { useEffect, useState } from "react";
import EventCard from "../cards/event-card";
import axios from "axios";
import { EventInterface } from "@/interfaces/home";

interface EventsApiResponse {
  success: boolean;
  data: EventInterface[];
}

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
        const res = await axios.get<EventsApiResponse>("https://dep2-backend.onrender.com/api/events", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          // Filter approved events and sort by AdminVerifiedAt desc
          const approvedRaw = res.data.data.filter((e: EventInterface) => e.isVerifiedByAdmin);
          const approved = approvedRaw.sort((a: EventInterface, b: EventInterface) => {
            const dateA = getVerifiedAt(a) ? new Date(getVerifiedAt(a)!).getTime() : 0;
            const dateB = getVerifiedAt(b) ? new Date(getVerifiedAt(b)!).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            // Secondary sort by eventId for stability
            return Number(b.eventId || 0) - Number(a.eventId || 0);
          });
          setEvents(approved);
        } else {
          setEvents([]);
          setError("No approved events found.");
        }
      } catch {
        setEvents([]);
        setError("Failed to fetch approved events.");
      } finally {
        setLoading(false);
      }
    }
    fetchApprovedEvents();
  }, []);

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