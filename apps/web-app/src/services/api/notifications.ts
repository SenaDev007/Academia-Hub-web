import { dataService } from '../dataService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'students' | 'planning' | 'hr' | 'finance' | 'general';
  recipientId?: string;
  recipientType?: 'student' | 'teacher' | 'admin' | 'parent';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  readAt?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'students' | 'planning' | 'hr' | 'finance' | 'general';
  recipientId?: string;
  recipientType?: 'student' | 'teacher' | 'admin' | 'parent';
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationFilters {
  recipientId?: string;
  recipientType?: 'student' | 'teacher' | 'admin' | 'parent';
  category?: 'students' | 'planning' | 'hr' | 'finance' | 'general';
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const notificationsService = {
  // Récupérer toutes les notifications
  async getNotifications(filters?: NotificationFilters) {
    try {
      const notifications = await dataService.getAllNotifications(filters);
      return {
        data: notifications,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer une notification par ID
  async getNotificationById(id: string) {
    try {
      const notification = await dataService.getNotificationById(id);
      if (!notification) {
        return {
          data: null,
          success: false,
          error: 'Notification non trouvée'
        };
      }
      return {
        data: notification,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la notification:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Créer une nouvelle notification
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await dataService.createNotification(data);
      return {
        data: notification,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Marquer une notification comme lue
  async markAsRead(id: string) {
    try {
      const notification = await dataService.updateNotification(id, {
        isRead: true,
        readAt: new Date().toISOString()
      });
      return {
        data: notification,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(recipientId?: string) {
    try {
      const success = await dataService.markAllNotificationsAsRead(recipientId);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer une notification
  async deleteNotification(id: string) {
    try {
      const success = await dataService.deleteNotification(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les notifications non lues
  async getUnreadNotifications(recipientId?: string) {
    try {
      const notifications = await dataService.getUnreadNotifications(recipientId);
      return {
        data: notifications,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les statistiques de notifications
  async getNotificationStats(recipientId?: string) {
    try {
      const stats = await dataService.getNotificationStats(recipientId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifications spécifiques aux étudiants
  async notifyStudentAbsence(studentId: string, absenceData: any) {
    try {
      const notification = await this.createNotification({
        title: 'Absence signalée',
        message: `Absence signalée pour ${absenceData.studentName} le ${absenceData.date}`,
        type: 'warning',
        category: 'students',
        recipientId: studentId,
        recipientType: 'student',
        actionUrl: `/students/absences/${absenceData.id}`,
        actionText: 'Voir les détails'
      });
      return notification;
    } catch (error) {
      console.error('Erreur lors de la notification d\'absence:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifications pour les transferts de classe
  async notifyClassTransfer(transferData: any) {
    try {
      const notification = await this.createNotification({
        title: 'Demande de transfert de classe',
        message: `Demande de transfert de ${transferData.studentName} de ${transferData.fromClass} vers ${transferData.toClass}`,
        type: 'info',
        category: 'students',
        recipientId: transferData.studentId,
        recipientType: 'student',
        actionUrl: `/students/transfers/${transferData.id}`,
        actionText: 'Voir la demande'
      });
      return notification;
    } catch (error) {
      console.error('Erreur lors de la notification de transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifications pour les incidents disciplinaires
  async notifyDisciplineIncident(incidentData: any) {
    try {
      const notification = await this.createNotification({
        title: 'Incident disciplinaire',
        message: `Incident disciplinaire signalé pour ${incidentData.studentName} - ${incidentData.incident}`,
        type: 'error',
        category: 'students',
        recipientId: incidentData.studentId,
        recipientType: 'student',
        actionUrl: `/students/discipline/${incidentData.id}`,
        actionText: 'Voir l\'incident'
      });
      return notification;
    } catch (error) {
      console.error('Erreur lors de la notification d\'incident:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifications pour les documents générés
  async notifyDocumentGenerated(documentData: any) {
    try {
      const notification = await this.createNotification({
        title: 'Document généré',
        message: `Le document "${documentData.documentType}" a été généré avec succès`,
        type: 'success',
        category: 'students',
        actionUrl: `/documents/${documentData.id}`,
        actionText: 'Télécharger'
      });
      return notification;
    } catch (error) {
      console.error('Erreur lors de la notification de document:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifications pour les inscriptions
  async notifyEnrollment(enrollmentData: any) {
    try {
      const notification = await this.createNotification({
        title: 'Nouvelle inscription',
        message: `Nouvelle inscription de ${enrollmentData.studentName} en ${enrollmentData.class}`,
        type: 'success',
        category: 'students',
        recipientId: enrollmentData.studentId,
        recipientType: 'student',
        actionUrl: `/students/${enrollmentData.studentId}`,
        actionText: 'Voir le profil'
      });
      return notification;
    } catch (error) {
      console.error('Erreur lors de la notification d\'inscription:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
