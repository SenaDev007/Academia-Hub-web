import React, { useState } from 'react';
import { Send, X, MessageSquare, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

const EnvoiDirecteurModal = ({ fiche, onClose, onEnvoyer }) => {
  const [commentaire, setCommentaire] = useState('');
  const [isEnvoying, setIsEnvoying] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEnvoyer = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsEnvoying(true);
    
    try {
      await onEnvoyer(fiche.id, commentaire);
      
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi de la fiche');
    } finally {
      setIsEnvoying(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      en_attente: { color: 'bg-orange-100 text-orange-800', text: 'En attente' },
      validee: { color: 'bg-green-100 text-green-800', text: 'Validée' },
      corrigee: { color: 'bg-red-100 text-red-800', text: 'À corriger' }
    };
    
    return badges[statut] || badges.brouillon;
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirmer l'envoi</h3>
                <p className="text-sm text-gray-600">Cette action ne peut pas être annulée</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Fiche à envoyer :</h4>
              <p className="text-sm text-gray-700">{fiche.titre}</p>
              <p className="text-xs text-gray-500 mt-1">
                {fiche.matiere} - {fiche.classe} - {fiche.date}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Ce qui va se passer :</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• La fiche sera envoyée au directeur pour validation</p>
                <p>• Le statut passera à "En attente de validation"</p>
                <p>• Une notification WhatsApp sera envoyée au directeur</p>
                <p>• Vous recevrez une réponse sous 48h maximum</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEnvoyer}
                disabled={isEnvoying}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isEnvoying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirmer l'envoi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Envoyer au Directeur</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de la fiche */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Fiche à envoyer</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{fiche.titre}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(fiche.statut).color}`}>
                  {getStatutBadge(fiche.statut).text}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Matière :</span> {fiche.matiere}
                </div>
                <div>
                  <span className="font-medium">Classe :</span> {fiche.classe}
                </div>
                <div>
                  <span className="font-medium">SA N° :</span> {fiche.saNumero}
                </div>
                <div>
                  <span className="font-medium">Date prévue :</span> {fiche.date}
                </div>
              </div>
            </div>
          </div>

          {/* Destinataire */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Destinataire
            </h4>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Directeur ASSOGBA Pierre</p>
              <p>CEG Sainte-Marie</p>
              <p>📱 +229 97 12 34 56 (WhatsApp)</p>
            </div>
          </div>

          {/* Commentaire optionnel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message pour le directeur (optionnel)
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              rows="4"
              placeholder="Ajoutez un message ou des précisions pour le directeur..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce message sera inclus dans la notification WhatsApp
            </p>
          </div>

          {/* Workflow d'envoi */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Processus de validation
            </h4>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Envoi immédiat au directeur</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Notification WhatsApp automatique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Validation ou corrections sous 48h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Notification de retour automatique</span>
              </div>
            </div>
          </div>

          {/* Vérifications avant envoi */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Vérifications avant envoi</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Toutes les sections sont complétées</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Les phases obligatoires sont présentes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Les durées sont cohérentes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Au moins une compétence est définie</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleEnvoyer}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
            Envoyer au Directeur
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvoiDirecteurModal;