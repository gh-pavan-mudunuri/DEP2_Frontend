import React from "react";

interface ConfirmationDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="rounded-lg shadow-lg p-6 w-full max-w-xs text-center pointer-events-auto"
        style={{
          background: "#0a174e", // navbar background
          color: "#ffd700",      // gold text for contrast
        }}
      >
        <div className="mb-4 text-lg font-semibold">{message}</div>
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;