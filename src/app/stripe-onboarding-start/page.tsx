"use client";
import React, { useState } from "react";

export default function StripeOnboardingStart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Replace with actual userId and email from your auth/user context
  const userId = 1; // Example only
  const email = "user@example.com";

  const handleStartOnboarding = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://dep2-backend.onrender.com/api/users/${userId}/stripe-express-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // Encapsulate email in an object
      });
      const data = await res.json();
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        setError("Could not get Stripe onboarding link.");
      }
    } catch (err) {
      setError("Error starting Stripe onboarding.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-blue-200">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Start Stripe Onboarding</h1>
        <p className="text-lg text-gray-700 mb-6">To receive payments, you need to complete your Stripe Express account setup.</p>
        <button
          onClick={handleStartOnboarding}
          disabled={loading}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition mb-4"
        >
          {loading ? "Redirecting..." : "Start Stripe Onboarding"}
        </button>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <a href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Back to Dashboard</a>
      </div>
    </div>
  );
}