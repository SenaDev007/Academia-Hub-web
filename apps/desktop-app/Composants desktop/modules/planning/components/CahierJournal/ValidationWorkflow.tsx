import React, { useState } from 'react';
import { Send, MessageCircle, CheckCircle, XCircle, Clock, User, ArrowRight, Phone, Mail, Bell, AlertTriangle } from 'lucide-react';
import { CahierJournalEntry, IValidationWorkflow, ValidationComment } from './types';
import { NotificationService } from "./services/NotificationService";

interface ValidationWorkflowProps {
  entry: CahierJournalEntry;
  workflow?: IValidationWorkflow;
  onSubmitForValidation: (entry: CahierJournalEntry, comment?: string) => void;
  onApprove: (workflowId: string, comment?: string) => void;
  onReject: (workflowId: string, comment: string) => void;
  onReturn: (workflowId: string, comment: string) => void;
  currentUserRole: 'enseignant' | 'directeur' | 'conseiller_pedagogique' | 'administrateur';
  currentUserName?: string;
}

const ValidationWorkflow: React.FC<ValidationWorkflowProps> = ({
  entry,
  workflow,
  onSubmitForValidation,
  onApprove,
  onReject,
  onReturn,
  currentUserRole,
  currentUserName = 'Utilisateur'
}) => {
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'return' | 'submit'>('approve');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  
  const notificationService = NotificationService.getInstance();

  const getStepStatus = (step: string) => {
    if (!workflow) return 'pending';
    
    if (workflow.currentStep === step) {
      return workflow.status;
    } else if (workflow.currentStep === 'directeur' && step === 'enseignant') {
      return 'completed';
    } else if (workflow.currentStep === 'conseiller_pedagogique' && (step === 'enseignant' || step === 'directeur')) {
      return 'completed';
    }
    
    return 'pending';
  };

  const getStepIcon = (step: string) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'enseignant':
        return 'Enseignant';
      case 'directeur':
        return 'Directeur';
      case 'conseiller_pedagogique':
        return 'Conseiller Pédagogique';
      default:
        return step;
    }
  };

  const canTakeAction = () => {
    if (!workflow) return currentUserRole === 'enseignant';
    
    return (
      (workflow.currentStep === 'directeur' && currentUserRole === 'directeur') ||
      (workflow.currentStep === 'conseiller_pedagogique' && currentUserRole === 'conseiller_pedagogique')
    );
  };

  const handleAction = async () => {
    setIsSubmitting(true);
    setNotificationStatus('Envoi en cours...');
    
    try {
      if (!workflow && action === 'submit') {
        // Soumission pour validation - envoyer au directeur
        await handleSubmitForValidation();
      } else if (workflow) {
        switch (action) {
          case 'approve':
            await handleApprove();
            break;
          case 'reject':
            await handleReject();
            break;
          case 'return':
            await handleReturn();
            break;
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      setNotificationStatus('Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotificationStatus(''), 3000);
    }
  };

  const handleSubmitForValidation = async () => {
    // Numéro WhatsApp du directeur (en production, récupérer depuis la base de données)
    const directorWhatsApp = '22997123456'; // Exemple
    const directorEmail = 'directeur@ecole.bj';
    
    // Générer le message WhatsApp
    const whatsappMessage = notificationService.generateWhatsAppMessage(
      'submit',
      entry,
      currentUserName,
      comment
    );
    
    // Envoyer notification WhatsApp
    const whatsappResult = await notificationService.sendWhatsAppNotification(
      directorWhatsApp,
      whatsappMessage,
      entry.id
    );
    
    // Envoyer notification sur la plateforme
    await notificationService.sendPlatformNotification(
      'director_id', // ID du directeur
      'Nouvelle séance à valider',
      `${entry.matiere} - ${entry.classe} soumise par ${currentUserName}`,
      entry.id
    );
    
    if (whatsappResult.success) {
      setNotificationStatus('✅ Notification envoyée au directeur');
      onSubmitForValidation(entry, comment);
    } else {
      setNotificationStatus('⚠️ Erreur d\'envoi WhatsApp');
    }
  };

  const handleApprove = async () => {
    const whatsappMessage = notificationService.generateWhatsAppMessage(
      'approve',
      entry,
      currentUserName,
      comment
    );
    
    // Envoyer notification à l'enseignant
    const teacherWhatsApp = '22912345678'; // Récupérer le numéro de l'enseignant
    await notificationService.sendWhatsAppNotification(
      teacherWhatsApp,
      whatsappMessage,
      entry.id
    );
    
    setNotificationStatus('✅ Séance approuvée et enseignant notifié');
    if (workflow) {
      onApprove(workflow.id, comment);
    }
  };

  const handleReject = async () => {
    const whatsappMessage = notificationService.generateWhatsAppMessage(
      'reject',
      entry,
      currentUserName,
      comment
    );
    
    // Envoyer notification à l'enseignant
    const teacherWhatsApp = '22912345678'; // Récupérer le numéro de l'enseignant
    await notificationService.sendWhatsAppNotification(
      teacherWhatsApp,
      whatsappMessage,
      entry.id
    );
    
    setNotificationStatus('❌ Séance rejetée et enseignant notifié');
    if (workflow) {
      onReject(workflow.id, comment);
    }
  };

  const handleReturn = async () => {
    const whatsappMessage = notificationService.generateWhatsAppMessage(
      'return',
      entry,
      currentUserName,
      comment
    );
    
    // Envoyer notification à l'enseignant
    const teacherWhatsApp = '22912345678'; // Récupérer le numéro de l'enseignant
    await notificationService.sendWhatsAppNotification(
      teacherWhatsApp,
      whatsappMessage,
      entry.id
    );
    
    setNotificationStatus('🔄 Séance retournée et enseignant notifié');
    if (workflow) {
      onReturn(workflow.id, comment);
    }
    
    setComment('');
    setShowCommentForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Processus de Validation</h3>
        {workflow && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            workflow.status === 'approved' ? 'bg-green-100 text-green-800' :
            workflow.status === 'rejected' ? 'bg-red-100 text-red-800' :
            workflow.status === 'returned' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {workflow.status === 'approved' ? 'Approuvé' :
             workflow.status === 'rejected' ? 'Rejeté' :
             workflow.status === 'returned' ? 'Retourné' :
             'En attente'}
          </span>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center justify-between mb-8">
        {['enseignant', 'directeur', 'conseiller_pedagogique'].map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                getStepStatus(step) === 'completed' || getStepStatus(step) === 'approved' 
                  ? 'border-green-500 bg-green-50' :
                getStepStatus(step) === 'rejected' 
                  ? 'border-red-500 bg-red-50' :
                getStepStatus(step) === 'pending' && workflow?.currentStep === step
                  ? 'border-yellow-500 bg-yellow-50' :
                  'border-gray-300 bg-gray-50'
              }`}>
                {getStepIcon(step)}
              </div>
              <span className="text-sm font-medium text-gray-700 mt-2">
                {getStepLabel(step)}
              </span>
              <span className="text-xs text-gray-500">
                {step === 'enseignant' ? 'Création' :
                 step === 'directeur' ? 'Validation' :
                 'Approbation'}
              </span>
            </div>
            {index < 2 && (
              <ArrowRight className="text-gray-400 mx-4" size={20} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Comments History */}
      {workflow && workflow.comments && workflow.comments.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Historique des commentaires</h4>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {workflow.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      comment.role === 'directeur' ? 'bg-blue-100 text-blue-700' :
                      comment.role === 'conseiller_pedagogique' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {comment.role === 'directeur' ? 'Directeur' :
                       comment.role === 'conseiller_pedagogique' ? 'Conseiller' :
                       'Enseignant'}
                    </span>
                    <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status de notification */}
      {notificationStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Bell size={16} />
            <span className="text-sm">{notificationStatus}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {canTakeAction() && (
        <div className="space-y-4">
          {!workflow && currentUserRole === 'enseignant' && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAction('submit');
                  setShowCommentForm(true);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre pour validation'}
              </button>
            </div>
          )}

          {workflow && workflow.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAction('approve');
                  setShowCommentForm(true);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {isSubmitting ? 'Traitement...' : 'Approuver'}
              </button>
              <button
                onClick={() => {
                  setAction('return');
                  setShowCommentForm(true);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} />
                {isSubmitting ? 'Traitement...' : 'Retourner'}
              </button>
              <button
                onClick={() => {
                  setAction('reject');
                  setShowCommentForm(true);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                {isSubmitting ? 'Traitement...' : 'Rejeter'}
              </button>
            </div>
          )}

          {/* Comment Form */}
          {showCommentForm && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire {action === 'reject' || action === 'return' ? '(obligatoire)' : '(optionnel)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={
                  action === 'approve' ? 'Commentaire de validation...' :
                  action === 'reject' ? 'Motif du rejet...' :
                  action === 'return' ? 'Demandes de modification...' :
                  'Commentaire...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setComment('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAction}
                  disabled={((action === 'reject' || action === 'return') && !comment.trim()) || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {isSubmitting ? 'Envoi...' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
            <span className="text-white text-xs">i</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Processus de validation</p>
            <p>
              {!workflow ? 
                'Cette séance n\'a pas encore été soumise pour validation.' :
                workflow.status === 'pending' ?
                  `En attente de validation par le ${getStepLabel(workflow.currentStep)}.` :
                workflow.status === 'approved' ?
                  'Cette séance a été approuvée et peut être mise en œuvre.' :
                workflow.status === 'rejected' ?
                  'Cette séance a été rejetée et nécessite des modifications.' :
                  'Cette séance a été retournée pour révision.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Instructions pour le directeur */}
      {currentUserRole === 'directeur' && workflow && workflow.status === 'pending' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Action requise</p>
              <p>
                Cette séance nécessite votre validation. Après examen, vous pouvez l'approuver, la rejeter ou la retourner pour modifications. L'enseignant sera automatiquement notifié par WhatsApp de votre décision.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationWorkflow;