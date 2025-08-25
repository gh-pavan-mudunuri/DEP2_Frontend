"use client";
import { useState } from "react";
import AdminEventIncome from "@/components/admin-event-income";
import AdminPayments from "@/components/admin-payments";
import Navbar from "@/components/cards/Navbar";
export default function AdminAllPaymentsPage() {
const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
return (
<div className="min-h-screen bg-blue-2">
<Navbar />
<main className="py-10">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<header className="mb-8">
<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
Event Payments Dashboard
</h1>
<p className="mt-2 text-lg text-gray-500">
An overview of income and payment details for all events.
</p>
</header>
<div className="bg-blue-2 shadow-lg rounded-lg p-6">
        {!selectedEventId ? (
          <AdminEventIncome onSelectEvent={setSelectedEventId} />
        ) : (
          <div>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-6 transition-transform transform hover:scale-105"
              onClick={() => setSelectedEventId(null)}
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Event Income Overview
            </button>
            <AdminPayments eventId={selectedEventId} />
          </div>
        )}
      </div>
    </div>
  </main>
</div>
);
}
