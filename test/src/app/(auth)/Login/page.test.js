"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [passwordReset, setPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/Auth/login', {
      email: email,
      password: password
    })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setMessage('Login successful!');
      })
      .catch(error => {
        if (error.response) {
          setMessage(error.response.data.message);
        } else {
          setMessage('An error occurred. Please try again.');
        }
      });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  axios.post(
    'http://localhost:5000/api/Auth/forgot-password',
    {email}
  )
  .then(response => {
    setMessage('Password reset email sent!');
  })
  .catch(error => {
    if (error.response && error.response.data?.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage('An error occurred. Please try again.');
    }
  });
};



  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="flex justify-center items-center flex-1">
        <div className="bg-white shadow-lg rounded-lg flex w-full max-w-md overflow-hidden">
          <div className="w-full p-6">
            <h2 className="text-3xl font-bold mb-4">Login</h2>
            {passwordReset ? (
              <form onSubmit={handleResetSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border px-4 py-2 mb-4 rounded"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded font-semibold"
                  aria-label="Send password reset email"
                >
                  Send Reset Email
                </button>
                <button
                  type="button"
                  className="text-blue-300 mt-3 text-xs hover:underline w-full"
                  onClick={() => setPasswordReset(false)}
                  aria-label="Back to login"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form className="space-y-1" onSubmit={handleLoginSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border px-4 py-2 mb-4 rounded"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border px-4 py-2 mb-0 rounded"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="text-blue-300 mb-5 text-xs hover:underline"
                  onClick={() => setPasswordReset(true)}
                  aria-label="Forgot password"
                >
                  Forget Password?
                </button>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded font-semibold"
                  aria-label="Login"
                >
                  Login
                </button>
                <p className="text-sm text-center">
                  New to EventSphere ?{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Sign Up
                  </a>
                </p>
              </form>
            )}{message && (
            <div className="p-1 bg-gray-100 text-gray-600 rounded-b-lg">
              <p>{message}</p>
            </div>
          )}
          </div>
          
        </div>
      </div>
    </div>
  );
}