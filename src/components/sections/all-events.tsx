"use client";

import { useEffect, useState } from "react";
import EventCard from "../cards/event-card";
import axios from "axios";
import { EventInterface } from "@/interfaces/home";

interface EventsApiResponse {
  success: boolean;
  data: EventInterface[];
}

export default function AllEvents() {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    async function fetchPagedEvents() {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        // Updated API endpoint from your second example
        const res = await axios.get<EventsApiResponse>(
          `https://dep2-backend.onrender.com/api/events/paged?page=1&pageSize=1000`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const unapprovedEvents = res.data.data.filter((e: EventInterface) => !e.isVerifiedByAdmin);
          setTotalCount(unapprovedEvents.length);
          const startIdx = (page - 1) * pageSize;
          const pagedUnapproved = unapprovedEvents.slice(startIdx, startIdx + pageSize);
          setEvents(pagedUnapproved);
        } else {
          setEvents([]);
          setTotalCount(0);
          setError("No events found.");
        }
      } catch (err) { // Used the catch block from the second example
        setEvents([]);
        setTotalCount(0);
        setError("Failed to fetch events.");
      } finally {
        setLoading(false);
      }
    }
    fetchPagedEvents();
  }, [page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="w-full">
      {loading ? (
        <div className="text-gray-500 p-8">Loading events...</div>
      ) : error ? (
        <div className="text-red-500 p-8">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 p-8">No events found.</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-6 justify-center">
            {events.map((event, idx) => (
              <EventCard
                event={event}
                key={event.eventId || idx}
                onApprove={() => {
                  setEvents(prev => prev.filter(e => e.eventId !== event.eventId));
                }}
              />
            ))}
          </div>
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="mx-2">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
            <label htmlFor="page-size-select" className="sr-only">Select page size</label>
            <select
              id="page-size-select"
              aria-label="Select page size"
              className="ml-4 px-2 py-1 rounded border"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}