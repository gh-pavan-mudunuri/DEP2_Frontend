"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EventForm from "@/components/event-form/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";

type EventFormData = {
  title: string;
  OrganizerName: string;
  organizerEmail: string;
  eventStart: string;
  eventEnd: string;
  registrationDeadline: string;
  maxAttendees: string;
  recurrenceType: string;
  recurrenceRule: string;
  customDates: any[];
  customFields: string;
  location: string;
  eventLink: string;
  description: string;
  type: string;
  category: string;
  otherCategory: string;
  isPaid: boolean;
  price: string | number;
  image: File | null;
  coverImageUrl: string;
  vibeVideo: File | null;
  vibeVideoPreview: string;
  speakers: any[];
  faqs: any[];
  occurrences: any[];
  media: any[];
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;
  const [initialData, setInitialData] = useState<EventFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editCount, setEditCount] = useState(0);
  const [isAdminApproved, setIsAdminApproved] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const token = localStorage.getItem("token"); // Change key if your JWT is stored under a different name
    fetch(`${API_URL}/api/events/${eventId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error('[ERROR] Failed to fetch event:', res.status, text);
          throw new Error(`Failed to fetch event: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        // Debug: Log the raw backend event data
        console.log('[DEBUG] Raw event data from backend:', data.data);
        // Support both { data: event } and plain event object
        const event = data && typeof data === 'object' && data.data ? data.data : data;

        // --- Robust mapping for all event fields ---
        const arr = (v: any) => Array.isArray(v) ? v : v ? [v] : [];
        // Speakers
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
        // FAQs (ensure always array, never null)
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
        // Occurrences
        const occurrences = arr(event.occurrences).map((o: any) => ({
          start: o.startTime ? new Date(o.startTime).toISOString().slice(0,16) : '',
          end: o.endTime ? new Date(o.endTime).toISOString().slice(0,16) : '',
          location: o.location || '',
        }));
        // Custom Dates for custom recurrence (parse from customFields if present)
        let customDates: any[] = [];
        if (event.recurrenceType === 'custom') {
          if (typeof event.customFields === 'string' && event.customFields.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(event.customFields);
              if (Array.isArray(parsed)) {
                customDates = parsed.map((d: any) => ({
                  start: d.start ? new Date(d.start).toISOString().slice(0,16) : '',
                  end: d.end ? new Date(d.end).toISOString().slice(0,16) : '',
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
        let coverPath = event.coverImage || '';
        if (coverPath && !coverPath.startsWith('/')) coverPath = '/' + coverPath;
        if (coverPath.startsWith('/wwwroot/')) coverPath = coverPath.replace('/wwwroot', '');
        if (!coverPath.startsWith('/uploads/covers/') && coverPath) {
          coverPath = coverPath.replace(/^\/+/,'').replace(/^uploads\/covers\//,'');
          coverPath = '/uploads/covers/' + coverPath;
        }
        const coverImageUrl = coverPath ? `${API_URL}${coverPath}` : '';
        let vibePath = event.vibeVideoUrl || '';
        if (vibePath && !vibePath.startsWith('/')) vibePath = '/' + vibePath;
        if (vibePath.startsWith('/wwwroot/')) vibePath = vibePath.replace('/wwwroot', '');
        const vibeVideoPreview = vibePath ? `${API_URL}${vibePath}` : '';
        // Media array
        const media = arr(event.media);

        // --- Fix description image src URLs to point to uploads/media-images if needed ---
        let description = event.description || '';
        // Replace src for any uploads/media* or uploads/media-images* with absolute API_URL
        description = description.replace(/src=["']\/?uploads\/(media-images|media)\/(.*?)["']/g, (match: string, folder: string, filename: string) => {
          return `src="${API_URL}/uploads/${folder}/${filename}"`;
        });
        // Also handle src without leading slash (rare DB cases)
        description = description.replace(/src=["']uploads\/(media-images|media)\/(.*?)["']/g, (match: string, folder: string, filename: string) => {
          return `src="${API_URL}/uploads/${folder}/${filename}"`;
        });
        // Replace __MEDIA_X__ placeholders with actual media image URLs from event.media
        if (Array.isArray(media)) {
          media.forEach((m: any, idx: number) => {
            if (m.mediaType && m.mediaType.toLowerCase() === 'image' && m.mediaUrl) {
              const url = m.mediaUrl.startsWith('http') ? m.mediaUrl : `${API_URL}${m.mediaUrl}`;
              description = description.replace(`__MEDIA_${idx}__`, url);
            }
          });
        }

        setInitialData({
          title: event.title || '',
          OrganizerName: event.organizerName || '',
          organizerEmail: event.organizerEmail || '',
          eventStart: event.eventStart ? new Date(event.eventStart).toISOString().slice(0,16) : '',
          eventEnd: event.eventEnd ? new Date(event.eventEnd).toISOString().slice(0,16) : '',
          registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0,16) : '',
          maxAttendees: event.maxAttendees ? String(event.maxAttendees) : "",
          recurrenceType: event.recurrenceType || 'None',
          recurrenceRule: event.recurrenceRule || '',
          customDates,
          customFields: event.customFields || '',
          location: event.location || '',
          eventLink: event.eventLink || '',
          description,
          type: event.eventType || 'Location Based',
          category: event.category || '',
          otherCategory: event.otherCategory || '',
          isPaid: event.isPaidEvent || false,
          price: event.price !== undefined && event.price !== null ? String(event.price) : '',
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
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!initialData) return <div>No event found.</div>;

  return <EventForm initialData={initialData} isEditMode eventId={eventId} editCount={editCount} verified={isAdminApproved} />;
}