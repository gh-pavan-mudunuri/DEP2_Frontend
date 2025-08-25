"use client";
import { useEffect, useState } from 'react';

interface Payment {
  paymentId: number;
  transactionId: string;
  userEmail: string;
  eventTitle: string;
  amount: number;
  paymentTime: string;
  status: string;
}

interface Props {
  eventId: number;
}

export default function AdminPayments({ eventId }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://dep2-backend.onrender.com'}/api/admin/event/${eventId}/payments`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch payments'))
      .then(data => {
        setPayments(Array.isArray(data) ? data : data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(typeof err === 'string' ? err : 'Error fetching payments');
        setLoading(false);
      });
  }, [eventId]);

  if (!eventId) return <div className="text-red-500">No event selected.</div>;
  if (loading) return <div>Loading payments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-bold mb-3">Payments for Event #{eventId}</h2>
      {payments.length === 0 ? (
        <div className="text-gray-500">No payments found for this event.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-xs sm:text-sm border border-black">
            <thead>
              <tr className="bg-[#0a174e] text-white">
                <th className="p-2 border border-black">Payment ID</th>
                <th className="p-2 border border-black">Transaction ID</th>
                <th className="p-2 border border-black">User Email</th>
                <th className="p-2 border border-black">Event Title</th>
                <th className="p-2 border border-black">Amount</th>
                <th className="p-2 border border-black">Status</th>
                <th className="p-2 border border-black">Time</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.paymentId} className="text-[#0a174e]">
                  <td className="p-2 border border-black">{p.paymentId}</td>
                  <td className="p-2 border border-black">{p.transactionId}</td>
                  <td className="p-2 border border-black">{p.userEmail}</td>
                  <td className="p-2 border border-black">{p.eventTitle}</td>
                  <td className="p-2 border border-black">₹{p.amount}</td>
                  <td className="p-2 border border-black">{p.status}</td>
                  <td className="p-2 border border-black">{new Date(p.paymentTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}