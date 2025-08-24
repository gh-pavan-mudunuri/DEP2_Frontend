"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";

interface Payment {
  paymentId: number;
  transactionId: string;
  userEmail: string;
  eventTitle: string;
  amount: number;
  paymentTime: string;
  status: string;
}

export default function AdminAllPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/payments`)
      .then(res => {
        setPayments(Array.isArray(res.data) ? res.data : res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Error fetching payments');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading all payments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-bold mb-3">All Event Payments</h2>
      {payments.length === 0 ? (
        <div className="text-gray-500">No payments found.</div>
      ) : (
  <table className="w-full text-sm border bg-blue-2">
          <thead>
            <tr className="bg-[#0a174e] text-white">
              <th className="p-2 border">Payment ID</th>
              <th className="p-2 border">Transaction ID</th>
              <th className="p-2 border">User Email</th>
              <th className="p-2 border">Event Title</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Time</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.paymentId} className="text-[#0a174e]">
                <td className="p-2 border">{p.paymentId}</td>
                <td className="p-2 border">{p.transactionId}</td>
                <td className="p-2 border">{p.userEmail}</td>
                <td className="p-2 border">{p.eventTitle}</td>
                <td className="p-2 border">₹{p.amount}</td>
                <td className="p-2 border">{p.status}</td>
                <td className="p-2 border">{new Date(p.paymentTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}