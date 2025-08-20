"use client";
import { useRef, useEffect, useState } from "react";
import EventCard from "../cards/event-card";
import { EventInterface } from "@/interfaces/home";
import axios from "axios";
import SwipeableCard from "../cards/swipable-card";

interface TrendingEventsProps {
  limit?: number;
}

export default function TrendingEvents({ limit }: TrendingEventsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 200;
  const scrollInterval = 3000;
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch trending events from API
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:5274/api/Home/trending");
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

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

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
          <div className="text-gray-500 mb-4">Loading...</div>
        ) : (
          <div className="relative pl-3 w-full">
            {/* Mobile view */}
            <div className=" sm:hidden w-full flex items-center justify-center">
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
                className="flex gap-4 overflow-x-auto scroll-smooth rounded-lg no-scrollbar px-2"
                style={{ scrollbarWidth: "none" }}
              >
                {error ? (
                  <div className="text-red-500 p-8">{error}</div>
                ) : limitedEvents.length === 0 ? (
                  <div className="text-gray-500 p-8">No trending events found.</div>
                ) : (
                  <>
                    {limitedEvents.map((event, index) => (
                      <div
                        className="flex-shrink-0"
                        key={event.eventId + "-trending-" + index}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
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
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}