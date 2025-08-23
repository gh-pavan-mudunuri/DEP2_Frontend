"use client";
import { Roboto } from "next/font/google";
const roboto = Roboto({ subsets: ["latin"], weight: "700" });

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import PopupMessage from '@/components/common/popup-message';
import axios, { AxiosError } from "axios";
import Link from "next/link";
import Image from "next/image";
import { FormData, APIResponse } from "@/interfaces/auth";

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<string>("");
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[\W]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (value: number): string => {
    if (value <= 1) return "bg-red-400";
    if (value <= 3) return "bg-yellow-400";
    return "bg-green-500";
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePopupClose = () => setMessage("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setPopupType('error');
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { name, email, password } = formData;
      await axios.post<APIResponse>("https://dep2-backend.onrender.com/api/Auth/register", {
        name,
        email,
        password
      });
      setPopupType('success');
      setMessage("Signup successful! Please check your email to verify your account.");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      const errMsg = err.response?.data?.message || "Something went wrong.";
      setPopupType(
        errMsg.toLowerCase().includes("verification email") && errMsg.toLowerCase().includes("sent")
          ? 'success'
          : 'error'
      );
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bg-cover bg-center bg-fixed flex flex-col select-none" >
      {message && (
        <PopupMessage
          message={message}
          type={popupType}
          onClose={handlePopupClose}
          duration={2500}
        />
      )}
      <div className="flex justify-center px-2 sm:px-4 py-8 md:items-center">
        <div className="bg-white/30 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl flex flex-col md:flex-row w-full max-w-md sm:max-w-lg md:max-w-3xl overflow-hidden">
          <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white/40 p-6 relative overflow-visible md:order-none order-first">
            <Image
              src="/images/register.png"
              alt="Event Sphere"
              width={120}
              height={120}
              className="relative z-20 object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105 mb-2 md:mb-0"
              loading="lazy"
            />
            <div className="text-xl md:text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700 drop-shadow-lg mb-1 md:mb-2">
              Welcome to Event Sphere
            </div>
            <div className="text-center text-blue-900/80 font-medium text-sm md:text-base italic mb-2 md:mb-0">
              Join us and experience the future of event management!
            </div>
          </div>

          <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl mb-4 font-bold text-blue-900 text-center">
              Signup
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                {isPasswordFocused && formData.password && (
                  <div className="w-full h-1 mt-1 bg-gray-200 rounded">
                    <div
                      className={`h-full rounded ${getStrengthColor(strength)}`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="submit"
                className="w-full text-white py-2 rounded font-semibold bg-cyan-500 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:scale-105 hover:shadow-lg transition-all duration-200 text-base sm:text-lg"
                style={{ background: "rgba(4, 195, 216, 1)" }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
              <p className="text-xs sm:text-sm text-center">
                Already have an account?{" "}
                <Link href="/Login" className="text-blue-500 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}