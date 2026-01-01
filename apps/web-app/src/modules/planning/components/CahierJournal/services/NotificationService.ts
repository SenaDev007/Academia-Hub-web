export class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Envoi de notification WhatsApp
  public async sendWhatsAppNotification(
    phoneNumber: string, 
    message: string, 
    entryId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Formatage du numéro (format international)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Construction de l'URL WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      
      // Ouvrir WhatsApp dans un nouvel onglet
      window.open(whatsappUrl, '_blank');
      
      // Enregistrer la notification dans les logs
      await this.logNotification({
        type: 'whatsapp',
        recipient: phoneNumber,
        message: message,
        entryId: entryId,
        status: 'sent'
      });
      
      return { success: true, messageId: `wa_${Date.now()}` };
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Envoi de notification email
  public async sendEmailNotification(
    email: string, 
    subject: string, 
    message: string, 
    entryId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Construction de l'URL mailto
      const encodedSubject = encodeURIComponent(subject);
      const encodedMessage = encodeURIComponent(message);
      const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedMessage}`;
      
      // Ouvrir le client email
      window.location.href = mailtoUrl;
      
      // Enregistrer la notification dans les logs
      await this.logNotification({
        type: 'email',
        recipient: email,
        message: `${subject}\n\n${message}`,
        entryId: entryId,
        status: 'sent'
      });
      
      return { success: true, messageId: `email_${Date.now()}` };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Notification sur la plateforme
  public async sendPlatformNotification(
    userId: string, 
    title: string, 
    message: string, 
    entryId: string
  ): Promise<{ success: boolean; notificationId?: string }> {
    try {
      const notification = {
        id: `notif_${Date.now()}`,
        userId: userId,
        title: title,
        message: message,
        entryId: entryId,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Stocker dans localStorage (en production, utiliser une vraie base de données)
      const existingNotifications = JSON.parse(localStorage.getItem('platform_notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('platform_notifications', JSON.stringify(existingNotifications));
      
      return { success: true, notificationId: notification.id };
    } catch (error) {
      console.error('Erreur notification plateforme:', error);
      return { success: false };
    }
  }

  // Formatage du numéro de téléphone
  private formatPhoneNumber(phoneNumber: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Si le numéro commence par 0, le remplacer par 229 (indicatif Bénin)
    if (cleaned.startsWith('0')) {
      cleaned = '229' + cleaned.substring(1);
    }
    
    // Si le numéro ne commence pas par 229, l'ajouter
    if (!cleaned.startsWith('229')) {
      cleaned = '229' + cleaned;
    }
    
    return cleaned;
  }

  // Enregistrement des logs de notification
  private async logNotification(logData: {
    type: 'whatsapp' | 'email' | 'platform';
    recipient: string;
    message: string;
    entryId: string;
    status: 'sent' | 'delivered' | 'failed';
  }): Promise<void> {
    try {
      const log = {
        id: `log_${Date.now()}`,
        ...logData,
        sentAt: new Date().toISOString()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('notification_logs') || '[]');
      existingLogs.push(log);
      localStorage.setItem('notification_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Erreur enregistrement log:', error);
    }
  }

  // Génération des messages selon le contexte
  public generateWhatsAppMessage(
    action: 'submit' | 'approve' | 'reject' | 'return',
    entry: any,
    senderName: string,
    comment?: string
  ): string {
    const baseInfo = `📚 *Academia Hub - Cahier Journal*\n\n` +
                    `📖 Matière: ${entry.matiere}\n` +
                    `🎓 Classe: ${entry.classe}\n` +
                    `📅 Date: ${new Date(entry.date).toLocaleDateString('fr-FR')}\n` +
                    `👨‍🏫 Enseignant: ${entry.enseignant}\n\n`;

    switch (action) {
      case 'submit':
        return `${baseInfo}✅ *Nouvelle séance soumise pour validation*\n\n` +
               `Une nouvelle séance a été soumise par ${senderName} et nécessite votre validation.\n\n` +
               `${comment ? `💬 Commentaire: ${comment}\n\n` : ''}` +
               `🔗 Consultez votre espace directeur sur Academia Hub pour examiner cette séance.\n\n` +
               `⏰ Soumise le: ${new Date().toLocaleString('fr-FR')}`;

      case 'approve':
        return `${baseInfo}✅ *Séance approuvée*\n\n` +
               `Votre séance a été approuvée par ${senderName}.\n\n` +
               `${comment ? `💬 Commentaire: ${comment}\n\n` : ''}` +
               `✨ Vous pouvez maintenant mettre en œuvre cette séance.\n\n` +
               `⏰ Approuvée le: ${new Date().toLocaleString('fr-FR')}`;

      case 'reject':
        return `${baseInfo}❌ *Séance rejetée*\n\n` +
               `Votre séance a été rejetée par ${senderName}.\n\n` +
               `💬 Motif: ${comment || 'Aucun motif spécifié'}\n\n` +
               `🔄 Veuillez apporter les corrections nécessaires et soumettre à nouveau.\n\n` +
               `⏰ Rejetée le: ${new Date().toLocaleString('fr-FR')}`;

      case 'return':
        return `${baseInfo}🔄 *Séance retournée pour révision*\n\n` +
               `Votre séance a été retournée par ${senderName} pour des ajustements.\n\n` +
               `💬 Demandes de modification: ${comment || 'Voir les commentaires sur la plateforme'}\n\n` +
               `📝 Veuillez effectuer les modifications demandées et soumettre à nouveau.\n\n` +
               `⏰ Retournée le: ${new Date().toLocaleString('fr-FR')}`;

      default:
        return baseInfo + 'Notification du système Academia Hub';
    }
  }
}