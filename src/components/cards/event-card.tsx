"use client";
 
import React, { useEffect, useState } from "react";
import PopupMessage from "../common/popup-message";
import ConfirmationDialog from "../common/confirmation-dialog";
import axios from "axios";
import { FaEdit, FaTrash, FaRegBookmark, FaBookmark } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { FaRegClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ReactDOM from "react-dom";
 
 
interface EventCardProps {
  event: any;
  showActions?: boolean;
  onDelete?: (eventId: string) => void;
  onEdit?: (event: any) => void;
  hideRegister?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (event: any, isBookmarked: boolean) => void;
  hideLive?: boolean;
  onApprove?: () => void;
}
 
export default function EventCard({ event, showActions = false, onDelete, onEdit, hideRegister = false, onBookmarkToggle, hideLive = false }: EventCardProps): React.JSX.Element {
  const [approved, setApproved] = useState(event.isVerifiedByAdmin);
  useEffect(() => { setApproved(event.isVerifiedByAdmin); }, [event.isVerifiedByAdmin]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const { onApprove } = arguments[0];
  // Detect admin from localStorage
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('user');
      console.log("Approving event with editCount:", event);

      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          setIsAdmin(userObj.role === 1 || userObj.role === "1" || userObj.role === "Admin");
        } catch {}
      }
    }
  }, []);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [editCount, setEditCount] = useState(event.editEventCount || 0);
  const [popup, setPopup] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  // --- ADDED FOR APPROVE MODAL/POPUP ---
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [approving, setApproving] = useState(false);
 
  // Fetch bookmark status for this event on mount
  useEffect(() => {
    async function fetchBookmarkStatus() {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      let userId = null;
      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
        } catch {}
      }
      if (!userId) {
        setIsBookmarked(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5274/api/Bookmarks/bookmarked-events/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data;
        if (Array.isArray(data)) {
          setIsBookmarked(data.some((e: any) => e.eventId === event.eventId));
        } else {
          setIsBookmarked(false);
        }
      } catch {
        setIsBookmarked(false);
      }
    }
    fetchBookmarkStatus();
    // Only run on mount or if eventId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.eventId]);

  function handleApprove(e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  setShowApproveDialog(true);
}

function confirmApprove() {
  setShowApproveDialog(false);
  // Async logic for approval and mail
  (async () => {
    if (editCount >= 0) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/Admin/event/${event.eventId}/approve`, {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
  const data = await res.json();
  console.log('Approve event response:', data); // Debug backend response
  if (data && data.success) {
          setApproved(true);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("eventApproved"));
          }
          // Send mail to organiser
                  const organiserEmail = event.OrganizerEmail || event.organiserEmail || event.organizerEmail || event.OrganiserEmail;
                  if (!organiserEmail) {
                    setPopup({ message: "Organiser email not found for this event.", type: "error" });
                    return;
                  }
          const eventTitle = event.title || event.eventTitle || event.name;
          const emailBody = `
            <div style='font-family:Segoe UI,Arial,sans-serif;background:#f9fafb;padding:32px;border-radius:16px;text-align:center;'>
              <h2 style='color:#16a34a;font-size:2rem;margin-bottom:8px;'>🎉 Congratulations!</h2>
              <p style='font-size:1.1rem;color:#374151;'>
                Your event <b style='color:#2563eb;'>${eventTitle}</b> has been <span style='color:#16a34a;font-weight:bold;'>approved</span> by our admin team.<br/>
                <span style='font-size:1.5rem;'>🥳✨</span>
              </p>
              <div style='margin:18px 0;'>
                <span style='display:inline-block;background:#e0f2fe;color:#0ea5e9;padding:8px 18px;border-radius:8px;font-size:1rem;'>
                  Wishing you a successful and memorable event!
                </span>
              </div>
              <p style='color:#64748b;font-size:0.95rem;'>
                If you need any help, feel free to reach out.<br/>
                <span style='font-size:1.2rem;'>👍🌟</span>
              </p>
              <hr style='margin:24px 0;border:none;border-top:1px solid #e5e7eb;' />
              <p style='font-size:0.9rem;color:#6b7280;'>Thank you for choosing EventSphere!</p>
            </div>
          `;
          console.log('Sending approval email:', {
            organiserEmail,
            eventTitle,
            emailBody
          });
          await axios.post(`${API_URL}/api/email/send-to-organiser`, {
            from: "admin@eventsphere.com",
            to: organiserEmail,
            subject: `Your event \"${eventTitle}\" has been approved!`,
            body: emailBody
          }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          setShowSuccessPopup(true);
          setTimeout(() => setShowSuccessPopup(false), 3000);
          if (typeof onApprove === 'function') {
            onApprove();
          }
        } else {
          setApproved(false); // Ensure UI stays unapproved on failure
          setPopup({ message: data?.message || "Failed to approve event.", type: "error" });
        }
      } catch {
        setApproved(false); // Ensure UI stays unapproved on error
        setPopup({ message: "Failed to approve event.", type: "error" });
      }
    } else {
      try {
        router.push(`/event/${event.eventId}/view-event`);
      } catch {
        setPopup({ message: "Failed to approve event.", type: "error" });
      }
    }
  })();
}



