"use client";
import React, { useState } from 'react';
import PopupMessage from "@/components/common/popup-message";
// Kept your original context import for strict TypeScript
import EditProfilePopupContext from "./edit-profile-popup-context";

// A type for the popup state for better type safety
type PopupState = {
  message: string;
  type?: "success" | "error" | "info";
} | null;

export default function EditProfileLayout({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<PopupState>(null);

  return (
    <EditProfilePopupContext.Provider value={setPopup}>
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        {/* PopupMessage logic remains the same */}
        {popup && (
          <div className="fixed left-0 top-0 w-full flex justify-center z-[100] pointer-events-none">
            <PopupMessage
              message={popup.message}
              type={popup.type}
              onClose={() => setPopup(null)}
            />
          </div>
        )}

        {/* The gradient background and header are removed as per your second code snippet */}
        
        <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          {children}
        </main>

        <footer className="w-full py-4 text-center text-gray-400 text-sm mt-8 relative z-10">
          &copy; {new Date().getFullYear()} EventSphere
        </footer>
      </div>
    </EditProfilePopupContext.Provider>
  );
}