"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import PopupMessage from '@/components/common/popup-message';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { UserRole } from "@/types/roles";
import Image from "next/image";
import { LoginResponse, APIError } from "@/interfaces/auth";

export default function Login() {
  const router = useRouter();

  const [passwordReset, setPasswordReset] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    axios.post<LoginResponse>('https://dep2-backend.onrender.com/api/Auth/login', {
      email: email,
      password: password
    })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        document.cookie = `authToken=${response.data.token}; path=/; max-age=86400; SameSite=Lax; Secure`;
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (typeof response.data.user.role !== 'undefined') {
          document.cookie = `userRole=${response.data.user.role}; path=/; max-age=86400; SameSite=Lax; Secure`;
        }
        setUser(response.data.user);
        setPopupType('success');
        setMessage('Login successful!');
        window.dispatchEvent(new Event("userLoggedIn"));
        if (response.data.user.role === UserRole.Admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      })
      .catch((error: AxiosError<APIError>) => {
        console.error('Login error:', error);
        let backendMsg = '';
        if (error.response) {
          if (typeof error.response.data === 'string') {
            backendMsg = error.response.data;
          } else if (
            typeof error.response.data === 'object' &&
            error.response.data &&
            'message' in error.response.data
          ) {
            backendMsg = error.response.data.message ?? '';
          }
        }
        if (backendMsg) {
          if (backendMsg.toLowerCase().includes('email not verified')) {
            setPopupType('error');
            setMessage('Your email is not verified. Please check your inbox for the verification link.');
          } else {
            setPopupType('error');
            setMessage(backendMsg);
          }
        } else {
          setPopupType('error');
          setMessage('An unexpected error occurred. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setMessage('');
    setPopupType('success');

    try {
      await axios.post('https://dep2-backend.onrender.com/api/Auth/forgot-password', { email });
      setPopupType('success');
      setMessage('Password reset email sent!');
    } catch (error) {
      const err = error as AxiosError<APIError>;
      setPopupType('error');
      setMessage(err.response?.data?.message ?? 'An error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handlePopupClose = () => setMessage('');

  return (
    <>
      {message && (
        <PopupMessage
          message={message}
          type={popupType}
          onClose={handlePopupClose}
          duration={2500}
        />
      )}

      <div className="flex flex-col justify-center items-center" >
        <div className="flex justify-center items-center flex-1 relative z-10 w-full">
          <div className="bg-white/80 sm:bg-white shadow-lg rounded-lg flex w-full max-w-xs sm:max-w-md md:max-w-lg backdrop-blur-md">
            <div className="w-full p-3 sm:p-6 z-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center">Login</h2>
              {passwordReset ? (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                    required
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(String(e.target.value))}
                  />
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center justify-center text-base sm:text-lg"
                    aria-label="Send password reset email"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Sending reset email...
                      </>
                    ) : (
                      "Send Reset Email"
                    )}
                  </button>
                  <button
                    type="button"
                    className="text-blue-300 mt-3 text-xs sm:text-sm hover:underline w-full"
                    onClick={() => setPasswordReset(false)}
                    aria-label="Back to login"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={handleLoginSubmit}>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                    required
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(String(e.target.value))}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                    required
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(String(e.target.value))}
                  />
                  <div className="mb-3 text-xs sm:text-sm text-right">
                    <button
                      type="button"
                      className="text-blue-300 hover:underline"
                      onClick={() => setPasswordReset(true)}
                      aria-label="Forgot password"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white py-2 rounded font-semibold hover:bg-gradient-to-r bg-blue-300  hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center justify-center text-base sm:text-lg"
                    aria-label="Login"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Logging you in, please wait...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                  <p className="text-xs sm:text-sm text-center">
                    New to EventSphere?{" "}
                    <a href="/Signup" className="text-blue-500 hover:underline">
                      Sign Up
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}