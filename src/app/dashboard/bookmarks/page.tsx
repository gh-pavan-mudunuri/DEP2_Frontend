"use client";

import { JSX, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { FaSpinner } from "react-icons/fa"; // Added for the loading spinner
import EventCard from "@/components/cards/event-card";
import PopupMessage from "@/components/common/popup-message";
import { EventInterface } from "@/interfaces/home";

// Kept the strict interface for bookmarked events
interface BookmarkedEvent {
  eventId: number;
  title: string;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  // Add other event fields if applicable
}

// Kept the strict type for the popup
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
          // Used the safer try-catch block for parsing
          try {
            const userObj = JSON.parse(userRaw);
            userId = userObj.userId ?? userObj.id ?? userObj.UserId ?? userObj.Id ?? null;
          } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
          }
        }

        if (!userId) {
          setError("User ID not found. Please log in again.");
          setEvents([]);
          setLoading(false); // Stop loading if no user ID
          return;
        }

        const res = await axios.get<BookmarkedEvent[]>(
          // The production URL from the original component is used
          `https://dep2-backend.onrender.com/api/Bookmarks/bookmarked-events/${userId}`,
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
        // Replaced the loading text with the new spinner component
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading events...</span>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">You have not bookmarked any events yet.</div>
      ) : (
        // Applied the updated Tailwind CSS classes to the grid container
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 px-4 py-2 w-full overflow-x-auto">
          {events.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              showActions={false}
              hideRegister={false}
              // Kept the logic, but used `_event` to indicate the parameter is unused
              onBookmarkToggle={async (_event: EventInterface, removed: boolean) => {
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