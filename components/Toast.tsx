import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-4 md:right-8 z-50 animate-slideIn">
      <div className="bg-[#0a0a12] border border-green-500 text-white px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-4 min-w-[300px]">
        <div className="bg-green-500/10 p-2 rounded-full">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h4 className="font-bold text-green-400 text-sm uppercase tracking-wider">Éxito</h4>
          <p className="text-sm text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
};