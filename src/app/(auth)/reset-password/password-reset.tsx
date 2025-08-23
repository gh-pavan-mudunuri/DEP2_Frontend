"use client";

import React,{ useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

interface ResetPasswordResponse {
  message: string;
}

export default function PasswordReset(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [matchError, setMatchError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);
  }, [searchParams]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = String(e.target.value);
    setNewPassword(value);
    setMatchError(
      confirmPassword && value !== confirmPassword ? "Passwords do not match." : ""
    );
  };

  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = String(e.target.value);
    setConfirmPassword(value);
    setMatchError(
      newPassword !== value ? "Passwords do not match." : ""
    );
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      const res = await axios.post<ResetPasswordResponse>(
        "https://dep2-backend.onrender.com/api/Auth/reset-password",
        {
          token,
          newPassword,
        }
      );
      setMessage(res.data.message || "Password reset successful.");
      setTimeout(() => {
        router.push("/Login");
      }, 2000);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setMessage(
        err.response?.data?.message || "Password reset failed. Please try again."
      );
    }
  };

  // Determine if the message is a success
  const isSuccess = message.toLowerCase().includes('success');

  return (
    <div className="bg-cover bg-center bg-fixed px-2 relative" >
      {/* Message fixed at the top of the page */}
      {message && (
        <div className={`fixed top-0 left-0 w-full flex justify-center z-50`}>
          <div className={`mt-6 px-8 py-4 min-w-[320px] max-w-[90vw] rounded-lg shadow-lg text-center text-lg font-semibold transition-all duration-300
            ${isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {message}
          </div>
        </div>
      )}
      <div className="flex items-center justify-center">
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
        </div>
      </div>
    </div>
  );
}