import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-4 p-5 rounded-3xl shadow-2xl animate-slide-up ${
              toast.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-900' :
              toast.type === 'error' ? 'bg-rose-50 border border-rose-100 text-rose-900' :
              'bg-blue-50 border border-blue-100 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? <CheckCircle2 className="text-emerald-500 shrink-0" size={24} /> :
               toast.type === 'error' ? <AlertCircle className="text-rose-500 shrink-0" size={24} /> :
               <Info className="text-blue-500 shrink-0" size={24} />}
              <p className="text-sm font-black tracking-tight leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
