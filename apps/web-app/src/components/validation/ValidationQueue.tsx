import React from 'react';
import { ValidationWorkflow } from '../../types/validation';
import { FiRefreshCw, FiCheck, FiX, FiClock } from 'react-icons/fi';

interface ValidationQueueProps {
  queue: ValidationWorkflow[];
  onRetry: (workflowId: string) => void;
  onValidate: (workflow: ValidationWorkflow) => void;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => string;
}

const ValidationQueue: React.FC<ValidationQueueProps> = ({
  queue,
  onRetry,
  onValidate,
  formatDate,
  getStatusColor,
  getTypeIcon
}) => {
  if (queue.length === 0) {
    return (
      <div className="p-12 text-center">
        <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune validation en attente</h3>
        <p className="text-gray-600">Toutes les validations ont été synchronisées avec succès.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {queue.map((workflow) => (
        <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(workflow.type)}</span>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{workflow.title}</h4>
                  <p className="text-sm text-gray-600 capitalize">{workflow.type.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FiClock className="w-4 h-4" />
                  <span>Créé le {formatDate(workflow.createdAt)}</span>
                </div>
                <div>
                  Par {workflow.createdByName}
                </div>
                <div>
                  Étape {workflow.currentStep} sur {workflow.totalSteps}
                </div>
              </div>

              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onValidate(workflow)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <FiCheck className="w-4 h-4" />
                <span>Valider</span>
              </button>
              
              <button
                onClick={() => onRetry(workflow.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Réessayer</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{Math.round((workflow.currentStep / workflow.totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ValidationQueue;
