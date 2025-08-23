"use client";

import React, { JSX, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import EventCard from "@/components/cards/event-card";
import { FaSpinner } from "react-icons/fa"; // Assuming you are using react-icons

// Define the Event interface based on your backend model
interface Event {
  eventId: number;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  // Add other fields if needed
}

export default function PastOrganizedEventsPage(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    async function fetchEvents(): Promise<void> {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      let userId: number | null = null;

      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userId = userObj.userId ?? userObj.id ?? userObj.UserId ?? userObj.Id ?? null;
        } catch {
          userId = null;
        }
      }

      if (userId && token) {
        try {
          const res: AxiosResponse<Event[]> = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://dep2-backend.onrender.com"}/api/Dashboard/past-organized/${userId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = res.data;
          setTotalCount(Array.isArray(data) ? data.length : 0);
          const pagedEvents = Array.isArray(data)
            ? data.slice((page - 1) * pageSize, page * pageSize)
            : [];
          setEvents(pagedEvents);
        } catch (error) {
          console.error("Failed to fetch past organized events:", error);
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
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading events...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 px-4 py-2 w-full overflow-x-auto">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                No past organized events found.
              </div>
            ) : (
              events.map((event: Event) => (
                <div key={event.eventId} className="flex justify-center items-center min-w-[260px] max-w-[360px]">
                  <EventCard
                    event={event}
                    hideRegister={true}
                    hideLive={true}
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Prev
            </button>

            <span className="mx-2">
              Page {page} of {totalPages}
            </span>

            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>

            <select
              className="ml-4 px-2 py-1 rounded border"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1); // Reset page on size change
              }}
              title="Select page size"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}