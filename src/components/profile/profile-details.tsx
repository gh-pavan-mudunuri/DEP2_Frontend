import React from 'react';

interface ProfileDetailsProps {
  name: string;
  email: string;
  phone: string;
  onEdit: () => void;
  onChangePassword: () => void;
}

export default function ProfileDetails({ name, email, phone, onEdit, onChangePassword }: ProfileDetailsProps) {
  return (
    <div className="flex flex-col gap-5 w-full md:w-[62%] md:pl-8 items-start justify-start md:justify-center">
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
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          className="py-2 px-4 rounded bg-blue-500 text-white font-semibold text-base hover:bg-blue-600 transition-all"
          onClick={onChangePassword}
        >
          Change Password
        </button>
        <button
          className="py-2 px-5 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all text-base"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
