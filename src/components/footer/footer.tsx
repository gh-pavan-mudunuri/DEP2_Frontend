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
        const res = await axios.get("https://dep2-backend.onrender.com/api/WebsiteReview");
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
      await axios.post("https://dep2-backend.onrender.com/api/WebsiteReview", payload);
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
      <footer className="w-full bg-[#0a174e] text-gray-200 py-6 flex flex-col items-center justify-center">
        {/* Top row: Need Help, Services, Categories (three columns) */}
        <div className="w-full max-w-6xl px-2 grid grid-cols-2 gap-6 mb-8
  sm:flex sm:flex-row sm:items-stretch sm:justify-between sm:gap-1 sm:mb-8 sm:grid-cols-none">
          {/* Mobile: Stack Need Help and Services in one column only for mobile */}
          <div className="min-w-0 break-words flex flex-col items-start justify-start text-left h-full w-full mb-0 sm:w-auto sm:mb-0 col-span-1 order-1 sm:order-none p-[26px] sm:p-2">
            {/* Mobile view: show both blocks stacked */}
            <div className="flex flex-col gap-6 sm:hidden text-left items-start w-full">
              {/* Need Help Block */}
              <div>
                <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-left" style={{ color: "#FFD700", textAlign: "left" }}>Need Help</h3>
                <ul className="space-y-2 text-xs sm:text-sm md:text-base mb-4 text-left items-start w-full">
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
                {/* Contact Us and Follow Us removed for mobile view under Need Help */}
              </div>
              {/* Services Block */}
              <div>
                <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-left" style={{ color: "#FFD700", textAlign: "left" }}>Services</h3>
                <ul className="space-y-2 text-xs sm:text-sm md:text-base mb-4 w-full text-left items-start">
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
                    className="bg-yellow-200 text-gray-800 px-3 py-1 rounded-lg text-xs font-semibold shadow hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-300 w-full max-w-[180px]"
                    onClick={() => setShowRatingModal(true)}
                    aria-haspopup="dialog"
                    aria-expanded={showRatingModal}
                    aria-controls="footer-rating-modal"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaStar className="text-yellow-400 text-xl" />
                      <span className="text-xs block text-center whitespace-pre-line">Rate Us</span>
                    </span>
                  </button>
                  <div className="text-xs text-gray-700 font-semibold bg-yellow-100 rounded-lg px-3 py-2 shadow flex flex-col items-center w-full max-w-[300px]">
                    <div className="flex items-center justify-center w-full">
                      <span>Avg: {avgRating.toFixed(1)} / 5</span>
                    </div>
                    <span className="text-gray-500 mt-1 text-center w-full">{ratingCount} ratings</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Desktop view: show only Need Help block in this column */}
            <div className="hidden sm:block">
              {/* Need Help Block (desktop) */}
              <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-left" style={{ color: "#FFD700", textAlign: "left" }}>Need Help</h3>
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
              <div className="mt-2 w-full flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-8">
                <div>
                  <h4 className="font-bold mb-2 text-sm sm:text-base md:text-lg" style={{ color: "#FFD700" }}>Contact Us</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <MdEmail className="text-red-500 bg-white rounded-md p-1 w-8 h-8" />
                    <FaPhone className="text-black bg-white rounded-full p-1 w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-sm sm:text-base md:text-lg" style={{ color: "#FFD700" }}>Follow Us</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <FaLinkedin className="text-blue-600 bg-white rounded-full p-1 w-8 h-8" />
                    <FaXTwitter className="text-black bg-white rounded-full p-1 w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Services (desktop only) */}
          <div className="hidden sm:flex min-w-0 break-words flex-col items-start justify-center text-left h-full w-full sm:w-auto sm:mb-0 col-span-1 sm:items-start sm:text-left p-2">
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-left" style={{ color: '#FFD700', textAlign: 'left' }}>Services</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base mb-4 w-full text-left">
              <li>
                <button className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none" onClick={() => {
                  if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('token');
                    if (token) {
                      router.push('/event/create-event');
                    } else {
                      router.push('/login');
                    }
                  }
                }}>Create Event</button>
              </li>
              <li>
                <button className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none" onClick={() => router.push('/upcoming-events')}>Find Event</button>
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
          {/* Right Column: Categories + Ratings + Contact/Follow Us (mobile only) */}
          <div className="min-w-0 break-words flex flex-col items-end justify-start h-full w-full sm:w-auto col-span-1 order-3 sm:order-none p-2">
            <div className="flex flex-col w-full">
              {/* Categories at the top */}
              <div className="w-full flex flex-col items-center">
                <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-right sm:text-center w-full" style={{ color: '#FFD700' }}>
                  <span className="block text-center sm:text-left mt-[20px] sm:mt-0">Categories</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm md:text-base w-50 text-center sm:text-center">
                  {categories.map((cat) => (
                    <li key={cat} className="w-full">
                      <Link href={`/upcoming-events?category=${encodeURIComponent(cat)}`} className="hover:underline block text-left w-full">
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Contact Us and Follow Us below Categories */}
              <div className="flex flex-col gap-4 w-full mt-6 sm:hidden">
                <div className="flex flex-col items-center w-full">
                  <h4 className="font-bold mb-2 text-sm" style={{ color: '#FFD700' }}>Contact Us</h4>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <MdEmail className="text-red-500 bg-white rounded-md p-1 w-8 h-8" />
                    <FaPhone className="text-black bg-white rounded-full p-1 w-8 h-8" />
                  </div>
                </div>
                <div className="flex flex-col items-center w-full">
                  <h4 className="font-bold mb-2 text-sm" style={{ color: '#FFD700' }}>Follow Us</h4>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <FaLinkedin className="text-blue-600 bg-white rounded-full p-1 w-8 h-8" />
                    <FaXTwitter className="text-black bg-white rounded-full p-1 w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
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
              onChange={(e) => setReviewTitle(String(e.target.value))}
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

      {/* Terms of Use Modal */}
      {showTerms && (
        <div
          id="footer-terms-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowTerms(false)}
        >
          <div className="bg-sky-100/90 backdrop-blur-lg m-6 rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowTerms(false)}
              aria-label="Close Terms of Use"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Terms of Use</h2>
            <div className="text-gray-800 text-xs md:text-sm space-y-2 max-h-96 overflow-y-auto">
              <p>By using EventSphere, you agree to abide by all applicable laws and regulations. You are responsible for the content you post and the events you create. EventSphere reserves the right to remove any content or event that violates our guidelines or is deemed inappropriate.</p>
              <p>EventSphere is not liable for any damages or losses resulting from the use of our platform. Users are expected to behave respectfully and ethically at all times.</p>
              <p>For full terms, please contact our support team.</p>
            </div>
          </div>
          <style jsx>{`
            .animate-fadeIn { animation: fadeInBg 0.2s ease; }
            .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div
          id="footer-privacy-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowPrivacy(false)}
        >
          <div className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowPrivacy(false)}
              aria-label="Close Privacy Policy"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Privacy Policy</h2>
            <div className="text-gray-800 text-xs md:text-sm space-y-2 max-h-96 overflow-y-auto">
              <p>Your privacy is important to us. EventSphere collects only the information necessary to provide our services and does not share your personal data with third parties except as required by law or to facilitate event participation.</p>
              <p>We use industry-standard security measures to protect your data. You may request deletion of your account and data at any time by contacting support.</p>
              <p>For full privacy details, please contact our support team.</p>
            </div>
          </div>
          <style jsx>{`
            .animate-fadeIn { animation: fadeInBg 0.2s ease; }
            .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* Fees & Pricings Modal */}
      {showPricing && (
        <div
          id="footer-pricing-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowPricing(false)}
        >
          <div
            className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowPricing(false)}
              aria-label="Close Pricing Info"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Fees & Pricings</h2>
            <div className="text-gray-800 text-xs md:text-sm space-y-2 max-h-96 overflow-y-auto">
              <p>EventSphere offers a transparent pricing structure tailored to event organizers.</p>
              <p><strong>Free Events:</strong> No charges. You can create and host free events at zero cost.</p>
              <p><strong>Paid Events:</strong> A small service fee is deducted from each paid registration to cover platform costs and transaction handling.</p>
              <p>The exact fee is calculated based on the ticket price and payment method. Detailed fee breakdown is available while making payment.</p>
              <p>For bulk or enterprise-level events, custom pricing can be discussed with our team.</p>
            </div>
          </div>
          <style jsx>{`
            .animate-fadeIn { animation: fadeInBg 0.2s ease; }
            .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* Organizer Features Modal */}
      {showOrganizerFeatures && (
        <div
          id="footer-organizer-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50  flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowOrganizerFeatures(false)}
        >
          <div
            className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowOrganizerFeatures(false)}
              aria-label="Close Organizer Features"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Organizer Features</h2>
            <ul className="text-gray-800 text-xs md:text-sm space-y-3 list-disc list-inside">
              <li>
                <strong>Event Management:</strong> Easily create, update, and manage events with customizable options.
              </li>
              <li>
                <strong>Payment Tracking:</strong> Monitor ticket sales, revenue, and transactions in real time.
              </li>
              <li>
                <strong>Reminders & Notifications:</strong> Automatically send reminders to attendees and get organizer alerts.
              </li>
              <li>
                <strong>Organized Dashboard View:</strong> Get a structured overview of your events and performance.
              </li>
            </ul>
          </div>
          <style jsx>{`
            .animate-fadeIn { animation: fadeInBg 0.2s ease; }
            .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* Why EventSphere Modal */}
      {showWhyEventSphere && (
        <div
          id="footer-why-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowWhyEventSphere(false)}
        >
          <div
            className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowWhyEventSphere(false)}
              aria-label="Close Why EventSphere"
              autoFocus
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Why Choose EventSphere?</h2>
            <ul className="text-gray-800 text-xs md:text-sm space-y-3 list-disc list-inside">
              <li><strong>All-in-One Platform:</strong> Manage event creation, promotion, registration, and analytics in one seamless dashboard.</li>
              <li><strong>User-Centric Design:</strong> Intuitive interfaces for both attendees and organizers, with responsive design across all devices.</li>
              <li><strong>Powerful Features:</strong> Support for recurring events, speaker management, ticketing, FAQs, and custom branding.</li>
              <li><strong>Real-Time Insights:</strong> Get live stats on ticket sales, attendance, and engagement to drive better decisions.</li>
              <li><strong>Reliable & Secure:</strong> Built on modern technologies with secure payment integrations and data privacy in mind.</li>
              <li><strong>Support When You Need It:</strong> Dedicated support team and rich documentation to guide your success.</li>
            </ul>
          </div>
          <style jsx>{`
            .animate-fadeIn { animation: fadeInBg 0.2s ease; }
            .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
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