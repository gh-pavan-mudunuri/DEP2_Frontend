"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[\W]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (value: number) => {
    switch (value) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
      case 3:
        return "bg-yellow-400";
      case 4:
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const { name, email, password } = formData;
      const res = await axios.post("http://localhost:5274/api/Auth/register", {
        name,
        email,
        password
      });
      setMessage("Signup successful! Please check your email.");
      setSuccess(true);
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Something went wrong.";
      setMessage(errMsg);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="flex justify-center items-center flex-1">
        <div className="bg-white shadow-lg rounded-lg flex w-full max-w-md overflow-hidden">
          <div className="w-full p-6">
            <h2 className="text-3xl font-bold mb-4">Signup</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full border px-4 py-2 rounded"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border px-4 py-2 rounded"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full border px-4 py-2 rounded"
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
                className="w-full border px-4 py-2 rounded"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded font-semibold"
              >
                Register
              </button>
              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500 hover:underline">
                  Login
                </Link>
              </p>
            </form>

            {message && (
              <div
                className={`mt-4 text-sm p-2 rounded ${
                  success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
