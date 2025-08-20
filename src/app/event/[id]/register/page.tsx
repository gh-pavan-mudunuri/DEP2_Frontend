"use client";
import { FiRefreshCw } from 'react-icons/fi';
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import TermsAndConditions from "@/components/TermsAndConditions";
import { useRouter, useParams } from "next/navigation";

// Types for API responses
interface EventApiResponse {
  data?: {
    price?: number;
    maxAttendees?: number;
    registrationCount?: number;
  };
}

interface RegistrationResponse {
  registrationId?: number;
  id?: number;
}

interface PaymentResponse {
  url?: string;
}

interface UserLocalStorage {
  userId?: number | string;
  id?: number | string;
  UserId?: number | string;
  Id?: number | string;
}

export default function RegisterEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [tickets, setTickets] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [ticketAlert, setTicketAlert] = useState<string>("");
  const [maxAttendees, setMaxAttendees] = useState<number | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [captcha, setCaptcha] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");
  const [showTnC, setShowTnC] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [touched, setTouched] = useState<{
    name: boolean;
    email: boolean;
    phone: boolean;
    tickets: boolean;
    captcha: boolean;
  }>({
    name: false,
    email: false,
    phone: false,
    tickets: false,
    captcha: false,
  });

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const res: AxiosResponse<EventApiResponse> = await axios.get(`http://localhost:5274/api/Events/${id}`);
        const eventData = res.data?.data;
        if (eventData) {
          setTicketPrice(eventData.price ?? 0);
          setMaxAttendees(typeof eventData.maxAttendees !== 'undefined' ? eventData.maxAttendees ?? null : null);
          setRegistrationCount(typeof eventData.registrationCount !== 'undefined' ? eventData.registrationCount ?? 0 : 0);
        } else {
          setTicketPrice(0);
          setMaxAttendees(null);
          setRegistrationCount(0);
        }
      } catch {
        setTicketPrice(0);
        setMaxAttendees(null);
        setRegistrationCount(0);
      }
    }
    if (id) fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (!tickets || Number(tickets) < 1) {
      setAmount(0);
      return;
    }
    setAmount(Number(tickets) * ticketPrice);
  }, [tickets, ticketPrice]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setCaptchaError("Captcha code does not match.");
      return;
    } else {
      setCaptchaError("");
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let userId: number | null = null;
      let userIdRaw: string | number | null = null;
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userObj: UserLocalStorage = JSON.parse(storedUser);
            userIdRaw = userObj.userId ?? userObj.id ?? userObj.UserId ?? userObj.Id ?? null;
            userId = typeof userIdRaw === "string" ? parseInt(userIdRaw, 10) : userIdRaw;
          } catch {
            userId = null;
          }
        }
      }
      if (!userId || isNaN(userId)) {
        setError(`User ID not found or invalid (value: ${userIdRaw}). Please log in again.`);
        setLoading(false);
        return;
      }

      const registrationPayload = {
        eventId: id,
        userId: userId,
        ticketCount: Number(tickets),
        email: email
      };
      let registrationId: number | null = null;
      try {
        const regRes: AxiosResponse<RegistrationResponse> = await axios.post(
          "http://localhost:5274/api/Registrations",
          registrationPayload,
          { headers: { "Content-Type": "application/json" } }
        );
        if (regRes && regRes.data && (regRes.data.registrationId || regRes.data.id)) {
          registrationId = regRes.data.registrationId ?? regRes.data.id ?? null;
          if (typeof window !== "undefined" && registrationId !== null) {
            localStorage.setItem('lastRegistrationId', registrationId.toString());
          }
        } else {
          throw new Error("Registration creation failed: No registrationId returned");
        }
      } catch (regErr: unknown) {
        let errMsg = "Registration creation failed";
        if (axios.isAxiosError(regErr)) {
          errMsg = regErr.response?.data?.message
            ?? regErr.response?.data
            ?? regErr.message
            ?? errMsg;
        } else if (regErr instanceof Error) {
          errMsg = regErr.message;
        }
        if (errMsg.toLowerCase().includes("max attendees limit")) {
          setError("Max attendees limit reached. You cannot register for this event.");
        } else if (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("duplicate registration")) {
          setError("You are already registered for this event.");
        } else {
          setError(errMsg);
        }
        setLoading(false);
        return;
      }

      const paymentPayload = {
        eventId: id,
        userId: userId,
        ticketCount: Number(tickets),
        registrationId: registrationId,
        currency: "inr",
        successUrl: typeof window !== "undefined" ? `${window.location.origin}/payment-success` : "",
        cancelUrl: typeof window !== "undefined" ? `${window.location.origin}/payment-cancel` : "",
        email: email
      };
      const checkoutRes: AxiosResponse<PaymentResponse> = await axios.post(
        "http://localhost:5274/api/Payments/create-checkout-session",
        paymentPayload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (checkoutRes && checkoutRes.data && checkoutRes.data.url) {
        window.location.href = checkoutRes.data.url;
        return;
      } else {
        throw new Error("Checkout session creation failed");
      }
    }
    catch (err: unknown) {
      let errMsg = "Checkout session creation failed";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message
          ?? err.response?.data
          ?? err.message
          ?? errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
    finally {
      setLoading(false);
    }
  };

  const handleTicketsChange = (value: string) => {
    setTicketAlert("");
    setTickets(value);
    const num = Number(value);
    if (isNaN(num) || num < 1) {
      setTicketAlert("Please enter a valid number of tickets (minimum 1)");
      setAmount(0);
    } else {
      setAmount(num * ticketPrice);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center py-8">
      <div className="max-w-[900px] w-full mx-auto p-2 sm:p-8 bg-white rounded-2xl shadow-2xl relative border border-blue-100">
        <div className={showTnC ? "blur-sm pointer-events-none select-none" : ""}>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center leading-tight text-blue-700 tracking-tight drop-shadow">Register for Event</h1>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* ...form fields unchanged... */}
            {/* (You can keep your form fields as in your original code) */}
          </form>
        </div>
        {showTnC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0">
            <div className="absolute inset-0 bg-blur bg-opacity-40 z-10" />
            <div className="bg-white rounded shadow-lg max-w-lg w-full p-3 sm:p-6 relative z-20 text-xs sm:text-base">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                onClick={() => setShowTnC(false)}
                aria-label="Close Terms and Conditions"
              >
                &times;
              </button>
              <TermsAndConditions />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}