"use client";
import { useEffect, useState } from "react";
import axios from "axios";


interface Payment {
  paymentId: number;
  eventId: number;
  eventTitle: string;
  amount: number;
  userEmail: string;
  status: string;
  paymentTime: string;
}

interface OrganizedEvent {
  eventId: number;
  eventTitle: string;
  totalAmount?: number;
  organizerIncome?: number;
  commission?: number;
  payments: Payment[];
}

export default function MyEventsPaymentsPage() {
  const [events, setEvents] = useState<OrganizedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<OrganizedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrganizedEventsWithPayments() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        const userId = userRaw ? JSON.parse(userRaw).userId : null;
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setEvents([]);
          setLoading(false);
          return;
        }
        // Fetch all events organized by this user, with payment details
        const res = await axios.get(`http://localhost:5274/api/dashboard/organized-events-payments/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const events: OrganizedEvent[] = Array.isArray(res.data) ? res.data : [];
        setEvents(events);
      } catch {
        setError("Failed to fetch events and payments");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizedEventsWithPayments();
  }, []);

  function handleViewPayments(event: OrganizedEvent) {
    setSelectedEvent(event);
  }

  const totalOrganizerIncome = events.reduce((sum, event) => sum + (event.organizerIncome ?? ((event.totalAmount ?? 0) * 0.9)), 0);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Organized Events Payment History</h1>
      <div className="mb-4 text-lg font-semibold text-green-700">Total Organizer Income: ₹{totalOrganizerIncome.toFixed(2)}</div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : selectedEvent ? (
        <div className="bg-white rounded-xl shadow p-4 mt-4">
          <button className="mb-4 px-4 py-2 bg-blue-100 rounded" onClick={() => setSelectedEvent(null)}>
            ← Back to Events
          </button>
          <h2 className="text-xl font-semibold mb-2">Payments for: <span className="text-blue-700">{selectedEvent.eventTitle}</span></h2>
          {selectedEvent.payments.length === 0 ? (
            <div className="text-gray-500">No payments found for this event.</div>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Payment ID</th>
                  <th className="p-2 border">User Email</th>
                  <th className="p-2 border">Event Title</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Time</th>
                </tr>
              </thead>
              <tbody>
                {selectedEvent.payments.map(p => (
                  <tr key={p.paymentId}>
                    <td className="p-2 border">{p.paymentId}</td>
                    <td className="p-2 border">{p.userEmail}</td>
                    <td className="p-2 border">{selectedEvent.eventTitle}</td>
                    <td className="p-2 border">₹{p.amount}</td>
                    <td className="p-2 border">{p.status}</td>
                    <td className="p-2 border">{new Date(p.paymentTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
      ) : events.length === 0 ? (
        <div className="text-gray-500">No events found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-blue-100">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2 border">Event Title</th>
                <th className="p-2 border">Total Amount</th>
                <th className="p-2 border">Organizer Income</th>
                <th className="p-2 border">EventSphere Commission</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.eventId} className="hover:bg-blue-50">
                  <td className="p-2 border text-black-700">{event.eventTitle}</td>
                  <td className="p-2 border">₹{event.totalAmount ?? 0}</td>
                  <td className="p-2 border">₹{event.organizerIncome ?? ((event.totalAmount ?? 0) * 0.9).toFixed(2)}</td>
                  <td className="p-2 border">₹{event.commission ?? ((event.totalAmount ?? 0) * 0.1).toFixed(2)}</td>
                  <td className="p-2 border">
                    <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={() => handleViewPayments(event)}>
                      View Payments
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
