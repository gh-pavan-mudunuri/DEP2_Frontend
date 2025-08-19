
"use client";

import React from 'react';

export default function PaymentSuccess() {
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Get registrationId from localStorage (set after registration)
    const registrationId = localStorage.getItem("lastRegistrationId");
    if (registrationId) {
      fetch(`http://localhost:5274/api/Registrations/${registrationId}`)
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center max-w-md w-full border border-green-100">
        <div className="flex flex-col items-center mb-6">
          <span className="text-6xl mb-2 animate-bounce">✅</span>
          <h1 className="text-3xl font-extrabold text-green-700 mb-2 drop-shadow">Payment Successful!</h1>
          <p className="text-lg text-green-600 mb-4 text-center">Thank you for your payment.<br />Your registration is confirmed.</p>
          {loading && <p className="text-gray-500">Loading QR code...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {qrCode && (
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code"
              className="mt-4 border rounded"
              style={{ width: 200, height: 200 }}
            />
          )}
        </div>
        <a href="/" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-semibold shadow hover:from-green-700 hover:to-emerald-600 transition-colors duration-200">Go to Home</a>
      </div>

    </div>
  );
}
