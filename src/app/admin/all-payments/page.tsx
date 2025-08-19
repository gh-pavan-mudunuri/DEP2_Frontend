"use client";
import { useState } from "react";
import AdminEventIncome from "@/components/admin-event-income";
import AdminPayments from "@/components/admin-payments";
import Navbar from "@/components/cards/Navbar";

export default function AdminAllPaymentsPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">All Event Payments</h1>
          {!selectedEventId ? (
            <AdminEventIncome onSelectEvent={setSelectedEventId} />
          ) : (
            <>
              <button
                className="mb-4 px-4 py-2 bg-gray-200 rounded"
                onClick={() => setSelectedEventId(null)}
              >
                ← Back to Event Income Overview
              </button>
              <AdminPayments eventId={selectedEventId} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
