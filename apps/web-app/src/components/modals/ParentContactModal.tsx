import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import WhatsAppModal from './WhatsAppModal';
import EmailModal from './EmailModal';

interface ParentContactModalProps {
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
    parentNotified?: boolean;
  };
  onParentContacted?: (absenceId: string) => void;
  onParentNotContacted?: (absenceId: string) => void;
}

export default function ParentContactModal({ isOpen, onClose, student, absence, onParentContacted, onParentNotContacted }: ParentContactModalProps) {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [parentContacted, setParentContacted] = useState(absence?.parentNotified || false);

  // Vérifier si student existe avant de rendre le modal
  if (!student) {
    return null;
  }

  // Mettre à jour l'état quand l'absence change
  React.useEffect(() => {
    setParentContacted(absence?.parentNotified || false);
  }, [absence?.parentNotified]);

  const handleCall = () => {
    if (student.parentPhone) {
      window.open(`tel:${student.parentPhone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    setIsWhatsAppModalOpen(true);
  };

  const handleEmail = () => {
    setIsEmailModalOpen(true);
  };

  const handleCopyPhone = () => {
    if (student.parentPhone) {
      navigator.clipboard.writeText(student.parentPhone);
      // Vous pourriez ajouter une notification toast ici
    }
  };

  const handleCopyEmail = () => {
    if (student.parentEmail) {
      navigator.clipboard.writeText(student.parentEmail);
      // Vous pourriez ajouter une notification toast ici
    }
  };

  const handleParentContactedChange = (checked: boolean) => {
    setParentContacted(checked);
    
    if (checked && absence?.id && onParentContacted) {
      console.log('=== DEBUG handleParentContactedChange ===');
      console.log('Cochage de la case - marquer comme contacté');
      console.log('absence.id:', absence.id);
      onParentContacted(absence.id);
    } else if (!checked && absence?.id && onParentNotContacted) {
      console.log('=== DEBUG handleParentContactedChange ===');
      console.log('Décocher de la case - marquer comme non contacté');
      console.log('absence.id:', absence.id);
      onParentNotContacted(absence.id);
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    Contacter le parent
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Informations de l'élève */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Élève concerné
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations du parent */}
                <div className="space-y-4">
                  {/* Nom du parent */}
                  {student.parentName && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {student.parentName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {student.parentRelationship || 'Parent'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Téléphone */}
                  {student.parentPhone && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {student.parentPhone}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Téléphone
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCall}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                          >
                            Appeler
                          </button>
                          <button
                            onClick={handleWhatsApp}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={handleCopyPhone}
                            className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors"
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {student.parentEmail && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {student.parentEmail}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Email
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleEmail}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            Envoyer
                          </button>
                          <button
                            onClick={handleCopyEmail}
                            className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors"
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adresse */}
                  {student.parentAddress && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Adresse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {student.parentAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profession */}
                  {student.parentProfession && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {student.parentProfession}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Profession
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message si aucune information de contact */}
                {!student.parentPhone && !student.parentEmail && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Aucune information de contact parent disponible pour cet élève.
                    </p>
                  </div>
                )}

                {/* Case à cocher pour marquer le parent comme contacté */}
                {absence && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="parentContacted"
                        checked={parentContacted}
                        onChange={(e) => handleParentContactedChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="parentContacted" className="ml-3 text-sm font-medium text-blue-900 dark:text-blue-100">
                        Marquer le parent comme contacté
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                      Cochez cette case si vous avez réussi à contacter le parent concernant cette absence.
                    </p>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>

      {/* Modal WhatsApp personnalisé */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        student={student}
        absence={absence}
      />

      {/* Modal Email personnalisé */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        student={student}
        absence={absence}
      />
    </Transition>
  );
}
