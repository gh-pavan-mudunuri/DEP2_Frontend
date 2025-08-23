import { useState } from 'react';
import ConfirmationDialog from '../common/confirmation-dialog';
import ProfileImage from './profile-image';

interface EditProfileFormProps {
  profile: {
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
    imageFile: File | null;
    imagePreview: string;
    stripeAccountId?: string | null;
  };
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  onStripeConnect?: () => void;
}

export default function EditProfileForm({ profile, editing, onChange, onImageChange, onCancel, onSave, onStripeConnect }: EditProfileFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStripePopup, setShowStripePopup] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
  setShowConfirm(false);
  const fakeEvent = { preventDefault: () => {}, target: null } as unknown as React.FormEvent<HTMLFormElement>;
  onSave(fakeEvent);
};
  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleStripeConnectClick = () => {
    if (profile.stripeAccountId) {
      setShowStripePopup(true);
    } else {
      if (onStripeConnect) onStripeConnect();
    }
  };

  const handleStripePopupClose = () => {
    setShowStripePopup(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-extrabold text-[#0a174e] text-center mb-6 tracking-wide" style={{ letterSpacing: '0.04em', textShadow: '0 2px 12px #ffd70088' }}>
        Edit Profile
        <span className="block w-16 h-1 mx-auto mt-2 rounded-full" />
      </h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border-4 border-[#0a174e] p-12 md:p-16 flex flex-col md:flex-row gap-0 items-center md:items-start w-full">
        {/* Left: Profile Image */}
        <div className={`flex flex-col items-center w-full md:w-[38%] mb-6 md:mb-0 md:pr-8`}>
          <ProfileImage imageUrl={profile.imageUrl} imagePreview={profile.imagePreview} />
          <div className="flex justify-center w-full">
            <label className="px-3 py-1.5 bg-white border border-gray-400 rounded-md shadow-sm cursor-pointer text-sm font-medium hover:bg-orange-50 hover:border-orange-400 transition-all mx-auto">
              Change Image
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {/* Right: Details */}
        <div className="hidden md:block h-full border-r border-gray-200 mx-2" style={{ minHeight: '220px' }} />
        <div className="flex flex-col gap-5 w-full md:w-[62%] md:pl-8 items-start justify-start md:justify-center">
          <label className="font-medium w-full">Name
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border-2 border-[#0a174e] rounded focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] transition-all bg-white text-[#0a174e] placeholder-gray-400"
              required
            />
          </label>
          <label className="font-medium w-full">Email
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border-2 border-[#0a174e] rounded focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] transition-all bg-white text-[#0a174e] placeholder-gray-400"
              required
            />
          </label>
          <label className="font-medium w-full">Phone
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border-2 border-[#0a174e] rounded focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] transition-all bg-white text-[#0a174e] placeholder-gray-400"
              required
            />
          </label>
          <div className="flex flex-col gap-4 mt-6 w-full">
            <div className="flex gap-4 justify-center md:justify-start">
              <button
                type="submit"
                className="py-2 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-[#0a174e] via-[#009688] to-[#ffd700] shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-[#3a4a7c] hover:via-[#ffd700] hover:to-[#ffd700] focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                disabled={editing}
              >
                {editing ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="py-2 px-6 rounded-lg bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 transition-all shadow-sm"
                onClick={onCancel}
                disabled={editing}
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              className="py-2 px-6 rounded-xl font-bold text-white bg-[#0a174e] transition-all shadow-sm w-full md:w-auto hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
              onClick={handleStripeConnectClick}
              disabled={editing}
            >
              Connect to Stripe
            </button>
          </div>
        </div>
      </form>
      <ConfirmationDialog
        open={showConfirm}
        message="Are you sure you want to save changes to your profile?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Save"
        cancelText="Cancel"
      />
      <ConfirmationDialog
        open={showStripePopup}
        message="You have already connected to Stripe."
        onConfirm={handleStripePopupClose}
        onCancel={handleStripePopupClose}
        confirmText="OK"
        cancelText="Close"
      />
    </div>
  );
}
