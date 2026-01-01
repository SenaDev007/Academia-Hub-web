import React, { useState, useEffect } from 'react';
import { Key, Mail, CheckCircle, Clock, AlertCircle, Send, Copy, Eye } from 'lucide-react';
import LicenseService from '../services/licenseService';

interface ProductKeyRequest {
  id: string;
  productKey: string;
  schoolName: string;
  promoterFirstName: string;
  promoterLastName: string;
  promoterEmail: string;
  status: string;
  createdAt: string;
  activationKey?: string;
}

const LicenseAdmin: React.FC = () => {
  const [requests, setRequests] = useState<ProductKeyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ProductKeyRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      // Ici vous appelleriez votre service pour récupérer les demandes
      // const pendingKeys = await LicenseService.getPendingProductKeys();
      // setRequests(pendingKeys);
      
      // Simulation pour l'exemple
      const mockRequests: ProductKeyRequest[] = [
        {
          id: '1',
          productKey: 'ABCD-EFGH-IJKL-MNOP',
          schoolName: 'École Test de Démonstration',
          promoterFirstName: 'Jean',
          promoterLastName: 'Test',
          promoterEmail: 'jean.test@ecole.com',
          status: 'pending',
          createdAt: new Date().toISOString(),
          activationKey: 'WXYZ-1234-5678-9ABC'
        }
      ];
      setRequests(mockRequests);
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error('Error loading requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sendActivationKey = async (request: ProductKeyRequest) => {
    try {
      if (!request.activationKey) {
        alert('Aucune clé d\'activation disponible pour cette demande');
        return;
      }

      // Ici vous appelleriez votre service pour envoyer la clé d'activation
      // await LicenseService.sendActivationKeyEmail(request.activationKey, request.promoterEmail, request.schoolName);
      
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Clé d'activation envoyée avec succès à ${request.promoterEmail}`);
      
      // Marquer comme envoyée
      const updatedRequests = requests.map(req => 
        req.id === request.id ? { ...req, status: 'sent' } : req
      );
      setRequests(updatedRequests);
    } catch (err) {
      alert('Erreur lors de l\'envoi de la clé d\'activation');
      console.error('Error sending activation key:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'sent':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'sent':
        return 'Envoyée';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRequests}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration des Licences</h1>
              <p className="text-gray-600 mt-1">Gérez les demandes de licences et envoyez les clés d'activation</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadRequests}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Demandes de licences ({requests.length})
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-600">Aucune demande de licence en attente pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.schoolName}
                        </h3>
                        <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-2">{getStatusText(request.status)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Promoteur:</span> {request.promoterFirstName} {request.promoterLastName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {request.promoterEmail}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Clé produit:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {request.productKey}
                          </code>
                          <button
                            onClick={() => copyToClipboard(request.productKey, 'product')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Copier la clé produit"
                          >
                            {copied === 'product' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        {request.activationKey && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Clé d'activation:</span>
                            <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono">
                              {request.activationKey}
                            </code>
                            <button
                              onClick={() => copyToClipboard(request.activationKey!, 'activation')}
                              className="text-green-600 hover:text-green-800"
                              title="Copier la clé d'activation"
                            >
                              {copied === 'activation' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      {request.status === 'pending' && request.activationKey && (
                        <button
                          onClick={() => sendActivationKey(request)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                          title="Envoyer la clé d'activation"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Instructions de vérification croisée
          </h3>
          
          <div className="text-blue-800 space-y-2">
            <p><strong>1.</strong> Le système génère automatiquement la clé produit ET la clé d'activation complète</p>
            <p><strong>2.</strong> Vous recevez un email avec les deux clés</p>
            <p><strong>3.</strong> Le promoteur vous envoie manuellement la clé produit qu'il voit dans l'application</p>
            <p><strong>4.</strong> Vous comparez les deux clés produit pour vérification croisée</p>
            <p><strong>5.</strong> Si elles correspondent, vous envoyez la clé d'activation complète au promoteur</p>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Détails de la demande</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Informations de l'école</h3>
                <p className="text-gray-600">{selectedRequest.schoolName}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Informations du promoteur</h3>
                <p className="text-gray-600">
                  {selectedRequest.promoterFirstName} {selectedRequest.promoterLastName}
                </p>
                <p className="text-gray-600">{selectedRequest.promoterEmail}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Clés</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Clé produit:</span>
                    <code className="block bg-gray-100 p-2 rounded mt-1 font-mono">
                      {selectedRequest.productKey}
                    </code>
                  </div>
                  
                  {selectedRequest.activationKey && (
                    <div>
                      <span className="text-sm text-gray-600">Clé d'activation:</span>
                      <code className="block bg-green-100 p-2 rounded mt-1 font-mono">
                        {selectedRequest.activationKey}
                      </code>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Statut</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="ml-2">{getStatusText(selectedRequest.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Fermer
                </button>
                
                {selectedRequest.status === 'pending' && selectedRequest.activationKey && (
                  <button
                    onClick={() => {
                      sendActivationKey(selectedRequest);
                      setShowDetails(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer la clé d'activation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseAdmin;
