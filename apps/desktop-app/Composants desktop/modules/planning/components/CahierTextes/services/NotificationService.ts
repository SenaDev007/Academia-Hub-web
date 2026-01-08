interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

class NotificationService {
  private static notifications: NotificationData[] = [];
  private static listeners: ((notifications: NotificationData[]) => void)[] = [];

  // Afficher une notification de succès
  static showSuccess(message: string, title: string = 'Succès'): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      id: 'notif_' + Date.now()
    });
  }

  // Afficher une notification d'erreur
  static showError(message: string, title: string = 'Erreur'): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      id: 'notif_' + Date.now()
    });
  }

  // Afficher une notification d'avertissement
  static showWarning(message: string, title: string = 'Attention'): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      id: 'notif_' + Date.now()
    });
  }

  // Afficher une notification d'information
  static showInfo(message: string, title: string = 'Information'): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      id: 'notif_' + Date.now()
    });
  }

  // Envoyer notification à l'administration
  static envoyerNotificationAdministration(cahierData: any, enseignant: any): void {
    const notificationDirecteur = {
      id: 'admin_' + Date.now(),
      type: 'info' as const,
      title: 'Nouveau cahier de texte à valider',
      message: `${enseignant.name} a soumis un cahier de texte pour ${cahierData.matiere} - ${cahierData.classe}`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: 'directeur',
      actions: [
        {
          label: 'Voir le cahier',
          action: () => this.navigateToValidation(cahierData.id),
          type: 'primary' as const
        }
      ]
    };

    this.addNotification(notificationDirecteur);
    
    // Envoyer aussi par email (simulation)
    this.simulateEmailNotification(notificationDirecteur);
  }

  // Envoyer notification de validation
  static envoyerNotificationValidation(cahierData: any, validateur: any, action: 'validé' | 'refusé'): void {
    const notification = {
      id: 'validation_' + Date.now(),
      type: action === 'validé' ? 'success' : 'warning' as const,
      title: `Cahier de texte ${action}`,
      message: `Votre cahier de texte du ${new Date(cahierData.date).toLocaleDateString('fr-FR')} a été ${action} par ${validateur.name}`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: cahierData.enseignantId,
      actions: action === 'refusé' ? [
        {
          label: 'Voir les commentaires',
          action: () => this.navigateToHistory(cahierData.id),
          type: 'primary' as const
        }
      ] : undefined
    };

    this.addNotification(notification);
  }

  // Envoyer notification de rappel
  static envoyerRappelSaisie(enseignantId: string, classes: string[]): void {
    const notification = {
      id: 'rappel_' + Date.now(),
      type: 'warning' as const,
      title: 'Rappel de saisie',
      message: `N'oubliez pas de saisir vos cahiers de texte pour les classes: ${classes.join(', ')}`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: enseignantId,
      actions: [
        {
          label: 'Saisir maintenant',
          action: () => this.navigateToEntry(),
          type: 'primary' as const
        }
      ]
    };

    this.addNotification(notification);
  }

  // Ajouter une notification
  private static addNotification(notification: NotificationData): void {
    this.notifications.unshift(notification);
    
    // Limiter à 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Sauvegarder localement
    this.saveNotifications();
    
    // Notifier les listeners
    this.notifyListeners();

    // Auto-suppression pour les notifications de succès après 5 secondes
    if (notification.type === 'success') {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    }
  }

  // Marquer comme lu
  static markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Supprimer une notification
  static removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Récupérer toutes les notifications
  static getNotifications(userId?: string): NotificationData[] {
    if (userId) {
      return this.notifications.filter(n => !n.userId || n.userId === userId);
    }
    return this.notifications;
  }

  // Récupérer les notifications non lues
  static getUnreadCount(userId?: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  }

  // S'abonner aux changements
  static subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    
    // Retourner fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Charger les notifications sauvegardées
  static loadNotifications(): void {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  }

  // Sauvegarder les notifications
  private static saveNotifications(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
    }
  }

  // Notifier les listeners
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (error) {
        console.error('Erreur notification listener:', error);
      }
    });
  }

  // Méthodes de navigation (à adapter selon votre router)
  private static navigateToValidation(cahierId: string): void {
    // Navigation vers la page de validation
    window.location.hash = `#/validation?cahier=${cahierId}`;
  }

  private static navigateToHistory(cahierId: string): void {
    // Navigation vers l'historique
    window.location.hash = `#/history?cahier=${cahierId}`;
  }

  private static navigateToEntry(): void {
    // Navigation vers la saisie
    window.location.hash = '#/entry';
  }

  // Simulation d'envoi d'email
  private static simulateEmailNotification(notification: NotificationData): void {
    console.log('📧 Email envoyé:', {
      to: notification.userId,
      subject: notification.title,
      body: notification.message,
      timestamp: notification.timestamp
    });
  }

  // Initialiser le service
  static init(): void {
    this.loadNotifications();
    
    // Programmer des rappels automatiques
    this.scheduleReminders();
  }

  // Programmer des rappels automatiques
  private static scheduleReminders(): void {
    // Rappel quotidien à 17h pour la saisie du lendemain
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(17, 0, 0, 0);
    
    if (now > reminderTime) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
      // Envoyer rappels aux enseignants qui n'ont pas saisi
      this.checkAndSendReminders();
      
      // Programmer le prochain rappel
      setInterval(() => {
        this.checkAndSendReminders();
      }, 24 * 60 * 60 * 1000); // Tous les jours
    }, timeUntilReminder);
  }

  private static checkAndSendReminders(): void {
    // Logique pour vérifier qui doit saisir et envoyer des rappels
    // À adapter selon vos données d'enseignants et classes
    console.log('🔔 Vérification des rappels de saisie...');
  }
}

// Initialiser le service au chargement
NotificationService.init();

export default NotificationService;