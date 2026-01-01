import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    parentAddress?: string;
    parentProfession?: string;
    parentRelationship?: string;
  };
  absence?: {
    id: string;
    date: string;
    period: string;
    reason: string;
  };
}

export default function WhatsAppModal({ isOpen, onClose, student, absence }: WhatsAppModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Vérifier si student existe avant de rendre le modal
  if (!student) {
    return null;
  }

  // Fonction pour traduire les périodes
  const translatePeriod = (period: string) => {
    const periodMap: { [key: string]: string } = {
      'morning': 'Matin',
      'afternoon': 'Après-midi',
      'evening': 'Soir',
      'full': 'Journée complète'
    };
    return periodMap[period] || period;
  };

  // Fonction pour déterminer le titre approprié
  const getParentTitle = (parentName?: string) => {
    if (!parentName) return 'Parent';
    
    // Si le nom commence par "M." ou "Mme", on le garde tel quel
    if (parentName.startsWith('M.') || parentName.startsWith('Mme')) {
      return parentName;
    }
    
    // Sinon, on ajoute "M./Mme" devant le nom
    return `M./Mme ${parentName}`;
  };

  // Message par défaut pour l'absence
  const defaultMessage = absence 
    ? `Bonjour ${getParentTitle(student.parentName)},

Nous vous contactons concernant l'absence de votre enfant ${student.firstName} ${student.lastName} le ${absence.date} (${translatePeriod(absence.period)}).

Motif de l'absence : ${absence.reason}

Pourriez-vous nous confirmer la raison de cette absence ?

Cordialement,
L'équipe pédagogique`
    : `Bonjour ${getParentTitle(student.parentName)},

Nous vous contactons concernant votre enfant ${student.firstName} ${student.lastName}.

Avez-vous un moment pour échanger ?

Cordialement,
L'équipe pédagogique`;

  // Initialiser le message par défaut quand le modal s'ouvre
  React.useEffect(() => {
    if (isOpen && !message) {
      setMessage(defaultMessage);
    }
  }, [isOpen, defaultMessage, message]);

  const handleSendWhatsApp = () => {
    if (!student.parentPhone) {
      return;
    }

    setIsSending(true);

    // Nettoyer le numéro de téléphone
    const cleanPhone = student.parentPhone.replace(/[\s\-\(\)]/g, '');
    // Ajouter l'indicatif du pays si nécessaire
    const phoneWithCountryCode = cleanPhone.startsWith('+') ? cleanPhone : `+225${cleanPhone}`;
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Ouvrir WhatsApp avec le message
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;
    
    // Simuler un délai d'envoi
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSending(false);
      onClose();
    }, 1000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    // Vous pourriez ajouter une notification toast ici
  };

  const handleCopyPhone = () => {
    if (student.parentPhone) {
      navigator.clipboard.writeText(student.parentPhone);
      // Vous pourriez ajouter une notification toast ici
    }
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    Envoyer un message WhatsApp
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Informations de l'élève et du parent */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Élève concerné
                        </p>
                        {student.parentName && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Parent : {student.parentName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {student.parentPhone}
                      </span>
                      <button
                        onClick={handleCopyPhone}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        title="Copier le numéro"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails de l'absence si disponible */}
                {absence && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Détails de l'absence
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Date :</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-2">{absence.date}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Période :</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-2">{translatePeriod(absence.period)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Motif :</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-2">{absence.reason}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Zone de message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message à envoyer
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                    placeholder="Tapez votre message ici..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {message.length} caractères
                    </span>
                    <button
                      onClick={handleCopyMessage}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier le message
                    </button>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={isSending || !student.parentPhone || !message.trim()}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                        Envoyer sur WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
