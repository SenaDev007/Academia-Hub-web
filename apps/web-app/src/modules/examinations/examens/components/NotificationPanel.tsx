import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Users, 
  FileText,
  Trophy,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
  context?: {
    type: 'bulletin' | 'tableau_honneur' | 'conseil_classe' | 'general';
    data?: any;
  };
}

export function NotificationPanel({ onClose, context }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState('T1');
  const [messageType, setMessageType] = useState('bulletin_disponible');
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const classes = ['CM2-A', 'CM2-B', '6ème A', '6ème B', '3ème C', 'Terminale C'];
  const trimestres = ['T1', 'T2', 'T3'];
  
  const messageTypes = [
    { id: 'bulletin_disponible', label: 'Bulletin Disponible', icon: FileText },
    { id: 'conseil_classe', label: 'Conseil de Classe', icon: Users },
    { id: 'reunion_parents', label: 'Réunion Parents', icon: Calendar },
    { id: 'tableau_honneur', label: 'Tableau d\'Honneur', icon: Trophy },
    { id: 'custom', label: 'Message Personnalisé', icon: MessageSquare }
  ];

  const handleSendSMS = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/sms/parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classe_id: 1, // À adapter selon la classe sélectionnée
          trimestre_id: 1, // À adapter selon le trimestre
          message_type: messageType,
          custom_message: customMessage
        })
      });
      
      const data = await response.json();
      setResults(data.results || []);
      
      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      alert('❌ Erreur lors de l\'envoi des SMS');
    }
    setIsLoading(false);
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      if (context?.type === 'bulletin' && context.data) {
        // Envoi de bulletin spécifique
        const response = await fetch('/api/notifications/email/bulletin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eleve_id: context.data.eleve_id,
            trimestre_id: context.data.trimestre_id,
            parent_email: context.data.parent_email
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('✅ Bulletin envoyé par email !');
        } else {
          alert(`❌ Erreur: ${data.message}`);
        }
      } else if (context?.type === 'tableau_honneur') {
        // Envoi de tableau d'honneur
        const response = await fetch('/api/notifications/tableau-honneur', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trimestre_id: 1,
            classe_id: selectedClass ? 1 : null,
            type_envoi: 'email',
            destinataires: recipients
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('✅ Tableau d\'honneur envoyé !');
        } else {
          alert(`❌ Erreur: ${data.message}`);
        }
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('❌ Erreur lors de l\'envoi par email');
    }
    setIsLoading(false);
  };

  const handleSendWhatsApp = async () => {
    setIsLoading(true);
    try {
      if (context?.type === 'bulletin' && context.data) {
        // Envoi de bulletin par WhatsApp
        const response = await fetch('/api/notifications/whatsapp/bulletin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eleve_id: context.data.eleve_id,
            trimestre_id: context.data.trimestre_id,
            parent_phone: context.data.parent_phone
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('✅ Bulletin envoyé par WhatsApp !');
        } else {
          alert(`❌ Erreur: ${data.message}`);
        }
      } else if (context?.type === 'tableau_honneur') {
        // Envoi de tableau d'honneur par WhatsApp
        const response = await fetch('/api/notifications/tableau-honneur', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trimestre_id: 1,
            classe_id: selectedClass ? 1 : null,
            type_envoi: 'whatsapp',
            destinataires: recipients
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('✅ Tableau d\'honneur envoyé par WhatsApp !');
        } else {
          alert(`❌ Erreur: ${data.message}`);
        }
      }
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      alert('❌ Erreur lors de l\'envoi par WhatsApp');
    }
    setIsLoading(false);
  };

  const getContextTitle = () => {
    switch (context?.type) {
      case 'bulletin':
        return '📋 Envoi de Bulletin';
      case 'tableau_honneur':
        return '🏆 Envoi Tableau d\'Honneur';
      case 'conseil_classe':
        return '👥 Notification Conseil de Classe';
      default:
        return '📱 Centre de Notifications';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {getContextTitle()}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Onglets */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'sms'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="h-4 w-4 mr-2" />
              SMS
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </button>
          </div>

          {/* Configuration générale */}
          {!context?.data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(classe => (
                    <option key={classe} value={classe}>{classe}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
                <select
                  value={selectedTrimester}
                  onChange={(e) => setSelectedTrimester(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {trimestres.map(trimestre => (
                    <option key={trimestre} value={trimestre}>
                      {trimestre === 'T1' ? '1er Trimestre' : 
                       trimestre === 'T2' ? '2ème Trimestre' : 
                       '3ème Trimestre'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Message</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {messageTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Message personnalisé */}
          {messageType === 'custom' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Personnalisé</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Saisissez votre message personnalisé..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Variables disponibles: {'{nom}'}, {'{prenom}'}, {'{classe}'}
              </p>
            </div>
          )}

          {/* Contenu spécifique par onglet */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📱 Envoi SMS aux Parents</h4>
                <p className="text-sm text-blue-800">
                  Les SMS seront envoyés aux numéros de téléphone des parents enregistrés.
                </p>
                <div className="mt-3">
                  <p className="text-xs text-blue-700">
                    <strong>Coût estimé:</strong> 0.05€ par SMS • <strong>Destinataires:</strong> ~{selectedClass ? '30' : '150'} parents
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendSMS}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Envoi en cours...' : 'Envoyer SMS'}
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">📧 Envoi Email aux Parents</h4>
                <p className="text-sm text-green-800">
                  {context?.type === 'bulletin' 
                    ? 'Le bulletin sera envoyé en pièce jointe PDF.'
                    : context?.type === 'tableau_honneur'
                    ? 'Le tableau d\'honneur sera envoyé en pièce jointe PDF.'
                    : 'Les emails seront envoyés avec les informations détaillées.'
                  }
                </p>
              </div>

              <button
                onClick={handleSendEmail}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Envoi en cours...' : 'Envoyer Email'}
              </button>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">💬 Envoi WhatsApp aux Parents</h4>
                <p className="text-sm text-green-800">
                  {context?.type === 'bulletin' 
                    ? 'Le bulletin sera envoyé avec un message personnalisé et le PDF en pièce jointe.'
                    : context?.type === 'tableau_honneur'
                    ? 'Le tableau d\'honneur sera envoyé avec félicitations.'
                    : 'Les messages WhatsApp seront envoyés avec formatage riche.'
                  }
                </p>
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600">
                    <strong>⚠️ Prérequis:</strong> WhatsApp Web doit être connecté sur le serveur
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Envoi en cours...' : 'Envoyer WhatsApp'}
              </button>
            </div>
          )}

          {/* Résultats d'envoi */}
          {results.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📊 Résultats d'Envoi</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm">
                        {result.eleve} - {result.contact}
                      </span>
                    </div>
                    <span className="text-xs">
                      {result.success ? '✅ Envoyé' : '❌ Échec'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <strong>Résumé:</strong> {results.filter(r => r.success).length} envoyés, {results.filter(r => !r.success).length} échecs
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}