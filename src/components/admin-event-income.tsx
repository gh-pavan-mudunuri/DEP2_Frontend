"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";

interface EventIncome {
  eventId: number;
  eventTitle: string;
  totalAmount: number;
}

export default function AdminEventIncome({ onSelectEvent }: { onSelectEvent: (eventId: number) => void }) {
  const [eventIncomes, setEventIncomes] = useState<EventIncome[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Kept the original API endpoint from your first file as requested
    api.get("https://dep2-backend.onrender.com/api/admin/event-income-summary")
      .then(res => {
        const incomes: EventIncome[] = Array.isArray(res.data) ? res.data : [];
        setEventIncomes(incomes);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.message || "Error fetching event incomes");
        setLoading(false);
      });
  }, []);

  // Calculate total EventSphere (admin) income: sum of all admin commissions (10% of each event's totalAmount)
  const totalAdminIncome = eventIncomes.reduce(
    (sum, e) => sum + ((typeof e.totalAmount === "number" && !isNaN(e.totalAmount) ? e.totalAmount : 0) * 0.1),
    0
  );

  if (loading) return <div>Loading event incomes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-blue-2 rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-bold mb-3">Event Income Overview</h2>
      <div className="mb-4 text-xl font-semibold text-blue-700">Total EventSphere Income: ₹{totalAdminIncome.toFixed(2)}</div>
      {eventIncomes.length === 0 ? (
        <div className="text-gray-500">No event payments found.</div>
      ) : (
  <table className="w-full text-sm border border-black">
          <thead>
            {/* Updated header style */}
            <tr className="bg-[#0a174e] text-white">
              <th className="p-2 border border-black">Event Title</th>
              <th className="p-2 border border-black">Total Amount</th>
              <th className="p-2 border border-black">Organizer Income</th>
              <th className="p-2 border border-black">EventSphere Commission</th>
              <th className="p-2 border border-black">Action</th>
            </tr>
          </thead>
          <tbody>
            {eventIncomes.map(e => (
              // Updated body row style
              <tr key={e.eventId} className="text-[#0a174e]">
                <td className="p-2 border border-black">{e.eventTitle}</td>
                <td className="p-2 border border-black">₹{typeof e.totalAmount === "number" && !isNaN(e.totalAmount) ? e.totalAmount : 0}</td>
                <td className="p-2 border border-black">₹{(((typeof e.totalAmount === "number" && !isNaN(e.totalAmount) ? e.totalAmount : 0) * 0.9).toFixed(2))}</td>
                <td className="p-2 border border-black">₹{(((typeof e.totalAmount === "number" && !isNaN(e.totalAmount) ? e.totalAmount : 0) * 0.1).toFixed(2))} </td>
                <td className="p-2 border border-black">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onSelectEvent(e.eventId)}>
                    View Payments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}