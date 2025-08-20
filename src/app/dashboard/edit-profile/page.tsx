"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ProfileImage from '@/components/profile/profile-image';
import ProfileDetails from '@/components/profile/profile-details';
import EditProfileForm from '@/components/profile/edit-profile-form';
import ChangePasswordModal from '@/components/profile/change-password-modal';
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
      {!editMode ? (
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl p-12 md:p-16">
          <h2 className="text-2xl font-bold mb-6 text-center"> Profile</h2>
          <div className="flex flex-col md:flex-row gap-0 items-center md:items-start w-full">
            {/* Left: Profile Image */}
            <div className="flex flex-col items-center md:items-start md:justify-start w-full mt-0 md:w-[38%] mb-12 md:mb-0 md:pr-8">
              <ProfileImage imageUrl={profile.imageUrl} imagePreview={profile.imagePreview} />
            </div>
            {/* Right: Details */}
            <div className="hidden md:block h-full border-r border-gray-200 mx-2" style={{ minHeight: '220px' }} />
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
            />
          </div>
          {/* Stripe onboarding section at bottom */}
          <div className="mt-10 text-center">
            {stripeAccountId ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-700 font-semibold mb-2">You have already set up your Stripe account.</div>
                <div className="text-sm text-gray-700">Stripe Account ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{stripeAccountId}</span></div>
              </div>
            ) : (
              <>
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
                  onClick={handleStripeOnboarding}
                  disabled={stripeOnboardingLoading}
                >
                  {stripeOnboardingLoading ? 'Redirecting to Stripe...' : 'Connect to Stripe'}
                </button>
                <div className="text-sm text-gray-500 mt-2">Connect your account to Stripe to receive payments.</div>
              </>
            )}
          </div>
        </div>
      ) : (
        <EditProfileForm
          profile={profile}
          editing={editing}
          onChange={handleChange}
          onImageChange={handleImageChange}
          onCancel={() => { setEditMode(false); setProfile((prev) => ({ ...prev, imageFile: null, imagePreview: prev.imageUrl })); setMessage(''); }}
          onSave={handleSave}
        />
      )}
      <ChangePasswordModal
        show={showChangePassword}
        email={resetEmail}
        loading={resetLoading}
        message={resetMsg}
        onClose={() => setShowChangePassword(false)}
        onEmailChange={e => setResetEmail(e.target.value)}
        onSubmit={handlePasswordReset}
      />
    </>
  );
}