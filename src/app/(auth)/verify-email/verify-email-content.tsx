"use client";

import { useState, useEffect, useRef, JSX } from "react";
import axios, { AxiosError } from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

interface VerifyEmailResponse {
  message: string;
}

export default function VerifyEmail(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [message, setMessage] = useState<string>("");
  const hasRun = useRef<boolean>(false);

  useEffect(() => {
    if (!token || hasRun.current) return;

    hasRun.current = true;

    axios.get<VerifyEmailResponse>(`http://localhost:5274/api/Auth/verify-email?token=${token}`)
      .then((response) => {
        setMessage('User Registered Successfully, now you can Login');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred.";
        setMessage(errorMessage);
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {message && (
        <div
          className={`shadow-lg rounded-xl px-8 py-6 text-center text-lg font-semibold border max-w-md w-full
            ${message.toLowerCase().includes('user registered') ? 'bg-green-500 text-white border-green-400' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
