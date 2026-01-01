import React, { useState, useEffect } from 'react';
import { Clock, Plus, ArrowUp, ArrowDown, X } from 'lucide-react';

const DeroulementBuilder = ({ deroulement, dureeTotal, onChange }) => {
  const [phases, setPhases] = useState([
    { id: 'preliminaires', nom: 'Préliminaires', obligatoire: true, couleur: 'bg-blue-500' },
    { id: 'introduction', nom: 'Introduction', obligatoire: true, couleur: 'bg-green-500' },
    { id: 'realisation', nom: 'Réalisation', obligatoire: true, couleur: 'bg-orange-500' },
    { id: 'retour', nom: 'Retour', obligatoire: true, couleur: 'bg-purple-500' }
  ]);

  const [selectedPhase, setSelectedPhase] = useState('preliminaires');
  const [dureeRestante, setDureeRestante] = useState(dureeTotal);

  useEffect(() => {
    const dureeUtilisee = Object.values(deroulement).reduce((total, phase) => total + (phase.duree || 0), 0);
    setDureeRestante(dureeTotal - dureeUtilisee);
  }, [deroulement, dureeTotal]);

  const updatePhase = (phaseId, field, value) => {
    const updatedDeroulement = {
      ...deroulement,
      [phaseId]: {
        ...deroulement[phaseId],
        [field]: value
      }
    };
    onChange(updatedDeroulement);
  };

  const ajouterPhasePersonnalisee = () => {
    const nouvellePhasId = `phase_${Date.now()}`;
    const nouvellePhase = {
      id: nouvellePhasId,
      nom: 'Nouvelle phase',
      obligatoire: false,
      couleur: 'bg-gray-500'
    };
    
    setPhases([...phases, nouvellePhase]);
    onChange({
      ...deroulement,
      [nouvellePhasId]: { consignes: '', resultats: '', duree: 0 }
    });
  };

  const supprimerPhase = (phaseId) => {
    setPhases(phases.filter(p => p.id !== phaseId));
    const nouveauDeroulement = { ...deroulement };
    delete nouveauDeroulement[phaseId];
    onChange(nouveauDeroulement);
    
    if (selectedPhase === phaseId) {
      setSelectedPhase('preliminaires');
    }
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
      setPhases(newPhases);
    }
  };

  const renderTableauDeroulement = () => (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 grid grid-cols-12 border-b border-gray-300">
        <div className="col-span-1 p-3 border-r border-gray-300 font-semibold text-center">N°</div>
        <div className="col-span-6 p-3 border-r border-gray-300 font-semibold">Consignes</div>
        <div className="col-span-5 p-3 font-semibold">Résultats attendus</div>
      </div>
      
      {phases.map((phase, index) => {
        const phaseData = deroulement[phase.id] || { consignes: '', resultats: '', duree: 0 };
        
        return (
          <div key={phase.id} className="grid grid-cols-12 border-b border-gray-200 min-h-[120px]">
            <div className="col-span-1 p-3 border-r border-gray-300 bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium">{index + 1}</span>
                <div className={`w-3 h-3 rounded-full ${phase.couleur}`}></div>
                <div className="text-xs text-gray-600">
                  {phaseData.duree}min
                </div>
              </div>
            </div>
            
            <div className="col-span-6 p-3 border-r border-gray-300">
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{phase.nom}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={phaseData.duree || ''}
                      onChange={(e) => updatePhase(phase.id, 'duree', parseInt(e.target.value) || 0)}
                      className="w-12 text-xs border border-gray-300 rounded px-1 py-0.5"
                      placeholder="0"
                    />
                    <Clock className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
              </div>
              <textarea
                value={phaseData.consignes || ''}
                onChange={(e) => updatePhase(phase.id, 'consignes', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                rows="4"
                placeholder="Décrivez les consignes et activités pour cette phase..."
              />
            </div>
            
            <div className="col-span-5 p-3">
              <textarea
                value={phaseData.resultats || ''}
                onChange={(e) => updatePhase(phase.id, 'resultats', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                rows="4"
                placeholder="Décrivez les résultats attendus..."
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Section II - Déroulement</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Durée totale:</span> {dureeTotal} min
          </div>
          <div className={`text-sm px-3 py-1 rounded-full ${
            dureeRestante >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <span className="font-medium">Restant:</span> {dureeRestante} min
          </div>
        </div>
      </div>

      {/* Gestion des phases */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Phases du déroulement</h4>
          <button
            onClick={ajouterPhasePersonnalisee}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter une phase
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPhase === phase.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedPhase(phase.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${phase.couleur}`}></div>
                  <span className="font-medium text-sm">{phase.nom}</span>
                  {phase.obligatoire && <span className="text-red-500 text-xs">*</span>}
                </div>
                
                {!phase.obligatoire && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deplacerPhase(phase.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deplacerPhase(phase.id, 'down');
                      }}
                      disabled={index === phases.length - 1}
                      className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        supprimerPhase(phase.id);
                      }}
                      className="p-0.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                {(deroulement[phase.id]?.duree || 0)} minutes
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau de déroulement */}
      <div>
        <h4 className="font-medium mb-3">Tableau de déroulement</h4>
        {renderTableauDeroulement()}
      </div>

      {/* Conseils pédagogiques */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Conseils pour le déroulement</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• <strong>Préliminaires:</strong> Appel, rappel séance précédente, présentation objectifs</p>
          <p>• <strong>Introduction:</strong> Motivation, situation déclenchante</p>
          <p>• <strong>Réalisation:</strong> Activités principales d'apprentissage</p>
          <p>• <strong>Retour:</strong> Synthèse, évaluation, devoirs</p>
        </div>
      </div>

      {dureeRestante < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Attention: Dépassement de durée</h4>
          <p className="text-sm text-red-800">
            La durée totale des phases ({dureeTotal - dureeRestante} min) dépasse la durée prévue de la séance ({dureeTotal} min).
            Veuillez ajuster les durées des phases.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeroulementBuilder;