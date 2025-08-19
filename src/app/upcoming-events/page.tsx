"use client";
import UpcomingEvents from "@/components/sections/upcoming-events";

export default function UpcomingEventsPage() {
  return (
    <div className="min-h-screen bg-white">
      <UpcomingEvents disableHorizontalScroll />
    </div>
  );
}
