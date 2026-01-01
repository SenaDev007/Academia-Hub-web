import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../components/dashboard/NotificationSystem';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState(0);

  // Ajouter une nouvelle notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${++lastNotificationId}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setLastNotificationId(lastNotificationId + 1);
    
    // Auto-suppression après 10 secondes pour les notifications de succès
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 10000);
    }
  }, [lastNotificationId]);

  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Supprimer toutes les notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notifications automatiques pour les actions RH
  const notifyPersonnelAction = useCallback((action: 'create' | 'update' | 'delete', name: string) => {
    const messages = {
      create: { title: 'Personnel ajouté', message: `${name} a été ajouté(e) avec succès.` },
      update: { title: 'Personnel mis à jour', message: `Les informations de ${name} ont été mises à jour.` },
      delete: { title: 'Personnel supprimé', message: `${name} a été supprimé(e) de la base de données.` }
    };
    
    addNotification({
      type: 'success',
      ...messages[action]
    });
  }, [addNotification]);

  const notifyContractAction = useCallback((action: 'create' | 'update' | 'delete', employeeName: string) => {
    const messages = {
      create: { title: 'Contrat créé', message: `Un nouveau contrat a été créé pour ${employeeName}.` },
      update: { title: 'Contrat mis à jour', message: `Le contrat de ${employeeName} a été modifié.` },
      delete: { title: 'Contrat supprimé', message: `Le contrat de ${employeeName} a été supprimé.` }
    };
    
    addNotification({
      type: 'success',
      ...messages[action]
    });
  }, [addNotification]);

  const notifyTrainingAction = useCallback((action: 'create' | 'update' | 'delete', title: string) => {
    const messages = {
      create: { title: 'Formation créée', message: `La formation "${title}" a été programmée.` },
      update: { title: 'Formation mise à jour', message: `La formation "${title}" a été modifiée.` },
      delete: { title: 'Formation supprimée', message: `La formation "${title}" a été annulée.` }
    };
    
    addNotification({
      type: 'success',
      ...messages[action]
    });
  }, [addNotification]);

  const notifyEvaluationAction = useCallback((action: 'create' | 'update' | 'delete', employeeName: string) => {
    const messages = {
      create: { title: 'Évaluation créée', message: `Une évaluation a été créée pour ${employeeName}.` },
      update: { title: 'Évaluation mise à jour', message: `L'évaluation de ${employeeName} a été modifiée.` },
      delete: { title: 'Évaluation supprimée', message: `L'évaluation de ${employeeName} a été supprimée.` }
    };
    
    addNotification({
      type: 'success',
      ...messages[action]
    });
  }, [addNotification]);

  // Notifications d'erreur
  const notifyError = useCallback((title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message
    });
  }, [addNotification]);

  // Notifications d'avertissement
  const notifyWarning = useCallback((title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message
    });
  }, [addNotification]);

  // Notifications d'information
  const notifyInfo = useCallback((title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message
    });
  }, [addNotification]);

  // Nettoyage automatique des anciennes notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      setNotifications(prev => 
        prev.filter(notification => notification.timestamp > oneHourAgo)
      );
    }, 60000); // Vérification toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    notifyPersonnelAction,
    notifyContractAction,
    notifyTrainingAction,
    notifyEvaluationAction,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};

export default useNotifications;
