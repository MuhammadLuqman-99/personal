'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose(action: () => void) {
    setVisible(false);
    setTimeout(action, 200);
  }

  return (
    <div
      className={`fixed inset-0 z-[99] flex items-center justify-center px-6 transition-all duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => handleClose(onCancel)}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transition-all duration-200 ${
          visible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>

        <div className="flex border-t border-gray-100">
          <button
            onClick={() => handleClose(onCancel)}
            className="flex-1 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <div className="w-px bg-gray-100" />
          <button
            onClick={() => handleClose(onConfirm)}
            className="flex-1 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
