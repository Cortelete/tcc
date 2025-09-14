import React, { ReactNode } from 'react';
import { ICONS } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="glass-card shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl"
        style={{background: 'rgba(15, 23, 42, 0.8)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center shrink-0"
             style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)'}}
        >
          <h2 className="text-xl font-bold text-white/90">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            {ICONS.close}
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;