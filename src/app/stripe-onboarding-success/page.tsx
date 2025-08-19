import React from "react";

export default function StripeOnboardingSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-green-200">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Stripe Onboarding Complete!</h1>
        <p className="text-lg text-gray-700 mb-6">Your Stripe Express account setup is finished. You can now receive payments for your events.</p>
        <a href="/dashboard" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition">Go to Dashboard</a>
      </div>
    </div>
  );
}
