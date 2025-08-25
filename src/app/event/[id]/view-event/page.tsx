"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/cards/Navbar";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { EventFormView, Speaker, Faq } from "@/interfaces/event-form";

const EventLivePreview = dynamic(
  () => import("@/components/event-live-preview"),
  { ssr: false }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dep2-backend.onrender.com";

interface MappedSpeaker extends Speaker {
  image: null;
  imagePreview: string;
}

interface User {
  userId?: number | string;
  name?: string;
  email?: string;
  role?: number | string;
  isAdminVerified?: boolean;
}

interface MappedEvent extends EventFormView {
  speakers: MappedSpeaker[];
  faqs: Faq[];
  coverImageUrl: string;
  vibeVideoUrl: string;
  description: string;
  isPaid: boolean;
  price: number | string;
}

function mapEventData(data: unknown): MappedEvent {
  const event = typeof data === "object" && data !== null && "data" in data
    ? (data as { data: EventFormView }).data
    : (data as EventFormView);

  const arr = <T,>(v: T | T[] | undefined): T[] =>
    Array.isArray(v) ? v : v ? [v] : [];


  const speakers: MappedSpeaker[] = arr(event.speakers).map((s: Speaker) => {
    let photoPath = s.photoUrl || "";
    if (photoPath && !photoPath.startsWith("/")) photoPath = "/" + photoPath;
    if (photoPath.startsWith("/wwwroot/"))
      photoPath = photoPath.replace("/wwwroot", "");
    return {
      ...s,
      image: null,
      imagePreview: photoPath ? `${API_URL}${photoPath}` : "",
    };
  });

  let faqs: Faq[] = [];
  if (Array.isArray(event.faqs)) {
    faqs = event.faqs.map((f) => ({
      question: f.question || "",
      answer: f.answer || "",
    }));
  } else if (event.faqs && typeof event.faqs === "object") {
    faqs = [
      {
        question: (event.faqs as Faq).question || "",
        answer: (event.faqs as Faq).answer || "",
      },
    ];
  }

  let coverPath = event.coverImage || "";
  if (coverPath && !coverPath.startsWith("/")) coverPath = "/" + coverPath;
  if (coverPath.startsWith("/wwwroot/"))
    coverPath = coverPath.replace("/wwwroot", "");
  if (!coverPath.startsWith("/uploads/covers/") && coverPath) {
    coverPath = coverPath.replace(/^\/+/, "").replace(/^uploads\/covers\//, "");
    coverPath = "/uploads/covers/" + coverPath;
  }
  const coverImageUrl = coverPath ? `${API_URL}${coverPath}` : "";

    let vibePath = event.vibeVideoUrl || event.vibeVideo || "";
    if (vibePath && !vibePath.startsWith("/")) vibePath = "/" + vibePath;
    if (vibePath.startsWith("/wwwroot/"))
      vibePath = vibePath.replace("/wwwroot", "");
    const vibeVideoUrl = vibePath ? `${API_URL}${vibePath}` : "";

  function processDescriptionHtml(html: string | undefined): string {
    if (!html) return '<span style="color:#bbb">[Description]</span>';
    return html.replace(
      /<img([^>]+)src=['"](?!(?:https?:|data:))\/?(uploads|wwwroot\/uploads)?\/?([^'">]+)['"]/gi,
      (match: string, pre: string, folder: string, path: string) => {
        const cleanPath = path
          .replace(/^wwwroot\//, "")
          .replace(/^uploads\//, "");
        return `<img${pre}src="${API_URL}/uploads/${cleanPath}"`;
      }
    );
  }
  const description = processDescriptionHtml(event.description || "");

  return {
    ...event,
    speakers,
    faqs,
    coverImageUrl,
    vibeVideoUrl,
    description,
    isPaid: event.isPaid ?? false,
    price:
      event.price !== undefined && event.price !== null
        ? event.price
        : (typeof event === 'object' && event !== null && 'Price' in event && (event as Record<string, unknown>).Price !== undefined && (event as Record<string, unknown>).Price !== null)
          ? (event as Record<string, unknown>).Price as number | string
          : 0,
  };
}

const ViewEventPage = () => {
  const params = useParams();
  const eventId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : null;

  const [event, setEvent] = useState<MappedEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [approved, setApproved] = useState<boolean>(false);
  const [editCount, setEditCount] = useState<number>(0);
  const [showEditedVersion, setShowEditedVersion] = useState<boolean>(false);
  const [editedEvent, setEditedEvent] = useState<MappedEvent | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);

  useEffect(() => {
    if (event && typeof event.isVerifiedByAdmin !== "undefined") {
      setApproved(event.isVerifiedByAdmin);
    }
  }, [event]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        try {
          const userObj: User = JSON.parse(userRaw);
          setIsAdmin(
            userObj.role === 1 ||
              userObj.role === "1" ||
              userObj.role === "Admin"
          );
          setIsAdminVerified(Boolean(userObj.isAdminVerified));
        } catch {}
      }
    }
  }, []);

  function toCamelCaseObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = obj[key];
    }
    return result;
  }

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`${API_URL}/api/events/${eventId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch event");
        return res.json();
      })
      .then((data) => {
        const mainEvent = mapEventData(data.data);
        let editedEventObj: MappedEvent | null = null;

        const rawCustomFields = data.data.customFields;

        if (
          mainEvent.editEventCount === -1 &&
          mainEvent.isVerifiedByAdmin === false &&
          rawCustomFields &&
          typeof rawCustomFields === "string"
        ) {
          try {
            const parsedCustomFields = JSON.parse(rawCustomFields) as Record<string, unknown>;
            const camelCasedFields = toCamelCaseObject(parsedCustomFields);

            const mergedEvent = {
              ...data.data,
              ...camelCasedFields,
            };

            editedEventObj = mapEventData(mergedEvent);
            setEditedEvent(editedEventObj);
          } catch (e) {
            console.error("Failed to parse customFields:", e);
          }
        }

        setEvent(mainEvent);
        setEditCount(data.data.editEventCount || 0);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  async function handleApprove(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!event) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let res: Response;
      if (editCount >= 0) {
        res = await fetch(
          `${API_URL}/api/Admin/event/${event.eventId}/approve`,
          {
            method: "PUT",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      } else {
        res = await fetch(
          `${API_URL}/api/Admin/event-edit/${event.eventId}/approve`,
          {
            method: "PUT",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      }
      const data = await res.json();
      if (data && data.success) {
        setApproved(true);
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("eventApproved"));
      } else {
        alert(data?.message || "Failed to approve event.");
      }
    } catch (err) {
      alert("Failed to approve event.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
        <div className="p-8 text-center text-lg font-semibold text-gray-700 bg-white/80 rounded-xl shadow-lg border border-orange-100 animate-pulse flex flex-col items-center justify-center gap-6">
          <img src="/images/jetpack-loading.gif" alt="Loading..." className="w-24 h-24 mb-4" />
          Loading event details...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
        <div className="p-8 text-center text-lg font-semibold text-red-600 bg-white/80 rounded-xl shadow-lg border border-red-100">
          {error}
        </div>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
        <div className="p-8 text-center text-lg font-semibold text-gray-500 bg-white/80 rounded-xl shadow-lg border border-gray-100">
          No event found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-100 py-6 px-0 flex flex-col">
      <Navbar forceAdminDashboard={isAdmin === true} />
      <div
        className="w-full"
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "stretch",
        }}
      >
        <div className="w-full">
          {isAdmin &&
          event.isVerifiedByAdmin === false &&
          editCount === -1 &&
          editedEvent ? (
            <div className="mt-12 w-full">
              <h2 className="text-xl font-bold text-center text-red-600 mb-4">
                Changes Detected — Review Before Approving
              </h2>

              <div className="flex justify-center mb-6">
                <button
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
                  onClick={() => setShowEditedVersion(!showEditedVersion)}
                >
                  {showEditedVersion
                    ? "View Previous Version"
                    : "View Edited Version"}
                </button>
              </div>

              <div className="border rounded-xl shadow-md bg-white p-4 w-full">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 text-center">
                  {showEditedVersion ? "Edited Version" : "Previous Version"}
                </h3>
                <EventLivePreview
                  event={showEditedVersion ? editedEvent : event}
                />
              </div>
            </div>
          ) : (
            <div
              className="w-full rounded-3xl shadow-2xl border border-orange-100/60 bg-white/70 backdrop-blur-md p-0 md:p-2 lg:p-6 transition-all duration-300 hover:shadow-[0_8px_40px_#f59e4299]"
              style={{
                boxShadow:
                  "0 8px 40px 0 rgba(80, 80, 120, 0.10), 0 1.5px 8px 0 #f59e4299",
              }}
            >
              <EventLivePreview event={event} />
            </div>
          )}
          <div className="w-full flex justify-center mt-8">
            {isAdmin && typeof event.isVerifiedByAdmin !== "undefined" ? (
              approved ? (
                <span className="bg-green-500 text-white text-lg py-2 px-8 rounded-xl shadow-md font-bold tracking-wide select-none cursor-default">
                  Approved
                </span>
              ) : (
                <button
                  className="bg-orange-500 text-white text-lg py-2 px-8 rounded-xl shadow-md font-bold tracking-wide hover:bg-orange-600 transition cursor-pointer"
                  aria-label="Approve event"
                  onClick={handleApprove}
                >
                  Approve Event
                </button>
              )
            ) : (
              <a
                href={`/event/${event.eventId}/register`}
                className="bg-gradient-to-r from-blue-100 via-blue-300 to-yellow-100 py-2 px-8 rounded-xl shadow-md hover:from-blue-200 hover:to-yellow-200 transition cursor-pointer select-none font-semibold tracking-wide text-[#0a174e] text-lg"
                aria-label="Register for event"
                style={{ boxShadow: '0 2px 16px 0 #fff8dc99, 0 4px 32px 0 #bae6fd99' }}
              >
                Register Now
              </a>
            )}
          </div>
          <style jsx global>{`
            @keyframes blink {
              0%,
              100% {
                filter: brightness(1);
                box-shadow: 0 2px 16px 0 #a21caf55;
              }
              50% {
                filter: brightness(1.25);
                box-shadow: 0 4px 32px 0 #a21caf99;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ViewEventPage;