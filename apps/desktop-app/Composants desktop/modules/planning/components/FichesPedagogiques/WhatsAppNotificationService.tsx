import React from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Service de notification WhatsApp (simulation)
class WhatsAppNotificationService {
  static async sendNotification(recipient, message, type = 'info') {
    // Simulation d'envoi WhatsApp
    console.log('Envoi WhatsApp:', { recipient, message, type });
    
    // Ici on intégrerait l'API WhatsApp Business
    // Par exemple avec Twilio, Meta WhatsApp Business API, etc.
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          messageId: `wa_${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }, 1000);
    });
  }

  static formatFicheNotification(fiche, action, comment = '') {
    const messages = {
      'envoye': `📚 *Nouvelle fiche pédagogique reçue*\n\n*Titre:* ${fiche.titre}\n*Matière:* ${fiche.matiere}\n*Classe:* ${fiche.classe}\n*Enseignant:* ${fiche.enseignant}\n\nVeuillez consulter la plateforme pour validation.`,
      
      'validee': `✅ *Fiche pédagogique validée*\n\n*Titre:* ${fiche.titre}\n*Matière:* ${fiche.matiere}\n*Classe:* ${fiche.classe}\n\nFélicitations ! Votre fiche a été approuvée.${comment ? `\n\n*Commentaire du directeur:*\n${comment}` : ''}`,
      
      'corrigee': `📝 *Fiche pédagogique à corriger*\n\n*Titre:* ${fiche.titre}\n*Matière:* ${fiche.matiere}\n*Classe:* ${fiche.classe}\n\n*Corrections demandées:*\n${comment}\n\nVeuillez apporter les modifications et renvoyer la fiche.`,
      
      'rejetee': `❌ *Fiche pédagogique rejetée*\n\n*Titre:* ${fiche.titre}\n*Matière:* ${fiche.matiere}\n*Classe:* ${fiche.classe}\n\n*Motif:*\n${comment}\n\nVeuillez revoir complètement la fiche avant de la renvoyer.`
    };

    return messages[action] || messages['envoye'];
  }
}

// Composant pour afficher les notifications
const WhatsAppNotificationPanel = ({ notifications = [] }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Notifications WhatsApp
      </h4>
      
      {notifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucune notification récente
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-2">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notification.recipient}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {notification.message.substring(0, 100)}...
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {notification.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Hook pour utiliser le service WhatsApp
const useWhatsAppNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const sendNotification = async (recipient, fiche, action, comment = '') => {
    setIsLoading(true);
    
    try {
      const message = WhatsAppNotificationService.formatFicheNotification(fiche, action, comment);
      const result = await WhatsAppNotificationService.sendNotification(recipient, message, action);
      
      const notification = {
        recipient,
        message,
        type: result.success ? 'success' : 'error',
        timestamp: result.timestamp,
        success: result.success,
        messageId: result.messageId
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Garder les 10 dernières
      
      return result;
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      const notification = {
        recipient,
        message: 'Erreur lors de l\'envoi',
        type: 'error',
        timestamp: new Date().toISOString(),
        success: false
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    sendNotification,
    isLoading
  };
};

export { WhatsAppNotificationService, WhatsAppNotificationPanel, useWhatsAppNotifications };