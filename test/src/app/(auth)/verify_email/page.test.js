"use client";

import { useState, useEffect } from "react";
 import { useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState("");

 

const hasRun = useRef(false);

useEffect(() => {
  if (!token || hasRun.current) return;

  hasRun.current = true; // prevent second run in dev

  axios.get(`http://localhost:5000/api/Auth/verify-email?token=${token}`)
    .then(response => { 
      setMessage('User Registered Successfully, now you can Login');
    })
    .catch(error => { 
      setMessage(error.response?.data?.message || error.message);
    });
}, [token]);


  return (
    <div>
      {message && (
        <div className="p-1 bg-gray-100 text-gray-600 rounded-b">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}