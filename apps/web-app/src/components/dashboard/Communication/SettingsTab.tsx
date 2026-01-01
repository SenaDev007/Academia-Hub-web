import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Phone,
  MessageSquare,
  Server,
  Key,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCommunicationData } from '../../../hooks/useCommunicationData';

const SettingsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'smtp' | 'sms' | 'whatsapp' | 'integrations'>('smtp');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Utilisation des vraies données depuis le hook
  const {
    smtpConfigs,
    smsConfigs,
    whatsappConfigs,
    loading,
    error,
    createSMTPConfig,
    updateSMTPConfig,
    deleteSMTPConfig,
    testSMTPConfig,
    createSMSConfig,
    updateSMSConfig,
    deleteSMSConfig,
    testSMSConfig,
    createWhatsAppConfig,
    updateWhatsAppConfig,
    deleteWhatsAppConfig,
    testWhatsAppConfig,
    fetchSMTPConfigs,
    fetchSMSConfigs,
    fetchWhatsAppConfigs
  } = useCommunicationData();

  // Données par défaut si pas de données réelles
  const defaultSMTPConfigs: any[] = [];
  const defaultSMSConfigs: any[] = [];
  const defaultWhatsAppConfigs: any[] = [];

  const sections = [
    {
      id: 'smtp' as const,
      name: 'Configuration SMTP',
      icon: Mail,
      description: 'Paramètres des serveurs email',
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'sms' as const,
      name: 'Passerelles SMS',
      icon: Phone,
      description: 'Configuration des opérateurs SMS',
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'whatsapp' as const,
      name: 'WhatsApp Business',
      icon: MessageSquare,
      description: 'API WhatsApp Business',
      color: 'from-emerald-600 to-emerald-700'
    },
    {
      id: 'integrations' as const,
      name: 'Intégrations',
      icon: Server,
      description: 'Automatisations et webhooks',
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <TestTube className="w-4 h-4 text-gray-500" />;
    }
  };

  const togglePasswordVisibility = (configId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Paramètres Techniques
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configuration des canaux de communication et intégrations
        </p>
      </div>

      {/* Navigation des sections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {section.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {section.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Section active */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${sections.find(s => s.id === activeSection)?.color}`}>
                {React.createElement(sections.find(s => s.id === activeSection)?.icon || Settings, {
                  className: "w-5 h-5 text-white"
                })}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {sections.find(s => s.id === activeSection)?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Configuration SMTP */}
          {activeSection === 'smtp' && (
            <div className="space-y-4">
              {(smtpConfigs || defaultSMTPConfigs).map((config) => (
                <div key={config.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {config.name}
                        </h4>
                        {config.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                            Par défaut
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          {getTestStatusIcon(config.testStatus)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {config.testStatus === 'success' ? 'Testé avec succès' : 
                             config.testStatus === 'failed' ? 'Test échoué' : 'Non testé'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Serveur:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.host}:{config.port}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Utilisateur:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.username}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Expéditeur:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.fromName} &lt;{config.fromEmail}&gt;
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Sécurité:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.secure ? 'TLS/SSL' : 'Non sécurisé'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Tester la configuration"
                      >
                        <TestTube className="w-4 h-4" />
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

          {/* Configuration SMS */}
          {activeSection === 'sms' && (
            <div className="space-y-4">
              {(smsConfigs || defaultSMSConfigs).map((config) => (
                <div key={config.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {config.name}
                        </h4>
                        {config.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300">
                            Par défaut
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          {getTestStatusIcon(config.testStatus)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {config.testStatus === 'success' ? 'Testé avec succès' : 
                             config.testStatus === 'failed' ? 'Test échoué' : 'Non testé'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Opérateur:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {config.provider.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Sender ID:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.senderId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Coût/SMS:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.costPerSMS} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Tester la configuration"
                      >
                        <TestTube className="w-4 h-4" />
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

          {/* Configuration WhatsApp */}
          {activeSection === 'whatsapp' && (
            <div className="space-y-4">
              {(whatsappConfigs || defaultWhatsAppConfigs).map((config) => (
                <div key={config.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {config.name}
                        </h4>
                        {config.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                            Par défaut
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          {getTestStatusIcon(config.testStatus)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {config.testStatus === 'success' ? 'Testé avec succès' : 
                             config.testStatus === 'failed' ? 'Test échoué' : 'Non testé'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Fournisseur:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {config.provider.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Numéro:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {config.phoneNumberId}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Tester la configuration"
                      >
                        <TestTube className="w-4 h-4" />
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

          {/* Intégrations */}
          {activeSection === 'integrations' && (
            <div className="text-center py-12">
              <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Intégrations Automatiques
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Configurez les déclencheurs automatiques depuis les autres modules
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle intégration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
