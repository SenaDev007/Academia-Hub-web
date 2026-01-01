import React, { useState } from 'react';
import { ValidationWorkflow, ValidationRequest } from '../../types/validation';
import { FiX, FiCheck, FiAlertTriangle, FiUser, FiMessageSquare } from 'react-icons/fi';

interface ValidationModalProps {
  workflow: ValidationWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (request: ValidationRequest) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onValidate,
  currentUser
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !workflow) return null;

  const currentStep = workflow.steps?.find(step => step.status === 'pending');
  const canValidate = currentStep?.requiredRoles?.includes(currentUser.role);

  const handleSubmit = async () => {
    if (!action || !currentStep) return;

    setLoading(true);
    try {
      const request: ValidationRequest = {
        workflowId: workflow.id,
        action,
        stepId: currentStep.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString()
      };

      await onValidate(request);
      
      // Reset form
      setAction(null);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Validation</h2>
            <p className="text-sm text-gray-600">{workflow.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Document Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Informations du document</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium capitalize">{workflow.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className="ml-2 font-medium capitalize">{workflow.status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Créé par:</span>
                <span className="ml-2 font-medium">{workflow.createdByName}</span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{new Date(workflow.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Étape actuelle</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiUser className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{currentStep.name}</span>
                </div>
                <p className="text-sm text-blue-700">
                  Rôle requis: {currentStep.requiredRoles?.join(', ')}
                </p>
                {currentStep.description && (
                  <p className="text-sm text-blue-600 mt-1">{currentStep.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Validation Steps */}
          {workflow.steps && workflow.steps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Progression</h3>
              <div className="space-y-2">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'approved' ? 'bg-green-100 text-green-800' :
                      step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      step.status === 'skipped' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.name}</div>
                      <div className="text-sm text-gray-600">
                        {step.userName && (
                          <span className="flex items-center space-x-1">
                            <FiUser className="w-3 h-3" />
                            <span>{step.userName}</span>
                          </span>
                        )}
                        {step.timestamp && (
                          <span className="ml-2">{new Date(step.timestamp).toLocaleDateString()}</span>
                        )}
                      </div>
                      {step.comment && (
                        <div className="text-sm text-gray-500 mt-1">{step.comment}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Form */}
          {canValidate && currentStep && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Action de validation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choisir une action
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setAction('approve')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                        action === 'approve'
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Approuver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction('reject')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                        action === 'reject'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FiX className="w-4 h-4" />
                      <span>Rejeter</span>
                    </button>
                  </div>
                </div>

                {action && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire {action === 'reject' && '(obligatoire)'}
                    </label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={`${action === 'approve' ? 'Commentaire optionnel...' : 'Expliquez la raison du rejet...'}`}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    {action === 'reject' && !comment.trim() && (
                      <p className="text-sm text-red-600 mt-1">
                        Un commentaire est requis pour le rejet
                      </p>
                    )}
                  </div>
                )}

                {action === 'reject' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <FiAlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
                        <div className="text-sm text-yellow-700 mt-1">
                          <p>
                            Le rejet de cette validation retournera le document à l'étape précédente
                            ou le marquera comme rejeté selon la configuration du workflow.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!canValidate && (
            <div className="border-t pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="flex">
                  <FiAlertTriangle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Non autorisé</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>
                        Votre rôle ({currentUser.role}) n'est pas autorisé à valider cette étape.
                        Rôle requis: {currentStep?.requiredRoles?.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!action || loading || (action === 'reject' && !comment.trim())}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              action === 'approve'
                ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                : action === 'reject'
                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
            } disabled:cursor-not-allowed`}
          >
            {loading ? 'Validation...' : action === 'approve' ? 'Approuver' : 'Rejeter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
