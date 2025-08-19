"use client";
import { EventFormPopupContext } from './layout';
import ConfirmationDialog from '../common/confirmation-dialog';
import dynamic from "next/dynamic";
import { EventFormData } from '@/interfaces/event-form';

const EventLivePreview = dynamic(() => import("@/components/event-live-preview"), { ssr: false });
// Ensure bullet/number markers always show in description preview
if (typeof window !== 'undefined') {
  const styleId = 'force-bullets-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
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
  };
}

// Always use backend API URL for media files

// Helper to ensure all <img src> in description use absolute URLs
function processDescriptionHtml(html: string | undefined) {
  if (!html) return '<span style="color:#bbb">[Description]</span>';
  // Replace <img src="/uploads/..."> or <img src="uploads/..."> with full API URL
  return html.replace(/<img([^>]+)src=['"](?!(?:https?:|data:))\/?(uploads|wwwroot\/uploads)?\/?([^'">]+)['"]/gi, (match, pre, folder, path) => {
    let cleanPath = path.replace(/^wwwroot\//, '').replace(/^uploads\//, '');
    return `<img${pre}src="${API_URL}/uploads/${cleanPath}"`;
  });
}

import { useState, useEffect, useCallback, ChangeEvent, FormEvent, useContext } from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';

// Add a class to the Tiptap editor content for bullet styling
// This ensures the injected CSS above applies to the editor area
const tiptapContentClass = 'tiptap-content';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Node, mergeAttributes, RawCommands, NodeViewProps, CommandProps } from '@tiptap/core';
import NextImage from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";

// Pencil SVG as data URI for cursor
const pencilCursor =
  "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><g><polygon points=\"2,30 8,28 26,10 22,6 4,24\" fill=\"%23fbbf24\" stroke=\"%233b2f13\" stroke-width=\"2\"/><rect x=\"22\" y=\"6\" width=\"4\" height=\"4\" fill=\"%23a3a3a3\" stroke=\"%233b2f13\" stroke-width=\"2\"/><polygon points=\"2,30 8,28 4,24\" fill=\"%23fff\" stroke=\"%233b2f13\" stroke-width=\"1\"/></g></svg>') 0 32, auto";

interface VideoAttrs {
  src: string
  controls?: boolean
  width?: string | number
  height?: string | number
}

// extend RawCommands with our custom insertVideo
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      insertVideo: (attrs: VideoAttrs) => ReturnType
    }
  }
}

const Video = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string | number | boolean | undefined | null> }) {
    return ['video', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      insertVideo:
        (attrs: VideoAttrs) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          })
        },
    }
  },
})


// import '../app/globals.css'

import { redirect, useRouter } from 'next/navigation';

type Speaker = { name: string; image: File | null; imagePreview: string; bio: string; photoUrl: string };
type Faq = { question: string; answer: string };
type Occurrence = { date: string; startTime: string; endTime: string; location: string };

type CustomDate = { start: string; end: string };
type EventData = {
  title: string;
  OrganizerName: string;
  organizerEmail: string;
  eventStart: string;
  eventEnd: string;
  registrationDeadline: string;
  maxAttendees: string;
  recurrenceType: string;
  location: string;
  eventLink: string;
  description: string;
  type: string;
  category: string;
  isPaid: boolean;
  price: string;
  image: File | null;
  coverImageUrl: string;
  vibeVideo: File | null;
  vibeVideoPreview: string;
  speakers: Speaker[];
  faqs: Faq[];
  occurrences: Occurrence[];
  recurrenceRule: string;
  customDates: CustomDate[];
};

type EventFormProps = {
  initialData?: Partial<EventFormData>;
  isEditMode?: boolean;
  eventId?: string | null;
};

export default function EventForm({ initialData, isEditMode = false, eventId }: EventFormProps) {
  // Helper to check if all required fields are filled
  const isFormComplete = () => {
    // Required fields for all event types
    if (!eventData.title.trim() || !eventData.OrganizerName.trim() || !eventData.organizerEmail.trim() || !eventData.eventStart || !eventData.eventEnd || !eventData.registrationDeadline || !eventData.maxAttendees || !eventData.type || !eventData.category || !eventData.description.trim()) {
      return false;
    }
    // Banner image required only for new event (not edit mode with existing cover)
    if (!isEditMode && !eventData.image && !eventData.coverImageUrl) return false;
    // Paid event: price required
    if (!isEditMode && eventData.isPaid && (!eventData.price || Number(eventData.price) < 0)) return false;
    // Location required for Location Based
    if (!isEditMode && eventData.type === 'Venue' && !eventData.location.trim()) return false;
    // Event link required for Online
    if (!isEditMode && eventData.type === 'Online' && !eventData.eventLink.trim()) return false;
    // Recurrence
    if (!isEditMode && eventData.recurrenceType === 'rule' && !eventData.recurrenceRule.trim()) return false;
    if (eventData.recurrenceType === 'custom' && (!eventData.customDates || eventData.customDates.length === 0)) return false;
    // Custom category: must not be empty
    const allowedCategories = ["Music","Tech","Health","Education","Business","Conference","Exhibitions","Others"];
    if (!isEditMode && !allowedCategories.includes(eventData.category) && !eventData.category.trim()) return false;
    return true;
  };
  // Use popup context for feedback
  const setPopup = useContext(EventFormPopupContext);
  // Handler for vibe video upload
  const handleVibeVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setEventData((prev: EventFormData) => ({
        ...prev,
        vibeVideo: file,
        vibeVideoPreview: URL.createObjectURL(file),
      }));
    }
  }
  // State for event data, recurrence, and organizer

const defaultEventData = {
  title: '',
  OrganizerName: '',
  organizer: '',
  organizerEmail: '',
  eventStart: '',
  eventEnd: '',
  registrationDeadline: '',
  maxAttendees: '',
  recurrenceType: 'None',
  recurrenceRule: '',
  customDates: [], // Now array of { start, end }
  customFields: '',
  location: '',
  eventLink: '',
  description: '',
  type: 'Venue',
  category: '',
  otherCategory: '', // Make sure this is always an empty string
  isPaid: false,
  price: '',
  image: null,
  coverImageUrl: '',
  vibeVideo: null,
  vibeVideoPreview: '',
  speakers: [
    { name: '', image: null, imagePreview: '', bio: '', photoUrl: '' },
  ],
  faqs: [
    { question: '', answer: '' },
  ],
  occurrences: [],
  media: [],
};

const [eventData, setEventData] = useState<EventFormData>({
  ...defaultEventData,
  ...(initialData || {}),
});

