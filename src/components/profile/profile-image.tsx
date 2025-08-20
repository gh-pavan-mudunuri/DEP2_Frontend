import React from 'react';

interface ProfileImageProps {
  imageUrl: string;
  imagePreview: string;
  alt?: string;
  className?: string;
}

const getImageUrl = (url: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dep2-backend.onrender.com";
  if (!url) return "";
  if (url.startsWith("/uploads/")) return backendUrl + url;
  return url;
};

export default function ProfileImage({ imageUrl, imagePreview, alt = 'Profile', className = '' }: ProfileImageProps) {
  return (
    <div className={`relative w-40 h-40 md:w-52 md:h-52 rounded-full bg-gray-200 overflow-hidden border-4 border-orange-300 shadow-xl ml-0 ${className}`}> 
      {imagePreview || imageUrl ? (
        <img
          src={getImageUrl(imagePreview || imageUrl)}
          alt={alt}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-5xl text-gray-400">👤</span>
      )}
    </div>
  );
}
