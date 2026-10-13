'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type Toast = { id: number; message: string; type: 'success' | 'error' };
const ToastContext = createContext<(message: string, type?: Toast['type']) => void>(
  () => undefined,
);
export function useToast() {
  return useContext(ToastContext);
}
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const sequence = useRef(0);
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++sequence.current;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 5500);
  }, []);
  return (
    <QueryClientProvider client={client}>
      <ToastContext.Provider value={toast}>
        {children}
        <div className="toast-stack" aria-live="polite" aria-atomic="false">
          {toasts.map((item) => (
            <div className={`toast toast-${item.type}`} key={item.id}>
              {item.type === 'success' ? <CheckCircle2 size={20} /> : <CircleAlert size={20} />}
              <span>{item.message}</span>
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() =>
                  setToasts((current) => current.filter((toast) => toast.id !== item.id))
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </QueryClientProvider>
  );
}
