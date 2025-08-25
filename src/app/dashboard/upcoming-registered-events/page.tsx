"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa"; // Added for the loading animation
import EventCard from "@/components/cards/event-card";
import { EventInterface } from "@/interfaces/home"; // Kept your original interface for type safety

export default function UpcomingRegisteredEventsPage() {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
  async function fetchEvents() {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    let userId = null;
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
      } catch {}
    }
    if (userId && token) {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://dep2-backend.onrender.com"}/api/Dashboard/current-attending/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // The backend returns an array directly, not an object with success/data/totalCount
        if (Array.isArray(res.data)) {
          setEvents(res.data);
          setTotalCount(res.data.length);
        } else {
          setEvents([]);
          setTotalCount(0);
        }
      } catch {
        setEvents([]);
        setTotalCount(0);
      }
    } else {
      setEvents([]);
      setTotalCount(0);
    }
    setLoading(false);
  }
  fetchEvents();
}, [page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Registered Events</h1>
      {loading ? (
        // Updated loading state with spinner icon and new styles
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading events...</span>
        </div>
      ) : (
        <>
          {/* Updated grid container with new responsive classes and styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 px-4 py-2 w-full overflow-x-auto">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No upcoming registered events found.</div>
            ) : (
              events.map(event => (
                <EventCard key={event.eventId} event={event} />
              ))
            )}
          </div>
          {/* Pagination controls remain the same but will apply to the updated layout */}
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
            <select
              className="ml-4 px-2 py-1 rounded border"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              title="Select page size"
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