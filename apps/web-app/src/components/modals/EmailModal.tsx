import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon, ClockIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface EmailModalProps {
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

export default function EmailModal({ isOpen, onClose, student, absence }: EmailModalProps) {
  const [subject, setSubject] = useState('');
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

  // Sujet par défaut pour l'absence
  const defaultSubject = absence 
    ? `Absence de ${student.firstName} ${student.lastName} - ${absence.date}`
    : `Information concernant ${student.firstName} ${student.lastName}`;

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

  // Initialiser le sujet et le message par défaut quand le modal s'ouvre
  React.useEffect(() => {
    if (isOpen && !subject && !message) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
    }
  }, [isOpen, defaultSubject, defaultMessage, subject, message]);

  const handleSendEmail = () => {
    if (!student.parentEmail) {
      return;
    }

    setIsSending(true);

    // Encoder le sujet et le message pour l'URL
    const encodedSubject = encodeURIComponent(subject);
    const encodedMessage = encodeURIComponent(message);
    
    // Ouvrir l'application email avec le message
    const emailUrl = `mailto:${student.parentEmail}?subject=${encodedSubject}&body=${encodedMessage}`;
    
    // Simuler un délai d'envoi
    setTimeout(() => {
      window.open(emailUrl, '_self');
      setIsSending(false);
      onClose();
    }, 1000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    // Vous pourriez ajouter une notification toast ici
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    // Vous pourriez ajouter une notification toast ici
  };

  const handleCopyEmail = () => {
    if (student.parentEmail) {
      navigator.clipboard.writeText(student.parentEmail);
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
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    Envoyer un email
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Informations de l'élève et du parent */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Élève concerné
                        </p>
                        {student.parentName && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Parent : {student.parentName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {student.parentEmail}
                      </span>
                      <button
                        onClick={handleCopyEmail}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        title="Copier l'email"
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
                  <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <h5 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Détails de l'absence
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-orange-700 dark:text-orange-300 font-medium">Date :</span>
                        <span className="text-orange-600 dark:text-orange-400 ml-2">{absence.date}</span>
                      </div>
                      <div>
                        <span className="text-orange-700 dark:text-orange-300 font-medium">Période :</span>
                        <span className="text-orange-600 dark:text-orange-400 ml-2">{translatePeriod(absence.period)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-orange-700 dark:text-orange-300 font-medium">Motif :</span>
                        <span className="text-orange-600 dark:text-orange-400 ml-2">{absence.reason}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Zone de sujet */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sujet de l'email
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Tapez le sujet de l'email..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {subject.length} caractères
                    </span>
                    <button
                      onClick={handleCopySubject}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier le sujet
                    </button>
                  </div>
                </div>

                {/* Zone de message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message à envoyer
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
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
                    onClick={handleSendEmail}
                    disabled={isSending || !student.parentEmail || !subject.trim() || !message.trim()}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
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
                        Envoyer par email
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