// Ensure the initialData, if present, doesn't have undefined values for properties

  // Update eventData when initialData changes (for edit mode prefill)
  useEffect(() => {
  if (initialData) {
    setEventData((prev) => {
      // Normalize type
      let type = initialData.type || 'Venue';
      if (type.toLowerCase() === 'location based' || type.toLowerCase() === 'location' || type.toLowerCase() === 'venue') {
        type = 'Venue';
      } else if (type.toLowerCase() === 'online') {
        type = 'Online';
      } else if (type.toLowerCase().includes('announce')) {
        type = 'TBA';
      }

      // Normalize speakers for imagePreview
      const speakers = (initialData.speakers || []).map((s: Partial<Speaker>) => ({
  ...s,
  image: null,
  imagePreview: s.photoUrl
    ? (s.photoUrl.startsWith('http') ? s.photoUrl : `${API_URL}${s.photoUrl}`)
    : '',
  photoUrl: s.photoUrl ?? '',   // ✅ ensure it's always a string
})) as Speaker[]
 // ensure final type is Speaker[]

      return {
        ...defaultEventData,
        ...initialData,
        type,
        recurrenceType:
          typeof initialData.recurrenceType === 'string'
            ? initialData.recurrenceType
            : (initialData.recurrenceType || 'None'),
        location:
          typeof initialData.location === 'string'
            ? initialData.location
            : (initialData.location || ''),
        maxAttendees:
          initialData.maxAttendees !== undefined && initialData.maxAttendees !== null
            ? String(initialData.maxAttendees)
            : '',
        speakers,
      };
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData]);

  // State to control live preview visibility on mobile
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmitEvent, setPendingSubmitEvent] = useState<FormEvent<HTMLFormElement> | null>(null);
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string>("");
  // Add showRibbons state
const [showRibbons, setShowRibbons] = useState(false);

// Responsive styles for images/videos in description preview
"use client";
  // ...existing code...

  // ...existing code...






  // Input change handler with recurrence logic
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEventData({ ...eventData, [name]: checked });
    } else {
      // Special logic for recurrenceType
      if (name === 'recurrenceType') {
        setEventData({
          ...eventData,
          recurrenceType: value,
          recurrenceRule: value === 'rule' ? eventData.recurrenceRule : '',
          customDates: value === 'custom' ? eventData.customDates || [] : [],
          customFields: value === 'custom' ? JSON.stringify(eventData.customDates || []) : '',
        });
      } else if (name === 'category') {
        setEventData({ ...eventData, category: value });
      } else {
        setEventData({ ...eventData, [name]: value });
      }
    }
  };
  // Image upload handler
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setEventData({ ...eventData, image: file });
      setCoverPreview(URL.createObjectURL(file));
    }
  };
 const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Image,
    Link,
    Video,
  ],
  content: eventData.description || '',
  onUpdate: ({ editor }) => {
    setEventData((prev: EventFormData) => ({
      ...prev,
      description: editor.getHTML(),
    }))
  },
  editorProps: {
    attributes: {
      class: 'min-h-[180px] p-4 border rounded bg-white list-disc pl-6 prose prose-sm max-w-none',
    },
  },
  immediatelyRender: false,
})



  // Only update editor content from eventData.description if editor is NOT focused
  useEffect(() => {
    if (editor && !editor.isFocused && eventData.description !== editor.getHTML()) {
      editor.commands.setContent(eventData.description || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData.description]);

  // Image upload handler for Tiptap (multiple files, append content)
  const handleImageUploadTiptap = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && editor) {
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          editor.chain().focus().insertContent({ type: 'image', attrs: { src: ev.target?.result as string } }).run();
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  }, [editor]);

  // Video upload handler for Tiptap (multiple files, append content)
  const handleVideoUploadTiptap = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && editor) {
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('video/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          editor.chain().focus().insertContent({ type: 'video', attrs: { src: ev.target?.result as string, controls: true, width: '100%', height: '240' } }).run();
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  }, [editor]);

  // Speaker handlers
  const handleSpeakerNameChange = (idx: number, value: string) => {
    const speakers = [...eventData.speakers];
    speakers[idx].name = value;
    setEventData({ ...eventData, speakers });
  };
  const handleSpeakerBioChange = (idx: number, value: string) => {
    const speakers = [...eventData.speakers];
    speakers[idx].bio = value;
    setEventData({ ...eventData, speakers });
  };
  const handleSpeakerImageChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const speakers = [...eventData.speakers];
      speakers[idx].image = file;
      speakers[idx].imagePreview = URL.createObjectURL(file);
      setEventData({ ...eventData, speakers });
    }
  };
  const addSpeaker = () => {
  setEventData({ 
    ...eventData, 
    speakers: [
      ...eventData.speakers, 
      { name: '', image: null, imagePreview: '', bio: '', photoUrl: '' } // Add photoUrl here
    ] 
  });
};
  const removeSpeaker = (idx: number) => {
  const speakers = eventData.speakers.filter((_, i) => i !== idx);
  setEventData({ ...eventData, speakers });
};


  // FAQ handlers
  const addFaq = () => {
  setEventData((prev: EventFormData) => ({
    ...prev,
    faqs: [...(prev.faqs || []), { question: '', answer: '' }],
  }));
};

const removeFaq = (idx: number) => {
  setEventData((prev: EventFormData) => ({
    ...prev,
    faqs: prev.faqs.filter((_, i) => i !== idx),
  }));
};

