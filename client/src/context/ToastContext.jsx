import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

function uid() {
  return `${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      toasts,
      push({ title, message, variant = 'info', timeoutMs = 2600 }) {
        const id = uid();
        const toast = {
          id,
          title: title || '',
          message: message || '',
          variant,
        };
        setToasts((prev) => [toast, ...prev].slice(0, 4));
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, timeoutMs);
        return id;
      },
      dismiss(id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    }),
    [toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
