import { ReactNode, useEffect } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
};

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export default function Modal({ open, title, onClose, size = 'lg', children }: ModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${sizeClass[size]} bg-white rounded-xl shadow-xl border border-gray-200`}
           role="dialog" aria-modal="true">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close" className="btn-secondary px-2 py-1" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
