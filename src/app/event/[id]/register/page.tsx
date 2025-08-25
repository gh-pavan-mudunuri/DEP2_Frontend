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
      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res: AxiosResponse<EventApiResponse> = await axios.get(
        `https://dep2-backend.onrender.com/api/Events/${id}`,
        { headers }
      );
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
          "https://dep2-backend.onrender.com/api/Registrations",
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
        "https://dep2-backend.onrender.com/api/Payments/create-checkout-session",
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
    <div className="relative min-h-screen bg-blue-2 border-t-8 border-[#0a174e] flex flex-col items-center justify-center py-2 -mt-8">
      <div className="max-w-[900px] w-full mx-auto p-2 sm:p-8 bg-blue-50/80 rounded-2xl shadow-2xl relative border border-blue-200 backdrop-blur-md">
        <div className={showTnC ? "blur-sm pointer-events-none select-none" : ""}>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center leading-tight tracking-tight drop-shadow text-[#0a174e] underline">Register for Event</h1>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><span role="img" aria-label="user">👤</span> Contact Information</h2>
              <hr className="mb-2 border-blue-100" />
            </div>
            {/* Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className=" font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800 flex items-center gap-2" htmlFor="name">
                <span role="img" aria-label="name">📝</span> Name <span className="text-red-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="name"
                  type="text"
                  className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.name && name ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                  value={name}
                  onChange={e => setName(String(e.target.value))}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  required
                  placeholder="Enter your name"
                  title="Name"
                />
                {touched.name && name && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                )}
              </div>
            </div>
            {/* Email */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className=" font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800 flex items-center gap-2" htmlFor="email">
                <span role="img" aria-label="email">📧</span> Email <span className="text-red-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="email"
                  type="email"
                  className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.email && email ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                  value={email}
                  onChange={e => setEmail(String(e.target.value))}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  required
                  placeholder="Enter your email"
                  title="Email"
                />
                {touched.email && email && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                )}
              </div>
            </div>
            {/* Phone */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
                <label className="font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800 flex items-center gap-2" htmlFor="phone">
                  <span role="img" aria-label="phone">📱</span> Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="w-full flex flex-row relative gap-2">
                  <select
                    id="country-code"
                    className="border rounded-l px-2 py-2 bg-gray-100 text-gray-700 text-sm sm:text-base"
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{ minWidth: "80px" }}
                    title="Country Code"
                  >
                    {/* ...country code options... */}
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* ...other options... */}
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.phone && phone ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                    value={phone}
                    onChange={e => setPhone(String(e.target.value))}
                    onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                    required
                    placeholder="Enter your phone number"
                    title="Phone Number"
                    pattern="[0-9]{7,15}"
                    maxLength={15}
                  />
                  {touched.phone && phone && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                  )}
                </div>
              </div>
            </div>
            <div className="my-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><span role="img" aria-label="ticket">🎟️</span> Ticket Details</h2>
              <hr className="mb-2 border-blue-100" />
            </div>
            {/* Tickets */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="tickets">
                Number of Tickets <span className="text-red-600">*</span>
              </label>
              <div className="relative w-full flex flex-col">
                {/* Show available tickets if both values are present */}
                {maxAttendees !== null && (
                  <div className="mb-1 text-xs sm:text-sm text-green-700 font-semibold">
                    Available tickets: {Math.max(0, maxAttendees - registrationCount)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    id="tickets"
                    type="number"
                    min={1}
                    max={maxAttendees !== null ? Math.max(1, maxAttendees - registrationCount) : undefined}
                    className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.tickets && tickets && Number(tickets) > 0 ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                    value={tickets}
                    onChange={e => handleTicketsChange(String(e.target.value))}
                    onBlur={() => setTouched(t => ({ ...t, tickets: true }))}
                    required
                    placeholder="Number of tickets"
                    title="Number of Tickets"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">@ ₹{ticketPrice} per ticket</span>
                </div>
                {touched.tickets && tickets && Number(tickets) > 0 && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                )}
                {ticketAlert && <div className="text-red-600 text-xs sm:text-sm mt-1 font-medium">{ticketAlert}</div>}
              </div>
            </div>
            {/* Amount */}
            <div className="my-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><span role="img" aria-label="security">🔒</span> Verification</h2>
              <hr className="mb-2 border-blue-100" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="amount">
                Total Payable Amount <span className="text-red-600">*</span>
              </label>
              <input
                id="amount"
                type="text"
                className="w-full border-0 border-b-2 border-gray-300 focus:border-blue-600 px-0 py-2 rounded-none bg-gray-100 focus:outline-none text-sm sm:text-base text-gray-900 font-semibold"
                value={`₹${amount}`}
                readOnly
                title="Total Payable Amount"
              />
            </div>
            {/* Captcha */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="captcha">
                Captcha <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <div className="relative mb-2">
                  <input
                    id="captcha"
                    type="text"
                    className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.captcha && captchaInput && captchaInput.trim().toUpperCase() === captcha ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                    value={captchaInput}
                    onChange={e => setCaptchaInput(String(e.target.value))}
                    onBlur={() => setTouched(t => ({ ...t, captcha: true }))}
                    required
                    placeholder="Enter the captcha code below"
                    title="Captcha"
                    autoComplete="off"
                  />
                  {touched.captcha && captchaInput && captchaInput.trim().toUpperCase() === captcha && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                  )}
                  {captchaError && <div className="text-red-600 text-xs sm:text-sm mt-1 font-medium">{captchaError}</div>}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-gray-200 px-2 py-2 sm:px-3 rounded text-sm sm:text-base tracking-widest select-none">{captcha}</span>
                  <button
                    type="button"
                    className={
                      `text-blue-600 text-xs sm:text-sm font-semibold flex items-center transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`
                    }
                    onClick={() => {
                      setRefreshing(true);
                      setCaptcha((() => {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                        let code = "";
                        for (let i = 0; i < 6; i++) {
                          code += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return code;
                      })());
                      setTimeout(() => setRefreshing(false), 700);
                    }}
                    aria-label="Refresh Captcha"
                  >
                    {/* Use react-icons for a modern refresh icon */}
                    <FiRefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Terms and Conditions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="mr-2 mt-1 sm:mt-0 accent-blue-600"
                required
                title="Accept Terms and Conditions"
              />
              <label htmlFor="terms" className="text-xs sm:text-xs mb-1 sm:mb-0 font-medium text-gray-700">
                I accept the{' '}
                <button
                  type="button"
                  className="underline text-blue-600 hover:text-blue-800 focus:outline-none text-xs sm:text-xs font-semibold"
                  onClick={() => setShowTnC(true)}
                >
                  terms and conditions
                </button>{' '}
                <span className="text-red-600">*</span>
              </label>
            </div>
            {error && <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 rounded px-3 py-2 text-xs sm:text-sm font-medium mt-2"><span role="img" aria-label="error">❌</span>{error}</div>}
            {success && <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 rounded px-3 py-2 text-xs sm:text-sm font-medium mt-2"><span role="img" aria-label="success">✅</span>{success}</div>}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-base sm:text-lg font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg border-2 border-[#bfae3a] bg-gradient-to-r from-[#0a174e] via-[#142a5c] to-[#1a2250] text-[#d4af37] transition hover:scale-105 hover:from-[#142a5c] hover:to-[#1a2250] hover:text-[#e6c200] hover:border-[#e6c200] focus:outline-none focus:ring-4 focus:ring-[#142a5c] ${
                name && email && phone && tickets && captchaInput && acceptTerms && !loading
                  ? "cursor-pointer"
                  : "opacity-60 cursor-not-allowed"
              }`}
              disabled={
                !name || !email || !phone || !tickets || !captchaInput || !acceptTerms || loading
              }
            >
              {loading ? (
                <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-[#d4af37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Processing...</span>
              ) : (
                <span>Pay Now & Register</span>
              )}
            </button>
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