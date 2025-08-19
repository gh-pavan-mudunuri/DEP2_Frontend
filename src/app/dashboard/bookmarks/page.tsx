"use client";

import { JSX, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import EventCard from "@/components/cards/event-card";
import PopupMessage from "@/components/common/popup-message";
import { EventInterface } from "@/interfaces/home";

interface BookmarkedEvent {
  eventId: number;
  title: string;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  // Add other event fields if applicable
}

type PopupType = "success" | "error" | "info";

export default function BookmarksPage(): JSX.Element {
  const [events, setEvents] = useState<BookmarkedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [popup, setPopup] = useState<{ message: string; type?: PopupType } | null>(null);

  useEffect(() => {
    async function fetchBookmarkedEvents(): Promise<void> {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");

        let userId: number | null = null;

        if (userRaw) {
          const userObj = JSON.parse(userRaw);
          userId = userObj.userId ?? userObj.id ?? userObj.UserId ?? userObj.Id ?? null;
        }

        if (!userId) {
          setError("User ID not found. Please log in again.");
          setEvents([]);
          return;
        }

        const res = await axios.get<BookmarkedEvent[]>(
          `http://localhost:5274/api/Bookmarks/bookmarked-events/${userId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const axiosErr = err as AxiosError;
        console.error("[Bookmarks] API error:", axiosErr);
        setError("Failed to fetch your bookmarks.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarkedEvents();
  }, []);

  return (
    <div className="mx-5 mt-10">
      {popup && (
        <PopupMessage
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6">My Bookmarked Events</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">You have not bookmarked any events yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              showActions={false}
              hideRegister={false}
              onBookmarkToggle={async (_event: BookmarkedEvent, removed: boolean) => {
                if (removed) {
                  setEvents((prev) => prev.filter((e) => e.eventId !== event.eventId));
                  setPopup({ message: "Bookmark removed", type: "info" });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
