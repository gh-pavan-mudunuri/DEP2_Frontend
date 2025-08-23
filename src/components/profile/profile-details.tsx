import React from 'react';

// The interface from your first snippet, which includes optional class props
interface ProfileDetailsProps {
  name: string;
  email: string;
  phone: string;
  onEdit: () => void;
  onChangePassword: () => void;
  editButtonClass?: string;
  changePasswordButtonClass?: string;
}

export default function ProfileDetails({
  name,
  email,
  phone,
  onEdit,
  onChangePassword,
  editButtonClass,
  changePasswordButtonClass,
}: ProfileDetailsProps) {
  return (
    <div className="flex flex-col gap-5 w-full md:w-[62%] md:pl-8 items-start justify-start md:justify-center">
      {/* --- User Details Section --- */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg text-gray-700">Name:</span>
          <span className="text-gray-900 text-lg font-semibold">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Email:</span>
          <span className="text-gray-800">{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Phone:</span>
          <span className="text-gray-800">{phone}</span>
        </div>
      </div>

      {/* --- Buttons Section with updated styles --- */}
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          // Applied new styles and merged with the optional prop
          className={`px-5 py-2 rounded-xl font-bold text-[#0a174e] bg-white border-2 border-[#0a174e] shadow-md transition-all duration-200 hover:bg-[#fffbe6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffd700] ${
            changePasswordButtonClass || ''
          }`}
          onClick={onChangePassword}
        >
          Change Password
        </button>
        <button
          type="button"
          // Applied new styles and merged with the optional prop
          className={`px-5 py-2 rounded-xl font-bold text-white bg-[#0a174e] shadow-md transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0a174e] ${
            editButtonClass || ''
          }`}
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}