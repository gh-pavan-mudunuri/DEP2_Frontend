import React from 'react';
import Link from 'next/link';

export default function PaymentCancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center max-w-md w-full border border-red-100">
        <div className="flex flex-col items-center mb-6">
          <span className="text-6xl mb-2 animate-bounce">❌</span>
          <h1 className="text-3xl font-extrabold text-red-700 mb-2 drop-shadow">Payment Cancelled</h1>
          <p className="text-lg text-red-600 mb-4 text-center">Your payment was not completed.<br />Please try again or contact support.</p>
        </div>
        <Link href="/" className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-lg font-semibold shadow hover:from-red-700 hover:to-pink-600 transition-colors duration-200">
          Go to Home
        </Link>
      </div>
    </div>
  );
}