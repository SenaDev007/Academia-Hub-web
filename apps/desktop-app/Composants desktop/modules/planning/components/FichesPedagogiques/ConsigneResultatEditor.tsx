import React, { useState } from 'react';
import { Plus, Trash2, Clock, ArrowUp, ArrowDown, Save, Eye, Edit3 } from 'lucide-react';

const ConsigneResultatEditor = ({ phases, onChange, dureeTotal }) => {
  const [editingPhase, setEditingPhase] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const ajouterPhase = () => {
    const nouvellePhase = {
      id: `phase_${Date.now()}`,
      nom: 'Nouvelle phase',
      consignes: '',
      resultats: '',
      duree: 0,
      ordre: phases.length + 1
    };
    onChange([...phases, nouvellePhase]);
  };

  const supprimerPhase = (phaseId) => {
    onChange(phases.filter(p => p.id !== phaseId));
  };

  const deplacerPhase = (phaseId, direction) => {
    const index = phases.findIndex(p => p.id === phaseId);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < phases.length - 1)
    ) {
      const newPhases = [...phases];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newPhases[index], newPhases[targetIndex]] = [newPhases[targetIndex], newPhases[index]];
      
      // Mettre à jour les ordres
      newPhases.forEach((phase, idx) => {
        phase.ordre = idx + 1;
      });
      
      onChange(newPhases);
    }
  };

  const updatePhase = (phaseId, field, value) => {
    onChange(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, [field]: value }
        : phase
    ));
  };

  const dureeUtilisee = phases.reduce((total, phase) => total + (phase.duree || 0), 0);
  const dureeRestante = dureeTotal - dureeUtilisee;

  const renderTableauPreview = () => (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 grid grid-cols-12 border-b border-gray-300">
        <div className="col-span-1 p-3 border-r border-gray-300 font-semibold text-center">N°</div>
        <div className="col-span-6 p-3 border-r border-gray-300 font-semibold text-center">Consignes</div>
        <div className="col-span-5 p-3 font-semibold text-center">Résultats attendus</div>
      </div>
      
      {phases.map((phase, index) => (
        <div key={phase.id} className="grid grid-cols-12 border-b border-gray-200 min-h-[100px]">
          <div className="col-span-1 p-3 border-r border-gray-300 bg-gray-50 text-center">
            <div className="font-medium">{index + 1}</div>
            <div className="text-xs text-gray-600 mt-1">{phase.duree}min</div>
          </div>
          
          <div className="col-span-6 p-3 border-r border-gray-300">
            <div className="font-medium text-sm mb-2">{phase.nom}</div>
            <div className="text-sm text-justify whitespace-pre-wrap">{phase.consignes}</div>
          </div>
          
          <div className="col-span-5 p-3">
            <div className="text-sm text-justify whitespace-pre-wrap">{phase.resultats}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableauEdition = () => (
    <div className="space-y-4">
      {phases.map((phase, index) => (
        <div key={phase.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                Phase {index + 1}
              </span>
              <input
                type="text"
                value={phase.nom}
                onChange={(e) => updatePhase(phase.id, 'nom', e.target.value)}
                className="font-medium border-none bg-transparent focus:bg-white focus:border focus:border-gray-300 rounded px-2 py-1"
                placeholder="Nom de la phase"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={phase.duree || ''}
                  onChange={(e) => updatePhase(phase.id, 'duree', parseInt(e.target.value) || 0)}
                  className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="0"
                />
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              
              <button
                onClick={() => deplacerPhase(phase.id, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => deplacerPhase(phase.id, 'down')}
                disabled={index === phases.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => supprimerPhase(phase.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consignes et activités
              </label>
              <textarea
                value={phase.consignes}
                onChange={(e) => updatePhase(phase.id, 'consignes', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                rows="6"
                placeholder="Décrivez les consignes, activités et méthodes pour cette phase..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résultats attendus
              </label>
              <textarea
                value={phase.resultats}
                onChange={(e) => updatePhase(phase.id, 'resultats', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                rows="6"
                placeholder="Décrivez les résultats et productions attendus..."
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Éditeur de déroulement</h3>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Durée totale:</span> {dureeTotal} min
          </div>
          <div className={`text-sm px-3 py-1 rounded-full ${
            dureeRestante >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <span className="font-medium">Restant:</span> {dureeRestante} min
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Éditer' : 'Aperçu'}
            </button>
            
            <button
              onClick={ajouterPhase}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter une phase
            </button>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {dureeRestante < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Dépassement de durée</h4>
          <p className="text-sm text-red-800">
            La durée totale des phases ({dureeUtilisee} min) dépasse la durée prévue ({dureeTotal} min).
            Veuillez ajuster les durées.
          </p>
        </div>
      )}

      {phases.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Aucune phase définie</h4>
          <p className="text-sm text-yellow-800">
            Commencez par ajouter les phases obligatoires : Préliminaires, Introduction, Réalisation, Retour.
          </p>
        </div>
      )}

      {/* Contenu principal */}
      {previewMode ? renderTableauPreview() : renderTableauEdition()}

      {/* Conseils pédagogiques */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Conseils pour le déroulement</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Préliminaires (5-10 min):</strong> Appel, rappel séance précédente, présentation objectifs</p>
          <p>• <strong>Introduction (10-15 min):</strong> Motivation, situation déclenchante, problématique</p>
          <p>• <strong>Réalisation (25-35 min):</strong> Activités principales d'apprentissage, exercices</p>
          <p>• <strong>Retour (5-10 min):</strong> Synthèse, évaluation, devoirs, annonce séance suivante</p>
        </div>
      </div>
    </div>
  );
};

export default ConsigneResultatEditor;