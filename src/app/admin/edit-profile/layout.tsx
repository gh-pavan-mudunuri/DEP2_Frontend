"use client";
import React, { useState } from 'react';
import PopupMessage from "@/components/common/popup-message";
import EditProfilePopupContext, { PopupType } from "./edit-profile-popup-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<PopupType>(null);
  return (
    <EditProfilePopupContext.Provider value={setPopup}>
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        {/* PopupMessage always above header/navbar */}
        {popup && (
          <div className="fixed left-0 top-0 w-full flex justify-center z-[100] pointer-events-none">
            <PopupMessage
              message={popup.message}
              type={popup.type}
              onClose={() => setPopup(null)}
            />
          </div>
        )}
        
        {/* Pink gradient top background */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: '40vh',
            minHeight: '220px',
            zIndex: 0,
            background: 'linear-gradient(135deg, #ff6aab 0%, #ffb86c 100%)',
          }}
        />

        <header className="w-full py-6 bg-transparent text-white text-center font-bold text-2xl shadow-none mb-8 relative z-10">
          Profile
        </header>
        
        <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          {children}
        </main>
        
        <footer className="w-full py-4 text-center text-gray-400 text-sm mt-8 relative z-10">
          &copy; {new Date().getFullYear()} EventSphere. All rights reserved.
        </footer>
      </div>
    </EditProfilePopupContext.Provider>
  );
}