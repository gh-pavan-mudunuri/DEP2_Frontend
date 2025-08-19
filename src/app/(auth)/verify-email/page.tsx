"use client";

import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';


export default function VerifyEmail(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [message, setMessage] = useState<string>("");
  const hasRun = useRef<boolean>(false);

  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true; // prevent second run in dev
    axios.get<{ message: string }>(`http://localhost:5274/api/Auth/verify-email?token=${token}`)
      .then(response => { 
        setMessage('User Registered Successfully, now you can Login');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      })
      .catch((error: any) => { 
        setMessage(error.response?.data?.message || error.message);
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
