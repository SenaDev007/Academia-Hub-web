/**
 * Toast Component
 * 
 * Composant de notification toast simple
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = 'info',
      title,
      message,
      duration = 3000,
      onClose,
      autoClose = true,
      className,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (autoClose && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300); // Attendre animation fade-out
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [autoClose, duration, onClose]);

    if (!isVisible) {
      return null;
    }

    const variants = {
      success: 'bg-green-50 border-green-200 text-green-900',
      warning: 'bg-orange-50 border-orange-200 text-orange-900',
      error: 'bg-red-50 border-red-200 text-red-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      info: AlertTriangle,
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-2 fade-in',
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{title}</div>
          {message && <div className="text-sm mt-1 opacity-90">{message}</div>}
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="ml-2 flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export { Toast };
