"use client";

import { useEffect, useState } from "react";
import EventCard from "../cards/event-card";
import axios from "axios";

export default function ApprovedEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApprovedEvents() {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await axios.get("http://localhost:5274/api/events", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          // Filter approved events and sort by AdminVerifiedAt desc
          const approvedRaw = res.data.data.filter((e: any) => e.isVerifiedByAdmin);
          // Support both adminVerifiedAt and AdminVerifiedAt
          const getVerifiedAt = (e: any) => e.adminVerifiedAt || e.AdminVerifiedAt || null;
          console.log('Approved events and their adminVerifiedAt:', approvedRaw.map((e: any) => ({ id: e.eventId, adminVerifiedAt: getVerifiedAt(e) })));
          const approved = approvedRaw.sort((a: any, b: any) => {
            const dateA = getVerifiedAt(a) ? new Date(getVerifiedAt(a)).getTime() : 0;
            const dateB = getVerifiedAt(b) ? new Date(getVerifiedAt(b)).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            // Secondary sort by eventId for stability
            return (b.eventId || 0) - (a.eventId || 0);
          });
          setEvents(approved);
        } else {
          setEvents([]);
          setError("No approved events found.");
        }
      } catch (err) {
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
