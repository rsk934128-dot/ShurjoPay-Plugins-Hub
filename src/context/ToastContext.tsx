import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, defaults to 4500
  action?: ToastAction;
  createdAt: number;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (options: Omit<ToastMessage, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => string;
  error: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => string;
  info: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => string;
  warning: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_EVENT_NAME = 'spay:toast_dispatch';

/**
 * Global singleton trigger for dispatching toasts from anywhere in the app,
 * even outside React components or lifecycle hooks.
 */
export const toast = {
  show: (options: Omit<ToastMessage, 'id' | 'createdAt'>) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail: options }));
    }
  },
  success: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
    toast.show({ type: 'success', title, message, ...options });
  },
  error: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
    toast.show({ type: 'error', title, message, ...options });
  },
  info: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
    toast.show({ type: 'info', title, message, ...options });
  },
  warning: (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
    toast.show({ type: 'warning', title, message, ...options });
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (options: Omit<ToastMessage, 'id' | 'createdAt'>): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const duration = options.duration ?? 4500;
      const newToast: ToastMessage = {
        ...options,
        id,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
      return showToast({ type: 'success', title, message, ...options });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
      return showToast({ type: 'error', title, message, ...options });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
      return showToast({ type: 'info', title, message, ...options });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'message'>>) => {
      return showToast({ type: 'warning', title, message, ...options });
    },
    [showToast]
  );

  // Listen to window-level custom events from singleton `toast` calls
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<Omit<ToastMessage, 'id' | 'createdAt'>>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener(TOAST_EVENT_NAME, handleCustomToast);
    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, handleCustomToast);
    };
  }, [showToast]);

  const contextValue = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      clearAllToasts,
      success,
      error,
      info,
      warning,
    }),
    [toasts, showToast, dismissToast, clearAllToasts, success, error, info, warning]
  );

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
