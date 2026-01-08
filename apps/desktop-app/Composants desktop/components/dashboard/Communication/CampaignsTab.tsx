import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useCommunicationData } from '../../../hooks/useCommunicationData';

const CampaignsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled'>('all');

  // Utilisation des vraies données depuis le hook
  const {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    stopCampaign,
    fetchCampaigns
  } = useCommunicationData();

  // Données par défaut si pas de données réelles
  const defaultCampaigns: any[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-500" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const currentCampaigns = campaigns || defaultCampaigns;
  const filteredCampaigns = currentCampaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const campaignStats = {
    total: currentCampaigns.length,
    running: currentCampaigns.filter(c => c.status === 'running').length,
    scheduled: currentCampaigns.filter(c => c.status === 'scheduled').length,
    completed: currentCampaigns.filter(c => c.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Campagnes de Communication
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos envois groupés et campagnes automatisées
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle campagne
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{campaignStats.total}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">En cours</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{campaignStats.running}</p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Programmées</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{campaignStats.scheduled}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Terminées</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{campaignStats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une campagne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Programmée</option>
            <option value="running">En cours</option>
            <option value="completed">Terminée</option>
            <option value="paused">En pause</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucune campagne trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedStatus !== 'all'
                ? 'Aucune campagne ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre première campagne de communication.'
              }
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Créer une campagne
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(campaign.status)}
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      {campaign.type === 'recurring' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                          Récurrente
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {campaign.targetGroups.join(', ')}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {campaign.channels.join(', ')}
                      </div>
                      {campaign.scheduledAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(campaign.scheduledAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                    
                    {/* Statistiques de la campagne */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{campaign.totalMessages}</div>
                        <div className="text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{campaign.sentMessages}</div>
                        <div className="text-gray-500 dark:text-gray-400">Envoyés</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{campaign.deliveredMessages}</div>
                        <div className="text-gray-500 dark:text-gray-400">Délivrés</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600">{campaign.readMessages}</div>
                        <div className="text-gray-500 dark:text-gray-400">Lus</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{campaign.failedMessages}</div>
                        <div className="text-gray-500 dark:text-gray-400">Échecs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {campaign.status === 'running' && (
                      <button
                        className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                        title="Mettre en pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Reprendre"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Démarrer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsTab;
