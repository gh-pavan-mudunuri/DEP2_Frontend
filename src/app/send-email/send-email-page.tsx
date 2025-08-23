"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import Navbar from "@/components/cards/Navbar";
import PopupMessage from "@/components/common/popup-message";

// Type definition for the popup message state for better type safety
type PopupType = "success" | "error";

interface PopupState {
  message: string;
  type?: PopupType;
}

// Interface for the user object stored in localStorage
interface UserLocalStorage {
  email?: string;
}

export default function SendEmailPage() {
  const searchParams = useSearchParams();
  const organiserEmail = searchParams.get("to") || "";
  const eventTitle = searchParams.get("event") || "";

  // State hooks with explicit types
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>(organiserEmail);
  const [subject, setSubject] = useState<string>(
    eventTitle ? `Regarding: ${eventTitle}` : ""
  );
  const [body, setBody] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => {
    // Pre-fill the 'from' field with the user's email from localStorage
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userRaw) {
      try {
        const userObj: UserLocalStorage = JSON.parse(userRaw);
        setFrom(userObj.email || "");
      } catch {
        // Ignore JSON parsing errors silently
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setPopup(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Using the deployed backend URL from your original snippet
      await axios.post("https://dep2-backend.onrender.com/api/email/send-to-organiser", {
        from,
        to,
        subject,
        body
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setPopup({ message: "Email sent successfully!", type: "success" });
      setBody(""); // Clear the message body on success
    } catch (err) {
      // Robust error handling to provide specific feedback
      let errorMsg = "Failed to send email.";
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors
        errorMsg = err.response?.data?.message ?? errorMsg;
      } else if (err instanceof Error) {
        // Handle generic JavaScript errors
        errorMsg = err.message;
      }
      setPopup({ message: errorMsg, type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navbar forceAdminDashboard={true} />
      <div className="flex items-center justify-center py-8 px-2">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 mt-8">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2 flex items-center gap-2">
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 text-blue-500'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75' />
            </svg>
            Send Email to Organiser
          </h2>
          <p className="text-gray-500 mb-6">Fill out the form below to contact the event organiser directly.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block font-semibold mb-1 text-blue-700">From</label>
              <input type="email" className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" value={from} onChange={e => setFrom(String(e.target.value))} required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-blue-700">To</label>
              <input type="email" className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed" value={to} onChange={e => setTo(String(e.target.value))} required readOnly />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-blue-700">Subject</label>
              <input type="text" className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" value={subject} onChange={e => setSubject(String(e.target.value))} required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-blue-700">Body</label>
              <textarea className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition" value={body} onChange={e => setBody(e.target.value)} required />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-2 rounded-lg font-bold text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={sending}>
              {sending ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                  </svg>
                  Send
                </>
              )}
            </button>
            {popup && (
              <PopupMessage
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup(null)}
                duration={2500}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}