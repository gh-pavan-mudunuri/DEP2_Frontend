"use client";

import React, { useState, useEffect, useContext } from 'react';
import { FaSpinner } from "react-icons/fa"; // Added for loading icon
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ProfileImage from '@/components/profile/profile-image';
import ProfileDetails from '@/components/profile/profile-details';
import EditProfileForm from '@/components/profile/edit-profile-form';
import ChangePasswordModal from '@/components/profile/change-password-modal';
// Updated context import path as per the second file
import  EditProfilePopupContext  from './edit-profile-popup-context';
 
export default function EditProfilePage() {

  // All hooks must be declared before any logic or return
  const router = useRouter();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
    imageFile: File | null;
    imagePreview: string;
  }>({
    name: '',
    email: '',
    phone: '',
    imageUrl: '',
    imageFile: null,
    imagePreview: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(''); // Only for local logic, not for popup
  const setPopup = useContext(EditProfilePopupContext);
  const [success, setSuccess] = useState(false);
  // For change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  // Stripe onboarding logic
  const [stripeOnboardingLoading, setStripeOnboardingLoading] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    // Fetch user profile using GET /api/Users/{id}
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.userId || user?.id || user?.UserId || user?.Id;
        if (!userId) {
          setMessage('User not found.');
          setSuccess(false);
          if (setPopup) setPopup({ message: 'User not found.', type: 'error' });
          setLoading(false);
          return;
        }
        // Kept the original deployed URL
        const res = await axios.get(`https://dep2-backend.onrender.com/api/Users/${userId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        const data = res.data;
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phoneNumber || data.phone || '',
          imageUrl: data.profileImage || data.imageUrl || '',
          imageFile: null,
          imagePreview: data.profileImage || data.imageUrl || ''
        });
      } catch (err) {
        setMessage('Failed to load profile.');
        setSuccess(false);
        if (setPopup) setPopup({ message: 'Failed to load profile.', type: 'error' });
      }
      setLoading(false);
    };
    fetchProfile();
    // Fetch user profile and StripeAccountId for onboarding
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    setStripeAccountId(user?.StripeAccountId || user?.stripeAccountId || null);
    setRole(user?.role || user?.Role || "");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, imageFile: file, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditing(true);
    setMessage('');
    setSuccess(false);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phoneNumber', profile.phone);
      if (profile.imageFile) {
        formData.append('profileImage', profile.imageFile);
      }
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.userId || user?.id || user?.UserId || user?.Id;
      if (!userId) {
        setMessage('User not found.');
        setSuccess(false);
        setEditing(false);
        if (setPopup) setPopup({ message: 'User not found.', type: 'error' });
        return;
      }
      // Kept the original deployed URL
      await axios.patch(`https://dep2-backend.onrender.com/api/Users/${userId}`, formData, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      setMessage('Profile updated successfully!');
      setSuccess(true);
      setEditMode(false);
      setProfile((prev) => ({ ...prev, imageFile: null }));
      if (setPopup) setPopup({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage('Failed to update profile.');
      setSuccess(false);
      if (setPopup) setPopup({ message: 'Failed to update profile.', type: 'error' });
    }
    setEditing(false);
  };

  // Show popup for 3 seconds when message changes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleStripeOnboarding = async () => {
    // If already connected, show popup with Stripe Account ID
    if (stripeAccountId) {
      setMessage(`You have already set up your Stripe account. Account ID: ${stripeAccountId}`);
      setSuccess(true);
      if (setPopup) setPopup({ message: `You have already set up your Stripe account. Account ID: ${stripeAccountId}`, type: 'info' });
      return;
    }
    setStripeOnboardingLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.userId || user?.id || user?.UserId || user?.Id;
      const email = user?.email || user?.Email || profile.email;
      if (!userId || !email) throw new Error('User or email not found');
      // Kept the original deployed URL
      const res = await axios.post(
        `https://dep2-backend.onrender.com/api/Users/${userId}/stripe-express-account`,
        { email },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : undefined }
      );
      const { onboardingUrl } = res.data;
      window.location.href = onboardingUrl;
    } catch (err) {
      setMessage('Failed to start Stripe onboarding.');
      setSuccess(false);
      if (setPopup) setPopup({ message: 'Failed to start Stripe onboarding.', type: 'error' });
    }
    setStripeOnboardingLoading(false);
  };

  // Handler for password reset form submit
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg('');
    setResetSuccess(false);
    try {
      // Kept the original deployed URL
      await axios.post('https://dep2-backend.onrender.com/api/Auth/forgot-password', { email: resetEmail });
      setResetMsg('Password reset email sent! Redirecting to login...');
      setResetSuccess(true);
      if (setPopup) setPopup({ message: 'Password reset email sent! Redirecting to login...', type: 'success' });
      setTimeout(() => {
        setResetMsg('');
        setResetSuccess(false);
        router.push('/Login');
      }, 800);
    } catch (err) {
      setResetMsg('An error occurred. Please try again.');
      setResetSuccess(false);
      if (setPopup) setPopup({ message: 'An error occurred. Please try again.', type: 'error' });
    }
    setResetLoading(false);
  };

  return (
    <>
      {loading ? (
        // Added loading state UI
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <FaSpinner className="animate-spin text-3xl mb-2" />
          <span>Loading profile...</span>
        </div>
      ) : !editMode ? (
        // Updated styling for profile view mode
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl border-4 border-[#0a174e] p-12 md:p-16" style={{ boxShadow: '0 4px 32px 0 #ffd70033, 0 1.5px 8px 0 #0a174e22' }}>
          <h2 className="text-3xl font-extrabold text-[#0a174e] text-center mb-6 tracking-wide" style={{ letterSpacing: '0.04em', textShadow: '0 2px 12px #ffd70088' }}>
            Profile
            <span className="block w-16 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r from-[#ffd700] via-[#fffbe6] to-[#ffd700]" />
          </h2>
          <div className="flex flex-col md:flex-row gap-0 items-center md:items-start w-full">
            {/* Left: Profile Image */}
            <div className="flex flex-col items-center md:items-start md:justify-start w-full mt-0 md:w-[38%] mb-12 md:mb-0 md:pr-8">
              <ProfileImage imageUrl={profile.imageUrl} imagePreview={profile.imagePreview} />
            </div>
            {/* Right: Details */}
            <div className="hidden md:block h-full border-r border-[#ffd700] mx-2" style={{ minHeight: '220px' }} />
            <ProfileDetails
              name={profile.name}
              email={profile.email}
              phone={profile.phone}
              onEdit={() => setEditMode(true)}
              onChangePassword={() => {
                setShowChangePassword(true);
                setResetEmail(profile.email);
                setResetMsg('');
              }}
              // Added button classes as props
              editButtonClass="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#0a174e] via-[#009688] to-[#ffd700] shadow-md transition-all duration-200 hover:scale-105 hover:shadow-xl hover:from-[#3a4a7c] hover:to-[#ffd700] focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
              changePasswordButtonClass="px-5 py-2 rounded-xl font-bold text-[#0a174e] bg-white border-2 border-[#0a174e] shadow-md transition-all duration-200 hover:bg-[#fffbe6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
            />
          </div>
          {/* Updated Stripe onboarding section */}
          <div className="mt-10 text-center">
            <>
              <button
                className="px-6 py-2 rounded-xl font-bold text-base text-[#0a174e] bg-white border-2 border-[#0a174e] shadow-lg focus:outline-none focus:ring-4 focus:ring-[#0a174e] text-center transition-all duration-150 hover:underline hover:bg-[#fffbe6] hover:text-[#0a174e] disabled:opacity-50"
                onClick={e => {
                  if (stripeAccountId) {
                    e.preventDefault();
                    setMessage('You have already connected to Stripe.');
                    setSuccess(true);
                    if (setPopup) setPopup({ message: 'You have already connected to Stripe.', type: 'info' });
                    return;
                  }
                  handleStripeOnboarding();
                }}
                disabled={stripeOnboardingLoading}
                style={{ letterSpacing: '0.04em', cursor: 'pointer', display: 'inline-block', textAlign: 'center' }}
              >
                {stripeOnboardingLoading ? 'Redirecting to Stripe...' : 'Connect to Stripe'}
              </button>
              <div className="text-sm text-gray-500 mt-2">Connect your account to Stripe to receive payments.</div>
              {stripeAccountId && (
                <div className="bg-yellow-50 border-2 border-[#0a174e] rounded-xl p-4 shadow-md mt-4">
                  <div className="text-[#0a174e] font-semibold mb-2">You have already set up your Stripe account.</div>
                  <div className="text-sm text-gray-700">Stripe Account ID: <span className="font-mono bg-white px-2 py-1 rounded border border-[#ffd700]">{stripeAccountId}</span></div>
                </div>
              )}
            </>
          </div>
        </div>
      ) : (
        // Updated props for EditProfileForm
        <EditProfileForm
          profile={{ ...profile, stripeAccountId }}
          editing={editing}
          onChange={handleChange}
          onImageChange={handleImageChange}
          onCancel={() => { setEditMode(false); setProfile((prev) => ({ ...prev, imageFile: null, imagePreview: prev.imageUrl })); setMessage(''); }}
          onSave={handleSave}
          onStripeConnect={() => {
            if (stripeAccountId) {
              setMessage('You have already connected to Stripe.');
              setSuccess(true);
              if (setPopup) setPopup({ message: 'You have already connected to Stripe.', type: 'info' });
            } else {
              handleStripeOnboarding();
            }
          }}
        />
      )}
      <ChangePasswordModal
        show={showChangePassword}
        email={resetEmail}
        loading={resetLoading}
        message={resetMsg}
        onClose={() => setShowChangePassword(false)}
        // Updated onEmailChange handler
        onEmailChange={e => setResetEmail(String(e.target.value))}
        onSubmit={handlePasswordReset}
      />
    </>
  );
}