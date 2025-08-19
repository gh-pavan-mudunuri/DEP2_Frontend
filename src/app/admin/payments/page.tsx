"use client";
import AdminPayments from "@/components/admin-payments";
import Navbar from "@/components/cards/Navbar";

export default function AdminPaymentsPage() {
  // TODO: Replace with dynamic eventId selection if needed
  const eventId = 1;
  return (
    <>
      <Navbar />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Payments for Event</h1>
          <AdminPayments eventId={eventId} />
        </div>
      </main>
    </>
  );
}
