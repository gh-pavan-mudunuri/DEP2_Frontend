import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dep2-backend.onrender.com";

type Speaker = { name: string; imagePreview: string; bio: string; photoUrl?: string };
type Faq = { question: string; answer: string };

type EventLivePreviewProps = {
  showRibbons: boolean;
  coverPreview: string;
  eventData: {
    title: string;
    organizer: string;
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
    coverImageUrl: string;
    vibeVideoPreview: string;
    speakers: Speaker[];
    faqs: Faq[];
    // Added these to support the updated button logic
    eventId?: string;
    id?: string;
    _id?: string;
  };
};

const DisplayEvent: React.FC<EventLivePreviewProps> = ({
  showRibbons,
  coverPreview,
  eventData,
}) => {
  return (
    <div
      className="relative bg-gradient-to-br from-orange-50 via-white to-yellow-100 rounded-2xl shadow-xl p-3 sm:p-6 md:p-10 flex-1 min-w-0 w-full max-w-full md:min-w-[320px] md:max-w-[600px] m-auto ring-2 md:ring-4 ring-orange-200/40 drop-shadow-[0_0_24px_rgba(251,146,60,0.25)] font-sans text-sm md:text-base tracking-[.01em] leading-[1.7]"
      style={{
        minHeight: "900px",
        height: "1000px",
        marginTop: 0,
        marginBottom: 0,
      }}
    >
      {/* Ribbons Animation Overlay */}
      {showRibbons && (
        <>
          <div className="pointer-events-none absolute inset-0 z-50 overflow-visible">
            {/* Ribbons */}
            {Array.from({ length: 18 }).map((_, i) => {
              const left =
                i < 9
                  ? `${5 + i * 8 + Math.random() * 2}%`
                  : `${55 + (i - 9) * 8 + Math.random() * 2}%`;
              const colors = [
                "bg-red-400",
                "bg-yellow-400",
                "bg-green-400",
                "bg-blue-400",
                "bg-pink-400",
                "bg-purple-400",
                "bg-orange-400",
                "bg-teal-400",
                "bg-indigo-400",
              ];
              const color = colors[i % colors.length];
              const delay = (Math.random() * 0.7).toFixed(2);
              const duration = (2.2 + Math.random() * 0.8).toFixed(2);
              const rotate = (Math.random() * 60 - 30).toFixed(0);
              const width = 6 + Math.random() * 6;
              const height = 36 + Math.random() * 24;
              return (
                <div
                  key={`ribbon-${i}`}
                  className={`absolute bottom-0 ${color}`}
                  style={{
                    left,
                    width: `${width}px`,
                    height: `${height}px`,
                    borderRadius: "8px",
                    opacity: 0.85,
                    transform: `rotate(${rotate}deg)`,
                    animation: `ribbon-shoot ${duration}s cubic-bezier(.22,1.2,.36,1) ${delay}s both`,
                    zIndex: 100,
                    boxShadow: "0 2px 8px #0002",
                  }}
                />
              );
            })}
            {/* Stars */}
            {Array.from({ length: 14 }).map((_, i) => {
              const left = `${Math.random() * 95}%`;
              const delay = (Math.random() * 0.7).toFixed(2);
              const duration = (1.7 + Math.random() * 1.2).toFixed(2);
              const size = 18 + Math.random() * 12;
              const color = [
                "#fbbf24",
                "#f87171",
                "#60a5fa",
                "#a78bfa",
                "#f472b6",
                "#34d399",
                "#facc15",
                "#f472b6",
                "#818cf8",
                "#f59e42",
                "#fcd34d",
                "#f9fafb",
                "#fef08a",
                "#fca5a5",
              ][i % 14];
              return (
                <svg
                  key={`star-${i}`}
                  className="absolute bottom-0"
                  style={{
                    left,
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity: 0.92,
                    zIndex: 101,
                    filter: "drop-shadow(0 2px 8px #0002)",
                    animation: `star-shoot ${duration}s cubic-bezier(.22,1.2,.36,1) ${delay}s both`,
                  }}
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="16,2 20,12 31,12 22,18 25,29 16,23 7,29 10,18 1,12 12,12"
                    fill={color}
                    stroke="#eab308"
                    strokeWidth="1.5"
                  />
                </svg>
              );
            })}
          </div>
          {/* Keyframes for ribbons and stars */}
          <style>{`
                @keyframes ribbon-shoot {
                  0% {
                    opacity: 0.7;
                    transform: translateY(0) scaleY(1) rotate(var(--ribbon-rotate, 0deg));
                  }
                  10% {
                    opacity: 1;
                    transform: translateY(-60px) scaleY(1.1) rotate(var(--ribbon-rotate, 0deg));
                  }
                  40% {
                    opacity: 1;
                    transform: translateY(-220px) scaleY(1.1) rotate(var(--ribbon-rotate, 0deg));
                  }
                  70% {
                    opacity: 0.95;
                    transform: translateY(-120px) scaleY(0.95) rotate(var(--ribbon-rotate, 0deg));
                  }
                  100% {
                    opacity: 0;
                    transform: translateY(40px) scaleY(0.7) rotate(var(--ribbon-rotate, 0deg));
                  }
                }
                @keyframes star-shoot {
                  0% {
                    opacity: 0.7;
                    transform: translateY(0) scale(1) rotate(0deg);
                  }
                  10% {
                    opacity: 1;
                    transform: translateY(-60px) scale(1.1) rotate(10deg);
                  }
                  40% {
                    opacity: 1;
                    transform: translateY(-240px) scale(1.1) rotate(-10deg);
                  }
                  70% {
                    opacity: 0.95;
                    transform: translateY(-120px) scale(0.95) rotate(0deg);
                  }
                  100% {
                    opacity: 0;
                    transform: translateY(40px) scale(0.7) rotate(0deg);
                  }
                }
              `}</style>
        </>
      )}
      <div className="relative flex justify-center items-center h-[40px] md:h-[70px] w-full bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: 'url("/images/ribbon.png")', backgroundSize: '80% 60px, 80% 70px' }}>
        <span className="text-white font-bold text-base md:text-xl tracking-wide drop-shadow-lg uppercase italic">
          📌 Live Preview
        </span>
      </div>
      <div className="space-y-2 text-sm md:text-base">
        <div>
          <span className="font-semibold text-gray-700">Title:</span>{" "}
          <span className="text-gray-900">
            {eventData.title || <span className="text-gray-400">[Event Title]</span>}
          </span>
        </div>
        {/* Banner Image Label above Preview */}
        <div className="text-lg text-orange-700 font-bold mt-6 mb-1 tracking-wide">
          Event Cover Image
        </div>
        <div className="relative h-32 md:h-40 w-full mb-3 md:mb-4 rounded-lg overflow-hidden flex items-center justify-center">
          {coverPreview || eventData.coverImageUrl ? (
            <img
              src={
                coverPreview ||
                (eventData.coverImageUrl
                  ? `${API_URL}${eventData.coverImageUrl}`
                  : undefined)
              }
              alt="Event Banner Preview"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 italic">No banner uploaded yet</span>
          )}
        </div>
        {/* Vibe Video Label and Preview below Banner */}
        {eventData.vibeVideoPreview && (
          <div className="my-3">
            <div className="text-lg text-orange-700 font-bold mb-1 tracking-wide italic">
              Vibe Video
            </div>
            <video
              src={
                eventData.vibeVideoPreview.startsWith("blob:")
                  ? eventData.vibeVideoPreview
                  : `${API_URL}${eventData.vibeVideoPreview}`
              }
              controls
              className="w-full max-h-[180px] rounded-lg bg-black border border-orange-200 shadow"
            />
          </div>
        )}
        <div>
          <span className="font-semibold text-gray-700">Organizer:</span>{" "}
          <span className="text-gray-900">
            {eventData.organizer || <span className="text-gray-400">[Organizer]</span>}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Organizer Email:</span>{" "}
          <span className="text-gray-900">
            {eventData.organizerEmail || (
              <span className="text-gray-400">[Organizer Email]</span>
            )}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Event Start:</span>{" "}
          <span className="text-gray-900">
            {eventData.eventStart || <span className="text-gray-400">[Start Date & Time]</span>}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Event End:</span>{" "}
          <span className="text-gray-900">
            {eventData.eventEnd || <span className="text-gray-400">[End Date & Time]</span>}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Registration Deadline:</span>{" "}
          <span className="text-gray-900">
            {eventData.registrationDeadline || (
              <span className="text-gray-400">[Registration Deadline]</span>
            )}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Recurrence Type:</span>{" "}
          <span className="text-gray-900">
            {eventData.recurrenceType || (
              <span className="text-gray-400">[Recurrence Type]</span>
            )}
          </span>
        </div>
        {eventData.type === "Location Based" && (
          <div>
            <span className="font-semibold text-gray-700">Location:</span>{" "}
            <span className="text-gray-900">
              {eventData.location || <span className="text-gray-400">[Location]</span>}
            </span>
          </div>
        )}
        {eventData.type === "Online" && (
          <div>
            <span className="font-semibold text-gray-700">Event Link:</span>
            {eventData.eventLink ? (
              <a
                href={eventData.eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline ml-2"
              >
                {eventData.eventLink}
              </a>
            ) : (
              <span className="text-gray-400 ml-2">[Event Link]</span>
            )}
          </div>
        )}
        <div>
          <span className="font-semibold text-gray-700">Type:</span>{" "}
          <span className="text-gray-900">{eventData.type}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Category:</span>{" "}
          <span className="text-gray-900">{eventData.category}</span>
        </div>
        <div className="mt-2 mb-4">
          <span className="font-semibold text-gray-700">Ticket Type:</span>
          {eventData.isPaid ? (
            <span className="inline-block ml-2 bg-orange-400 text-white rounded-lg px-4 py-0.5 font-bold text-[16px] tracking-wide shadow-[0_1px_4px_#f59e4222]">
              Paid - ₹{eventData.price || "0"}
            </span>
          ) : (
            <span className="inline-block ml-2 bg-green-500 text-white rounded-lg px-4 py-0.5 font-bold text-[16px] tracking-wide shadow-[0_1px_4px_#22c55e22]">
              Free
            </span>
          )}
          <span className="ml-4 font-semibold text-gray-700">
            Available Tickets:
          </span>{" "}
          <span className="text-gray-900">
            {/* Assuming tickets = maxAttendees for now, you can update this logic if you have a separate tickets field */}
            {eventData.maxAttendees ? eventData.maxAttendees : <span className="text-gray-400">[Not set]</span>}
          </span>
          <button
            className="py-2 px-8 rounded-xl shadow-md font-bold tracking-wide text-[#ffd700] bg-[#0a174e] border-2 border-[#ffd700] hover:bg-[#142a5c] hover:text-[#ffd700] hover:border-[#ffd700] hover:underline focus:outline-none focus:ring-4 focus:ring-[#0a174e] text-lg text-center transition-all duration-200 cursor-pointer select-none"
            onClick={() => window.location.href = `/event/${eventData.eventId || eventData.id || eventData._id}/register`}
            aria-label="Register for event"
          >
            Register Now
          </button>
        </div>
        <div className="my-6">
          <div className="font-bold text-lg text-orange-700 mb-2 tracking-wide">
            Description
          </div>
          <div
            className="prose prose-lg max-w-none bg-white/80 border border-gray-200 rounded-lg p-4 mt-2 shadow-sm description-preview text-[1.13rem] leading-[1.8] text-gray-800 min-h-[80px] tracking-[.01em] font-sans"
            style={{ listStyleType: "disc", paddingLeft: "1.5em" }}
            dangerouslySetInnerHTML={{
              __html:
                eventData.description ||
                '<span style="color:#bbb">[Description]</span>',
            }}
          />
        </div>
        <div className="my-6">
          <div className="font-bold text-lg text-orange-700 mb-2 tracking-wide">
            Speakers
          </div>
          {eventData.speakers.length === 0 ||
          eventData.speakers.every(
            (s) => !s.name && !s.bio && !s.imagePreview
          ) ? (
            <span className="text-gray-400 ml-2">[No speakers added]</span>
          ) : (
            <div className="mt-2 space-y-3">
              {eventData.speakers.map(
                (speaker, idx) =>
                  (speaker.name || speaker.bio || speaker.imagePreview) && (
                    <div
                      key={idx}
                      className="flex items-start gap-4 mb-2 bg-white rounded-lg shadow p-3 border border-orange-100"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {speaker.imagePreview ? (
                          <img
                            src={speaker.imagePreview}
                            alt={`Speaker ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : speaker.photoUrl ? (
                          <img
                            src={`${API_URL}${speaker.photoUrl}`}
                            alt={`Speaker ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-2xl">👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[16px] text-gray-800">
                          {speaker.name || (
                            <span className="text-gray-400">[Name]</span>
                          )}
                        </div>
                        <div className="text-[14px] text-gray-700 mt-1 leading-6">
                          {speaker.bio || (
                            <span className="text-gray-300">[Bio]</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
        {/* FAQs Preview in Live Preview */}
        <div className="my-6">
          <div className="font-bold text-lg text-orange-700 mb-2 tracking-wide">
            FAQs
          </div>
          {eventData.faqs.length === 0 ||
          eventData.faqs.every((f) => !f.question && !f.answer) ? (
            <span className="text-gray-400 ml-2">[No FAQs added]</span>
          ) : (
            <div className="mt-2 space-y-3">
              {eventData.faqs.map(
                (faq, idx) =>
                  (faq.question || faq.answer) && (
                    <div
                      key={idx}
                      className="mb-2 bg-white rounded-lg shadow p-3 border border-orange-100"
                    >
                      <div className="font-semibold text-[15px] text-blue-700">
                        Q{idx + 1}:{" "}
                        {faq.question || (
                          <span className="text-gray-400">[Question]</span>
                        )}
                      </div>
                      <div className="text-[14px] text-gray-700 mt-1 pl-2 leading-6">
                        A:{" "}
                        {faq.answer || (
                          <span className="text-gray-300">[Answer]</span>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
        {/* Vibe Video Preview (from backend after creation) */}
        {eventData.vibeVideoPreview && (
          <div className="my-6">
            <div className="font-bold text-lg text-orange-700 mb-2 tracking-wide">
              Vibe Video
            </div>
            <video
              src={
                eventData.vibeVideoPreview.startsWith("blob:")
                  ? eventData.vibeVideoPreview
                  : `${API_URL}${eventData.vibeVideoPreview}`
              }
              controls
              className="w-full max-w-[400px] mt-2 rounded-lg border border-orange-200 shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayEvent;