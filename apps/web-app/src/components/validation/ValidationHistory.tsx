import React from 'react';
import { ValidationWorkflow } from '../../types/validation';
import { FiRefreshCw, FiCheck, FiX, FiClock, FiUser } from 'react-icons/fi';

interface ValidationHistoryProps {
  history: ValidationWorkflow[];
  onRetry: (workflowId: string) => void;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => string;
}

const ValidationHistory: React.FC<ValidationHistoryProps> = ({
  history,
  onRetry,
  formatDate,
  getStatusColor,
  getTypeIcon
}) => {
  if (history.length === 0) {
    return (
      <div className="p-12 text-center">
        <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique</h3>
        <p className="text-gray-600">Les validations synchronisées apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {history.map((workflow) => (
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
                  Mis à jour le {formatDate(workflow.updatedAt)}
                </div>
              </div>

              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status.replace('_', ' ')}
                </span>
              </div>

              {/* Validation Steps */}
              {workflow.steps && workflow.steps.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Étapes de validation</h5>
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3 text-sm">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          step.status === 'approved' ? 'bg-green-100 text-green-800' :
                          step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          step.status === 'skipped' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{step.name}</div>
                          <div className="text-gray-600">
                            {step.userName && (
                              <span className="flex items-center space-x-1">
                                <FiUser className="w-3 h-3" />
                                <span>{step.userName}</span>
                              </span>
                            )}
                            {step.timestamp && (
                              <span className="ml-2">{formatDate(step.timestamp)}</span>
                            )}
                          </div>
                          {step.comment && (
                            <div className="text-gray-500 text-xs mt-1">{step.comment}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {workflow.status === 'failed' && (
                <button
                  onClick={() => onRetry(workflow.id)}
                  className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Réessayer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ValidationHistory;
