import React, { useState } from 'react';
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
  };
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function EditProfileForm({ profile, editing, onChange, onImageChange, onCancel, onSave }: EditProfileFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    // Actually submit the form
    onSave(new Event('submit') as any);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl p-12 md:p-16 flex flex-col md:flex-row gap-0 items-center md:items-start w-full">
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
              className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </label>
          <label className="font-medium w-full">Email
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </label>
          <label className="font-medium w-full">Phone
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </label>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="py-2 px-4 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
              disabled={editing}
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="py-2 px-4 rounded bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 transition-all"
              onClick={onCancel}
              disabled={editing}
            >
              Cancel
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
    </>
  );
}
