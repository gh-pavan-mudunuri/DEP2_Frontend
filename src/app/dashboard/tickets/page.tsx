"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { FaSpinner } from "react-icons/fa"; // Added for the loading spinner
import TicketCard from "@/components/cards/ticket-card";

// Interface for Registration remains the same from your strict version
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

// Interface for UserData remains the same from your strict version
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

        // Using the robust user ID parsing from your first snippet
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
            // If parsing fails, uid remains null, preventing errors
          }
        }

        // Using the deployed API endpoint from your first snippet
        const res = await axios.get<Registration[]>(
          "https://dep2-backend.onrender.com/api/Registrations",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const allRegs = res.data || [];

        // Filtering logic remains the same and is type-safe
        setRegistrations(
          uid !== null
            ? allRegs.filter((r: Registration) => r.userId === uid)
            : []
        );
      } catch (err) {
        // Using the more specific error handling from your first snippet
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

      {/* --- UPDATED PART --- */}
      {/* Using the improved loading UI from your second snippet */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading tickets...</span>
        </div>
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