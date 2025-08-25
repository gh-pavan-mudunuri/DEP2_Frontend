"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaLinkedin, FaXTwitter, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import Link from "next/link";

export default function Footer() {
  const [showFaqs, setShowFaqs] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showPricing, setShowPricing] = React.useState(false);
  const [showOrganizerFeatures, setShowOrganizerFeatures] = React.useState(false);
  const [showWhyEventSphere, setShowWhyEventSphere] = React.useState(false);
  const categories = ["Music", "Tech", "Health", "Education", "Business", "Conference", "Exhibitions", "Others"];

  const router = useRouter();

  return (
    <>
      <footer className="w-full bg-gray-800 text-gray-200 py-6 flex flex-col items-center justify-center">
        <div className="flex justify-between w-full max-w-6xl px-4 mx-auto pt-10 space-y-8 md:space-y-0 md:space-x-8">
          {/* Need Help */}
          <div>
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-4 text-yellow-800" style={{ color: '#c2a74eff' }}>Need Help</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base">
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowAbout(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showAbout}
                  aria-controls="footer-about-modal"
                >
                  About Us
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowContact(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showContact}
                  aria-controls="footer-contact-modal"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowFaqs(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showFaqs}
                  aria-controls="footer-faq-modal"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowTerms(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showTerms}
                  aria-controls="footer-terms-modal"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowPrivacy(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showPrivacy}
                  aria-controls="footer-privacy-modal"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-4 text-yellow-800" style={{ color: '#c2a74eff' }}>Services</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base">
              <li>
                <button className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const token = localStorage.getItem('token');
                      if (token) {
                        router.push('/event/create-event');
                      } else {
                        router.push('/login');
                      }
                    }
                  }}>
                  Create Event
                </button>
              </li>
              <li>
                <button className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none"
                  onClick={() => router.push('/upcoming-events')}>
                  Find Event
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowPricing(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showPricing}
                  aria-controls="footer-pricing-modal"
                >
                  Fees & Pricings
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowOrganizerFeatures(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showOrganizerFeatures}
                  aria-controls="footer-organizer-modal"
                >
                  Organizer Features
                </button>
              </li>
              <li>
                <button type="button" className="hover:underline text-left w-full bg-transparent border-none p-0 m-0 text-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onClick={() => setShowWhyEventSphere(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showWhyEventSphere}
                  aria-controls="footer-why-modal"
                >
                  Why EventSphere
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-4 text-yellow-800" style={{ color: '#c2a74eff' }}>Categories</h3>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base">
              {categories.map(cat => (
                <li key={cat}>
                  <Link href={`/upcoming-events?category=${encodeURIComponent(cat)}`} className="hover:underline">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & Contact */}
        <div className="flex justify-center items-center gap-20 lg:gap-35 xl:gap-65 mt-8 w-full">
          {/* Social Media */}
          <div>
            <h4 className="font-bold mb-2 text-center sm:text-left text-sm sm:text-base md:text-lg" style={{ color: '#c2a74eff' }}>Follow Us</h4>
            <div className="flex justify-center sm:justify-start items-center space-x-4 mt-4">
              <FaLinkedin className="text-blue-600 bg-white rounded-full p-1 w-8 h-8" />
              <FaXTwitter className="text-black bg-white rounded-full p-1 w-8 h-8" />
            </div>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-2 text-center sm:text-left text-sm sm:text-base md:text-lg" style={{ color: '#c2a74eff' }}>Contact Us</h4>
            <div className="flex justify-center sm:justify-start items-center space-x-4 mt-4">
              <MdEmail className="text-red-500 bg-white rounded-md p-1 w-8 h-8" />
              <FaPhone className="text-black bg-white rounded-full p-1 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full text-center text-gray-400 font-semibold text-xs sm:text-sm md:text-base mt-10 pb-0">
          &copy; EventSphere Online Solutions Pvt Ltd. All Rights Reserved
        </div>
      </footer>

      {/* About Us Modal */}
      {showAbout && (
        <div
          id="footer-about-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowAbout(false)}
        >
          <div className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowAbout(false)}
              aria-label="Close About Us"
              autoFocus>
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
            .animate-fadeIn { animation: fadeInBg 0.2s ease; }
            .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
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
          <div className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowContact(false)}
              aria-label="Close Contact Us"
              autoFocus>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Contact Us</h2>
            <ul className="space-y-2 text-gray-800 text-xs md:text-sm">
              <li>Email: <a href="mailto:support@eventsphere.com" className="underline hover:text-orange-400">support@eventsphere.com</a></li>
              <li>Phone: <a href="tel:+919999999999" className="underline hover:text-orange-400">+91 99999 99999</a></li>
              <li>Address: 2nd Floor, Tech Park, Hyderabad, India</li>
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

      {/* FAQs Modal */}
      {showFaqs && (
        <div
          id="footer-faq-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowFaqs(false)}
        >
          <div className="bg-sky-100/90 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 m-5 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowFaqs(false)}
              aria-label="Close FAQs"
              autoFocus>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">EventSphere FAQs</h2>
            <ul className="space-y-4 text-gray-800 text-xs md:text-sm">
              <li>
                <strong>What is EventSphere?</strong><br />
                EventSphere is an all-in-one platform for creating, managing, and discovering events, designed for both organizers and attendees.
              </li>
              <li>
                <strong>How do I create an event?</strong><br />
                Click on "Create Event" in the navigation or footer, fill in your event details, and publish. You can add speakers, FAQs, recurrence, and more.
              </li>
              <li>
                <strong>Can I host both online and offline events?</strong><br />
                Yes! EventSphere supports location-based, online, and hybrid events with flexible options for links, maps, and more.
              </li>
              <li>
                <strong>How do attendees register for my event?</strong><br />
                Attendees can find your event via search or category, view details, and register directly on the event page.
              </li>
              <li>
                <strong>What features are available for organizers?</strong><br />
                Organizers can manage registrations, add speakers, set up recurring events, upload banners and videos, and customize event FAQs.
              </li>
              <li>
                <strong>Is there a fee for using EventSphere?</strong><br />
                Creating free events is always free. For paid events, a small service fee may apply. See "Fees & Pricings" for details.
              </li>
              <li>
                <strong>How do I contact support?</strong><br />
                Use the "Contact Us" section in the footer or email us at support@eventsphere.com.
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
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowTerms(false)}
              aria-label="Close Terms of Use"
              autoFocus>
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
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowPrivacy(false)}
              aria-label="Close Privacy Policy"
              autoFocus>
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

      {/* Organizer Features Modal */}
      {showOrganizerFeatures && (
        <div
          id="footer-organizer-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowOrganizerFeatures(false)}
        >
          <div className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowOrganizerFeatures(false)}
              aria-label="Close Organizer Features"
              autoFocus>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-violet-700">Organizer Features</h2>
            <ul className="text-gray-800 text-xs md:text-sm space-y-3 list-disc list-inside">
              <li><strong>Event Management:</strong> Easily create, update, and manage events with customizable options.</li>
              <li><strong>Payment Tracking:</strong> Monitor ticket sales, revenue, and transactions in real time.</li>
              <li><strong>Reminders & Notifications:</strong> Automatically send reminders to attendees and get organizer alerts.</li>
              <li><strong>Organized Dashboard View:</strong> Get a structured overview of your events and performance.</li>
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
          <div className="bg-sky-100/90 m-6 backdrop-blur-lg rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInUp"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowWhyEventSphere(false)}
              aria-label="Close Why EventSphere"
              autoFocus>
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
    </>
  );
}