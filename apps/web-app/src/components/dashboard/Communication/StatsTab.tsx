import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCommunicationData } from '../../../hooks/useCommunicationData';

const StatsTab: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all');

  // Utilisation des vraies données depuis le hook
  const {
    stats,
    loading,
    error,
    fetchStats
  } = useCommunicationData();

  // Données par défaut si pas de données réelles
  const defaultStats = {
    overview: {
      totalMessages: 0,
      totalContacts: 0,
      totalCampaigns: 0,
      averageReadRate: 0
    },
    byChannel: {
      email: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
        contacts: 0
      },
      sms: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
        contacts: 0
      },
      whatsapp: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
        contacts: 0
      }
    },
    trends: {
      messagesOverTime: []
    },
    topTemplates: []
  };

  // Utiliser les vraies données ou les données par défaut
  const currentStats = stats || defaultStats;

  // Filtrage des données selon la période et le canal
  const filteredStats = useMemo(() => {
    let filtered = { ...currentStats };
    
    // Filtrer par canal si nécessaire
    if (selectedChannel !== 'all') {
      filtered.byChannel = {
        [selectedChannel]: currentStats.byChannel[selectedChannel] || {
          sent: 0, delivered: 0, read: 0, failed: 0, deliveryRate: 0, readRate: 0, contacts: 0
        }
      };
    }
    
    return filtered;
  }, [currentStats, selectedChannel, selectedPeriod]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'sms':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Statistiques & Rapports
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analysez les performances de vos communications
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les canaux</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Messages Envoyés</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{filteredStats.overview.totalMessages.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% ce mois</span>
              </div>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Contacts Actifs</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{filteredStats.overview.totalContacts}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5% ce mois</span>
              </div>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Campagnes</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{filteredStats.overview.totalCampaigns}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+3 ce mois</span>
              </div>
            </div>
            <Calendar className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Taux de Lecture</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{filteredStats.overview.averageReadRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+2.1% ce mois</span>
              </div>
            </div>
            <Eye className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Statistiques par canal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Performance par Canal
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(filteredStats.byChannel).map(([channel, data]) => (
              <div key={channel} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getChannelIcon(channel)}
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {channel === 'whatsapp' ? 'WhatsApp' : channel}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {data.sent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      messages envoyés
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{data.sent}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Envoyés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{data.delivered}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Délivrés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{data.read}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Lus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{data.failed}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Échecs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-indigo-600">{data.readRate}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Taux lecture</div>
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taux de délivrance</span>
                    <span className="font-medium">{data.deliveryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${data.deliveryRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Templates les Plus Utilisés
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredStats.topTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>Utilisé {template.usageCount} fois</span>
                    <span>•</span>
                    <span>Délivrance: {template.deliveryRate}%</span>
                    <span>•</span>
                    <span>Lecture: {template.readRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique de tendance (placeholder) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Évolution des Messages
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Graphique de Tendance
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Visualisation des tendances de communication sur la période sélectionnée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
