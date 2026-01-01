import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Mail,
  Phone,
  Bell,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  BookOpen,
  BarChart3,
  MessageCircle,
  UserPlus,
  Zap
} from 'lucide-react';
import { useCommunicationData } from '../../hooks/useCommunicationData';
import ContactsTab from './Communication/ContactsTab';
import MessagingCentersTab from './Communication/MessagingCentersTab';
import TemplatesTab from './Communication/TemplatesTab';
import CampaignsTab from './Communication/CampaignsTab';
import SettingsTab from './Communication/SettingsTab';
import StatsTab from './Communication/StatsTab';

const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Utilisation du hook de données de communication
  const {
    contacts,
    messages,
    templates,
    campaigns,
    stats,
    loading,
    error,
    refreshData,
    clearError
  } = useCommunicationData();

  // Configuration des onglets
  const tabs = [
    {
      id: 'contacts',
      label: 'Répertoire',
      icon: Users,
      description: 'Gestion des contacts parents',
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'messaging',
      label: 'Centres de Message',
      icon: MessageCircle,
      description: 'Email, SMS, WhatsApp',
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: BookOpen,
      description: 'Modèles de messages',
      color: 'from-purple-600 to-purple-700'
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      icon: Zap,
      description: 'Envois groupés',
      color: 'from-orange-600 to-orange-700'
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: BarChart3,
      description: 'Rapports et analyses',
      color: 'from-indigo-600 to-indigo-700'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration technique',
      color: 'from-gray-600 to-gray-700'
    }
  ];

  // Statistiques calculées à partir des vraies données
  const communicationStats = useMemo(() => {
    if (!stats || !stats.byChannel) {
      return [
        { title: 'Messages envoyés', value: '0', change: '0%', icon: MessageSquare, color: 'from-blue-600 to-blue-700' },
        { title: 'SMS envoyés', value: '0', change: '0%', icon: Phone, color: 'from-green-600 to-green-700' },
        { title: 'Emails envoyés', value: '0', change: '0%', icon: Mail, color: 'from-purple-600 to-purple-700' },
        { title: 'Taux de lecture', value: '0%', change: '0%', icon: CheckCircle, color: 'from-orange-600 to-orange-700' }
      ];
    }

    return [
      {
        title: 'Messages envoyés',
        value: stats.totalMessages.toLocaleString(),
        change: '+12%', // TODO: Calculer la vraie tendance
        icon: MessageSquare,
        color: 'from-blue-600 to-blue-700'
      },
      {
        title: 'SMS envoyés',
        value: stats.byChannel?.sms?.sent?.toLocaleString() || '0',
        change: '+8%',
        icon: Phone,
        color: 'from-green-600 to-green-700'
      },
      {
        title: 'Emails envoyés',
        value: stats.byChannel?.email?.sent?.toLocaleString() || '0',
        change: '+15%',
        icon: Mail,
        color: 'from-purple-600 to-purple-700'
      },
      {
        title: 'Taux de lecture',
        value: `${Math.round(((stats.byChannel?.email?.readRate || 0) + (stats.byChannel?.sms?.readRate || 0) + (stats.byChannel?.whatsapp?.readRate || 0)) / 3)}%`,
        change: '+2.1%',
        icon: CheckCircle,
        color: 'from-orange-600 to-orange-700'
      }
    ];
  }, [stats]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold mb-2">Communication & Messagerie</h1>
              <p className="text-blue-100 text-lg">
                Plateforme unifiée pour toutes vos communications avec les parents d'élèves
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={refreshData}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Search className="w-4 h-4 mr-2" />
                Actualiser
              </button>
              <button 
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communicationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
                  role="tab"
                  aria-selected={isActive ? 'true' : 'false'}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : (
            <>
              {activeTab === 'contacts' && (
                <ContactsTab />
              )}
              
              {activeTab === 'messaging' && (
                <MessagingCentersTab />
              )}
              
              {activeTab === 'templates' && (
                <TemplatesTab />
              )}
              
              {activeTab === 'campaigns' && (
                <CampaignsTab />
              )}
              
              {activeTab === 'stats' && (
                <StatsTab />
              )}
              
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communication;
