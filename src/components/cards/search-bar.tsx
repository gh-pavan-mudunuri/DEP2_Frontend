"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import EventCard from "./event-card";
import { EventInterface } from "@/interfaces/home"; // Keep the original EventInterface import

export default function SearchBar() {
  const [query, setQuery] = useState<string>(""); // Keep string type
  const [results, setResults] = useState<EventInterface[]>([]); // Keep EventInterface[] type
  const [showPopup, setShowPopup] = useState<boolean>(false); // Keep boolean type
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowPopup(false);
      return;
    }
    const fetchEvents = async () => {
      try {
        // Keep the original API URL and strong typing for the response
        const res = await axios.post<{ success: boolean; data: EventInterface[] }>(
          "https://dep2-backend.onrender.com/api/Home/filter", // Original API URL
          {}
        );
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const filtered = res.data.data.filter(
            (e: EventInterface) =>
              (e.title && e.title.toLowerCase().includes(query.toLowerCase())) ||
              (e.location && e.location.toLowerCase().includes(query.toLowerCase())) ||
              // Added e.category to filter logic from the second snippet
              ("category" in e && typeof e.category === 'string' && e.category.toLowerCase().includes(query.toLowerCase()))
          );
          setResults(filtered);
          setShowPopup(filtered.length > 0);
        } else {
          setResults([]);
          setShowPopup(false);
        }
      } catch {
        setResults([]);
        setShowPopup(false);
      }
    };
    fetchEvents();
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  // Keep original handleSubmit type
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowPopup(false);
    router.push(`/dashboard?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="relative w-full">
      {/* Updated form className from the second snippet */}
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(String(e.target.value));
            if (String(e.target.value).trim()) setShowPopup(true);
            else setShowPopup(false);
          }}
          placeholder="Search events, organizers, or categories..."
          // Updated input className from the second snippet
          className="px-2 sm:px-3 border-b border-white bg-transparent focus:outline-none focus:border-b-2 focus:border-white text-base w-full text-white placeholder:text-gray-300 focus:text-white"
        />
        <button
          type="submit"
          // Updated button className from the second snippet
          className="h-9 sm:h-10 px-2 sm:px-4 bg-transparent text-white font-semibold flex items-center justify-center"
          aria-label="Search"
        >
          {/* Updated SVG fill, stroke, and added style transform from the second snippet */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5" style={{ transform: 'scaleX(-1)' }}>
            <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </form>
      {showPopup && results.length > 0 && (
        <div ref={popupRef} className="absolute z-50 left-0 mt-2 w-full sm:w-[800px] max-h-[600px] overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-2xl p-4">
          <div className="mb-3 text-lg font-semibold text-blue-700">Matching Events</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {results.map((event, idx) => (
              <div key={event.eventId || idx} className="transition-transform duration-200 hover:scale-105 hover:bg-blue-50 rounded-lg">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}