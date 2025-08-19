"use client";
import React, { useState, createContext } from 'react';
import PopupMessage from "@/components/common/popup-message";

export const EventFormPopupContext = createContext<((popup: { message: string; type?: "success" | "error" | "info" } | null) => void) | undefined>(undefined);

export default function EventFormLayout({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  return (
    <EventFormPopupContext.Provider value={setPopup}>
      <div className="min-h-screen bg-gray-100">
        {popup && (
          <div className="fixed left-0 top-0 w-full flex justify-center z-[100] pointer-events-none">
            <PopupMessage
              message={popup.message}
              type={popup.type}
              onClose={() => setPopup(null)}
            />
          </div>
        )}
        {/* No static heading here; page can provide its own heading if needed */}
        <div className="max-w-7xl pt-12 mx-auto px-4">
          {children}
        </div>
      </div>
    </EventFormPopupContext.Provider>
  );
}