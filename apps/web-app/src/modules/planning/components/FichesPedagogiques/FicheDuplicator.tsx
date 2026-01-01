import React, { useState } from 'react';
import { Copy, Calendar, Users, BookOpen, Settings, Check, X } from 'lucide-react';

const FicheDuplicator = ({ fiche, onDuplicate, onClose, niveauxScolaires }) => {
  const [duplicateData, setDuplicateData] = useState({
    titre: `${fiche.titre} - Copie`,
    date: '',
    classe: fiche.classe,
    niveauScolaire: fiche.niveauScolaire,
    matiere: fiche.matiere,
    adaptations: {
      changerDate: true,
      changerClasse: false,
      adapterContenu: true,
      conserverValidation: false
    }
  });

  const [selectedAdaptations, setSelectedAdaptations] = useState([]);

  const adaptationsDisponibles = [
    {
      id: 'niveau',
      nom: 'Adapter au niveau',
      description: 'Ajuster le vocabulaire et la complexité selon le niveau',
      icon: Users
    },
    {
      id: 'duree',
      nom: 'Ajuster la durée',
      description: 'Recalculer les temps selon les contraintes',
      icon: Calendar
    },
    {
      id: 'competences',
      nom: 'Réviser les compétences',
      description: 'Adapter les compétences au nouveau contexte',
      icon: BookOpen
    },
    {
      id: 'materiel',
      nom: 'Adapter le matériel',
      description: 'Ajuster selon les ressources disponibles',
      icon: Settings
    }
  ];

  const handleDuplicate = () => {
    const nouvelleFiche = {
      ...fiche,
      id: Date.now(),
      titre: duplicateData.titre,
      date: duplicateData.date,
      classe: duplicateData.classe,
      niveauScolaire: duplicateData.niveauScolaire,
      statut: 'brouillon',
      adaptations: selectedAdaptations,
      dateCreation: new Date().toISOString(),
      ficheOriginale: fiche.id
    };

    onDuplicate(nouvelleFiche);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Copy className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Dupliquer la fiche pédagogique</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Informations de base */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Fiche originale</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Titre:</span> {fiche.titre}</p>
              <p><span className="font-medium">Matière:</span> {fiche.matiere}</p>
              <p><span className="font-medium">Classe:</span> {fiche.classe}</p>
              <p><span className="font-medium">Date:</span> {fiche.date}</p>
            </div>
          </div>

          {/* Paramètres de duplication */}
          <div className="space-y-4">
            <h4 className="font-medium">Paramètres de la nouvelle fiche</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau titre
                </label>
                <input
                  type="text"
                  value={duplicateData.titre}
                  onChange={(e) => setDuplicateData({...duplicateData, titre: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvelle date
                </label>
                <input
                  type="date"
                  value={duplicateData.date}
                  onChange={(e) => setDuplicateData({...duplicateData, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau scolaire
                </label>
                <select
                  value={duplicateData.niveauScolaire}
                  onChange={(e) => setDuplicateData({
                    ...duplicateData, 
                    niveauScolaire: e.target.value,
                    classe: ''
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {Object.entries(niveauxScolaires).map(([key, niveau]) => (
                    <option key={key} value={key}>{niveau.nom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe
                </label>
                <select
                  value={duplicateData.classe}
                  onChange={(e) => setDuplicateData({...duplicateData, classe: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {(niveauxScolaires[duplicateData.niveauScolaire]?.classes || []).map(classe => (
                    <option key={classe} value={classe}>{classe}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Adaptations automatiques */}
          <div className="space-y-4">
            <h4 className="font-medium">Adaptations automatiques</h4>
            <p className="text-sm text-gray-600">
              Sélectionnez les adaptations à appliquer automatiquement
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {adaptationsDisponibles.map(adaptation => {
                const Icon = adaptation.icon;
                const isSelected = selectedAdaptations.includes(adaptation.id);
                
                return (
                  <div
                    key={adaptation.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAdaptations(prev => prev.filter(id => id !== adaptation.id));
                      } else {
                        setSelectedAdaptations(prev => [...prev, adaptation.id]);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{adaptation.nom}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {adaptation.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options avancées */}
          <div className="space-y-3">
            <h4 className="font-medium">Options avancées</h4>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={duplicateData.adaptations.conserverValidation}
                  onChange={(e) => setDuplicateData({
                    ...duplicateData,
                    adaptations: {
                      ...duplicateData.adaptations,
                      conserverValidation: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Conserver l'historique de validation</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={duplicateData.adaptations.adapterContenu}
                  onChange={(e) => setDuplicateData({
                    ...duplicateData,
                    adaptations: {
                      ...duplicateData.adaptations,
                      adapterContenu: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Adapter automatiquement le contenu</span>
              </label>
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
            onClick={handleDuplicate}
            disabled={!duplicateData.titre || !duplicateData.date}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Dupliquer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};

export default FicheDuplicator;