const handleFaqChange = (idx: number, field: 'question' | 'answer', value: string) => {
  setEventData((prev: EventFormData) => {
    const newFaqs = [...prev.faqs];
    newFaqs[idx][field] = value;
    return { ...prev, faqs: newFaqs };
  });
};

  // Actual submit logic, only called after confirmation
  const doSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure OrganizerName is present and non-empty
    if (!eventData.OrganizerName || eventData.OrganizerName.trim() === "") {
      setPopup && setPopup({ message: "Organizer name is required.", type: "error" });
      return;
    }
    // Fallback: If OrganizerName is somehow null, set to 'Unknown Organizer'
    if (eventData.OrganizerName == null) {
      eventData.OrganizerName = "Unknown Organizer";
    }

    // Validate event start and end dates are not in the past or already completed
    const now = new Date();
    if (eventData.eventStart) {
      const startDate = new Date(eventData.eventStart);
      if (startDate < now) {
        if (setPopup) setPopup({ message: "Event start date/time cannot be in the past.", type: "error" });
        return;
      }
    }
    if (eventData.eventEnd) {
      const endDate = new Date(eventData.eventEnd);
      if (endDate < now) {
        if (setPopup) setPopup({ message: "Event end date/time cannot be in the past.", type: "error" });
        return;
      }
    }

    // Validate registration deadline is before event start date/time
    if (eventData.registrationDeadline && eventData.eventStart) {
      const regDeadline = new Date(eventData.registrationDeadline);
      const startDate = new Date(eventData.eventStart);
      if (regDeadline >= startDate) {
        if (setPopup) setPopup({ message: "Registration deadline must be before event start date/time.", type: "error" });
        return;
      }
    }

    // Validate maxAttendees does not exceed 10000
    if (eventData.maxAttendees && Number(eventData.maxAttendees) > 10000) {
      if (setPopup) setPopup({ message: "Max people can attend should not exceed 10,000.", type: "error" });
      return;
    }

    // Show ribbons for 3 seconds
    setShowRibbons(true);
    setTimeout(() => setShowRibbons(false), 3000);

    // Debug: Log the data being sent
    console.log('Submitting event with:');
    console.log('Speakers:', eventData.speakers);
    console.log('Faqs:', eventData.faqs);
    console.log('Occurrences:', eventData.occurrences);

    type BackendOccurrence = {
      date?: string;
      startTime?: string;
      StartTime?: string;
      endTime?: string;
      EndTime?: string;
      EventTitle?: string;
      location?: string;
    };

    // Declare the variable with the explicit type
    let validOccurrences: BackendOccurrence[] = [];
    // Build validOccurrences and RecurrenceRule/CustomFields for backend
    let recurrenceRule = '';
    let customFields = '';

  // ...existing code...
    if (eventData.recurrenceType === 'None') {
      // Single event: one occurrence from eventStart/eventEnd
      if (!eventData.eventStart || !eventData.eventEnd) {
        if (setPopup) setPopup({ message: 'Event start and end are required.', type: 'error' });
        return;
      }
      const start = new Date(eventData.eventStart);
      const end = new Date(eventData.eventEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        if (setPopup) setPopup({ message: 'Invalid event start or end date/time.', type: 'error' });
        return;
      }
      if (end <= start) {
        if (setPopup) setPopup({ message: 'Event end must be after start.', type: 'error' });
        return;
      }
      validOccurrences = [{
        date: eventData.eventStart.split('T')[0],
        startTime: eventData.eventStart.split('T')[1],
        endTime: eventData.eventEnd.split('T')[1],
        location: eventData.location || '',
      }];
    } else if (eventData.recurrenceType === 'rule') {
      // Rule-based recurrence: send rule, no occurrences
      if (!eventData.recurrenceRule) {
        if (setPopup) setPopup({ message: 'Recurrence rule is required.', type: 'error' });
        return;
      }
      recurrenceRule = eventData.recurrenceRule;
      validOccurrences = [];
    } else if (eventData.recurrenceType === 'custom') {
  // Custom dates: build occurrences from customDates (array of {start, end})
  if (!eventData.customDates || eventData.customDates.length === 0) {
    if (setPopup) setPopup({ message: 'At least one custom occurrence is required.', type: 'error' });
    return;
  }
  // Validate all custom occurrences have both start and end
  for (const occ of eventData.customDates) {
    if (!occ.start || !occ.end) {
      if (setPopup) setPopup({ message: 'Each custom occurrence must have both start and end date/time.', type: 'error' });
      return;
    }
    // Ensure the value is a valid ISO string with date and time
    const startDate = new Date(occ.start);
    const endDate = new Date(occ.end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      if (setPopup) setPopup({ message: 'Invalid date/time format in custom occurrence.', type: 'error' });
      return;
    }
    if (endDate <= startDate) {
      if (setPopup) setPopup({ message: 'Custom occurrence end must be after start.', type: 'error' });
      return;
    }
  }

  type CustomDate = { start: string; end: string };

  // Always send ISO string (date and time) to backend
  validOccurrences = eventData.customDates.map((occ: CustomDate) => ({
    StartTime: new Date(occ.start).toISOString(),
    EndTime: new Date(occ.end).toISOString(),
    EventTitle: eventData.title
  }));
  // Also update customFields to use ISO strings
  customFields = JSON.stringify(eventData.customDates.map((occ: CustomDate) => ({
    start: new Date(occ.start).toISOString(),
    end: new Date(occ.end).toISOString()
  })));
  // ...existing code...
}

    const formData = new FormData();

    // Get OrganizerId from localStorage (adjust key as needed)
    let organizerId = '';
    if (typeof window !== 'undefined') {
      organizerId = localStorage.getItem('userId') || '';
    }

    // Map simple fields (adjust keys to match backend if needed)
    formData.append('Title', eventData.title);
    formData.append('OrganizerName', eventData.OrganizerName && eventData.OrganizerName.trim() ? eventData.OrganizerName.trim() : "Unknown Organizer");
    formData.append('OrganizerEmail', eventData.organizerEmail);
    formData.append('EventStart', eventData.eventStart);
    formData.append('EventEnd', eventData.eventEnd);
    formData.append('RegistrationDeadline', eventData.registrationDeadline);
    formData.append('MaxAttendees', eventData.maxAttendees);
    formData.append('RecurrenceType', eventData.recurrenceType);
    if (eventData.recurrenceType === 'rule') {
      formData.append('RecurrenceRule', recurrenceRule);
    }
    if (eventData.recurrenceType === 'custom') {
      formData.append('CustomFields', customFields);
    }
    // Only send Location if Venue, only send EventLink if Online
    if (eventData.type === 'Venue') {
      formData.append('Location', eventData.location);
      formData.append('EventLink', null);
    } else if (eventData.type === 'Online') {
      formData.append('Location', null);
      formData.append('EventLink', eventData.eventLink || '');
    } else {
      formData.append('Location', null);
      formData.append('EventLink', null);
    }
    // Ensure event type is sent as both 'EventType' and 'Type' for backend compatibility
    formData.append('EventType', eventData.type);
    formData.append('Type', eventData.type);
    // If category is Others, the input below will update category directly
    formData.append('Category', eventData.category);

    // --- Extract and upload images from description ---
    // --- Extract and upload images/videos from description ---
    const descriptionHtml = eventData.description;
    const mediaRegex = /<img[^>]+src=["'](data:image\/(png|jpeg|jpg|gif);base64,[^"']+)["'][^>]*>|<video[^>]+src=["'](data:video\/(mp4|webm|mov|avi|mkv);base64,[^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    let imgIndex = 0;
    let newDescription = descriptionHtml;
    while ((match = mediaRegex.exec(descriptionHtml)) !== null) {
      // match[1] is image, match[2] is video
      const dataUrl = match[1] || match[2];
      if (!dataUrl) continue;
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) continue;
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      for (let i = 0; i < n; ++i) u8arr[i] = bstr.charCodeAt(i);
      const ext = mime.split('/')[1];
      const file = new File([u8arr], `descmedia_${Date.now()}_${imgIndex}.${ext}`, { type: mime });
      formData.append('media', file);
      // Log file info for debugging
      console.log(`[MEDIA APPEND] name: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      // Replace src with placeholder
      newDescription = newDescription.replace(dataUrl, `__MEDIA_${imgIndex}__`);
      imgIndex++;
    }

    // Extract all video URLs from the description and add to mediaDtos
    const videoUrlRegex = /https?:\/\/[^\s'"<>]+\.(mp4|webm|mov|avi|mkv)/gi;
    let videoUrlMatch;
    const mediaDtos = [];
    while ((videoUrlMatch = videoUrlRegex.exec(descriptionHtml)) !== null) {
      const url = videoUrlMatch[0];
      mediaDtos.push({
        MediaType: 'Video',
        MediaUrl: url,
        Description: 'Extracted from description'
      });
    }
    if (mediaDtos.length > 0) {
      formData.append('Media', JSON.stringify(mediaDtos));
    }
    formData.append('Description', newDescription);

    formData.append('IsPaidEvent', eventData.isPaid ? 'true' : 'false');
    formData.append('Price', eventData.price || '0');
    // Always send EventLink, even if empty
    formData.append('EventLink', eventData.eventLink || '');
    // Add OrganizerId if present
    if (organizerId) {
      formData.append('OrganizerId', organizerId);
    }

    // File fields
    if (eventData.image) {
      formData.append('CoverImage', eventData.image);
    }
    if (eventData.vibeVideo) {
      formData.append('VibeVideo', eventData.vibeVideo);
    }


    // Speakers (as JSON, without image files)
    formData.append('Speakers', JSON.stringify(eventData.speakers.map((s: Speaker) => ({
      name: s.name,
      bio: s.bio,
      photoUrl: s.photoUrl || undefined
    }))));
    // Attach speaker images as separate fields
    eventData.speakers.forEach((speaker: Speaker, idx: number) => {
      if (speaker.image) {
        formData.append(`speakers[${idx}].image`, speaker.image);
      }
    });
    // Ensure Faqs is always an array
    const faqsArray = Array.isArray(eventData.faqs) ? eventData.faqs : [eventData.faqs];
    formData.append('Faqs', JSON.stringify(faqsArray));
    formData.append('Occurrences', JSON.stringify(validOccurrences));
    // Remove duplicate OrganizerName append and validation block (already handled above)

    try {
      // Add Authorization header with JWT token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const url = isEditMode && eventId ? `http://localhost:5274/api/events/${eventId}` : 'http://localhost:5274/api/events';
      const method = isEditMode && eventId ? 'PUT' : 'POST';
      console.log('[SUBMIT] Submitting event to:', url, 'method:', method);
      console.log('[SUBMIT] FormData entries:');
      for (let pair of formData.entries()) {
        console.log('  ', pair[0], pair[1]);
      }
      const res = await fetch(url, {
        method,
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const event = await res.json();
        if (event.mediaUrls && Array.isArray(event.mediaUrls)) {
          let updatedDescription = newDescription;
          event.mediaUrls.forEach((url: string, idx: number) => {
            updatedDescription = updatedDescription.replace(`__MEDIA_${idx}__`, url);
          });
          setEventData((prev: EventFormData) => ({
            ...prev,
            description: updatedDescription,
            coverImageUrl: event.coverImageUrl || '',
            vibeVideoPreview: event.vibeVideoUrl || '',
          }));
        } else {
          setEventData((prev: EventFormData) => ({
            ...prev,
            coverImageUrl: event.coverImageUrl || '',
            vibeVideoPreview: event.vibeVideoUrl || '',
          }));
        }
        // alert(isEditMode ? 'Event updated successfully!' : 'Event submitted successfully!');
        if (setPopup) setPopup({ message: isEditMode ? 'Event updated successfully!' : 'Event submitted successfully!', type: 'success' });
        router.push('/dashboard'); // Redirect to events page after submission
      } else {
        const error = await res.text();
        console.error('[SUBMIT ERROR] Submission failed:', res.status, error);
        // alert('Submission failed: ' + error);
        if (setPopup) setPopup({ message: 'Submission failed: ' + error, type: 'error' });
      }
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('[SUBMIT ERROR] Exception during submission:', error.message);
    if (setPopup) {
      setPopup({
        message: 'Submission failed: ' + error.message,
        type: 'error',
      });
    }
  } else {
    console.error('[SUBMIT ERROR] Unknown exception during submission:', error);
    if (setPopup) {
      setPopup({
        message: 'Submission failed: ' + String(error),
        type: 'error',
      });
    }
  }
  }
 } 

  // Handler for form submit: show confirmation dialog
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPendingSubmitEvent(e);
    setShowConfirm(true);
  };

  // Prevent background scroll/interactions when confirmation dialog is open
  useEffect(() => {
    if (showConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showConfirm]);

  return (
    <>
      {/* Confirmation dialog does not dim or cover the background */}
      {/* Confirmation Dialog for publishing event */}
      <ConfirmationDialog
        open={showConfirm}
        message={isEditMode ? "Are you sure you want to update this event?" : "Are you sure you want to publish this event?"}
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
        className="bg-violet-50 rounded-2xl shadow-lg p-2 sm:p-4 md:p-8 md:py-8 md:px-8 min-h-screen w-full box-border overflow-auto relative select-none mt-0"
        style={{ cursor: pencilCursor }}
      >
      <div className="absolute left-[-10px] top-4 sm:left-[-14px] sm:top-6 flex flex-col gap-2 sm:gap-3 z-10"> {Array.from({length: 9}).map((_, i)=> (
        <div key={i} className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
      ))}
      </div>
      {/* Mobile: Toggle Live Preview Button */}
      <div className="block lg:hidden w-full mb-3">
        <button
            type="button"
            style={{ cursor: 'pointer' }}
          className="w-full py-2 px-4 rounded-xl bg-orange-500 text-white font-bold shadow hover:bg-orange-600 transition-all text-base md:text-lg border-0 tracking-wide"
          onClick={() => setShowMobilePreview((prev) => !prev)}
        >
          {showMobilePreview ? 'Hide Live Preview' : 'Show Live Preview'}
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 w-full max-w-full md:max-w-[1400px] mx-auto items-stretch relative min-h-[700px]">
        {/* Create Event Form */}
        <form
          className={`relative flex flex-col gap-4 md:gap-5 flex-1 min-w-0 w-full max-w-full md:min-w-[320px] md:max-w-[600px] bg-white rounded-2xl shadow-lg p-3 sm:p-6 md:p-8 m-auto ring-2 md:ring-4 ring-violet-200/40 drop-shadow-[0_0_24px_rgba(139,92,246,0.25)] overflow-y-auto font-italic italic ${showMobilePreview ? 'hidden' : ''} lg:block`}
          onSubmit={handleSubmit}
          style={{
            height: '700px',
            minHeight: 0,
            marginTop: 0,
            marginBottom: 0,
            flexBasis: '0',
            flexGrow: 1,
            flexShrink: 1,
          }}
        >
          <div className="flex flex-row items-center mb-3 md:mb-4">
            <img
              src="/images/siderib.png"
              alt="Sidebar Decorative"
              className="hidden md:block h-12 md:h-20 w-auto -ml-4 md:-ml-10 mr-2 md:mr-5 select-none pointer-events-none"
            />
            <h2 className="text-lg md:text-2xl font-bold text-center">{isEditMode ? 'Edit Event' : 'Create an Event'}</h2>
          </div>
          <p className="italic text-sm md:text-base">Enter Event Details below:</p>
          {/* Title */}
          <label className="font-medium text-gray-600 flex flex-col gap-1 mb-2 italic text-sm md:text-base">
  <span className="flex items-center">
    Event Title
    <span className="text-red-500 ml-1">*</span>
  </span>
  <div className="relative">
    <input
      name="title"
      type="text"
      placeholder="e.g. Summer Fest 2025"
      required
      onChange={handleInputChange}
      value={eventData.title}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition duration-200 pr-10 font-normal not-italic"
    />
    {eventData.title && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    )}
  </div>
</label>
  {/* Upload Event Banner label and upload button after Event Title */}
  <div className="flex flex-col items-start w-full mb-2 text-sm md:text-base">
    <div className="mb-2 flex items-center">
      <span className="text-gray-700 font-medium text-base italic">Upload Event Banner</span>
      <span className="text-red-400 ml-1 text-lg">*</span>
    </div>
    <label
      className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 text-white px-7 py-3 rounded-2xl cursor-pointer shadow-xl hover:from-blue-700 hover:to-cyan-600 transition-all border-2 border-white"
      style={{ minWidth: 220, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 4px 16px #0002', letterSpacing: 0.5 }}
    >
      <span style={{ pointerEvents: 'none', textShadow: '0 1px 4px #0006' }}>Upload Event Banner</span>
      <input
        name="image"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </label>
    <span className="text-xs text-gray-500 mt-2">Recommended: 1200x400px</span>
  </div>
          {/* Cover Image Preview (remains after the input) */}
          <div className="relative h-32 md:h-40 w-full mb-3 md:mb-4 rounded-lg overflow-hidden flex items-center justify-center">
            {coverPreview || eventData.coverImageUrl ? (
              <img
                src={coverPreview || eventData.coverImageUrl || undefined}
                alt="Event Banner Preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400 italic">No banner uploaded yet</span>
            )}
          </div>
          {/* Vibe Video Upload */}
          <div className="mb-3 md:mb-4 text-sm md:text-base">
            <label className="block font-medium mb-2">Vibe Video (optional)</label>
            <label className="inline-block px-3 py-1.5 bg-white border border-gray-400 rounded-md shadow-sm cursor-pointer text-sm font-medium hover:bg-violet-50 hover:border-violet-400 transition-all">
              Choose File
              <input name="vibeVideo" type="file" accept="video/*" className="hidden" onChange={handleVibeVideoUpload} />
            </label>
            <span className="text-xs text-gray-500 block mt-1">Upload a short video to showcase the vibe of your event.</span>
          </div>

          {/* Organizer */}
          <label className="font-medium text-gray-700 flex flex-col gap-1 mb-2 italic text-sm md:text-base">
            <span className="flex items-center">Organizer Name<span className="text-red-500 ml-1">*</span></span>
            <div className="relative">
              <input name="OrganizerName" type="text" placeholder="Your name or organization" required onChange={handleInputChange} value={eventData.OrganizerName} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition duration-200 pr-10 font-normal not-italic break-all" style={{wordBreak:'break-all', overflowWrap:'break-word'}} />
              {eventData.OrganizerName && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
          </label>
          {/* Organizer Email */}
          <label className="font-medium text-gray-700 flex flex-col gap-1 mb-2 italic text-sm md:text-base">
            <span className="flex items-center">Organizer Email<span className="text-red-500 ml-1">*</span></span>
            <div className="relative">
              <input name="organizerEmail" type="email" placeholder="e.g. you@email.com" required onChange={handleInputChange} value={eventData.organizerEmail} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition duration-200 pr-10 font-normal not-italic break-all" style={{wordBreak:'break-all', overflowWrap:'break-word'}} />
              {eventData.organizerEmail && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
          </label>

          {/* Event Start & End Date & Time in same row */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 md:mb-4">
            <label className="font-medium text-gray-700 flex flex-col gap-1 mb-2 flex-1 italic text-sm md:text-base">
              <span className="flex items-center">Event Start Date & Time<span className="text-red-500 ml-1">*</span></span>
              <div className="relative">
                <div className="border-2 border-gray-300 rounded-md bg-white shadow px-3 py-2 min-h-[48px] flex items-center">
                  <input name="eventStart" disabled={isEditMode} type="datetime-local" required onChange={handleInputChange} value={eventData.eventStart} className="input input-bordered w-[180px] md:w-[200px] pr-2 bg-transparent border-none focus:ring-0 focus:border-none font-normal not-italic" />
                </div>
                {eventData.eventStart && (
                  <span className="absolute right-1 top-1/2 -translate-y-[60%] text-green-500 pointer-events-none" style={{right: 6, top: '55%'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
              </div>
            </label>
            <label className="font-medium text-gray-700 flex flex-col gap-1 mb-2 flex-1 italic text-sm md:text-base">
              <span className="flex items-center">Event End Date & Time<span className="text-red-500 ml-1">*</span></span>
              <div className="relative">
                <div className="border-2 border-gray-300 rounded-md bg-white shadow px-3 py-2 min-h-[48px] flex items-center">
                  <input name="eventEnd" disabled={isEditMode} type="datetime-local" required onChange={handleInputChange} value={eventData.eventEnd} className="input input-bordered w-[180px] md:w-[200px] pr-2 bg-transparent border-none focus:ring-0 focus:border-none font-normal not-italic" />
                </div>
                {eventData.eventEnd && (
                  <span className="absolute right-1 top-1/2 -translate-y-[60%] text-green-500 pointer-events-none" style={{right: 6, top: '55%'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
              </div>
            </label>
          </div>
          {/* Recurrence Type */}
<label htmlFor="recurrenceType" className="flex items-center font-medium mb-1 italic text-sm md:text-base">Recurrence Type<span className="text-red-500 ml-1">*</span>
  <div>
    <select
      id="recurrenceType"
      name="recurrenceType"
      onChange={handleInputChange}
      value={eventData.recurrenceType}
      disabled={isEditMode}
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-orange-500 transition duration-200"
    >
      <option value="None">None</option>
      <option value="rule">Rule-based</option>
      <option value="custom">Custom Dates</option>
    </select>
  </div>
</label>
{/* Occurrences Section - only for non-recurring events */}
{/* Rule-based recurrence input */}
{eventData.recurrenceType === 'rule' && (
  <div className="mb-4">
    <label className="block font-medium mb-2 italic text-sm md:text-base">Recurrence Rule (iCal format)<span className="text-red-500 ml-1">*</span>
      <input
        name="recurrenceRule"
        disabled={isEditMode}
        type="text"
        placeholder="e.g. FREQ=WEEKLY;BYDAY=MO,WE,FR"
        required
        onChange={handleInputChange}
        value={eventData.recurrenceRule}
        className="input input-bordered w-full border-orange-400 bg-orange-50 text-amber-700 font-semibold pr-10"
      />
      <span className="text-xs text-gray-500 mt-1 block">Note: Only the first 10 occurrences will be created and shown for rule-based recurrence.</span>
    </label>
    {/* Display up to 10 occurrences for rule-based recurrence */}
    {Array.isArray(eventData.occurrences) && (eventData.occurrences || []).length > 0 && (
      <div className="mt-2">
        <div className="font-semibold text-gray-700 mb-1">First 10 Occurrences:</div>
        <ul className="list-disc pl-6 text-sm text-gray-800">
          {(eventData.occurrences || []).slice(0, 10).map((occ: { start?: string; end?: string }, idx: number) => (
  <li key={idx}>
    {occ.start ? new Date(occ.start).toLocaleString() : ''}
    {occ.end ? ` to ${new Date(occ.end).toLocaleString()}` : ''}
  </li>
))}

        </ul>
        {eventData.occurrences.length > 10 && (
          <div className="mt-1 text-xs text-gray-500 italic">Only first 10 occurrences shown.</div>
        )}
      </div>
    )}
  </div>
)}

{/* Custom dates recurrence input */}
{eventData.recurrenceType === 'custom' && (
  <div className="mb-4">
    <label className="block font-medium mb-2 italic text-sm md:text-base">
      Custom Occurrences<span className="text-red-500 ml-1">*</span>
    </label>
    {(eventData.customDates || []).map((occ: CustomDate, idx: number) => (
      <div key={idx} className="flex gap-2 mb-2 items-center">
        <input
          type="datetime-local"
          disabled={isEditMode}
          value={occ && occ.start ? occ.start : ''}
          onChange={e => {
            setEventData((prev: EventFormData) => {
              // Deep copy to avoid reference issues
              const newDates = prev.customDates.map((item: CustomDate, i: number) =>
                i === idx ? { ...item, start: e.target.value } : { ...item }
              );
              return { ...prev, customDates: newDates, customFields: JSON.stringify(newDates) };
            });
          }}
          className="input input-bordered"
          placeholder="Start Date & Time"
        />
        <span className="font-bold">to</span>
        <input
          type="datetime-local"
          value={occ && occ.end ? occ.end : ''}
          disabled={isEditMode}
          onChange={e => {
            setEventData((prev: EventFormData) => {
              // Deep copy to avoid reference issues
              const newDates = prev.customDates.map((item: CustomDate, i: number) =>
                i === idx ? { ...item, end: e.target.value } : { ...item }
              );
              return { ...prev, customDates: newDates, customFields: JSON.stringify(newDates) };
            });
          }}
          className="input input-bordered"
          placeholder="End Date & Time"
        />
        <button type="button" onClick={() => {
          setEventData((prev: EventFormData) => {
            const newDates = prev.customDates.filter((_: CustomDate, i: number) => i !== idx);
            return { ...prev, customDates: newDates, customFields: JSON.stringify(newDates) };
          });
        }} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => {
      // Always create a new object for each occurrence to avoid reference issues
      const newDates = [...(eventData.customDates ? eventData.customDates.map((d: CustomDate) => ({ ...d })) : []), { start: '', end: '' }];
      setEventData({ ...eventData, customDates: newDates, customFields: JSON.stringify(newDates) });
    }} className="px-3 py-1 bg-green-500 text-white rounded">+ Add Occurrence</button>
    {/* Debug: Display the customDates array as JSON */}
    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono">
      <strong>DEBUG customDates:</strong>
      <pre>{JSON.stringify(eventData.customDates, null, 2)}</pre>
    </div>
  </div>
)}
          {/* Location with event type options and conditional map or event link */}
          <div className="mb-2 text-sm md:text-base">
            <span className="block font-medium mb-2 italic">Event Type<span className="text-red-500 ml-1">*</span></span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              {['Online', 'Venue', 'TBA'].map((type) => (
                <label
                  key={type}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: eventData.type === type ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    background: eventData.type === type ? '#2563eb' : '#f3f4f6',
                    color: eventData.type === type ? '#fff' : '#222',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                    boxShadow: eventData.type === type ? '0 2px 8px #2563eb22' : 'none',
                    transition: 'all 0.15s',
                  }}
                  className="select-none"
                >
                  <input
                    type="radio"
                    name="type"
                    disabled={isEditMode}
                    value={type}
                    checked={eventData.type === type}
                    onChange={e => {
                      // Custom logic: clear irrelevant fields when switching type
                      setEventData(prev => {
                        let newData = { ...prev, type };
                        if (type === 'Venue') {
                          newData = { ...newData, eventLink: '' };
                        } else if (type === 'Online') {
                          newData = { ...newData, location: '' };
                        } else if (type === 'TBA') {
                          newData = { ...newData, location: '', eventLink: '' };
                        }
                        return newData;
                      });
                    }}
                    style={{ display: 'none' }}
                  />
                  {type}
                </label>
              ))}
            </div>
            {eventData.type === 'Venue' && (
              <>
                  <span className="block font-medium mb-2 italic">Location<span className="text-red-500 ml-1">*</span></span>
                  <div className="relative">
                    <input name="location" disabled={isEditMode} type="text" placeholder="e.g. Gachibowli, Hyderabad" required onChange={handleInputChange} value={eventData.location} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition duration-200 pr-10" />
                    {eventData.location && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                {eventData.location && (
                  <div style={{ marginTop: '0.5rem', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0001' }}>
                    <iframe
                      title="Google Maps Preview"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(eventData.location)}&output=embed`}
                    ></iframe>
                  </div>
                )}
              </>
            )}
            {eventData.type === 'Online' && (
              <label className="block font-medium mb-2 w-full mt-2 italic">Event Link<span className="text-red-500">*</span>
                
                <div className="relative">
                  <input
                    name="eventLink"
                    disabled={isEditMode}
                    type="url"
                    placeholder="Enter event link (e.g. https://meet.example.com/xyz)"
                    required={eventData.type === 'Online'}
                    onChange={handleInputChange}
                    value={eventData.eventLink}
                    className="input input-bordered w-full pr-10"
                  />
                  {eventData.eventLink && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </div>
              </label>
            )}
          </div>

          {/* Category */}
          <label className="block font-medium mb-2 italic text-sm md:text-base">Category<span className="text-red-500 ml-1">*</span>
            <div className="relative">
              <select name="category" onChange={handleInputChange} value={["Music","Tech","Health","Education","Business","Conference","Exhibitions"].includes(eventData.category) ? eventData.category : 'Others'} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-orange-500 transition duration-200 pr-10 font-normal not-italic">
                <option value="" disabled hidden>--Select--</option>
                <option value="Music">Music</option>
                <option value="Tech">Tech</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Conference">Conference</option>
                <option value="Exhibitions">Exhibitions</option>
                <option value="Others">Others</option>
              </select>
              {eventData.category && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
            {/* Show input if category is Others or a custom value */}
            {(["Others"].includes(eventData.category) || !["Music","Tech","Health","Education","Business","Conference","Exhibitions"].includes(eventData.category)) && (
              <div className="mt-2">
                <input
                  name="category"
                  type="text"
                  placeholder="Please specify other category"
                  value={!["Music","Tech","Health","Education","Business","Conference","Exhibitions"].includes(eventData.category) ? eventData.category : ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition duration-200 font-normal not-italic"
                />
              </div>
            )}
          </label>

          {/* Paid Event - Modern Toggle UI */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-5 mb-2 md:mb-3">
              <span className="font-semibold text-[15px] md:text-[16px]">Ticket Type:</span>
              <div className="flex items-center gap-2 md:gap-3">
                <span className={`min-w-[40px] text-right ${!eventData.isPaid ? 'text-green-500 font-bold' : 'text-gray-400 font-medium'} text-[15px] md:text-[16px]`}>Free</span>
                <button
            type="button"
            style={{ cursor: 'pointer' }}
                  aria-label="Toggle Paid Event"
                  onClick={() => setEventData({ ...eventData, isPaid: !eventData.isPaid, price: !eventData.isPaid ? eventData.price : '' })}
                  className={`w-[44px] md:w-[48px] h-[18px] rounded-full border-none relative transition-colors duration-200 shadow focus:outline-none cursor-pointer flex items-center p-0 ${eventData.isPaid ? 'bg-orange-400' : 'bg-green-500'}`}
                >
                  <span
                    className="absolute top-0.5 left-0.5 transition-all duration-200"
                    style={{ left: eventData.isPaid ? 24 : 4, width: 20, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px #0002', display: 'block' }}
                  />
                </button>
                <span className={`min-w-[40px] text-left ${eventData.isPaid ? 'text-orange-400 font-bold' : 'text-gray-400 font-medium'} text-[15px] md:text-[16px]`}>Paid</span>
              </div>
            </div>
          <div className="mt-2 md:mt-3">
              {eventData.isPaid && (
                <>
                  <label className="block font-medium mb-2 text-sm md:text-base" style={{ marginBottom: 4 }}>Price (₹)<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <input
                      name="price"
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      required={eventData.isPaid}
                      onChange={handleInputChange}
                      value={eventData.price}
                      className="input input-bordered w-full border-orange-400 bg-orange-50 text-amber-700 font-semibold pr-10"
                    />
                    {eventData.price && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                </>
              )}
              {/* Max Attendees */}
              <label className="block font-medium mb-2 mt-4 italic text-sm md:text-base">Max People Can Attend<span className="text-red-500 ml-1">*</span>
                <div className="relative">
                  <input
                    name="maxAttendees"
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    required
                    onChange={handleInputChange}
                    value={eventData.maxAttendees}
                    className="input input-bordered w-full border-orange-400 bg-orange-50 text-amber-700 font-semibold pr-10 font-normal not-italic"
                  />
                  {eventData.maxAttendees && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </div>
              </label>
              {/* Registration Deadline (always visible) */}
          <label className="font-medium text-gray-700 flex flex-col gap-1 mb-2 mt-4 italic text-sm md:text-base">
                <span className="flex items-center">Registration Deadline<span className="text-red-500 ml-1">*</span></span>
                <div className="relative">
                  <input
                    name="registrationDeadline"
                    type="datetime-local"
                    required
                    onChange={handleInputChange}
                    value={eventData.registrationDeadline}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-orange-500 transition duration-200 pr-10 font-normal not-italic"
                  />
                  {eventData.registrationDeadline && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Description with Tiptap Rich Text Editor, minimal toolbar, and visible formatting */}
          <span className="block font-medium mb-2 text-sm md:text-base">Event Description<span className="text-red-500 ml-1">*</span></span>
          <div className="mb-3 md:mb-4 not-italic">
            {/* Minimal Tiptap Toolbar */}
           {/* Toolbar */}
<div className="flex gap-1 md:gap-2 mb-2 flex-wrap">
  {/* Bold */}
  <button
            type="button"
            style={{ cursor: 'pointer' }}
    title="Bold"
    aria-label="Bold"
    onClick={() => editor && editor.chain().focus().toggleBold().run()}
    className={`toolbar-btn flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-orange-100 active:scale-95 ${editor?.isActive('bold') ? 'bg-orange-200 text-orange-700' : 'bg-white text-gray-700'}`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 6a3 3 0 0 1 0 6H9V6h4zm0 6a3 3 0 0 1 0 6H9v-6h4z"/></svg>
  </button>

  {/* Italic */}
  <button
            type="button"
            style={{ cursor: 'pointer' }}
    title="Italic"
    aria-label="Italic"
    onClick={() => editor && editor.chain().focus().toggleItalic().run()}
    className={`toolbar-btn flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-orange-100 active:scale-95 ${editor?.isActive('italic') ? 'bg-orange-200 text-orange-700' : 'bg-white text-gray-700'}`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 4h-4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4"/></svg>
  </button>

  {/* Bullet List */}
  <button
            type="button"
            style={{ cursor: 'pointer' }}
    title="Bullet List"
    aria-label="Bullet List"
    onClick={() => editor && editor.chain().focus().toggleBulletList().run()}
    className={`toolbar-btn flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-orange-100 active:scale-95 ${editor?.isActive('bulletList') ? 'bg-orange-200 text-orange-700' : 'bg-white text-gray-700'}`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="6" cy="18" r="1.5"/>
      <line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/>
    </svg>
  </button>
</div>

{/* Tiptap Content Area */}
<div className="prose max-w-none text-sm md:text-base" style={{ listStyleType: 'disc', paddingLeft: '0.5em' }}>
  <EditorContent editor={editor} />
</div>

            {/* Editor box with visible formatting as you type */}
            <div className="border border-gray-200 rounded-xl bg-white min-h-[120px] md:min-h-[180px] mb-0 p-2">
              <EditorContent 
                editor={editor} 
                className="outline-none focus:outline-none min-h-[160px] text-base text-gray-800 prose"
                style={{ listStyleType: 'disc', paddingLeft: '0.5em' }}
              />
            </div>
            {/* Upload buttons below, side by side */}
            <div className="flex flex-col sm:flex-row gap-0 mt-2">
              <label className="flex-1 flex items-center justify-center cursor-pointer bg-gray-100 rounded-bl-xl py-3 font-semibold text-base shadow border border-gray-200 border-t-0 border-r border-r-gray-200">
                🖼 Image
                <input type="file" accept="image/*" multiple onChange={handleImageUploadTiptap} className="hidden" />
              </label>
              <label className="flex-1 flex items-center justify-center cursor-pointer bg-gray-100 rounded-br-xl py-3 font-semibold text-base shadow border border-gray-200 border-t-0 border-l border-l-gray-200">
                🎬 Video
                <input type="file" accept="video/*" multiple onChange={handleVideoUploadTiptap} className="hidden" />
              </label>
            </div>
          </div>

          {/* Speakers */}
          <div>
            <label className="block font-medium mb-2 italic text-sm md:text-base">Speakers</label>
            {(eventData.speakers || []).map((speaker: Speaker, idx: number) => (
              <div key={idx} className="relative mb-4 md:mb-6 w-full">
                <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-slate-50 shadow-sm w-full min-h-[70px] md:min-h-[90px] flex flex-col justify-center">
                  <button
            type="button"
            style={{ cursor: 'pointer' }}
                    onClick={() => removeSpeaker(idx)}
                    className="absolute top-0 right-2 bg-white border border-gray-800 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow z-20 transition-colors duration-150 p-0"
                    title="Delete Speaker"
                    aria-label="Delete Speaker"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Speaker Name"
                      value={speaker.name}
                      onChange={e => handleSpeakerNameChange(idx, e.target.value)}
                      className="input input-bordered text-[12px] md:text-[13px] h-7 px-2 py-0.5 rounded mb-0.5 w-full"
                    />
                    <label className="inline-block px-2 py-1 md:px-3 md:py-1.5 mt-1 bg-white border border-gray-400 rounded-md shadow-sm cursor-pointer text-xs md:text-sm font-medium hover:bg-violet-50 hover:border-violet-400 transition-all">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleSpeakerImageChange(idx, e)}
                        className="hidden"
                        title="Upload speaker image"
                        placeholder="Upload speaker image"
                      />
                    </label>
                  </div>
                  <textarea
                    placeholder="Speaker Bio"
                    value={speaker.bio}
                    onChange={e => handleSpeakerBioChange(idx, e.target.value)}
                    className="input input-bordered min-h-[28px] md:min-h-[36px] text-[12px] md:text-[13px] resize-vertical px-2 py-1 rounded w-full"
                  />
                </div>
              </div>
            ))}
            <button
            type="button"
            style={{ cursor: 'pointer' }}
              onClick={addSpeaker}
              className="mt-2 md:mt-4 px-3 md:px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all w-full text-sm md:text-base tracking-wide border-0"
            >
              + Add another speaker
            </button>
          </div>

          {/* FAQs Section */}
          <div className="my-5 md:my-8">
            <label className="block font-medium mb-2 italic text-sm md:text-base">Event FAQs</label>
            {(eventData.faqs || []).map((faq: Faq, idx: number) => (
              <div key={idx} className="relative mb-3 md:mb-5 w-full">
                <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-slate-50 shadow-sm w-full min-h-[40px] md:min-h-[60px] flex flex-col justify-center">
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="absolute top-0 right-2 bg-white border border-gray-800 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow z-20 transition-colors duration-150 p-0"
                    title="Delete FAQ"
                    aria-label="Delete FAQ"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <input
                    type="text"
                    placeholder={`Question ${idx + 1}`}
                    value={faq.question}
                    onChange={e => handleFaqChange(idx, 'question', e.target.value)}
                    className="input input-bordered text-[12px] md:text-[13px] h-7 px-2 py-0.5 rounded mb-1 w-full"
                  />
                  <textarea
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={e => handleFaqChange(idx, 'answer', e.target.value)}
                    className="input input-bordered min-h-[20px] md:min-h-[28px] text-[12px] md:text-[13px] resize-vertical px-2 py-1 rounded w-full"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFaq}
              className="mt-2 px-3 md:px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition-all w-full text-sm md:text-base tracking-wide border-0"
            >
              + Add another FAQ
            </button>
          </div>
          <button
            type="submit"
            style={{ cursor: isFormComplete() ? 'pointer' : 'not-allowed', opacity: isFormComplete() ? 1 : 0.6 }}
            className="w-full mt-4 md:mt-6 px-4 md:px-5 py-2 md:py-3 rounded-xl bg-green-600 text-white font-bold shadow hover:bg-green-700 transition-all text-base md:text-lg text-[1.1rem] border-0 tracking-wide"
            disabled={!isFormComplete()}
          >
            Publish Event
          </button>
          {/* FAQs Preview */}
          <div className="my-4 md:my-6">
            <strong className="text-[1.1rem] text-[#222] italic">FAQs:</strong>
            {eventData.faqs.length === 0 || eventData.faqs.every((f: Faq) => !f.question && !f.answer) ? (
              <span className="text-gray-500 ml-2">[No FAQs added]</span>
            ) : (
              <div className="mt-2">
                {eventData.faqs.map((faq: Faq, idx: number) => (
  (faq.question || faq.answer) && (
    <div key={idx} className="mb-2 p-2 bg-white rounded shadow text-gray-700">
      <strong>Q{idx + 1}:</strong> {faq.question}<br />
      <span className="ml-4"><strong>A:</strong> {faq.answer}</span>
    </div>
  )
))}

              </div>
            )}
          </div>
        </form>

        {/* Live Preview (refactored to use EventLivePreview) */}
        <div className={`${showMobilePreview ? '' : 'hidden'} lg:block flex-1 min-w-0`}>
          <div
            className="relative bg-white/90 rounded-2xl shadow-lg border-2 border-orange-200 w-full max-w-[820px] mx-auto flex flex-col items-center overflow-hidden min-w-0 h-full"
            style={{ height: '700px', minHeight: 0, flexBasis: '0', flexGrow: 1, flexShrink: 1 }}
          >
            {/* Ribbon Heading inside scrollable preview */}
            <div className="w-full flex justify-center relative select-none z-20 pt-4 pb-2 sm:pb-3">
              <div className="relative w-fit mx-auto">
                <div className="absolute left-[-32px] top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-300 rounded-l-xl shadow-lg z-0 rotate-[-8deg] border-2 border-orange-300"></div>
                <div className="absolute right-[-32px] top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-300 rounded-r-xl shadow-lg z-0 rotate-[8deg] border-2 border-orange-300"></div>
                <h2 className="relative z-10 text-xl md:text-2xl font-bold text-white tracking-wide uppercase drop-shadow-lg px-6 sm:px-10 py-2 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 rounded-xl border-4 border-orange-300 shadow-lg text-center" style={{ letterSpacing: 2 }}>
                  <span className="drop-shadow">🎉 Live Preview 🎉</span>
                </h2>
              </div>
            </div>
            {/* Scrollable preview content with improved mobile spacing */}
            <div
              className="flex-1 w-full overflow-y-auto px-2 sm:px-4 pb-6 pt-2"
              style={{ maxHeight: 'calc(100% - 80px)', minWidth: 0 }}
            >
              <div className="max-w-full sm:max-w-[700px] mx-auto w-full min-w-0">
                {/* Force vertical layout for preview in event form */}
                <div className="event-preview-vertical-layout">
                  <EventLivePreview
                    event={{
                      title: eventData.title,
                      coverImageUrl: coverPreview || eventData.coverImageUrl,
                      vibeVideoUrl: eventData.vibeVideoPreview,
                      organizerName: eventData.OrganizerName,
                      organizerEmail: eventData.organizerEmail,
                      eventStart: eventData.eventStart,
                      eventEnd: eventData.eventEnd,
                      registrationDeadline: eventData.registrationDeadline,
                      recurrenceType: eventData.recurrenceType,
                      type: eventData.type,
                      location: eventData.location,
                      eventLink: eventData.eventLink,
                      category: eventData.category,
                      isPaid: eventData.isPaid,
                      price: eventData.price,
                      maxAttendees: eventData.maxAttendees,
                      description: eventData.description,
                      speakers: eventData.speakers,
                      faqs: eventData.faqs,
                      vibeVideoPreview: eventData.vibeVideoPreview,
                    }}
                    
                    forceMobileLayout={true}
                  />
                  {/* Show location map in live preview if location is entered */}
                  {eventData.type === 'Venue' && eventData.location && (
                    <div style={{ marginTop: '1rem', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0001' }}>
                      <iframe
                        title="Google Maps Preview"
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(eventData.location)}&output=embed`}
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </>
  );
}