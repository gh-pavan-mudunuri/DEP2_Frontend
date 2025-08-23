"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios, { AxiosError } from "axios";

interface VerifyEmailResponse {
  message: string;
}

export default function VerifyEmail() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    axios
      .get<VerifyEmailResponse>(
        `https://dep2-backend.onrender.com/api/Auth/verify-email?token=${token}`
      )
      .then(() => {
        setMessage("User Registered Successfully, now you can Login");
        setTimeout(() => router.push("/login"), 2000);
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred.";
        setMessage(errorMessage);
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {message && (
        <div
          className={`shadow-lg rounded-xl px-8 py-6 text-center text-lg font-semibold border max-w-md w-full
          ${
            message.toLowerCase().includes("user registered")
              ? "bg-green-500 text-white border-green-400"
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}