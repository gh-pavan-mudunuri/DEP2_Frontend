import { useEffect } from "react";
import { createPortal } from "react-dom";

interface PopupMessageProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number; // ms
}

const PopupMessage: React.FC<PopupMessageProps> = ({ message, type = "success", onClose, duration = 2500 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  let bgColor = "bg-green-500";
  if (type === "error") bgColor = "bg-red-500";
  if (type === "info") bgColor = "bg-blue-500";

  // Try to render in a portal above the navbar if a root exists
  if (typeof window !== "undefined") {
    const portalRoot = document.getElementById("popup-message-root");
    const popupContent = (
      <div
        className={`mt-4 px-6 py-3 rounded-lg shadow-lg text-white text-center max-w-md w-fit mx-auto ${bgColor} animate-fade-in`}
        style={{ pointerEvents: "auto", zIndex: 100 }}
        role="alert"
      >
        {message}
      </div>
    );
    if (portalRoot) {
      return createPortal(popupContent, portalRoot);
    }
  }
  // fallback: fixed at top center
  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[1000] px-6 py-3 rounded-lg shadow-lg text-white text-center max-w-md w-fit mx-auto ${bgColor} animate-fade-in`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default PopupMessage;
