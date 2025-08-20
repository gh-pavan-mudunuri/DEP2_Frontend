"use client";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import TicketCard from "@/components/cards/ticket-card";

interface Registration {
  id: number;
  eventId: number;
  userId: number;
  ticketCount: number;
  userEmail?: string;
  qrCode?: string; // base64 PNG string
  registeredAt: string;
  eventTitle?: string;
}

interface UserData {
  userId?: number;
  id?: number;
  UserId?: number;
  Id?: number;
}

export default function TicketsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRegistrations() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");

        let uid: number | null = null;

        if (userRaw) {
          try {
            const userObj: UserData = JSON.parse(userRaw);
            uid =
              userObj.userId ??
              userObj.id ??
              userObj.UserId ??
              userObj.Id ??
              null;
            if (uid !== null) setUserId(uid);
          } catch {
            // If parsing fails, uid remains null
          }
        }

        const res = await axios.get<Registration[]>(
          "https://dep2-backend.onrender.com/api/Registrations",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const allRegs = res.data || [];

        setRegistrations(
          uid !== null
            ? allRegs.filter((r: Registration) => r.userId === uid)
            : []
        );
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Error fetching registrations:", axiosError.message);
        setError("Failed to fetch registrations");
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrations();
  }, []);

  return (
    <div className="p-6 w-full min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6">Tickets</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : registrations.length === 0 ? (
        <div className="text-gray-500">No tickets found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full h-full">
          {registrations.map((reg) => (
            <TicketCard key={reg.id} reg={reg} />
          ))}
        </div>
      )}
    </div>
  );
}
