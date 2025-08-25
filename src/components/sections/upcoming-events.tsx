"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import debounce from "lodash/debounce";
import EventCard from "../cards/event-card";
import SwipeableCard from "../cards/swipable-card";
import EventsFilters from "./events-filter";
import axios from "axios";
import { EventInterface } from "@/interfaces/home";
import { FaSpinner } from "react-icons/fa";

interface UpcomingEventsProps {
  disableHorizontalScroll?: boolean;
  searchQuery?: string;
  searchCategory?: string;
  limit?: number;
  showBackground?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  setTotalCount?: (count: number) => void;
}

interface FilterState {
  location: string;
  online: boolean | null;
  paid: "paid" | "free" | null;
  price?: "paid" | "free" | null;
  category: string;
  recurrence: string;
  recurrenceType?: string;
  eventType?: string;
}

type EventOrViewAll = EventInterface & { __viewAll?: false } | { __viewAll: true };

export default function UpcommingEvents({
  disableHorizontalScroll,
  searchQuery,
  searchCategory = "",
  limit,
  showBackground,
  page = 1,
  pageSize = 20,
  onPageChange,
  setTotalCount,
}: UpcomingEventsProps) {
  const [showViewAll, setShowViewAll] = useState<boolean>(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowViewAll(window.location.pathname !== "/upcoming-events");
    }
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    online: null,
    paid: null,
    category: searchCategory,
    recurrence: "",
    eventType: ""
  });

  const [categories] = useState<string[]>([
    "Music", "Tech", "Health", "Education", "Business", "Conference", "Exhibitions", "Others"
  ]);

  useEffect(() => {
    if (searchCategory) {
      setFilters(prev => ({
        ...prev,
        category: searchCategory
      }));
    }
  }, [searchCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const progress =
          (container.scrollLeft /
            (container.scrollWidth - container.offsetWidth)) *
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

  // Fetch filtered events from backend when filters change, with debounce
  useEffect(() => {
    const fetchFilteredEvents = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post<{ success: boolean; data: EventInterface[]; totalCount?: number }>(
          `https://dep2-backend.onrender.com/api/Home/filter-paged?page=${page}&pageSize=${pageSize}`,
          filters
        );
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
          if (setTotalCount) setTotalCount(res.data.totalCount || res.data.data.length);
        } else {
          setEvents([]);
          if (setTotalCount) setTotalCount(0);
        }
      } catch (err) {
        setEvents([]);
        console.error("Failed to fetch filtered events", err);
      } finally {
        setIsLoading(false);
      }
    };
    const debouncedFetch = debounce(fetchFilteredEvents, 400);
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [filters, page, pageSize, setTotalCount]);

  // Only show events approved by admin
  const approvedEvents: EventInterface[] = events.filter(e => e.isVerifiedByAdmin === true);
  // Filter events by searchQuery (title or location)
  let filteredBySearch: EventInterface[] = (searchQuery && searchQuery.trim())
    ? approvedEvents.filter(e =>
        (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : approvedEvents;

  // Always enforce event limit for all users and views, but not on dedicated page
  if (limit && showViewAll) {
    filteredBySearch = filteredBySearch.slice(0, limit);
  }

  return (
    <div className={showBackground ? "bg-blue-2 mx-5" : "mx-5"}>
      <div className="mt-10 mb-2 relative">
        <h2 className="text-xl sm:text-2xl md:text-3xl mt-2 mb-3 font-sans font-bold">Upcoming Events:</h2>
        {/* Hide 'View All' button on upcoming-events page (hydration safe) */}
        {showViewAll && (
          <a
            href="/upcoming-events"
            className="absolute top-0 right-0 text-black font-semibold text-sm px-3 py-1 rounded hover:underline"
            style={{ zIndex: 10 }}
          >
            View All
          </a>
        )}
        <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
          <EventsFilters
            filters={filters}
            onChange={update => setFilters(prev => ({ ...prev, ...update }))}
            categories={categories}
            paidOptions={["Free", "Paid"]}
            onlineOptions={["Online", "Offline"]}
            onClearFilters={() => setFilters({
              location: "",
              online: null,
              paid: null,
              category: "",
              recurrence: "",
              eventType: ""
            })}
          />
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-blue-600">
            <FaSpinner className="animate-spin text-3xl mb-2" />
            <span>Loading events...</span>
          </div>
        ) : filteredBySearch.length === 0 && !isLoading ? (
          <div className="text-gray-500 text-center py-8 w-full">No upcoming events found.</div>
        ) : disableHorizontalScroll ? (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {filteredBySearch.map((event, index) => (
              <div key={event.eventId || index} className="flex justify-center items-center w-full">
<EventCard event={event} />              </div>
            ))}
          </div>
        ) : (
        <div className="relative pl-3 w-full">
          {/* Mobile view */}
          <div className=" sm:hidden w-full flex flex-col items-center justify-center space-y-4 px-2" style={{ minHeight: '100%' }}>
            <SwipeableCard
              items={[...filteredBySearch, { __viewAll: true } as EventOrViewAll]}
              render={item =>
                "__viewAll" in item && item.__viewAll ? (
                  <div className="flex items-center justify-center h-full min-h-[180px]">
                    <Link
                      href="/upcoming-events"
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg min-w-[220px] justify-center"
                      style={{ whiteSpace: "nowrap", height: "fit-content" }}
                    >
                      View All
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <EventCard event={item as EventInterface} />
                )
              }
            />
          </div>

          {/* Desktop/tablet view */}
          <div className="hidden sm:block relative">
            <div
              ref={scrollRef}
              className="flex gap-4 items-center overflow-x-auto scroll-smooth rounded-lg no-scrollbar px-2"
              style={{ scrollbarWidth: "none" }}
            >
              {filteredBySearch.map((event, index) => (
                <div
                  className="flex-shrink-0"
                  key={event.eventId || index}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>

          {/* Scroll progress bar */}
          {!disableHorizontalScroll && (
            <div className="mt-2 h-1 w-full bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}