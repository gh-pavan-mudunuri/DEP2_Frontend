"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function PasswordReset() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState("");
  const [message, setMessage] = useState("");

  // Dynamically check password match
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setMatchError("Passwords do not match.");
    } else {
      setMatchError("");
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (newPassword !== e.target.value) {
      setMatchError("Passwords do not match.");
    } else {
      setMatchError("");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMatchError("Passwords do not match.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/Auth/reset-password", {
        token,
        newPassword,
      });
      setMessage(res.data.message || "Password reset successful.");
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Password reset failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <form className="space-y-4" onSubmit={handleResetSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full border px-4 py-2 rounded"
            required
            value={newPassword}
            onChange={handlePasswordChange}
          />
          <input
            type="password"
            placeholder="Re-enter new password"
            className="w-full border px-4 py-2 rounded"
            required
            value={confirmPassword}
            onChange={handleConfirmChange}
          />
          {matchError && (
            <p className="text-red-500 text-sm">{matchError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded font-semibold"
            disabled={!!matchError || !newPassword || !confirmPassword}
          >
            Reset Password
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-gray-700">{message}</div>
        )}
      </div>
    </div>
  );
}