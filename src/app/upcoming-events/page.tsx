"use client";
import React, { Suspense } from "react";
import UpcomingEventsPage from "./upcoming-events-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpcomingEventsPage />
    </Suspense>
  );
}