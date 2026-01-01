import React, { useState } from 'react';
import { ArrowLeft, Send, MessageSquare, CheckCircle, XCircle, Clock, User, FileText, AlertTriangle } from 'lucide-react';

const ValidationWorkflow = ({ onClose }) => {
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState('');

  const fichesEnAttente = [
    {
      id: 1,
      titre: "Les fractions - Addition et soustraction",
      enseignant: "M. KOUASSI Jean",
      matiere: "Mathématiques",
      classe: "6ème",
      dateEnvoi: "2025-01-18 14:30",
      statut: "en_attente",
      priorite: "normale"
    },
    {
      id: 2,
      titre: "La conjugaison du présent",
      enseignant: "Mme ADJOVI Marie",
      matiere: "Français",
      classe: "5ème",
      dateEnvoi: "2025-01-17 10:15",
      statut: "en_attente",
      priorite: "urgente"
    },
    {
      id: 3,
      titre: "Les états de la matière",
      enseignant: "M. DOSSOU Paul",
      matiere: "Sciences Physiques",
      classe: "4ème",
      dateEnvoi: "2025-01-16 16:45",
      statut: "en_attente",
      priorite: "normale"
    }
  ];

  const handleValidation = (ficheId, actionType) => {
    if (!comment.trim() && actionType !== 'valider') {
      alert('Veuillez ajouter un commentaire');
      return;
    }

    // Ici on traiterait la validation
    console.log('Validation:', { ficheId, actionType, comment });
    
    // Simulation d'envoi WhatsApp
    const fiche = fichesEnAttente.find(f => f.id === ficheId);
    if (fiche) {
      console.log(`Notification WhatsApp envoyée à ${fiche.enseignant}`);
    }
    
    setComment('');
    setSelectedFiche(null);
  };

  const getPriorityBadge = (priorite) => {
    return priorite === 'urgente' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au tableau de bord
        </button>
        <h2 className="text-xl font-semibold">Workflow de Validation</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Liste des fiches en attente */}
        <div className="col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Fiches en attente de validation</h3>
            <p className="text-sm text-gray-600 mt-1">{fichesEnAttente.length} fiche(s) à traiter</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {fichesEnAttente.map(fiche => (
              <div 
                key={fiche.id}
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedFiche?.id === fiche.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedFiche(fiche)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{fiche.titre}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(fiche.priorite)}`}>
                        {fiche.priorite}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{fiche.enseignant}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{fiche.matiere}</span>
                        <span>{fiche.classe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Envoyé le {fiche.dateEnvoi}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de validation */}
        <div className="bg-white rounded-lg shadow">
          {selectedFiche ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Validation de la fiche</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">Titre:</span>
                  <p className="text-sm">{selectedFiche.titre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Enseignant:</span>
                  <p className="text-sm">{selectedFiche.enseignant}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Matière/Classe:</span>
                  <p className="text-sm">{selectedFiche.matiere} - {selectedFiche.classe}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires et suggestions
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows="4"
                    placeholder="Ajoutez vos commentaires, corrections ou suggestions..."
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleValidation(selectedFiche.id, 'valider')}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider la fiche
                  </button>
                  
                  <button
                    onClick={() => handleValidation(selectedFiche.id, 'corriger')}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Demander des corrections
                  </button>
                  
                  <button
                    onClick={() => handleValidation(selectedFiche.id, 'rejeter')}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter la fiche
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Notification automatique</p>
                      <p>L'enseignant recevra une notification sur la plateforme et par WhatsApp avec votre décision et vos commentaires.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une fiche à valider</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationWorkflow;