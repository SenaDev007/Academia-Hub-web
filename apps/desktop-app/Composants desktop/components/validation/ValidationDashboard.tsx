import React, { useState, useEffect } from 'react';
import { useOfflineValidation } from '../../hooks/useOfflineValidation';
import { ValidationWorkflow, ValidationStatus, ValidationFilters } from '../../types/validation';
import { useNotifications } from '../../contexts/NotificationContext';
import ValidationQueue from './ValidationQueue';
import ValidationHistory from './ValidationHistory';
import ValidationStats from './ValidationStats';
import ValidationModal from './ValidationModal';
import { FiRefreshCw, FiDownload, FiUpload, FiFilter, FiSearch } from 'react-icons/fi';

const ValidationDashboard: React.FC = () => {
  const {
    queue,
    history,
    stats,
    isOnline,
    isSyncing,
    lastSync,
    addValidation,
    retryValidation,
    forceSync,
    clearQueue,
    clearHistory
  } = useOfflineValidation();

  const { showNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'stats'>('queue');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ValidationWorkflow | null>(null);
  const [filters, setFilters] = useState<ValidationFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      showNotification({
        type: 'info',
        message: `${queue.length} validations en attente seront synchronisées`
      });
    }
  }, [isOnline, queue.length]);

  const handleForceSync = async () => {
    try {
      await forceSync();
      showNotification({
        type: 'success',
        message: 'Synchronisation forcée réussie'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Erreur lors de la synchronisation'
      });
    }
  };

  const handleRetry = async (workflowId: string) => {
    try {
      await retryValidation(workflowId);
      showNotification({
        type: 'success',
        message: 'Validation renvoyée avec succès'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Erreur lors du renvoi'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ValidationStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      published: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      fiche_pedagogique: '📋',
      cahier_journal: '📖',
      bulletin: '📊',
      attestation: '📄'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflows de Validation</h1>
              <p className="text-gray-600 mt-1">
                Gérez les validations offline et synchronisez avec le serveur
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              
              <button
                onClick={handleForceSync}
                disabled={isSyncing || !isOnline}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalWorkflows}</div>
              <div className="text-sm text-blue-800">Total workflows</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingValidations}</div>
              <div className="text-sm text-yellow-800">En attente</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approvedWorkflows}</div>
              <div className="text-sm text-green-800">Approuvés</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejectedWorkflows}</div>
              <div className="text-sm text-red-800">Rejetés</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'queue', label: 'File d\'attente', count: queue.length },
                { id: 'history', label: 'Historique', count: history.length },
                { id: 'stats', label: 'Statistiques' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'queue' && (
            <ValidationQueue
              queue={queue}
              onRetry={handleRetry}
              onValidate={setSelectedWorkflow}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getTypeIcon={getTypeIcon}
            />
          )}
          
          {activeTab === 'history' && (
            <ValidationHistory
              history={history}
              onRetry={handleRetry}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getTypeIcon={getTypeIcon}
            />
          )}
          
          {activeTab === 'stats' && (
            <ValidationStats
              stats={stats}
              formatDate={formatDate}
            />
          )}
        </div>

        {/* Validation Modal */}
        {selectedWorkflow && (
          <ValidationModal
            workflow={selectedWorkflow}
            onClose={() => setSelectedWorkflow(null)}
            onValidate={addValidation}
          />
        )}
      </div>
    </div>
  );
};

export default ValidationDashboard;
