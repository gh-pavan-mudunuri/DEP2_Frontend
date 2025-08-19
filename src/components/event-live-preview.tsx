import React from "react";
import Link from "next/link";
function formatDateTime(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const d = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const t = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${d}, ${t}`;
}
 
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";
 
function processDescriptionHtml(html: string | undefined): string {
  if (!html) return '<span style="color:#bbb">[Description]</span>';
  let out = html.replace(
    /<img([^>]+)src=['"](?!(?:https?:|data:))\/?(uploads|wwwroot\/uploads)?\/?([^'"]+)['"]/gi,
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
  // Replace <video src="/uploads/..."> or <video src="uploads/..."> with full API URL and ensure controls, width, height
  out = out.replace(/<video([^>]+)src=['"](?!(?:https?:|data:))\/?(uploads|wwwroot\/uploads)?\/?([^'"]+)['"]([^>]*)>/gi, (
    match: string,
    pre: string,
    folder: string,
    path: string,
    post: string
  ) => {
    let cleanPath = path.replace(/^wwwroot\//, '').replace(/^uploads\//, '');
    return `<video${pre}src="${API_URL}/uploads/${cleanPath}" controls width="100%" height="240"${post}>`;
  });
  return out;
}
 
type Speaker = {
  name: string;
  bio: string;
  photoUrl?: string;
  image?: File | null;
  imagePreview?: string;
};
type Faq = { question: string; answer: string };
type Occurrence = {
  occurrenceId: number;
  startTime: string;
  endTime: string;
  eventTitle?: string;
  isCancelled?: boolean;
};
type EventLivePreviewProps = {
  event: {
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

  /** If true, always use mobile (vertical) layout regardless of screen size */
  forceMobileLayout?: boolean;
};
 
const EventLivePreview: React.FC<EventLivePreviewProps> = ({ event, forceMobileLayout }) => {
  // Calculate available tickets
  const ticketsBooked = event.ticketsBooked ?? event.registrationCount ?? 0;
  const maxAttendees = Number(event.maxAttendees) || 0;
  const availableTickets = Math.max(0, maxAttendees - ticketsBooked);
  if (!event) return null;
  // Use a local variable for event type, fallback to event.eventType if needed
  const eventType = event.type !== undefined ? event.type : event.eventType;
  // Determine layout classes
  const mainSectionClass = forceMobileLayout
    ? 'flex flex-col gap-6 mb-6'
    : 'flex flex-col md:flex-row gap-6 md:gap-10 mb-6';
  const leftColClass = forceMobileLayout
    ? 'flex flex-col gap-4 w-full'
    : 'flex flex-col gap-4 md:w-2/5 w-full';
  const rightColClass = forceMobileLayout
    ? 'flex flex-col gap-4 justify-center w-full'
    : 'flex-1 flex flex-col gap-4 justify-center';
  const detailsGridClass = forceMobileLayout
    ? 'grid grid-cols-1 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 gap-4';
  return (
  <div className="w-full mx-auto p-0 md:p-4 lg:p-8 bg-white/90 rounded-3xl shadow-xl mb-4">
      <div className="w-full flex justify-center mb-6">
        <div
          className="border-2 border-fuchsia-300 bg-white/90 rounded-2xl shadow-lg px-6 py-4 max-w-2xl w-full flex items-center justify-center"
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            textAlign: 'center',
            fontWeight: 800,
            fontSize: event.title && event.title.length > 50 ? '1.3rem' : event.title && event.title.length > 30 ? '1.7rem' : '2.1rem',
            lineHeight: 1.18,
            boxShadow: '0 2px 12px 0 #f59e4299',
            padding: '1.2rem 1.5rem',
            maxWidth: '90vw',
            whiteSpace: 'pre-line',
            overflow: 'hidden',
          }}
          title={event.title}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-fuchsia-600 to-indigo-600 drop-shadow-lg break-words whitespace-pre-line w-full overflow-hidden text-ellipsis">
            {event.title}
          </span>
        </div>
      </div>
      <div className={mainSectionClass}>
        {/* Left: Cover image and vibe video */}
        <div className={leftColClass}>
          <div className="relative w-full max-h-[180px] md:max-h-[220px] rounded-xl overflow-hidden flex items-center justify-center border border-orange-100 shadow bg-gradient-to-br from-orange-50 via-white to-indigo-100">
            {event.coverImageUrl ? (
              <img src={event.coverImageUrl} alt="Event Banner Preview" className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" style={{maxHeight:'220px'}} />
            ) : (
              <span className="text-gray-400 italic">No banner uploaded yet</span>
            )}
          </div>
          {event.vibeVideoUrl && event.vibeVideoUrl.trim() !== '' && (
            <video src={event.vibeVideoUrl} controls className="w-full max-w-xs md:max-w-full rounded-xl border border-orange-200 shadow bg-black aspect-video" style={{maxHeight:'180px'}} />
          )}
        </div>
        {/* Right: Event details */}
        <div className={rightColClass}>
          <div className={detailsGridClass}>
            <div className="flex items-center gap-3 bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-orange-500 text-xl">👤</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Organizer</div>
                <div className="text-base font-bold text-gray-800 break-all whitespace-pre-line" title={event.organizerName}>{event.organizerName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-indigo-500 text-xl">✉️</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Organizer Email</div>
                <div className="text-base font-medium text-gray-800 break-all whitespace-pre-line" title={event.organizerEmail}>{event.organizerEmail}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-fuchsia-50/60 border border-fuchsia-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-fuchsia-500 text-xl">📅</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Event Start</div>
                <div className="text-base font-medium text-gray-800">{formatDateTime(event.eventStart)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-fuchsia-50/60 border border-fuchsia-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-fuchsia-500 text-xl">⏰</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Event End</div>
                <div className="text-base font-medium text-gray-800">{formatDateTime(event.eventEnd)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-orange-500 text-xl">📝</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Registration Deadline</div>
                <div className="text-base font-medium text-gray-800">{formatDateTime(event.registrationDeadline)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-indigo-500 text-xl">🔁</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Recurrence Dates</div>
            {event.recurrenceType === "None" ? (
              <select
                className="border border-fuchsia-200 rounded-lg px-2 py-1 text-base shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-400 mt-1 text-gray-400 bg-gray-100"
                style={{ maxWidth: 260 }}
                disabled
              >
                <option value="none">None</option>
              </select>
            ) : Array.isArray(event.occurrences) && event.occurrences.length > 0 ? (
              (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const futureOccurrences = event.occurrences.filter((occ: Occurrence) => {
                  const start = new Date(occ.startTime);
                  return !isNaN(start.getTime()) && start >= today;
                });
                return (
                  <select
                    className="border border-fuchsia-200 rounded-lg px-2 py-1 text-base shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-400 mt-1"
                    defaultValue={futureOccurrences[0]?.occurrenceId}
                    style={{ maxWidth: 260 }}
                  >
                    {futureOccurrences.length === 0 ? (
                      <option value="none" disabled>No future dates</option>
                    ) : (
                      futureOccurrences.map((occ: Occurrence) => {
                        const format = (d: string) => {
                          const date = new Date(d);
                          return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        };
                        return (
                          <option key={occ.occurrenceId} value={occ.occurrenceId} disabled>
                            {format(occ.startTime)} - {format(occ.endTime)}
                          </option>
                        );
                      })
                    )}
                  </select>
                );
              })()
            ) : (
              <div className="text-base font-medium text-gray-800">{event.recurrenceType}</div>
            )}
              </div>
            </div>
            {eventType === 'Venue' && (
              <>
                <div className="flex items-center gap-3 bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 shadow-sm animate-blink-location">
                  <span className="text-orange-500 text-xl">📍</span>
                  <div className="flex flex-col">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Location</div>
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-400 via-fuchsia-500 to-indigo-500 text-white font-bold text-base py-1.5 px-4 rounded-lg shadow transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 border border-orange-300 mt-1"
                      style={{ letterSpacing: '0.03em', animation: 'blink-location 1.2s linear infinite', width: 'fit-content', maxWidth: '100%' }}
                      title="View on Map"
                      onClick={() => {
                        if (event.location) {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank');
                        }
                      }}
                    >
                      <span className="truncate max-w-[50vw] md:max-w-[180px]">{event.location}</span>
                      <span className="ml-2 text-xs font-semibold bg-white/20 rounded px-2 py-1 border border-white/30">View on Map</span>
                    </button>
                  </div>
                </div>
      {/* Blinking animation for location button */}
      <style jsx>{`
        @keyframes blink-location {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }
        .animate-blink-location {
          animation: blink-location 1.2s linear infinite;
        }
      `}</style>
                {/* Map removed as requested; only clickable location grid remains */}
              </>
            )}
            {eventType === 'Online' && (
              <div className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 shadow-sm">
                <span className="text-indigo-500 text-xl">🔗</span>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Event Link</div>
                  {event.eventLink ? (
                    <a href={event.eventLink} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-base font-medium">{event.eventLink}</a>
                  ) : (
                    <span className="text-gray-400 ml-2">[Event Link]</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-fuchsia-50/60 border border-fuchsia-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-fuchsia-500 text-xl">🏷️</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Type</div>
                <div className="text-base font-medium text-gray-800">
                  {(() => {
                    const typeRaw = eventType;
                    const type = typeRaw?.toString().toLowerCase();
                    // Handle numeric values from backend
                    if (type === '0') return <span>Online</span>;
                    if (type === '1') return <span>Venue</span>;
                    if (type === '2') return <span className="italic text-gray-500">To Be Announced</span>;
                    if (!type || type === 'tba' || type === 'to be announced' || type.includes('announce')) {
                      return <span className="italic text-gray-500">To Be Announced</span>;
                    }
                    if (type === 'venue') {
                      return <span>Venue</span>;
                    }
                    if (type === 'online') {
                      return <span>Online</span>;
                    }
                    // fallback for any other type
                    return <span>{eventType}</span>;
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-orange-500 text-xl">📂</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Category</div>
                <div className="text-base font-medium text-gray-800">{event.category}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-indigo-500 text-xl">🎟️</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">Ticket Type</div>
                {event.isPaid ? (
                  <span className="inline-block ml-2 bg-orange-400 text-white rounded-lg px-4 py-0.5 font-bold text-[16px] tracking-wide shadow-[0_1px_4px_#f59e4222]">Paid - ₹{event.price || '0'}</span>
                ) : (
                  <span className="inline-block ml-2 bg-green-500 text-white rounded-lg px-4 py-0.5 font-bold text-[16px] tracking-wide shadow-[0_1px_4px_#22c55e22]">Free</span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-orange-500 text-xl">👥</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Max People Can Attend</div>
                <div className="text-base font-bold text-gray-800">{event.maxAttendees}</div>
              </div>
            </div>
            {/* Available Tickets and Register Now button together */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3 shadow-sm mt-2">
              <span className="text-blue-500 text-xl">🎫</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Available Tickets</div>
                <div className="text-base font-bold text-gray-800">{availableTickets}</div>
              </div>
              <Link
                href={`/event/${event.eventId || event.id || event._id}/register`}
                className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-6 px-6 py-2 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 animate-blink text-center"
                style={{
                  animation: 'blink 1.2s linear infinite',
                  boxShadow: '0 2px 16px 0 #2563eb55',
                  letterSpacing: '0.04em',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  display: 'inline-block',
                  textAlign: 'center',
                }}
              >
                Register Now
              </Link>
            </div>
          {/* ...existing code... */}
          </div>
          {/* Register button is now beside max people can attend */}
        </div>
      </div>
      {/* Bottom: Description, Speakers, FAQs */}
      <div className="my-6">
        <div className="font-bold text-2xl text-orange-700 mb-2 tracking-wide">Description</div>
        <div
          className="prose prose-lg max-w-none bg-white/80 border border-gray-200 rounded-xl p-6 mt-2 shadow-sm description-preview text-[1.13rem] leading-[1.8] text-gray-800 min-h-[80px] tracking-[.01em] font-sans break-words whitespace-pre-line w-full overflow-auto"
          style={{
            listStyleType: 'disc',
            paddingLeft: '1.5em',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxHeight: 'none',
            maxWidth: '100%',
          }}
          dangerouslySetInnerHTML={{ __html: processDescriptionHtml(event.description) }}
        />
      </div>
      <div className="my-6">
        <div className="font-bold text-2xl text-orange-700 mb-2 tracking-wide">Speakers</div>
        {(!event.speakers || event.speakers.length === 0) ? (
          <span className="text-gray-400 ml-2">[No speakers added]</span>
        ) : (
          <div className="flex flex-col gap-6 mt-2">
            {event.speakers?.map((speaker: Speaker, idx: number) =>
              (speaker.name || speaker.bio || speaker.imagePreview) ? (
                <div key={idx} className="flex items-start gap-4 bg-white rounded-xl shadow p-4 border border-orange-100">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-orange-200">
                    {speaker.imagePreview ? (
                      <img src={speaker.imagePreview} alt={`Speaker ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : speaker.photoUrl ? (
                      <img src={`${API_URL}${speaker.photoUrl}`} alt={`Speaker ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-3xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-800 break-all whitespace-pre-wrap">{speaker.name || <span className="text-gray-400">[Name]</span>}</div>
                    <div className="text-[15px] text-gray-700 mt-1 leading-6 break-all whitespace-pre-wrap">{speaker.bio || <span className="text-gray-300">[Bio]</span>}</div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
      <div className="my-6">
        <div className="font-bold text-2xl text-orange-700 mb-2 tracking-wide">FAQs</div>
        {(!event.faqs || event.faqs.length === 0) ? (
          <span className="text-gray-400 ml-2">[No FAQs added]</span>
        ) : (
          <div className="flex flex-col gap-6 mt-2">
            {event.faqs?.map((faq: Faq, idx: number) => (
              (faq.question || faq.answer) && (
                <div key={idx} className="p-4 bg-white rounded-xl shadow text-gray-700 border border-orange-100 break-all whitespace-pre-wrap">
                  <strong className="text-orange-700">Q{idx + 1}:</strong> <span className="break-all whitespace-pre-wrap">{faq.question}</span><br />
                  <span className="ml-4 break-all whitespace-pre-wrap"><strong className="text-indigo-700">A:</strong> {faq.answer}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
      {/* Only one Vibe Video section at the top; removed duplicate at the bottom */}
    </div>
  );
}
 
export default EventLivePreview;