// Removed duplicate confirmApprove and unused states
 
  // Handler for bookmark toggle
  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    const token = localStorage.getItem("token");
    try {
      const userRaw = localStorage.getItem("user");
      let userId = null;
      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
        } catch {}
      }
      if (isBookmarked) {
        // Remove bookmark (send userId as query param)
        await axios.delete(`http://localhost:5274/api/Bookmarks/delete/${event.eventId}?userId=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setIsBookmarked(false);
        setPopup({ message: "Bookmark removed", type: "info" });
        if (typeof onBookmarkToggle === 'function') {
          onBookmarkToggle(event, true);
        }
      } else {
        // Add bookmark
        await axios.post(
          `http://localhost:5274/api/Bookmarks/add`,
          { eventId: event.eventId, userId },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setIsBookmarked(true);
        setPopup({ message: "Bookmark added", type: "success" });
        if (typeof onBookmarkToggle === 'function') {
          onBookmarkToggle(event, false);
        }
      }
    } catch {
      setPopup({ message: isBookmarked ? "Failed to remove bookmark" : "Failed to add bookmark", type: "error" });
    } finally {
      setBookmarkLoading(false);
    }
  };
  // Debug: log editCount and event
  if (showActions) {
    // Only log for cards with actions (My Events page)
    // eslint-disable-next-line no-console
    console.log('[EventCard] eventId:', event.eventId, 'editCount:', event.editCount, 'event:', event);
  }
  // Registration deadline (assume event.registrationDeadline is ISO string)
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  // Use event data, fallback to defaults if missing
  // Removed carousel state, always show first image
  // Helper to ensure image URLs are absolute for backend-served images
  const toAbsoluteUrl = (url: string) => {
    if (!url) return "/images/card-top.jpg";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5274${url}`;
    return url;
  };
 
  // If event has Media (array), use first image, else fallback
  const images = event?.media && event.media.length > 0
    ? event.media.filter((m: any) => m.mediaType === "Image").map((m: any) => toAbsoluteUrl(m.mediaUrl))
    : [toAbsoluteUrl(event.coverImage)];
  // Show 'Online' if event is online, otherwise show location or 'Venue'
  let location = "";
  if (event.eventType === "Online" || event.eventType === 0) {
    location = "Online";
  } else if (event.location && event.location.trim() !== "") {
    location = event.location;
  } else {
    location = "Venue";
  }
  // Show Paid if price > 0, else Free
  const type = event.price && event.price > 0 ? "Paid" : "Free";
  // Use registrationCount (total tickets booked) if available, else fallback to registrations array length
  const registrations = event.registrationCount ?? 0;
  const title = event.title || "Untitled Event";
  const eventStart = event.eventStart ? new Date(event.eventStart) : null;
  const eventEnd = event.eventEnd ? new Date(event.eventEnd) : null;
  const date = eventStart ? eventStart.toLocaleDateString() : "TBA";
  // Calculate duration in hours (rounded to 1 decimal)
  let duration = null;
  if (eventStart && eventEnd) {
    const diffMs = eventEnd.getTime() - eventStart.getTime();
    if (diffMs > 0) {
      duration = (diffMs / (1000 * 60 * 60)).toFixed(1); // hours
    }
  }
 
  // Recurrence label for display
  let recurrenceLabel = "";
  if (event.recurrenceType) {
    if (event.recurrenceType.toLowerCase() === "one-time") recurrenceLabel = "Once";
    else if (event.recurrenceType.toLowerCase() === "multiple") recurrenceLabel = "Multiple";
    else recurrenceLabel = event.recurrenceType;
  }
  const eventId = event.eventId;
  const shareUrl = `https://eventsphere.com/event/${eventId || 1}`;
  const shareText = encodeURIComponent(`Check out this event: ${title}`);
  // const audience = event.audience || "General";
 
  // Removed auto-scrolling carousel logic
 
  return (
    <div className="relative">
      {popup && (
        <PopupMessage
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
      <ConfirmationDialog
        open={showApproveDialog}
        message={`Are you sure you want to approve the event "${title}"?`}
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={confirmApprove}
        onCancel={() => setShowApproveDialog(false)}
      />
      <Link
        href={`/event/${eventId}/view-event`}
        className="block group focus:outline-none focus:ring-2 focus:ring-blue-400"
        tabIndex={0}
      >

  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden mx-auto px-2 py-3 sm:px-4 sm:py-4 mb-2 flex flex-col w-full h-auto min-h-[260px] sm:min-h-[340px] md:min-h-[420px] sm:min-w-[280px] sm:max-w-[400px] md:min-w-[350px] md:max-w-[450px] lg:min-w-[370px] lg:max-w-[480px] event-card-responsive
    sm:w-full md:w-1/2 lg:w-1/3">

        {/* Glow background */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl opacity-60 z-0" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl opacity-50 z-0" />
        {/* Responsive handled by Tailwind classes above. For <400px, parent should use flex-nowrap and overflow-x-auto. */}
 
  <div className="relative z-10 flex flex-col h-full">
          {/* Image Carousel */}
        <div className="relative w-full h-28 sm:h-36 md:h-40 lg:h-44 rounded-2xl overflow-hidden flex-shrink-0">
          <Image
            src={images[0]}
            alt="Event Image"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 33vw"
            className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
 
          {/* Location/Online & Type */}
          <div className="flex items-center mt-2 flex-wrap gap-y-1">
            <div className="flex text-xs font-sans items-center max-w-[140px] flex-shrink-0">
              <Image src="/icons/location.png" alt="Location" width={13} height={13} />
              <span
                className="ml-1 w-[110px] overflow-hidden text-ellipsis whitespace-nowrap inline-block align-middle"
                title={location}
              >
                {location}
              </span>
            </div>
            <div className="mx-2">|</div>
            <div className="flex text-xs font-sans items-center">
              <Image src="/icons/save-money.png" alt="Type" width={13} height={13} />
              <span className="ml-1">{type}</span>
            </div>
          </div>
 
          {/* Title */}
          <div className="flex items-center justify-between mb-1 lg:mb-2 flex-wrap gap-y-1">
            <h4
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold max-w-[150px] md:max-w-[180px] lg:max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap block"
              title={title}
            >
              {title}
            </h4>
          <button
            type="button"
            className={"hover:scale-110 transition-transform cursor-pointer bg-transparent border-none p-0"}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this event"}
            onClick={handleBookmarkToggle}
            disabled={bookmarkLoading}
          >
            {isBookmarked ? (
              <FaBookmark size={22} color="#06b6d4" style={bookmarkLoading ? { opacity: 0.5 } : {}} />
            ) : (
              <FaRegBookmark size={22} color="#64748b" style={bookmarkLoading ? { opacity: 0.5 } : {}} />
            )}
          </button>
          </div>
 
          {/* Date, Start Time & Duration */}
          <div className="flex flex-col gap-1 lg:mb-1 w-full text-xs sm:text-sm md:text-base lg:text-base">
            <div className="flex gap-2 items-center font-bold text-xs">
              <Image src="/icons/calendar.png" alt="Date" width={15} height={20} />
              <span>
                {eventStart ? eventStart.toLocaleDateString() : "TBA"}
                {eventStart && (
                  <>
                    {" "}
                    <span className="text-gray-500">{eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {duration && (
                        <span className="text-gray-400 ml-1">({duration} hr{Number(duration) !== 1 ? 's' : ''})</span>
                      )}
                    </span>
                  </>
                )}
              </span>
            </div>
            {/* Registration Deadline */}
            {registrationDeadline && (
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-red-400">
                <FaRegClock className="text-red-400" size={15} />
                <span>
                  {registrationDeadline.toLocaleDateString()} {registrationDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
 
          {/* Registration info (centered vertically for all screens) */}
          <div className="text-xs sm:text-sm md:text-base flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-blue-600 text-xs font-bold">{registrations}</span>{" "}
            <span className="text-xs">registrations</span>
            {!hideLive && (
              <span
                className="inline-flex items-center px-0.5 py-0.5 bg-red-500 text-xs rounded animate-pulse text-white font-bold"
                title="Live registration count"
              >
                <span className="w-1 h-1 bg-white rounded-full mr-1" />
                LIVE
              </span>
            )}
          </div>
 
          {/* Category, Recurrence & Share */}
          <div className="flex justify-between items-center text-xs sm:text-sm md:text-base mb-2 lg:mb-4 flex-wrap gap-y-1">
            <div className="flex gap-2 text-xs items-center">
              <Image src="/icons/businessman.png" alt="Category" width={20} height={20} />
              {event.category && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold text-gray-700" title={event.category}>
                  {event.category}
                </span>
              )}
              {recurrenceLabel && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded text-xs font-semibold text-blue-700" title={recurrenceLabel}>
                  {recurrenceLabel}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`, '_blank', 'noopener,noreferrer');
              }}
              className="hover:scale-110 transition-transform cursor-pointer"
              aria-label="Share event on Twitter"
            >
              <Image src="/icons/send.png" alt="Share" width={16} height={20} />
            </button>
          </div>
 
          {/* Register/Approve Button and Actions */}
          <div className="flex flex-col items-center gap-2 mt-2 mb-0 w-full pb-0">
            {/* Admin Approve Button Logic */}
            {isAdmin && typeof event.isVerifiedByAdmin !== 'undefined' ? (
              <div className="flex items-center gap-2">
                {approved ? (
                  <span className="bg-green-500 text-white text-xs lg:text-sm py-1 px-3 lg:py-2 lg:px-6 rounded-full shadow-md font-semibold tracking-wide select-none cursor-default">
                    Approved
                  </span>
                ) : (
                  <button
                    className="bg-orange-500 text-white text-xs lg:text-sm py-1 px-3 lg:py-2 lg:px-6 rounded-full shadow-md font-semibold tracking-wide hover:bg-orange-600 transition cursor-pointer"
                    aria-label="Approve event"
                    onClick={(e) => handleApprove(e)}
                    disabled={approved} // Disable button after approval
                  >
                    Approve Event
                  </button>
                )}
                {/* Mail Icon Button for Admins */}
                <button
                  className="ml-2 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition"
                  title="Send Email to Organiser"
                  aria-label="Send Email to Organiser"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Redirect to /send-email with organiser email and event title as query params
                    const organiserEmail = event.organiserEmail || event.organizerEmail || event.OrganiserEmail || event.OrganizerEmail;
                    const eventTitle = event.title || event.eventTitle || event.name;
                    if (organiserEmail) {
                      window.location.href = `/send-email?to=${encodeURIComponent(organiserEmail)}&event=${encodeURIComponent(eventTitle)}`;
                    } else {
                      alert('Organiser email not found for this event.');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                  </svg>
                </button>
              </div>
            ) : null}
            {!isAdmin && !hideRegister && (
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Use Next.js router for navigation
                  if (typeof window !== 'undefined') {
                    window.location.href = `/event/${event.eventId || event.id || event._id}/register`;
                  }
                }}
                className="bg-gradient-to-r text-xs sm:text-sm md:text-base lg:text-lg from-purple-500 to-blue-500 py-1 sm:py-2 px-3 sm:px-4 md:px-6 rounded-full shadow-md hover:from-purple-600 hover:to-blue-600 transition cursor-pointer select-none font-semibold tracking-wide"
                aria-label="Register for event"
              >
                Register Now
              </button>
            )}
            {showActions && (
              <div className="flex gap-2 mt-1">
                {/* Edit (Pencil) Button */}
                {editCount === -1 ? <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();}}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-full text-xs font-semibold text-yellow-800 shadow border border-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  title="Last Edit Not Approved"
                ><span>Last Edit Not Approved</span></button> :<button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-full text-xs font-semibold text-yellow-800 shadow border border-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  title="Edit Event"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEdit) onEdit(event);
                  }}
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit</span>
                  {/* Show edits left if available (number or numeric string) */}
                  {((typeof event.editCount === 'number' && !isNaN(event.editCount)) || (typeof event.editCount === 'string' && !isNaN(Number(event.editCount)))) && (
                    <span className="ml-2 px-2 py-0.5 bg-white border border-yellow-300 rounded text-yellow-700 font-bold text-xs" title="Edits left">
                      {event.editEventCount} left
                    </span>
                  )}
                </button>}
                
                {/* Delete Button */}
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-full text-xs font-semibold text-red-800 shadow border border-red-300 transition focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                  title="Delete Event"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onDelete) onDelete(eventId);
                  }}
                >
                  <FaTrash className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </Link>
      {showSuccessPopup && ReactDOM.createPortal(
  <div className="fixed left-1/2 top-[70px] z-[9999] -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-lg">
    Event approved and email sent successfully!
  </div>,
  document.body
)}
{showApproveModal && ReactDOM.createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] text-center">
      <h3 className="text-xl font-bold mb-4 text-blue-700">Are you sure you want to approve event?</h3>
      <div className="flex justify-center gap-6 mt-6">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          onClick={confirmApprove}
          disabled={approving}
        >
          Yes
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          onClick={() => setShowApproveModal(false)}
          disabled={approving}
        >
          No
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
    </div>
  );
}
