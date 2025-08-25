export interface CustomDate {
  start: string; // ISO string (YYYY-MM-DDTHH:mm)
  end: string;   // same format
}

export interface Speaker {
  name: string;
  bio: string;
  photoUrl: string;
  image: File | null;
  imagePreview: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Occurrence {
  start: string;
  startTime?: string;
  endTime?: string;
  end: string;
  location: string;
  eventTitle?: string;
  isCancelled?: boolean;
  occurrenceId?: number; // keep optional for backend compatibility
}

export type MappedOccurrence = Omit<Occurrence, "occurrenceId"> & { occurrenceId: number };

export interface Media {
  mediaType: 'image' | 'video' | string;
  mediaUrl: string;
}

export interface EventFormData {
    eventId?: number | string;
  title: string;
  OrganizerName: string;
  organizerEmail: string;
  eventStart: string;
  eventEnd: string;
  registrationDeadline: string;
  maxAttendees: string;
  recurrenceType: string;
  recurrenceRule: string;
  customDates: CustomDate[];
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
  vibeVideo: File | null | string;
  vibeVideoPreview: string;
  vibeVideoUrl?: string;
  speakers: Speaker[];
  faqs: Faq[];
  occurrences: Occurrence[];
  media: Media[];
}


export interface EventFormView {
    eventId?: number | string;
  title: string;
  OrganizerName: string;
  organizerEmail: string;
  eventStart: string;
  eventEnd: string;
  registrationDeadline: string;
  maxAttendees: string;
  recurrenceType: string;
  recurrenceRule: string;
  customDates: CustomDate[];
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
  coverImageUrl?: string;
  coverImage?: string;
  vibeVideo: string;
  vibeVideoPreview: string;
  vibeVideoUrl?: string;
  editEventCount: number;
  isVerifiedByAdmin: boolean;
  speakers: Speaker[];
  faqs: Faq[];
  occurrences: Occurrence[];
  media: Media[];
}

export interface EventLivePreviewProps  {
    title: string;
    coverImageUrl?: string;
    vibeVideoUrl?: string;
    organizerName?: string;
    organizerEmail?: string;
    eventStart?: string;
    eventEnd?: string;
    registrationDeadline?: string;
    recurrenceType?: string;
    recurrenceDates?: string[];
    occurrences?: Occurrence[];
    type?: string;
    eventType?: string | number; // Allow fallback for backend property
    location?: string;
    eventLink?: string;
    category?: string;
    isPaid?: boolean;
    isPaidEvent?: boolean;
    price?: string | number;
    maxAttendees?: string | number;
    description?: string;
    speakers?: Speaker[];
    faqs?: Faq[];
    vibeVideoPreview?: string;
    eventId?: string | number;
    id?: string | number;
    _id?: string | number;
    ticketsBooked?: number;
    registrationCount?: number;
  };