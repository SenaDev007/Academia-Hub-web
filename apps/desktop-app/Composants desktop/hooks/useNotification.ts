import { useState, useCallback } from 'react';

interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationOptions[]>([]);

  const showNotification = useCallback((options: NotificationOptions) => {
    const notification = {
      ...options,
      duration: options.duration || 5000,
    };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, notification.duration);
  }, []);

  const hideNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    notifications,
    showNotification,
    hideNotification,
  };
};
