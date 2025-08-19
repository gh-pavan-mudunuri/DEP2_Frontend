"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaLinkedin, FaXTwitter, FaPhone, FaStar } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useState, useEffect } from "react";
import axios from "axios";
import PopupMessage from "../common/popup-message";
import Link from "next/link";

export default function Footer() {
  const [showFaqs, setShowFaqs] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComments, setReviewComments] = useState("");
  const [popup, setPopup] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [showPricing, setShowPricing] = React.useState(false);
  const [showOrganizerFeatures, setShowOrganizerFeatures] = React.useState(false);
  const [showWhyEventSphere, setShowWhyEventSphere] = React.useState(false);
  const categories = ["Music", "Tech", "Health", "Education", "Business", "Conference", "Exhibitions", "Others"];

  const router = useRouter();

  // Fetch average rating
  useEffect(() => {
    async function fetchAvgRating() {
      try {
        const res = await axios.get("http://localhost:5274/api/WebsiteReview");
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          const total = data.reduce((sum, r) => sum + r.rating, 0);
          setAvgRating(total / data.length);
          setRatingCount(data.length);
        } else {
          setAvgRating(0);
          setRatingCount(0);
        }
      } catch {
        setAvgRating(4.2);
        setRatingCount(37);
      }
    }
    fetchAvgRating();
  }, []);

  // Get userId from localStorage
  let userId = 0;
  if (typeof window !== "undefined") {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const userObj = JSON.parse(userRaw);
        userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id || 0;
      } catch {
        userId = 0;
      }
    }
  }
  const isUserLoggedIn = !!userId && !isNaN(userId) && userId !== 0;

  async function submitRating() {
    setSubmitting(true);
    try {
      if (!isUserLoggedIn) {
        setPopup({ message: "You must be logged in to submit a review.", type: "error" });
        setSubmitting(false);
        return;
      }
      if (!userRating || userRating < 1 || userRating > 5) {
        setPopup({ message: "Please select a valid rating (1-5).", type: "error" });
        setSubmitting(false);
        return;
      }
      const payload = {
        userId,
        rating: userRating,
        title: reviewTitle || undefined,
        comments: reviewComments || undefined,
      };
      await axios.post("http://localhost:5274/api/WebsiteReview", payload);
      setUserRating(0);
      setReviewTitle("");
      setReviewComments("");
      setThankYou(true);
      setTimeout(() => setThankYou(false), 2000);
      setShowRatingModal(false);
      setPopup({ message: "Thank you for your review!", type: "success" });
    } catch {
      setPopup({ message: "Failed to submit review. Please try again.", type: "error" });
    }
    setSubmitting(false);
  }

  return (
    <>
      {/* Footer layout: three columns + categories/rating below */}
      <footer className="w-full bg-gray-800 text-gray-200 py-6 flex flex-col items-center justify-center">
        {/* Top row: Need Help, Services, Categories (three columns) */}
  <div className="w-full max-w-6xl px-2 flex flex-row items-stretch gap-2 mb-8">
          {/* Left Column: Need Help */}
          <div className="min-w-[140px] flex flex-col items-start justify-center text-left h-full">
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-yellow-800 text-center" style={{ color: "#c2a74eff" }}>Need Help</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base mb-4">
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowAbout(true)} aria-haspopup="dialog" aria-expanded={showAbout} aria-controls="footer-about-modal">About Us</button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400 text-xs sm:text-sm md:text-base text-white"
                  onClick={() => setShowContact(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showContact}
                  aria-controls="footer-contact-modal"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowFaqs(true)} aria-haspopup="dialog" aria-expanded={showFaqs} aria-controls="footer-faq-modal">FAQs</button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowTerms(true)} aria-haspopup="dialog" aria-expanded={showTerms} aria-controls="footer-terms-modal">Terms of Use</button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowPrivacy(true)} aria-haspopup="dialog" aria-expanded={showPrivacy} aria-controls="footer-privacy-modal">Privacy Policy</button>
              </li>
            </ul>
              {/* Contact Us and Follow Us side by side */}
              <div className="mt-2 w-full flex flex-row items-center justify-start gap-8">
                <div>
                  <h4 className="font-bold mb-2 text-sm sm:text-base md:text-lg" style={{ color: "#c2a74eff" }}>Contact Us</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <MdEmail className="text-red-500 bg-white rounded-md p-1 w-8 h-8" />
                    <FaPhone className="text-black bg-white rounded-full p-1 w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-sm sm:text-base md:text-lg" style={{ color: "#c2a74eff" }}>Follow Us</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <FaLinkedin className="text-blue-600 bg-white rounded-full p-1 w-8 h-8" />
                    <FaXTwitter className="text-black bg-white rounded-full p-1 w-8 h-8" />
                  </div>
                </div>
              </div>
          </div>

          {/* Center Column: Services + Follow Us + Contact Us */}
          <div className="flex-1 min-w-[160px] flex flex-col items-center justify-center text-center h-full">
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-yellow-800 text-center" style={{ color: "#c2a74eff" }}>Services</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base mb-4 w-auto text-center">
              <li>
                <button className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none" onClick={() => {
                  if (typeof window !== "undefined") {
                    const token = localStorage.getItem("token");
                    if (token) {
                      router.push("/event/create-event");
                    } else {
                      router.push("/login");
                    }
                  }
                }}>Create Event</button>
              </li>
              <li>
                <button className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none" onClick={() => router.push("/upcoming-events")}>Find Event</button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowPricing(true)} aria-haspopup="dialog" aria-expanded={showPricing} aria-controls="footer-pricing-modal">Fees & Pricings</button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowOrganizerFeatures(true)} aria-haspopup="dialog" aria-expanded={showOrganizerFeatures} aria-controls="footer-organizer-modal">Organizer Features</button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400" onClick={() => setShowWhyEventSphere(true)} aria-haspopup="dialog" aria-expanded={showWhyEventSphere} aria-controls="footer-why-modal">Why EventSphere</button>
              </li>
            </ul>
            {/* Ratings below Services */}
            <div className="flex flex-col items-center md:items-center justify-center gap-2 mt-4 md:mt-0">
              <button
                className="bg-yellow-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                onClick={() => setShowRatingModal(true)}
                aria-haspopup="dialog"
                aria-expanded={showRatingModal}
                aria-controls="footer-rating-modal"
              >
                <span className="inline-flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  Rate Us
                </span>
              </button>
              <div className="text-xs text-gray-700 font-semibold bg-yellow-100 rounded-full px-3 py-1 shadow flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span>Avg: {avgRating.toFixed(1)} / 5</span>
                <span className="text-gray-500">({ratingCount} ratings)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Categories + Ratings */}
          <div className="min-w-[140px] flex flex-col items-end justify-center h-full">
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-yellow-800 text-center" style={{ color: "#c2a74eff" }}>Categories</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/upcoming-events?category=${encodeURIComponent(cat)}`} className="hover:underline">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
            {/* ...existing code... */}
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full text-center text-gray-400 font-semibold text-xs sm:text-sm md:text-base mt-10 pb-0">
          &copy; EventSphere Online Solutions Pvt Ltd. All Rights Reserved
        </div>
      </footer>

      {/* Rating Modal Popup */}
      {showRatingModal && (
        <div
          id="footer-rating-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-sm w-full p-8 relative animate-fadeInUp flex flex-col items-center border border-yellow-200"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowRatingModal(false)}
              aria-label="Close Rating"
              autoFocus
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-yellow-700 mb-4">Share Your Experience</h3>
            <div className="flex gap-2 mb-4 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-4xl ${userRating >= star ? "text-yellow-400 drop-shadow" : "text-gray-300"} focus:outline-none transition-transform hover:scale-125`}
                  onClick={() => setUserRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  disabled={submitting}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Review title (optional)"
              className="border border-yellow-300 rounded px-3 py-2 w-full mb-2 focus:ring-2 focus:ring-yellow-400"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />
            <textarea
              placeholder="Your comments (optional)"
              className="border border-yellow-300 rounded px-3 py-2 w-full mb-2 focus:ring-2 focus:ring-yellow-400"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-50 mt-2"
              onClick={submitRating}
              disabled={userRating === 0 || submitting}
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </button>
            {thankYou && (
              <div className="text-green-600 font-semibold mt-3 animate-fadeIn">
                Thank you for your feedback!
              </div>
            )}
            <div className="text-xs text-gray-700 mt-3 font-semibold bg-yellow-100 rounded-full px-3 py-1 shadow flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              <span>Avg: {avgRating.toFixed(1)} / 5</span>
              <span className="text-gray-500">({ratingCount} ratings)</span>
            </div>
          </div>
          <style jsx>{`
            .animate-fadeIn {
              animation: fadeInBg 0.2s ease;
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.3s cubic-bezier(.39, .575, .565, 1) both;
            }
            @keyframes fadeInBg {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* About Us Modal */}
      {showAbout && (
        <div
          id="footer-about-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowAbout(false)}
              aria-label="Close About Us"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">About EventSphere</h2>
            <div className="text-gray-800 text-xs md:text-sm space-y-2">
              <p>EventSphere is a modern event management platform empowering organizers and attendees to create, discover, and experience events seamlessly.</p>
              <p>Our mission is to simplify event planning and participation with powerful tools, intuitive design, and a vibrant community. Whether you are hosting a small workshop or a large conference, EventSphere provides everything you need to succeed.</p>
              <p>Join us and be part of the next generation of event experiences!</p>
            </div>
          </div>
          <style jsx>{`
            .animate-fadeIn {
              animation: fadeInBg 0.2s ease;
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.3s cubic-bezier(.39, .575, .565, 1);
            }
            @keyframes fadeInBg {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContact && (
        <div
          id="footer-contact-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowContact(false)}
        >
          <div
            className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowContact(false)}
              aria-label="Close Contact Us"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Contact Us</h2>
            <ul className="space-y-2 text-gray-800 text-xs md:text-sm">
              <li>
                Email:{" "}
                <a href="mailto:support@eventsphere.com" className="underline hover:text-orange-400">
                  support@eventsphere.com
                </a>
              </li>
              <li>
                Phone:{" "}
                <a href="tel:+919999999999" className="underline hover:text-orange-400">
                  +91 99999 99999
                </a>
              </li>
              <li>Address: 2nd Floor, Tech Park, Hyderabad, India</li>
            </ul>
          </div>
          <style jsx>{`
            .animate-fadeIn {
              animation: fadeInBg 0.2s ease;
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.3s cubic-bezier(.39, .575, .565, 1);
            }
            @keyframes fadeInBg {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* FAQs Modal */}
      {showFaqs && (
        <div
          id="footer-faq-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowFaqs(false)}
        >
          <div
            className="bg-sky-100/90 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 m-5 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowFaqs(false)}
              aria-label="Close FAQs"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">EventSphere FAQs</h2>
            <ul className="space-y-4 text-gray-800 text-xs md:text-sm">
              <li>
                <strong>What is EventSphere?</strong>
                <br />
                EventSphere is an all-in-one platform for creating, managing, and discovering events, designed for both organizers and attendees.
              </li>
              <li>
                <strong>How do I create an event?</strong>
                <br />
                Click on &quot;Create Event&quot; in the navigation or footer, fill in your event details, and publish. You can add speakers, FAQs, recurrence, and more.
              </li>
              <li>
                <strong>Can I host both online and offline events?</strong>
                <br />
                Yes! EventSphere supports location-based, online, and hybrid events with flexible options for links, maps, and more.
              </li>
              <li>
                <strong>How do attendees register for my event?</strong>
                <br />
                Attendees can find your event via search or category, view details, and register directly on the event page.
              </li>
              <li>
                <strong>What features are available for organizers?</strong>
                <br />
                Organizers can manage registrations, add speakers, set up recurring events, upload banners and videos, and customize event FAQs.
              </li>
              <li>
                <strong>Is there a fee for using EventSphere?</strong>
                <br />
                Creating free events is always free. For paid events, a small service fee may apply. See &quot;Fees & Pricings&quot; for details.
              </li>
              <li>
                <strong>How do I contact support?</strong>
                <br />
                Use the &quot;Contact Us&quot; section in the footer or email us at support@eventsphere.com.
              </li>
            </ul>
          </div>
          <style jsx>{`
            .animate-fadeIn {
              animation: fadeInBg 0.2s ease;
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.3s cubic-bezier(.39, .575, .565, 1) both;
            }
            @keyframes fadeInBg {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Popup message for feedback */}
      {popup && (
        <PopupMessage message={popup.message} type={popup.type} onClose={() => setPopup(null)} />
      )}
    </>
  );
}
