"use client";
import { useRef, useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa"; // Added for loading icon
import EventCard from "../cards/event-card";
import { EventInterface } from "@/interfaces/home"; // Kept original interface
import axios from "axios";
import SwipeableCard from "../cards/swipable-card";

interface TrendingEventsProps {
  limit?: number;
}

export default function TrendingEvents({ limit }: TrendingEventsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Removed unused scrollAmount and scrollInterval variables
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [events, setEvents] = useState<EventInterface[]>([]); // Kept original EventInterface type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch trending events from API
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError("");
      try {
        // Kept the original production API endpoint
        const res = await axios.get("https://dep2-backend.onrender.com/api/Home/trending");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
          setError("No trending events found.");
        }
      } catch {
        setEvents([]);
        setError("Failed to fetch trending events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Scroll progress tracking (normalized to first half)
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const progress =
          (container.scrollLeft /
            ((container.scrollWidth / 2) - container.offsetWidth)) *
          100;
        setScrollProgress(Math.min(progress, 100));
      }
    };
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (ref) ref.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Removed handleMouseEnter and handleMouseLeave as auto-scroll is not implemented

  // Always enforce event limit for all users and views
  let limitedEvents = events;
  if (limit) {
    limitedEvents = events.slice(0, limit);
  }

  return (
    <div className="mx-5">
      <div className="mt-10 mb-2 relative">
        <h2 className="text-xl sm:text-2xl md:text-3xl mt-2 mb-3 font-sans font-bold">
          Trending Events:
        </h2>
        <a
          href="/trending-events"
          className="absolute top-0 right-0 text-black font-semibold text-sm px-3 py-1 rounded hover:underline"
          style={{ zIndex: 10 }}
        >
          View All
        </a>
        {loading ? (
          // Updated loading state with spinner icon and text
          <div className="flex flex-col items-center justify-center py-8 text-blue-600">
            <FaSpinner className="animate-spin text-3xl mb-2" />
            <span>Loading trending events...</span>
          </div>
        ) : (
          <div className="relative pl-3 w-full">
            {/* Mobile view */}
            <div className="sm:hidden w-full flex items-center justify-center">
              {/* Note: The loading state is handled globally above, so nested loading is redundant here */}
              <SwipeableCard
                items={[...limitedEvents, { __viewAll: true }]}
                render={event =>
                  "__viewAll" in event && event.__viewAll ? (
                    <div className="flex items-center justify-center h-full min-h-[180px]">
                      <a
                        href="/trending-events"
                        className="flex items-center gap-1 px-4 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-lg min-w-[220px] justify-center"
                        style={{ whiteSpace: "nowrap", height: "fit-content" }}
                      >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <EventCard event={event as EventInterface} />
                  )
                }
              />
            </div>
            {/* Desktop/tablet view */}
            <div className="hidden sm:block relative">
              <div
                ref={scrollRef}
                // Updated with justify-start for alignment
                className="flex gap-4 justify-start overflow-x-auto scroll-smooth rounded-lg no-scrollbar px-2"
                style={{ scrollbarWidth: "none" }}
              >
                {error ? (
                  <div className="text-red-500 p-8">{error}</div>
                ) : limitedEvents.length === 0 ? (
                  // Updated empty state message and styling
                  <div className="text-gray-500 text-center py-8 w-full">No trending events found.</div>
                ) : (
                  <>
                    {limitedEvents.map((event, index) => (
                      <div
                        // Updated class and removed mouse handlers
                        className="flex items-start"
                        key={event.eventId + "-trending-" + index}
                      >
                        <EventCard event={event} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 w-full bg-gray-300 rounded-full overflow-hidden">
              <div
                // Updated progress bar color to blue
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}