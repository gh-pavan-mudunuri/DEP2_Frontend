"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/cards/Navbar";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const EventLivePreview = dynamic(() => import("@/components/event-live-preview"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";

// Utility function (optional): Convert PascalCase keys to camelCase
function toCamelCaseObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[camelKey] = obj[key];
  }
  return result;
}

const mapEventData = (data: any) => {
  const event = data && typeof data === 'object' && data.data ? data.data : data;
  const arr = (v: any) => Array.isArray(v) ? v : v ? [v] : [];

  const speakers = arr(event.speakers).map((s: any) => {
    let photoPath = s.photoUrl || '';
    if (photoPath && !photoPath.startsWith('/')) photoPath = '/' + photoPath;
    if (photoPath.startsWith('/wwwroot/')) photoPath = photoPath.replace('/wwwroot', '');
    return {
      name: s.name || '',
      bio: s.bio || '',
      photoUrl: photoPath,
      image: null,
      imagePreview: photoPath ? `${API_URL}${photoPath}` : '',
    };
  });

  let faqs: { question: string; answer: string }[] = [];
  if (Array.isArray(event.faqs)) {
    faqs = event.faqs.map((f: any) => ({
      question: f.question || '',
      answer: f.answer || '',
    }));
  } else if (event.faqs && typeof event.faqs === 'object') {
    faqs = [{
      question: event.faqs.question || '',
      answer: event.faqs.answer || '',
    }];
  }

  let coverPath = event.coverImage || '';
  if (coverPath && !coverPath.startsWith('/')) coverPath = '/' + coverPath;
  if (coverPath.startsWith('/wwwroot/')) coverPath = coverPath.replace('/wwwroot', '');
  if (!coverPath.startsWith('/uploads/covers/') && coverPath) {
    coverPath = coverPath.replace(/^\/+/, '').replace(/^uploads\/covers\//, '');
    coverPath = '/uploads/covers/' + coverPath;
  }
  const coverImageUrl = coverPath ? `${API_URL}${coverPath}` : '';

  let vibePath = event.vibeVideoUrl || '';
  if (vibePath && !vibePath.startsWith('/')) vibePath = '/' + vibePath;
  if (vibePath.startsWith('/wwwroot/')) vibePath = vibePath.replace('/wwwroot', '');
  const vibeVideoUrl = vibePath ? `${API_URL}${vibePath}` : '';

  function processDescriptionHtml(html: string | undefined): string {
    if (!html) return '<span style="color:#bbb">[Description]</span>';
    return html.replace(
      /<img([^>]+)src=['"](?!(?:https?:|data:))\/?(uploads|wwwroot\/uploads)?\/?([^'">]+)['"]/gi,
      (
        match: string,
        pre: string,
        folder: string,
        path: string
      ) => {
        let cleanPath = path.replace(/^wwwroot\//, '').replace(/^uploads\//, '');
        return `<img${pre}src="${API_URL}/uploads/${cleanPath}"`;
      }
    );
  }

  let description = processDescriptionHtml(event.description || '');

  return {
    ...event,
    speakers,
    faqs,
    coverImageUrl,
    vibeVideoUrl,
    description,
    isPaid: event.isPaid ?? event.isPaidEvent ?? false,
    price: event.price ?? event.ticketPrice ?? 0,
  };
};

const ViewEventPage = () => {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editedEvent, setEditedEvent] = useState<any>(null);
  const [editCount, setEditCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`${API_URL}/api/events/${eventId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch event");
        return res.json();
      })
      .then((data) => {
        const mainEvent = mapEventData(data.data);
        let editedEvent = null;

        const rawCustomFields = data.data.customFields;

        if (
          mainEvent.editEventCount === -1 &&
          mainEvent.isVerifiedByAdmin === false &&
          rawCustomFields &&
          typeof rawCustomFields === "string"
        ) {
          try {
            const parsedCustomFields = JSON.parse(rawCustomFields);
            const camelCasedFields = toCamelCaseObject(parsedCustomFields);

            const mergedEvent = {
              ...data.data,
              ...camelCasedFields,
            };

            const editedEvent1 = mapEventData(mergedEvent);

            console.log("Parsed custom fields:", editedEvent1);
            setEditedEvent(editedEvent1);
          } catch (e) {
            console.error("Failed to parse customFields:", e);
          }
        }

        setEvent(mainEvent);
        
        setEditCount(data.data.editEventCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setIsAdmin(userObj.role === 1);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
  }, []);

  if (isAdmin === null) return null;

  if (loading) {
    return (
      <>
        <Navbar forceAdminDashboard={isAdmin === true} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
          <div className="p-8 text-center text-lg font-semibold text-gray-700 bg-white/80 rounded-xl shadow-lg border border-orange-100 animate-pulse">
            Loading event details...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar forceAdminDashboard={isAdmin === true} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
          <div className="p-8 text-center text-lg font-semibold text-red-600 bg-white/80 rounded-xl shadow-lg border border-red-100">
            {error}
          </div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar forceAdminDashboard={isAdmin === true} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
          <div className="p-8 text-center text-lg font-semibold text-gray-500 bg-white/80 rounded-xl shadow-lg border border-gray-100">
            No event found.
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-100 py-6 px-0 flex flex-col items-center">
      <Navbar forceAdminDashboard={isAdmin === true} />
      <div
        className="w-full"
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >


        {isAdmin && event.isVerifiedByAdmin === false && editCount === -1 && editedEvent ? (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-center text-red-600 mb-4">Changes Detected — Review Before Approving</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-xl shadow-md bg-white p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Previous Version</h3>
                <EventLivePreview event={event} />
              </div>
              <div className="border rounded-xl shadow-md bg-yellow-50 p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Edited Version</h3>
                <EventLivePreview event={editedEvent} />
              </div>
            </div>
          </div>
        ) :         <div
          className="w-full rounded-3xl shadow-2xl border border-orange-100/60 bg-white/70 backdrop-blur-md p-0 md:p-2 lg:p-6 transition-all duration-300 hover:shadow-[0_8px_40px_#f59e4299]"
          style={{
            boxShadow: "0 8px 40px 0 rgba(80, 80, 120, 0.10), 0 1.5px 8px 0 #f59e4299",
          }}
        >
          <EventLivePreview event={event} />
        </div>}
      </div>
    </div>
  );
};

export default ViewEventPage;
