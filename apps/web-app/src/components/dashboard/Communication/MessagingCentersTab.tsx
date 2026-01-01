import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter
} from 'lucide-react';

const MessagingCentersTab: React.FC = () => {
  const [activeCenter, setActiveCenter] = useState<'email' | 'sms' | 'whatsapp'>('email');

  const centers = [
    {
      id: 'email' as const,
      name: 'Centre Email',
      icon: Mail,
      description: 'Gestion des emails avec éditeur riche',
      color: 'from-blue-600 to-blue-700',
      stats: { sent: 1247, delivered: 1198, read: 892, failed: 12 }
    },
    {
      id: 'sms' as const,
      name: 'Centre SMS',
      icon: Phone,
      description: 'Envoi rapide de SMS aux parents',
      color: 'from-green-600 to-green-700',
      stats: { sent: 856, delivered: 834, read: 756, failed: 8 }
    },
    {
      id: 'whatsapp' as const,
      name: 'Centre WhatsApp',
      icon: MessageSquare,
      description: 'Messages WhatsApp Business',
      color: 'from-emerald-600 to-emerald-700',
      stats: { sent: 423, delivered: 418, read: 398, failed: 2 }
    }
  ];

  const activeData = centers.find(c => c.id === activeCenter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Centres de Messagerie
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos communications par canal avec une interface unifiée
        </p>
      </div>

      {/* Navigation des centres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {centers.map((center) => {
          const Icon = center.icon;
          const isActive = activeCenter === center.id;
          
          return (
            <button
              key={center.id}
              onClick={() => setActiveCenter(center.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${center.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {center.stats.sent}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    envoyés
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {center.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {center.description}
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">{center.stats.delivered}</div>
                  <div className="text-gray-500">Délivrés</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-600">{center.stats.read}</div>
                  <div className="text-gray-500">Lus</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{center.stats.failed}</div>
                  <div className="text-gray-500">Échecs</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Centre actif */}
      {activeData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${activeData.color}`}>
                  <activeData.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {activeData.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeData.description}
                  </p>
                </div>
              </div>
              
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau message
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Interface spécifique au centre */}
            {activeCenter === 'email' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Inbox */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                          <Inbox className="w-4 h-4 mr-2" />
                          Boîte de réception
                        </h4>
                        <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          12
                        </span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Réponse parent - Marie Dubois
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              Merci pour l'information concernant...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Composition */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Composer un email
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Destinataires
                          </label>
                          <input
                            type="text"
                            placeholder="Sélectionner les contacts..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Objet
                          </label>
                          <input
                            type="text"
                            placeholder="Objet du message..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message
                          </label>
                          <textarea
                            rows={6}
                            placeholder="Votre message..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                            Brouillon
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Send className="w-4 h-4 mr-2 inline" />
                            Envoyer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCenter === 'sms' && (
              <div className="text-center py-12">
                <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Centre SMS
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interface d'envoi rapide de SMS aux parents d'élèves
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau SMS
                </button>
              </div>
            )}

            {activeCenter === 'whatsapp' && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Centre WhatsApp
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Envoi de messages WhatsApp Business avec support multimédia
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau message WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCentersTab;
