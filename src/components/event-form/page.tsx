"use client";
import { FaUserCircle } from "react-icons/fa";
import { EventFormPopupContext } from "./layout";
import ConfirmationDialog from "../common/confirmation-dialog";
import dynamic from "next/dynamic";
import { EventFormData } from "@/interfaces/event-form";
import {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  useContext,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Node, mergeAttributes, RawCommands, CommandProps } from "@tiptap/core";
import { useRouter } from "next/navigation";

const EventLivePreview = dynamic(
  () => import("@/components/event-live-preview"),
  { ssr: false }
);

// Ensure bullet/number markers always show in description preview
if (typeof window !== "undefined") {
  const styleId = "force-bullets-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      /* Preview/editor area bullets: marker and text on same line */
      .description-preview ul, .tiptap-content ul {
        list-style-type: disc !important;
        list-style-position: outside !important;
        margin-left: 1.5em !important;
        padding-left: 0 !important;
      }
      .description-preview ul li, .tiptap-content ul li {
        list-style-type: disc !important;
        display: list-item !important;
        margin-left: 0 !important;
        padding-left: 0.3em !important;
        font-size: 1em;
        line-height: 1.7;
      }
      .description-preview ol, .tiptap-content ol {
        list-style-type: decimal !important;
        list-style-position: outside !important;
        margin-left: 1.5em !important;
        padding-left: 0 !important;
      }
      .description-preview ol li, .tiptap-content ol li {
        list-style-type: decimal !important;
        display: list-item !important;
        margin-left: 0 !important;
        padding-left: 0.3em !important;
        font-size: 1em;
        line-height: 1.7;
      }
    `;
    document.head.appendChild(style);
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dep2-backend.onrender.com";

// Pencil SVG as data URI for cursor
const pencilCursor =
  'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g><polygon points="2,30 8,28 26,10 22,6 4,24" fill="%23fbbf24" stroke="%233b2f13" stroke-width="2"/><rect x="22" y="6" width="4" height="4" fill="%23a3a3a3" stroke="%233b2f13" stroke-width="2"/><polygon points="2,30 8,28 4,24" fill="%23fff" stroke="%233b2f13" stroke-width="1"/></g></svg>\') 0 32, auto';

interface VideoAttrs {
  src: string;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      insertVideo: (attrs: VideoAttrs) => ReturnType;
    };
  }
}

const Video = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,
  addAttributes() {
    return {};
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
  return ["video", mergeAttributes(HTMLAttributes)];
},
  addCommands() {
    return {
      insertVideo:
        (attrs: VideoAttrs) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});

type Speaker = {
  name: string;
  image: File | null;
  imagePreview: string;
  bio: string;
  photoUrl: string;
};
type Faq = { question: string; answer: string };
type Occurrence = {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
};
type CustomDate = { start: string; end: string };

type EventFormProps = {
  initialData?: Partial<EventFormData>;
  isEditMode?: boolean;
  eventId?: string | null;
};

export default function EventForm({
  initialData,
  isEditMode = false,
  eventId,
}: EventFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const setPopup = useContext(EventFormPopupContext);

  const defaultEventData: EventFormData = {
    title: "",
    OrganizerName: "",
    organizerEmail: "",
    eventStart: "",
    eventEnd: "",
    registrationDeadline: "",
    maxAttendees: "",
    recurrenceType: "None",
    recurrenceRule: "",
    customDates: [],
    customFields: "",
    location: "",
    eventLink: "",
    description: "",
    type: "Venue",
    category: "",
    otherCategory: "",
    isPaid: false,
    price: "",
    image: null,
    coverImageUrl: "",
    vibeVideo: null,
    vibeVideoPreview: "",
    speakers: [
      { name: "", image: null, imagePreview: "", bio: "", photoUrl: "" },
    ],
    faqs: [{ question: "", answer: "" }],
    occurrences: [],
    media: [],
  };

  const [eventData, setEventData] = useState<EventFormData>({
    ...defaultEventData,
    ...(initialData || {}),
  });

  const isFormComplete = () => {
    if (
      !eventData.title.trim() ||
      !eventData.OrganizerName.trim() ||
      !eventData.organizerEmail.trim() ||
      !eventData.eventStart ||
      !eventData.eventEnd ||
      !eventData.registrationDeadline ||
      !eventData.maxAttendees ||
      !eventData.type ||
      !eventData.category ||
      !eventData.description.trim()
    ) {
      return false;
    }
    if (!isEditMode && !eventData.image && !eventData.coverImageUrl)
      return false;
    if (eventData.isPaid && (!eventData.price || Number(eventData.price) < 0))
      return false;
    if (eventData.type === "Venue" && !eventData.location.trim()) return false;
    if (eventData.type === "Online" && !eventData.eventLink.trim())
      return false;
    if (eventData.recurrenceType === "rule" && !eventData.recurrenceRule.trim())
      return false;
    if (
      eventData.recurrenceType === "custom" &&
      (!eventData.customDates || eventData.customDates.length === 0)
    )
      return false;
    const allowedCategories = [
      "Music",
      "Tech",
      "Health",
      "Education",
      "Business",
      "Conference",
      "Exhibitions",
      "Others",
    ];
    if (
      !allowedCategories.includes(eventData.category) &&
      !eventData.category.trim()
    )
      return false;
    return true;
  };

  useEffect(() => {
    if (initialData) {
      setEventData((prev) => {
        let type = initialData.type || "Venue";
        if (
          type.toLowerCase() === "location based" ||
          type.toLowerCase() === "location" ||
          type.toLowerCase() === "venue"
        ) {
          type = "Venue";
        } else if (type.toLowerCase() === "online") {
          type = "Online";
        } else if (type.toLowerCase().includes("announce")) {
          type = "TBA";
        }

        const speakers = (initialData.speakers || []).map(
          (s: Partial<Speaker>) => ({
            name: s.name || "",
            bio: s.bio || "",
            image: null,
            imagePreview: s.photoUrl
              ? s.photoUrl.startsWith("http")
                ? s.photoUrl
                : `${API_URL}${s.photoUrl}`
              : "",
            photoUrl: s.photoUrl ?? "",
          })
        ) as Speaker[];

        return {
          ...defaultEventData,
          ...prev,
          ...initialData,
          type,
          recurrenceType:
            typeof initialData.recurrenceType === "string"
              ? initialData.recurrenceType
              : initialData.recurrenceType || "None",
          location:
            typeof initialData.location === "string"
              ? initialData.location
              : initialData.location || "",
          maxAttendees:
            initialData.maxAttendees !== undefined &&
            initialData.maxAttendees !== null
              ? String(initialData.maxAttendees)
              : "",
          speakers,
        };
      });
    }
  }, [initialData]);

  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmitEvent, setPendingSubmitEvent] =
    useState<FormEvent<HTMLFormElement> | null>(null);
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string>("");

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const type = "type" in e.target ? e.target.type : "text";

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEventData({ ...eventData, [name]: checked });
    } else {
      if (name === "recurrenceType") {
        setEventData({
          ...eventData,
          recurrenceType: String(value),
          recurrenceRule: value === "rule" ? eventData.recurrenceRule : "",
          customDates: value === "custom" ? eventData.customDates || [] : [],
          customFields:
            value === "custom"
              ? JSON.stringify(eventData.customDates || [])
              : "",
        });
      } else if (
        name === "maxAttendees" &&
        (value === "0" || Number(value) === 0)
      ) {
        if (setPopup)
          setPopup({ message: "Max people can't be zero.", type: "error" });
        return;
      } else {
        setEventData({ ...eventData, [name]: value });
      }
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setEventData({ ...eventData, image: file });
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleVibeVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setEventData((prev) => ({
        ...prev,
        vibeVideo: file,
        vibeVideoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
      }),
      Image,
      Link,
      Video,
    ],
    content: eventData.description || "",
    onUpdate: ({ editor }) => {
      setEventData((prev) => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] p-4 border rounded bg-white list-disc pl-6 prose prose-sm max-w-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (
      editor &&
      !editor.isFocused &&
      eventData.description !== editor.getHTML()
    ) {
      editor.commands.setContent(eventData.description || "");
    }
  }, [eventData.description, editor]);

  const handleImageUploadTiptap = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && editor) {
        Array.from(files).forEach((file) => {
          if (!file.type.startsWith("image/")) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "image",
                attrs: { src: ev.target?.result as string },
              })
              .run();
          };
          reader.readAsDataURL(file);
        });
        e.target.value = "";
      }
    },
    [editor]
  );

  const handleSpeakerNameChange = (idx: number, value: string) => {
    const speakers = [...eventData.speakers];
    speakers[idx].name = value;
    // Deduplicate by name and bio
    const deduped = speakers.filter(s => s.name.trim() || s.bio.trim())
      .filter((s, i, arr) => arr.findIndex(t => t.name.trim().toLowerCase() === s.name.trim().toLowerCase() && t.bio.trim() === s.bio.trim()) === i);
    setEventData({ ...eventData, speakers: deduped });
  };

  const handleSpeakerBioChange = (idx: number, value: string) => {
    const speakers = [...eventData.speakers];
    speakers[idx].bio = value;
    // Deduplicate by name and bio
    const deduped = speakers.filter(s => s.name.trim() || s.bio.trim())
      .filter((s, i, arr) => arr.findIndex(t => t.name.trim().toLowerCase() === s.name.trim().toLowerCase() && t.bio.trim() === s.bio.trim()) === i);
    setEventData({ ...eventData, speakers: deduped });
  };

  const handleSpeakerImageChange = (
    idx: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const speakers = [...eventData.speakers];
      speakers[idx].image = file;
      speakers[idx].imagePreview = URL.createObjectURL(file);
      // Deduplicate by name and bio
      const deduped = speakers.filter(s => s.name.trim() || s.bio.trim())
        .filter((s, i, arr) => arr.findIndex(t => t.name.trim().toLowerCase() === s.name.trim().toLowerCase() && t.bio.trim() === s.bio.trim()) === i);
      setEventData({ ...eventData, speakers: deduped });
    }
  };

  const addSpeaker = () => {
    const speakers = [
      ...eventData.speakers,
      { name: "", image: null, imagePreview: "", bio: "", photoUrl: "" },
    ];
    // Deduplicate by name and bio
    const deduped = speakers.filter(s => s.name.trim() || s.bio.trim())
      .filter((s, i, arr) => arr.findIndex(t => t.name.trim().toLowerCase() === s.name.trim().toLowerCase() && t.bio.trim() === s.bio.trim()) === i);
    setEventData({ ...eventData, speakers: deduped });
  };

  const removeSpeaker = (idx: number) => {
    if (idx === 0 && eventData.speakers.length > 1) {
      const speakers = eventData.speakers.filter((_, i) => i !== idx);
      setEventData({ ...eventData, speakers });
    } else if (idx === 0) {
      const speakers = [...eventData.speakers];
      speakers[0] = {
        name: "",
        image: null,
        imagePreview: "",
        bio: "",
        photoUrl: "",
      };
      setEventData({ ...eventData, speakers });
    } else {
      const speakers = eventData.speakers.filter((_, i) => i !== idx);
      setEventData({ ...eventData, speakers });
    }
  };

  const addFaq = () => {
    setEventData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const removeFaq = (idx: number) => {
    setEventData((prev) => {
      if (idx === 0 && prev.faqs.length > 1) {
        return { ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) };
      } else if (idx === 0) {
        const faqs = [...prev.faqs];
        faqs[0] = { question: "", answer: "" };
        return { ...prev, faqs };
      } else {
        return { ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) };
      }
    });
  };

  const handleFaqChange = (
    idx: number,
    field: "question" | "answer",
    value: string
  ) => {
    setEventData((prev) => {
      const newFaqs = [...prev.faqs];
      newFaqs[idx][field] = value;
      // Deduplicate by question and answer
      const deduped = newFaqs.filter(f => f.question.trim() || f.answer.trim())
        .filter((f, i, arr) => arr.findIndex(t => t.question.trim().toLowerCase() === f.question.trim().toLowerCase() && t.answer.trim() === f.answer.trim()) === i);
      return { ...prev, faqs: deduped };
    });
  };

  const doSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    // Validations
    const now = new Date();
    if (new Date(eventData.eventStart) < now) {
      if (setPopup)
        setPopup({
          message: "Event start date/time cannot be in the past.",
          type: "error",
        });
      setSubmitting(false);
      return;
    }
    if (new Date(eventData.eventEnd) < new Date(eventData.eventStart)) {
      if (setPopup)
        setPopup({ message: "Event end must be after start.", type: "error" });
      setSubmitting(false);
      return;
    }
    if (
      new Date(eventData.registrationDeadline) >= new Date(eventData.eventStart)
    ) {
      if (setPopup)
        setPopup({
          message: "Registration deadline must be before event start.",
          type: "error",
        });
      setSubmitting(false);
      return;
    }
    if (Number(eventData.maxAttendees) > 10000) {
      if (setPopup)
        setPopup({
          message: "Max attendees cannot exceed 10,000.",
          type: "error",
        });
      setSubmitting(false);
      return;
    }

    let validOccurrences: Occurrence[] = [];
    let recurrenceRule = "";
    let customFields = "";

    if (eventData.recurrenceType === "None") {
      validOccurrences = [
        {
          date: eventData.eventStart.split("T")[0],
          startTime: eventData.eventStart.split("T")[1],
          endTime: eventData.eventEnd.split("T")[1],
          location: eventData.location || "",
        },
      ];
    } else if (eventData.recurrenceType === "rule") {
      recurrenceRule = eventData.recurrenceRule;
    } else if (eventData.recurrenceType === "custom") {
      for (const occ of eventData.customDates) {
        if (
          !occ.start ||
          !occ.end ||
          new Date(occ.end) <= new Date(occ.start)
        ) {
          if (setPopup)
            setPopup({
              message:
                "Each custom occurrence must have a valid start and end time.",
              type: "error",
            });
          setSubmitting(false);
          return;
        }
      }
      validOccurrences = eventData.customDates.map((occ) => ({
    date: occ.start.split("T")[0],
    startTime: occ.start.split("T")[1] || "",
    endTime: occ.end.split("T")[1] || "",
    location: eventData.location || "",
  }));
      customFields = JSON.stringify(validOccurrences);
    }

    const formData = new FormData();
    const organizerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";

    formData.append("Title", eventData.title);
    formData.append(
      "OrganizerName",
      eventData.OrganizerName.trim() || "Unknown Organizer"
    );
    formData.append("OrganizerEmail", eventData.organizerEmail);
    formData.append("EventStart", eventData.eventStart);
    formData.append("EventEnd", eventData.eventEnd);
    formData.append("RegistrationDeadline", eventData.registrationDeadline);
    formData.append("MaxAttendees", eventData.maxAttendees);
    formData.append("RecurrenceType", eventData.recurrenceType);
    if (recurrenceRule) formData.append("RecurrenceRule", recurrenceRule);
    if (customFields) formData.append("CustomFields", customFields);

    if (eventData.type === "Venue") {
      formData.append("Location", eventData.location);
    } else if (eventData.type === "Online") {
      formData.append("EventLink", eventData.eventLink || "");
    }

    formData.append("EventType", eventData.type);
    formData.append("Type", eventData.type);
    formData.append("Category", eventData.category);

    const descriptionHtml = eventData.description;
    const mediaRegex =
      /<img[^>]+src=["'](data:image\/(png|jpeg|jpg|gif);base64,[^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    let imgIndex = 0;
    let newDescription = descriptionHtml;
    while ((match = mediaRegex.exec(descriptionHtml)) !== null) {
      const dataUrl = match[1];
      if (!dataUrl) continue;
      const arr = dataUrl.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) continue;
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const file = new File(
        [u8arr],
        `descmedia_${Date.now()}_${imgIndex}.${mime.split("/")[1]}`,
        { type: mime }
      );
      formData.append("media", file);
      newDescription = newDescription.replace(dataUrl, `__MEDIA_${imgIndex}__`);
      imgIndex++;
    }
    formData.append("Description", newDescription);

    formData.append("IsPaidEvent", String(eventData.isPaid));
    formData.append("Price", String(eventData.price || "0"));
    if (organizerId) formData.append("OrganizerId", organizerId);
    if (eventData.image) formData.append("CoverImage", eventData.image);
    if (eventData.vibeVideo) formData.append("VibeVideo", eventData.vibeVideo);

    // Deduplicate speakers by name and bio (ignore empty)
    const dedupedSpeakers = (eventData.speakers || [])
      .filter(s => s.name.trim() || s.bio.trim())
      .filter((s, idx, arr) =>
        arr.findIndex(t => t.name.trim().toLowerCase() === s.name.trim().toLowerCase() && t.bio.trim() === s.bio.trim()) === idx
      );

    // Deduplicate FAQs by question and answer (ignore empty)
    const dedupedFaqs = (eventData.faqs || [])
      .filter(f => f.question.trim() || f.answer.trim())
      .filter((f, idx, arr) =>
        arr.findIndex(t => t.question.trim().toLowerCase() === f.question.trim().toLowerCase() && t.answer.trim() === f.answer.trim()) === idx
      );

    // Speakers (as JSON, without image files)
    formData.append('Speakers', JSON.stringify(dedupedSpeakers.map((s) => ({
      name: s.name,
      bio: s.bio,
      photoUrl: s.photoUrl || undefined
    }))));
    // Attach speaker images as separate fields
    dedupedSpeakers.forEach((speaker, idx) => {
      if (speaker.image) {
        formData.append(`speakers[${idx}].image`, speaker.image);
      }
    });
    // Ensure Faqs is always an array
    formData.append('Faqs', JSON.stringify(dedupedFaqs));
    formData.append('Occurrences', JSON.stringify(validOccurrences));

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const url =
        isEditMode && eventId
          ? `${API_URL}/api/events/${eventId}`
          : `${API_URL}/api/events`;
      const method = isEditMode && eventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const successMessage = isEditMode
          ? "Event updated successfully!"
          : "Event submitted successfully! Connect to Stripe to receive payments in Dashboard.";
  if (setPopup) setPopup({ message: successMessage, type: "success" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        const error = await res.text();
        if (setPopup)
          setPopup({ message: "Submission failed: " + error, type: "error" });
      }
    } catch (error) {
  if (setPopup)
    setPopup({
      message:
        "Submission failed: " +
        ((error instanceof Error && error.message) ? error.message : "An unknown error occurred"),
      type: "error",
    });
} finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPendingSubmitEvent(e);
    setShowConfirm(true);
  };

  useEffect(() => {
    document.body.style.overflow = showConfirm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showConfirm]);

  return (
    <>
      <ConfirmationDialog
        open={showConfirm}
        message={
          isEditMode
            ? "Are you sure you want to update this event?"
            : "Are you sure you want to publish this event?"
        }
        onConfirm={() => {
          setShowConfirm(false);
          if (pendingSubmitEvent) doSubmit(pendingSubmitEvent);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setPendingSubmitEvent(null);
        }}
      />
      <div
        className="bg-blue-50 rounded-2xl shadow-lg p-2 sm:p-4 md:p-8 min-h-screen w-full box-border overflow-auto relative select-none mt-0 flex flex-col"
        style={{ cursor: pencilCursor }}
      >
        <div className="absolute left-[-10px] top-4 sm:left-[-14px] sm:top-6 flex flex-col gap-2 sm:gap-3 z-10">
          {" "}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        <div className="block lg:hidden w-full mb-3">
          <button
            type="button"
            style={{ cursor: "pointer" }}
            className="w-full py-2 px-4 rounded-xl bg-yellow-500 text-white font-bold shadow hover:bg-yellow-600 transition-all text-base md:text-lg border-0 tracking-wide"
            onClick={() => setShowMobilePreview((prev) => !prev)}
          >
            {showMobilePreview ? "Hide Live Preview" : "Show Live Preview"}
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap--4 md:gap-8 w-full max-w-full md:max-w-[1400px] mx-auto items-stretch relative min-h-[700px]">
          <div
              className="block w-full lg:w-1/2 min-h-[700px] max-h-[90vh] z-30"
              style={{ alignSelf: "stretch" }}
            >
            <form
              className={`flex flex-col gap-4 w-full h-auto max-h-[90vh] bg-white rounded-2xl shadow-lg p-4 ring-4 ring-[#0a174e] border-4 border-[#0a174e] drop-shadow-md overflow-y-auto ${
                showMobilePreview ? "hidden" : ""
              } scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-blue-900 mx-auto`}
              onSubmit={handleSubmit}
            >
              <div className="w-full  flex justify-center  select-none z-20 pt-4 pb-2 sm:pb-3 mt-0 relative top-0 bg-white">
                <h2
                  className="relative z-10 text-xl md:text-2xl font-bold px-6 sm:px-10 py-2 rounded-xl border-4 shadow-lg text-center"
                  style={{ letterSpacing: 2, color: "#0a174e" }}
                >
                  <span>{isEditMode ? "Edit Event" : "Create Event"}</span>
                </h2>
              </div>
              <p className="italic text-sm md:text-base">
                Enter Event Details below:
              </p>

              {/* Title */}
              <label className="font-medium text-black flex flex-col gap-1 mb-2 italic text-sm md:text-base">
                <span className="flex items-center">
                  Event Title: <span className="text-red-500 ml-1">*</span>
                </span>
                <div className="relative">
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g. Summer Fest 2025"
                    required
                    onChange={handleInputChange}
                    value={eventData.title}
                    className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 transition duration-200 pr-10 font-normal not-italic"
                  />
                  {eventData.title && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </label>

              {/* Upload Event Banner */}
              <div className="flex flex-col items-start w-full mb-2 text-sm md:text-base">
                <div className="mb-2 flex items-center">
                  <span className="text-black font-medium text-base italic">
                    Upload Event Banner
                  </span>
                  <span className="text-red-400 ml-1 text-lg">*</span>
                </div>
                <label
                  className={`bg-[#0a174e] text-white px-7 py-3 rounded-2xl shadow-xl border-2 border-white font-bold text-[1.1rem] transition-all flex items-center ${
                    eventData.image
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:bg-[#233a7c] hover:underline"
                  }`}
                  style={{
                    minWidth: 220,
                    textAlign: "center",
                    boxShadow: "0 4px 16px #0002",
                    letterSpacing: 0.5,
                  }}
                >
                  <span
                    style={{
                      pointerEvents: "none",
                      textShadow: "0 1px 4px #0006",
                    }}
                  >
                    Upload Banner
                  </span>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={!!eventData.image}
                  />
                  {eventData.image && (
                    <span className="ml-2 flex items-center text-green-400 font-semibold text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 mr-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {eventData.image.name.substring(0, 10)}...
                      <button
                        type="button"
                        className="ml-2 flex items-center justify-center bg-transparent text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.preventDefault();
                          setEventData((prev) => ({ ...prev, image: null }));
                          setCoverPreview("");
                        }}
                        title="Delete image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                </label>
                <span className="text-xs text-gray-500 mt-2">
                  Recommended: 1200x400px
                </span>
              </div>

              {/* Cover Image Preview */}
              <div className="relative h-32 md:h-40 w-full mb-3 md:mb-4 rounded-lg overflow-hidden flex items-center justify-center">
                {coverPreview || eventData.coverImageUrl ? (
                  <img
                    src={coverPreview || eventData.coverImageUrl}
                    alt="Event Banner Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-400 italic">
                    No banner uploaded
                  </span>
                )}
              </div>

              {/* Vibe Video Upload */}
              <div className="mb-3 md:mb-4 text-sm md:text-base">
                <label className="block font-medium mb-2">
                  Vibe Video (optional)
                </label>
                <label
                  className={`inline-flex items-center px-3 py-1.5 bg-white border border-gray-400 rounded-md shadow-sm text-sm font-medium transition-all ${
                    eventData.vibeVideo
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:bg-violet-50 hover:border-violet-400"
                  }`}
                >
                  Choose File
                  <input
                    name="vibeVideo"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVibeVideoUpload}
                    disabled={!!eventData.vibeVideo}
                  />
                  {eventData.vibeVideo && (
                    <span className="ml-2 flex items-center text-green-400 font-semibold text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 mr-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {eventData.vibeVideo instanceof File
                        ? eventData.vibeVideo.name.substring(0, 10)
                        : ""}
                      ...
                      <button
                        type="button"
                        className="ml-2"
                        onClick={(e) => {
                          e.preventDefault();
                          setEventData((prev) => ({
                            ...prev,
                            vibeVideo: null,
                            vibeVideoPreview: "",
                          }));
                        }}
                        title="Delete video"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-red-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                </label>
                <span className="text-xs text-gray-500 block mt-1">
                  Upload a short video to showcase the vibe of your event.
                </span>
              </div>

              {/* Organizer Name & Email */}
              <label className="font-medium text-black flex flex-col gap-1 mb-2 italic text-sm md:text-base">
                <span className="flex items-center">
                  Organizer Name: <span className="text-red-500 ml-1">*</span>
                </span>
                <div className="relative">
                  <input
                    name="OrganizerName"
                    type="text"
                    placeholder="Your name or organization"
                    required
                    onChange={handleInputChange}
                    value={eventData.OrganizerName}
                    className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
                  />
                  {eventData.OrganizerName && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </label>
              <label className="font-medium text-black flex flex-col gap-1 mb-2 italic text-sm md:text-base">
                <span className="flex items-center">
                  Organizer Email: <span className="text-red-500 ml-1">*</span>
                </span>
                <div className="relative">
                  <input
                    name="organizerEmail"
                    type="email"
                    placeholder="e.g. you@email.com"
                    required
                    onChange={handleInputChange}
                    value={eventData.organizerEmail}
                    className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
                  />
                  {eventData.organizerEmail && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </label>

              {/* Event Dates */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 md:mb-4">
                <label className="font-medium text-black flex flex-col gap-1 mb-2 flex-1 italic text-sm md:text-base">
                  <span className="flex items-center">
                    Event Start: <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    name="eventStart"
                    disabled={isEditMode}
                    type="datetime-local"
                    required
                    onChange={handleInputChange}
                    value={eventData.eventStart}
                    className="input input-bordered w-full h-12 pr-2 bg-transparent border border-gray-300 focus:ring-0 focus:border-gray-400 font-normal not-italic px-4 py-3 rounded-md"
                  />
                </label>
                <label className="font-medium text-black flex flex-col gap-1 mb-2 flex-1 italic text-sm md:text-base">
                  <span className="flex items-center">
                    Event End: <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    name="eventEnd"
                    disabled={isEditMode}
                    type="datetime-local"
                    required
                    onChange={handleInputChange}
                    value={eventData.eventEnd}
                    className="input input-bordered w-full h-12 pr-2 bg-transparent border border-gray-300 focus:ring-0 focus:border-gray-400 font-normal not-italic px-4 py-3 rounded-md"
                  />
                </label>
              </div>

              {/* Recurrence Type */}
              <label
                htmlFor="recurrenceType"
                className="flex items-center font-medium text-black mb-1 italic text-sm md:text-base"
              >
                Recurrence Type: <span className="text-red-500 ml-1">*</span>
                <select
                  id="recurrenceType"
                  name="recurrenceType"
                  onChange={handleInputChange}
                  value={eventData.recurrenceType}
                  disabled={isEditMode}
                  required
                  className="ml-2 w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-yellow-500"
                >
                  <option value="None">None</option>
                  <option value="rule">Rule-based</option>
                  <option value="custom">Custom Dates</option>
                </select>
              </label>

              {/* Rule-based Recurrence */}
              {eventData.recurrenceType === "rule" && (
                <div className="mb-4">
                  <label className="block font-medium mb-2 italic text-sm md:text-base">
                    Recurrence Rule (iCal):
                    <span className="text-red-500 ml-1">*</span>
                    <input
                      name="recurrenceRule"
                      disabled={isEditMode}
                      type="text"
                      placeholder="e.g. FREQ=WEEKLY;BYDAY=MO,WE"
                      required
                      onChange={handleInputChange}
                      value={eventData.recurrenceRule}
                      className="input input-bordered w-full border-yellow-400 bg-yellow-50 text-amber-700 font-semibold"
                    />
                  </label>
                </div>
              )}

              {/* Custom Dates Recurrence */}
              {eventData.recurrenceType === "custom" && (
                <div className="mb-4">
                  <label className="block font-medium mb-2 italic text-sm md:text-base">
                    Custom Occurrences:{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {(eventData.customDates || []).map((occ, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <input
                        type="datetime-local"
                        disabled={isEditMode}
                        value={occ.start || ""}
                        onChange={(e) => {
                          setEventData((prev) => {
                            const faqs = [...(prev.faqs || []), { question: "", answer: "" }];
                            // Deduplicate by question and answer
                            const deduped = faqs.filter(f => f.question.trim() || f.answer.trim())
                              .filter((f, i, arr) => arr.findIndex(t => t.question.trim().toLowerCase() === f.question.trim().toLowerCase() && t.answer.trim() === f.answer.trim()) === i);
                            return { ...prev, faqs: deduped };
                          });
                            setEventData((prev) => {
                              const newDates = [...prev.customDates];
                              newDates[idx].start = String(e.target.value);
                              return {
                                ...prev,
                                customDates: newDates,
                                customFields: JSON.stringify(newDates),
                              };
                            });
                        }}
                        className="input input-bordered"
                        placeholder="Start Date & Time"
                      />
                      <span className="font-bold">to</span>
                      <input
                        type="datetime-local"
                        value={occ.end || ""}
                        disabled={isEditMode}
                        onChange={(e) => {
                          setEventData((prev) => {
                            const newDates = [...prev.customDates];
                            newDates[idx].end = String(e.target.value); // <-- Ensure string
                            return {
                              ...prev,
                              customDates: newDates,
                              customFields: JSON.stringify(newDates),
                            };
                          });
                        }}
                        className="input input-bordered"
                        placeholder="End Date & Time"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEventData((prev) => ({
                            ...prev,
                            customDates: prev.customDates.filter(
                              (_, i) => i !== idx
                            ),
                          }));
                        }}
                        className="px-1 py-0.2 bg-red-500 text-white rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEventData((prev) => ({
                        ...prev,
                        customDates: [
                          ...prev.customDates,
                          { start: "", end: "" },
                        ],
                      }));
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    + Add Occurrence
                  </button>
                </div>
              )}

              {/* Location with event type options and conditional map or event link */}
              <div className="mb-2 text-sm md:text-base">
                <span className="block font-medium mb-2 italic">
                  Event Type: <span className="text-red-500 ml-1">*</span>
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  {["Online", "Venue", "TBA"].map((type) => (
                    <label
                      key={type}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        border:
                          eventData.type === type
                            ? "2px solid #2563eb"
                            : "2px solid #e5e7eb",
                        background:
                          eventData.type === type ? "#2563eb" : "#f3f4f6",
                        color: eventData.type === type ? "#fff" : "#222",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        padding: "0.5rem 0",
                        cursor: "pointer",
                        boxShadow:
                          eventData.type === type
                            ? "0 2px 8px #2563eb22"
                            : "none",
                        transition: "all 0.15s",
                      }}
                      className="select-none"
                    >
                      <input
                        type="radio"
                        name="type"
                        disabled={isEditMode}
                        value={type}
                        checked={eventData.type === type}
                        onChange={(e) => {
                          // Custom logic: clear irrelevant fields when switching type
                          setEventData((prev) => {
                            let newData = { ...prev, type };
                            if (type === "Venue") {
                              newData = { ...newData, eventLink: "" };
                            } else if (type === "Online") {
                              newData = { ...newData, location: "" };
                            } else if (type === "TBA") {
                              newData = {
                                ...newData,
                                location: "",
                                eventLink: "",
                              };
                            }
                            return newData;
                          });
                        }}
                        style={{ display: "none" }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
                {eventData.type === "Venue" && (
                  <>
                    <span className="block font-medium mb-2 italic">
                      Location: <span className="text-red-500 ml-1">*</span>
                    </span>
                    <div className="relative">
                      <input
                        name="location"
                        disabled={isEditMode}
                        type="text"
                        placeholder="e.g. Gachibowli, Hyderabad"
                        required
                        onChange={handleInputChange}
                        value={eventData.location}
                        className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 transition duration-200 pr-10"
                      />
                      {eventData.location && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    {eventData.location && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 1px 4px #0001",
                        }}
                      >
                        <iframe
                          title="Google Maps Preview"
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            eventData.location
                          )}&output=embed`}
                        ></iframe>
                      </div>
                    )}
                  </>
                )}
                {eventData.type === "Online" && (
                  <label className="block font-medium mb-2 w-full mt-2 italic">
                    Event Link<span className="text-red-500">*</span>
                    <div className="relative">
                      <input
                        name="eventLink"
                        disabled={isEditMode}
                        type="url"
                        placeholder="Enter event link (e.g. https://meet.example.com/xyz)"
                        required={eventData.type === "Online"}
                        onChange={handleInputChange}
                        value={eventData.eventLink}
                        className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 transition duration-200 pr-10 font-normal not-italic"
                      />
                      {eventData.eventLink && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Category */}
              <label className="block font-medium text-black mb-2 italic text-sm md:text-base">
                Category<span className="text-red-500 ml-1">*</span>
                <select
                  name="category"
                  onChange={handleInputChange}
                  value={
                    [
                      "Music",
                      "Tech",
                      "Health",
                      "Education",
                      "Business",
                      "Conference",
                      "Exhibitions",
                    ].includes(eventData.category)
                      ? eventData.category
                      : "Others"
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    --Select--
                  </option>
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Conference">Conference</option>
                  <option value="Exhibitions">Exhibitions</option>
                  <option value="Others">Others</option>
                </select>
                {(![
                  "Music",
                  "Tech",
                  "Health",
                  "Education",
                  "Business",
                  "Conference",
                  "Exhibitions",
                ].includes(eventData.category) ||
                  eventData.category === "Others") && (
                  <input
                    name="category"
                    type="text"
                    placeholder="Please specify other category"
                    value={
                      ![
                        "Music",
                        "Tech",
                        "Health",
                        "Education",
                        "Business",
                        "Conference",
                        "Exhibitions",
                      ].includes(eventData.category)
                        ? eventData.category
                        : ""
                    }
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full h-12 px-4 border border-yellow-300 rounded-md"
                  />
                )}
              </label>

              {/* Ticket Type & Price */}
              <div className="mb-4 md:mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold text-[16px]">
                    Ticket Type:
                  </span>
                  <span
                    className={`min-w-[40px] text-right ${
                      !eventData.isPaid
                        ? "text-green-500 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    Free
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEventData({
                        ...eventData,
                        isPaid: !eventData.isPaid,
                        price: !eventData.isPaid ? eventData.price : "",
                      })
                    }
                    className={`w-[48px] h-[18px] rounded-full relative transition-colors ${
                      eventData.isPaid ? "bg-yellow-400" : "bg-green-500"
                    }`}
                  >
                    <span
                      className="absolute top-0.5 transition-all"
                      style={{
                        left: eventData.isPaid ? 24 : 4,
                        width: 20,
                        height: 14,
                        borderRadius: "50%",
                        background: "#fff",
                      }}
                    />
                  </button>
                  <span
                    className={`min-w-[40px] text-left ${
                      eventData.isPaid
                        ? "text-yellow-400 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    Paid
                  </span>
                </div>
                {eventData.isPaid && (
                  <label className="block font-medium mb-2 text-sm md:text-base">
                    Price (₹): <span className="text-red-500 ml-1">*</span>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      required={eventData.isPaid}
                      onChange={handleInputChange}
                      value={eventData.price}
                      className="w-full h-12 px-4 border border-gray-300 rounded-md bg-white text-amber-700 font-semibold"
                    />
                  </label>
                )}
              </div>

              {/* Max Attendees & Deadline */}
              <label className="block font-medium text-black mb-2 mt-4 italic text-sm md:text-base">
                Max People Can Attend:
                <span className="text-red-500 ml-1">*</span>
                <input
                  name="maxAttendees"
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  required
                  onChange={handleInputChange}
                  value={eventData.maxAttendees}
                  className="w-full h-12 px-4 border border-gray-300 rounded-md"
                />
              </label>
              <label className="font-medium text-black flex flex-col gap-1 mb-2 mt-4 italic text-sm md:text-base">
                <span className="flex items-center">
                  Registration Deadline:{" "}
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <input
                  name="registrationDeadline"
                  type="datetime-local"
                  required
                  onChange={handleInputChange}
                  value={eventData.registrationDeadline}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </label>

              {/* Description Editor */}
              <span className="block font-medium text-black mb-2 text-sm md:text-base">
                Event Description: <span className="text-red-500 ml-1">*</span>
              </span>
              <div className="mb-3 md:mb-4 not-italic">
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-3 md:p-4 flex flex-col gap-2">
                  <div className="flex gap-1 md:gap-2 mb-1 flex-wrap">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`toolbar-btn ${
                        editor?.isActive("bold") ? "bg-yellow-200" : "bg-white"
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      className={`toolbar-btn ${
                        editor?.isActive("italic")
                          ? "bg-yellow-200"
                          : "bg-white"
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <text
                          x="8"
                          y="18"
                          fontFamily="serif"
                          fontSize="18"
                          fontStyle="italic"
                        >
                          I
                        </text>
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Bullet List"
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      className={`toolbar-btn ${
                        editor?.isActive("bulletList")
                          ? "bg-yellow-200"
                          : "bg-white"
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M8 6h12M8 12h12M8 18h12M4 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Attach Image"
                      onClick={() =>
                        document
                          .getElementById("tiptap-image-upload-input")
                          ?.click()
                      }
                      className="toolbar-btn bg-white"
                    >
                      <span style={{ fontSize: "1.5rem", lineHeight: "1" }}>
                        🔗
                      </span>
                    </button>
                    <input
                      id="tiptap-image-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUploadTiptap}
                      className="hidden"
                    />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg min-h-[180px] p-2">
                    <EditorContent
                      editor={editor}
                      className="outline-none min-h-[160px] prose"
                    />
                  </div>
                </div>
              </div>

              {/* Speakers Section */}
              <div>
                <label className="block font-medium text-black mb-2 italic text-sm md:text-base">
                  Speakers:
                </label>
                {(eventData.speakers || []).map((speaker, idx) => (
                  <div
                    key={idx}
                    className="relative mb-4 w-full flex flex-row items-center gap-3"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 bg-gray-100 flex items-center justify-center">
                        {speaker.imagePreview ? (
                          <img
                            src={speaker.imagePreview}
                            alt="Speaker"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FaUserCircle size={56} className="text-gray-400" />
                        )}
                      </div>
                      <label className="px-2 py-1 bg-white border rounded-md cursor-pointer text-xs hover:bg-violet-50">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSpeakerImageChange(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <input
                        type="text"
                        placeholder="Speaker Name"
                        value={speaker.name}
                        onChange={(e) =>
                          handleSpeakerNameChange(idx, String(e.target.value))
                        }
                        className="h-7 px-2 rounded w-full border border-gray-300"
                      />
                      <textarea
                        placeholder="Speaker Bio"
                        value={speaker.bio}
                        onChange={(e) =>
                          handleSpeakerBioChange(idx, String(e.target.value))
                        }
                        className="min-h-[36px] px-2 py-1 rounded w-full border border-gray-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(idx)}
                      title="Delete Speaker"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={addSpeaker}
                      title="Add Speaker"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14m-7-7h14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* FAQs Section */}
              <div className="my-5 md:my-8">
                <label className="block font-medium text-black mb-2 italic text-sm md:text-base">
                  Event FAQs:
                </label>
                {(eventData.faqs || []).map((faq, idx) => (
                  <div
                    key={idx}
                    className="relative mb-3 w-full flex flex-col gap-2 p-3 bg-gray-50 border rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder={`Question ${idx + 1}`}
                      value={faq.question}
                      onChange={(e) =>
                        handleFaqChange(idx, "question", String(e.target.value))
                      }
                      className="h-8 px-3 rounded w-full mb-2 border"
                    />
                    <textarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) =>
                        handleFaqChange(idx, "answer", e.target.value)
                      }
                      className="min-h-[36px] px-3 py-2 rounded w-full border"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        title="Delete FAQ"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                      <button type="button" onClick={addFaq} title="Add FAQ">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14m-7-7h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormComplete() || submitting}
                style={{ opacity: !isFormComplete() || submitting ? 0.6 : 1 }}
                className="w-full mt-4 md:mt-6 px-4 md:px-5 py-3 rounded-xl bg-[#0a174e] text-white font-bold shadow hover:bg-[#233a7c] transition-all text-lg tracking-wide flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
                {submitting
                  ? "Publishing..."
                  : isEditMode
                  ? "Update Event"
                  : "Publish Event"}
              </button>
            </form>
          </div>

          <div
            className={(showMobilePreview ? '' : 'hidden') + ' lg:block w-full lg:w-1/2 min-h-[700px] max-h-[90vh] min-w-0 flex flex-col justify-stretch items-stretch'}>
            <div
              className="relative bg-white/90 rounded-2xl shadow-lg ring-4 ring-yellow-400 w-full max-w-[820px] mx-auto flex flex-col items-center overflow-hidden min-w-0 h-full scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-blue-900"
              style={{
                height: "700px",
                minHeight: 0,
                flexBasis: "0",
                flexGrow: 1,
                flexShrink: 1,
              }}
            >
              <div className="w-full flex justify-center relative select-none z-20 pt-4 pb-2 sm:pb-3">
                <h2
                  className="relative z-10 text-xl md:text-2xl font-bold px-6 sm:px-10 py-2 rounded-xl shadow-lg text-center"
                  style={{ letterSpacing: 2, color: "#0a174e" }}
                >
                  <span>🎉 Live Preview 🎉</span>
                </h2>
              </div>
              <div
                className="flex-1 w-full overflow-y-auto px-2 sm:px-4 pb-6 pt-2"
                style={{ maxHeight: "calc(100% - 80px)", minWidth: 0 }}
              >
                <div className="max-w-full sm:max-w-[700px] mx-auto w-full min-w-0">
                  <EventLivePreview
                    event={{
                      ...eventData,
                      coverImageUrl: coverPreview || eventData.coverImageUrl,
                      organizerName: eventData.OrganizerName,
                      vibeVideoUrl: eventData.vibeVideoPreview || eventData.vibeVideoUrl,
                      isPreview: true,
                    }}
                    forceMobileLayout={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
