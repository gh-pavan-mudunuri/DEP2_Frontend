"use client";
import { JSX, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EventForm from "@/components/event-form/page";
import type {
  EventFormData,
  Speaker,
  Faq,
  Occurrence,
  Media,
  CustomDate,
} from "@/interfaces/event-form";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dep2-backend.onrender.com";

export default function EditEventPage(): JSX.Element | null {
  const router = useRouter();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  const [initialData, setInitialData] = useState<EventFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editCount, setEditCount] = useState<number>(0);
  const [isAdminApproved, setIsAdminApproved] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Utility function to ensure proper array type conversion
  const arr = <T,>(v: T | T[] | null | undefined): T[] => {
    return Array.isArray(v) ? v : v ? [v] : [];
  };

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    axios.get(`${API_URL}/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data = res.data;
        console.log("[DEBUG] Raw event data from backend:", data.data);

        const event = data && typeof data === "object" && data.data ? data.data : data;

        // --- Robust mapping for all event fields ---
        const speakers: Speaker[] = arr<Speaker>(event.speakers).map((s) => {
          let photoPath = s.photoUrl || "";
          if (photoPath && !photoPath.startsWith("/")) photoPath = "/" + photoPath;
          if (photoPath.startsWith("/wwwroot/")) photoPath = photoPath.replace("/wwwroot", "");
          return {
            name: s.name || "",
            bio: s.bio || "",
            photoUrl: photoPath,
            image: null,
            imagePreview: photoPath ? `${API_URL}${photoPath}` : "",
          };
        });

        // FAQs (ensure always array, never null)
        let faqs: Faq[] = [];
        if (Array.isArray(event.faqs)) {
          faqs = event.faqs.map((f: Faq) => ({
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

        // Occurrences
        const occurrences: Occurrence[] = arr<Occurrence>(event.occurrences).map((o) => ({
          start: o.startTime ? new Date(o.startTime).toISOString().slice(0, 16) : "",
          end: o.endTime ? new Date(o.endTime).toISOString().slice(0, 16) : "",
          location: o.location || "",
        }));

        // Custom Dates for custom recurrence (parse from customFields if present)
        let customDates: CustomDate[] = [];
        if (event.recurrenceType === "custom") {
          if (
            typeof event.customFields === "string" &&
            event.customFields.trim().startsWith("[")
          ) {
            try {
              const parsed = JSON.parse(event.customFields);
              if (Array.isArray(parsed)) {
                customDates = parsed.map((d: CustomDate) => ({
                  start: d.start ? new Date(d.start).toISOString().slice(0, 16) : "",
                  end: d.end ? new Date(d.end).toISOString().slice(0, 16) : "",
                }));
              }
            } catch {
              customDates = occurrences;
            }
          } else {
            customDates = occurrences;
          }
        }

        // Media (for preview only, not upload)
        let coverPath = event.coverImage || "";
        if (coverPath && !coverPath.startsWith("/")) coverPath = "/" + coverPath;
        if (coverPath.startsWith("/wwwroot/")) coverPath = coverPath.replace("/wwwroot", "");
        if (!coverPath.startsWith("/uploads/covers/") && coverPath) {
          coverPath = coverPath.replace(/^\/+/, "").replace(/^uploads\/covers\//, "");
          coverPath = "/uploads/covers/" + coverPath;
        }
        const coverImageUrl = coverPath ? `${API_URL}${coverPath}` : "";

        let vibePath = event.vibeVideoUrl || "";
        if (vibePath && !vibePath.startsWith("/")) vibePath = "/" + vibePath;
        if (vibePath.startsWith("/wwwroot/")) vibePath = vibePath.replace("/wwwroot", "");
        const vibeVideoPreview = vibePath ? `${API_URL}${vibePath}` : "";
        const media: Media[] = arr<Media>(event.media);

        // --- Fix description image src URLs to point to uploads/media-images if needed ---
        let description = event.description || "";
        description = description.replace(
          /src=["']\/?uploads\/(media-images|media)\/(.*?)["']/g,
          (_match: string, folder: string, filename: string) => {
            return `src="${API_URL}/uploads/${folder}/${filename}"`;
          }
        );
        description = description.replace(
          /src=["']uploads\/(media-images|media)\/(.*?)["']/g,
          (_match: string, folder: string, filename: string) => {
            return `src="${API_URL}/uploads/${folder}/${filename}"`;
          }
        );

        // Also replace __MEDIA_X__ placeholders with actual media image URLs
        if (Array.isArray(media)) {
          media.forEach((m, idx: number) => {
            if (m.mediaType && m.mediaType.toLowerCase() === "image" && m.mediaUrl) {
              const url = m.mediaUrl.startsWith("http")
                ? m.mediaUrl
                : `${API_URL}${m.mediaUrl}`;
              description = description.replace(`__MEDIA_${idx}__`, url);
            }
          });
        }

        setInitialData({
          title: event.title || "",
          OrganizerName: event.organizerName || "",
          organizerEmail: event.organizerEmail || "",
          eventStart: event.eventStart
            ? new Date(event.eventStart).toISOString().slice(0, 16)
            : "",
          eventEnd: event.eventEnd
            ? new Date(event.eventEnd).toISOString().slice(0, 16)
            : "",
          registrationDeadline: event.registrationDeadline
            ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
            : "",
          maxAttendees: event.maxAttendees ? String(event.maxAttendees) : "",
          recurrenceType: event.recurrenceType || "None",
          recurrenceRule: event.recurrenceRule || "",
          customDates,
          customFields: event.customFields || "",
          location: event.location || "",
          eventLink: event.eventLink || "",
          description,
          type: event.eventType || "Location Based",
          category: event.category || "",
          otherCategory: event.otherCategory || "",
          isPaid: event.isPaidEvent || false,
          price:
            event.price !== undefined && event.price !== null
              ? String(event.price)
              : event.Price !== undefined && event.Price !== null
                ? String(event.Price)
                : "",
          image: null,
          coverImageUrl,
          vibeVideo: null,
          vibeVideoPreview,
          speakers,
          faqs,
          occurrences,
          media,
        });

        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!initialData) return <div>No event found.</div>;

  return <EventForm initialData={initialData} isEditMode eventId={eventId}  />;
}