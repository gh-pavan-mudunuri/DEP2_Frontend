"use client";

import { useEffect, useState } from "react";
import EventCard from "../cards/event-card";
import axios from "axios";
import { EventInterface } from "@/interfaces/home";

interface UnapprovedEventsApiResponse {
  events: EventInterface[];
  totalCount: number;
}

export default function UnapprovedEvents() {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 20;

  useEffect(() => {
    async function fetchUnapprovedEvents() {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await axios.get<UnapprovedEventsApiResponse>(
          `http://localhost:5274/api/admin/unapproved-events?page=${page}&pageSize=${pageSize}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.data && Array.isArray(res.data.events)) {
          setEvents(res.data.events);
          setTotalCount(res.data.totalCount || 0);
        } else {
          setEvents([]);
          setError("No unapproved events found.");
        }
      } catch {
        setEvents([]);
        setError("Failed to fetch unapproved events.");
      } finally {
        setLoading(false);
      }
    }
    fetchUnapprovedEvents();
  }, [page]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="text-gray-500 p-8">Loading unapproved events...</div>
      ) : error ? (
        <div className="text-red-500 p-8">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 p-8">No unapproved events found.</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-6 justify-center">
            {events.map((event, idx) => (
              <EventCard event={event} key={event.eventId || idx} />
            ))}
          </div>
          {totalCount > 0 && (
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded mr-2"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >Prev</button>
              <span className="px-4 py-2">Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
              <button
                className="px-4 py-2 bg-gray-200 rounded ml-2"
                disabled={page * pageSize >= totalCount}
                onClick={() => setPage(page + 1)}
              >Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}