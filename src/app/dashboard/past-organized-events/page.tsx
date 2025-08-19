"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "@/components/cards/event-card";

export default function PastOrganizedEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
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
            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}/api/Dashboard/past-organized/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = res.data;
          setTotalCount(Array.isArray(data) ? data.length : 0);
          const pagedEvents = Array.isArray(data) ? data.slice((page - 1) * pageSize, page * pageSize) : [];
          setEvents(pagedEvents);
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
      <h1 className="text-3xl font-bold mb-6">Past Organized Events</h1>
      {loading ? (
        <div className="text-gray-500 mb-4">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No past organized events found.</div>
            ) : (
              events.map(event => (
                <EventCard key={event.eventId} event={event} hideRegister={true} hideLive={true} />
              ))
            )}
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
