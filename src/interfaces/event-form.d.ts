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
  start: string;   // ISO datetime string
  end: string;
  location: string;
}

export interface Media {
  mediaType: 'image' | 'video' | string;
  mediaUrl: string;
}

export interface EventFormData {
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
  vibeVideo: File | null;
  vibeVideoPreview: string;
  speakers: Speaker[];
  faqs: Faq[];
  occurrences: Occurrence[];
  media: Media[];
}
