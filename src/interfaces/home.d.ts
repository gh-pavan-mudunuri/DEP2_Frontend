export interface EventInterface {
  eventId: number | string;
  id?:number | string;
  Id?: number | string;
  title?: string ;
  eventTitle?: string;
  name?: string;
  description?: string;
  eventType?: string | number;
  location?: string;
  price?: number;
  registrationCount?: number;
  registrationDeadline?: string; // ISO string
  eventStart?: string;
  eventEnd?: string;
  recurrenceType?: string;
  category?: string;
  media?: MediaItem[];
  coverImage?: string;
  isVerifiedByAdmin?: boolean;
  OrganizerEmail?: string;
  organiserEmail?: string;
  organizerEmail?: string;
  editEventCount?: number;
  editCount?: number | string;
}

export interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onDelete?: (eventId: string | number) => void;
  onEdit?: (event: Event) => void;
  hideRegister?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (event: Event, isBookmarked: boolean) => void;
  hideLive?: boolean;
  onApprove?: () => void;
}