import React from 'react';

interface ChangePasswordModalProps {
  show: boolean;
  email: string;
  loading: boolean;
  message: string;
  onClose: () => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChangePasswordModal({ show, email, loading, message, onClose, onEmailChange, onSubmit }: ChangePasswordModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs sm:max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-bold mb-4 text-center">Change Password</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded text-sm"
            required
            value={email}
            onChange={onEmailChange}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
            aria-label="Send password reset email"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Sending reset email...
              </>
            ) : (
              'Send Reset Email'
            )}
          </button>
          {message && (
            <div className={`p-2 rounded mt-2 text-center ${message.toLowerCase().includes('error') ? 'bg-red-200 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <p>{message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
