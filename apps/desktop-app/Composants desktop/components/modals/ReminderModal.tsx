import React, { useState } from 'react';
import { X, Phone, Smartphone, MessageSquare, Send, CheckCircle } from 'lucide-react';

interface TuitionStatus {
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  className: string;
  expectedTuition: number;
  paidTuition: number;
  remainingTuition: number;
  status: 'not_started' | 'partial' | 'completed';
  phoneNumber?: string;
  lastPaymentDate?: string;
  nextDueDate?: string;
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: TuitionStatus | null;
  onSend: (student: TuitionStatus, type: 'call' | 'sms' | 'whatsapp', message?: string) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  student,
  onSend
}) => {
  const [selectedType, setSelectedType] = useState<'call' | 'sms' | 'whatsapp'>('call');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !student) return null;

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend(student, selectedType, customMessage || undefined);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getDefaultMessage = (type: 'call' | 'sms' | 'whatsapp') => {
    const studentName = student.studentName;
    const remainingAmount = student.remainingTuition.toLocaleString();
    
    switch (type) {
      case 'call':
        return `Bonjour, nous vous contactons concernant la scolarité de ${studentName}. Il reste ${remainingAmount} F CFA à régler. Merci de nous contacter pour finaliser le paiement.`;
      case 'sms':
        return `Rappel scolarité - ${studentName}: ${remainingAmount} F CFA restants. Merci de régulariser votre situation.`;
      case 'whatsapp':
        return `Bonjour ! 👋\n\nRappel concernant la scolarité de *${studentName}*.\n\n💰 Montant restant : *${remainingAmount} F CFA*\n\nMerci de nous contacter pour finaliser le paiement.\n\nCordialement, l'équipe administrative.`;
      default:
        return '';
    }
  };

  const reminderTypes = [
    {
      id: 'call',
      label: 'Appel téléphonique',
      icon: Phone,
      description: 'Appeler directement le parent',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: Smartphone,
      description: 'Envoyer un SMS de rappel',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      description: 'Envoyer un message WhatsApp',
      color: 'text-green-500 bg-green-50 border-green-200'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Envoyer un rappel de scolarité</h3>
              <p className="text-blue-100 mt-1">
                Rappeler le paiement de scolarité à {student.studentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              title="Fermer"
              aria-label="Fermer la modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations de l'élève */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informations de l'élève</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">{student.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Classe</p>
                <p className="font-medium text-gray-900">{student.level} - {student.className}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scolarité attendue</p>
                <p className="font-medium text-gray-900">{student.expectedTuition.toLocaleString()} F CFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scolarité versée</p>
                <p className="font-medium text-green-600">{student.paidTuition.toLocaleString()} F CFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reste à payer</p>
                <p className="font-medium text-red-600">{student.remainingTuition.toLocaleString()} F CFA</p>
              </div>
              {student.phoneNumber && (
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{student.phoneNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Type de rappel */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Type de rappel</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {reminderTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as 'call' | 'sms' | 'whatsapp')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedType === type.id
                        ? `${type.color} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className="w-6 h-6" />
                      <span className="font-medium text-sm">{type.label}</span>
                      <span className="text-xs text-gray-500 text-center">{type.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message personnalisé */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Message personnalisé</h4>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-2">Message par défaut :</p>
                <p className="text-sm text-blue-700">{getDefaultMessage(selectedType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personnaliser le message (optionnel)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Laissez vide pour utiliser le message par défaut..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Aperçu du message */}
          {customMessage && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Aperçu du message</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{customMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSending}
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer le rappel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
