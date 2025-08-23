"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Imported next/image

export default function PaymentSuccess() {
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Get registrationId from localStorage (set after registration)
    const registrationId = localStorage.getItem("lastRegistrationId");
    if (registrationId) {
      // Kept your original fetch logic and endpoint
      fetch(`https://dep2-backend.onrender.com/api/Registrations/${registrationId}`)
        .then(res => res.json())
        .then(data => {
          setQrCode(data.qrCode || null);
          setLoading(false);
        })
        .catch(() => {
          setError("Could not fetch registration details.");
          setLoading(false);
        });
    } else {
      setError("Registration ID not found.");
      setLoading(false);
    }
  }, []);

  return (
    // Applied new background gradient
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50">
      {/* Applied new card styling, border, and box-shadow */}
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center max-w-md w-full border border-yellow-200" style={{ boxShadow: '0 0 24px 4px #fff8dc, 0 0 32px 8px #ffd700' }}>
        <div className="flex flex-col items-center mb-6">
          {/* Replaced checkmark span with the success GIF Image component */}
          <Image
            src="/images/success.gif" // Assuming images folder is in your public directory
            alt="Success"
            width={200}
            height={200}
            className="mb-2"
            unoptimized
          />
          {/* Applied new h1 styling with textShadow */}
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{
              color: '#0a174e',
              textShadow: '0 0 16px #ffd700, 0 0 8px #fff8dc'
            }}
          >
            Payment Successful!
          </h1>
          <p className="text-lg text-green-600 mb-4 text-center">Thank you for your payment.<br />Your registration is confirmed.</p>
          {loading && <p className="text-gray-500">Loading QR code...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {qrCode && (
            // Updated QR Code to use next/image component for optimization
            <div className="mt-4 border rounded overflow-hidden" style={{ width: 200, height: 200 }}>
                <Image
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR Code"
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                    unoptimized
                />
            </div>
          )}
        </div>
        {/* Added new container for buttons and the "Go to Tickets" link */}
        <div className="flex flex-row gap-4 w-full justify-center mt-2">
            <Link
                href="/"
                className="px-6 py-3 bg-[#0a174e] text-white rounded-lg font-semibold shadow transition-all duration-200 text-center hover:-translate-y-1 hover:bg-[#233a7c]"
                style={{ display: 'inline-block' }}
            >
                Go to Home
            </Link>
            <Link href="/dashboard/tickets" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-600 transition-colors duration-200 text-center">
                Go to Tickets
            </Link>
        </div>
      </div>
    </div>
  );
}