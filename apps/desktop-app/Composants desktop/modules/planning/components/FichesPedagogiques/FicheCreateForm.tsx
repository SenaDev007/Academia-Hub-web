import React, { useState } from 'react';
import { Save, X, ArrowRight, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import TemplateSelector from './TemplateSelector';
import ElementsPlanificationForm from './ElementsPlanificationForm';
import DeroulementBuilder from './DeroulementBuilder';

const FicheCreateForm = ({ onCancel, onSave, niveauxScolaires }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ficheData, setFicheData] = useState({
    // En-tête
    anneeScolaire: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    trimestre: '1',
    saNumero: '',
    sequenceNumero: '',
    date: '',
    cours: '',
    duree: '',
    titre: '',
    niveauScolaire: '',
    classe: '',
    matiere: '',
    etablissement: '',
    enseignant: '',
    
    // Éléments de planification
    competences: [],
    objectifsSpecifiques: [],
    prerequis: [],
    materielDidactique: [],
    strategiesEnseignement: [],
    modalitesEvaluation: [],
    difficultesPrevues: [],
    solutionsEnvisagees: [],
    
    // Déroulement
    deroulement: {
      preliminaires: { consignes: '', resultats: '', duree: 0 },
      introduction: { consignes: '', resultats: '', duree: 0 },
      realisation: { consignes: '', resultats: '', duree: 0 },
      retour: { consignes: '', resultats: '', duree: 0 }
    }
  });

  const steps = [
    { id: 1, title: 'Informations générales', icon: FileText },
    { id: 2, title: 'Éléments de planification', icon: CheckCircle },
    { id: 3, title: 'Déroulement', icon: ArrowRight },
    { id: 4, title: 'Révision et validation', icon: Save }
  ];

  const matieres = [
    'Mathématiques', 'Français', 'Sciences Physiques', 'SVT', 
    'Histoire-Géographie', 'Anglais', 'EPS', 'Arts Plastiques'
  ];

  const getClassesForNiveau = (niveauScolaire) => {
    return niveauxScolaires[niveauScolaire]?.classes || [];
  };

  const handleNiveauScolaireChange = (niveauScolaire) => {
    setFicheData({
      ...ficheData,
      niveauScolaire,
      classe: '' // Reset classe when niveau changes
    });
  };

  const handleStepChange = (step) => {
    if (step > currentStep && !validateCurrentStep()) return;
    setCurrentStep(step);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return ficheData.titre && ficheData.matiere && ficheData.niveauScolaire && ficheData.classe && ficheData.duree;
      case 2:
        return ficheData.competences.length > 0 && ficheData.objectifsSpecifiques.length > 0;
      case 3:
        return Object.values(ficheData.deroulement).every(phase => phase.consignes && phase.resultats);
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Année scolaire *
          </label>
          <select
            value={ficheData.anneeScolaire}
            onChange={(e) => setFicheData({...ficheData, anneeScolaire: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trimestre *
          </label>
          <select
            value={ficheData.trimestre}
            onChange={(e) => setFicheData({...ficheData, trimestre: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">1er Trimestre (Sept - Déc)</option>
            <option value="2">2ème Trimestre (Jan - Mars)</option>
            <option value="3">3ème Trimestre (Avril - Juin)</option>
          </select>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Sélection du template</h3>
        <TemplateSelector 
          niveauScolaire={ficheData.niveauScolaire}
          classe={ficheData.classe}
          matiere={ficheData.matiere}
          onTemplateSelect={(template) => {
            setFicheData({...ficheData, ...template});
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SA N° *
            </label>
            <input
              type="text"
              value={ficheData.saNumero}
              onChange={(e) => setFicheData({...ficheData, saNumero: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: SA 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SÉQUENCE N° *
            </label>
            <input
              type="text"
              value={ficheData.sequenceNumero}
              onChange={(e) => setFicheData({...ficheData, sequenceNumero: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Séquence 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={ficheData.date}
              onChange={(e) => setFicheData({...ficheData, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cours *
            </label>
            <input
              type="text"
              value={ficheData.cours}
              onChange={(e) => setFicheData({...ficheData, cours: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom du cours"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (en minutes) *
            </label>
            <input
              type="number"
              value={ficheData.duree}
              onChange={(e) => setFicheData({...ficheData, duree: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 55"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau scolaire *
            </label>
            <select
              value={ficheData.niveauScolaire}
              onChange={(e) => handleNiveauScolaireChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un niveau</option>
              {Object.entries(niveauxScolaires).map(([key, niveau]) => (
                <option key={key} value={key}>{niveau.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe *
            </label>
            <select
              value={ficheData.classe}
              onChange={(e) => setFicheData({...ficheData, classe: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!ficheData.niveauScolaire}
            >
              <option value="">Sélectionner une classe</option>
              {getClassesForNiveau(ficheData.niveauScolaire).map(classe => (
                <option key={classe} value={classe}>{classe}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matière *
            </label>
            <select
              value={ficheData.matiere}
              onChange={(e) => setFicheData({...ficheData, matiere: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une matière</option>
              {matieres.map(matiere => (
                <option key={matiere} value={matiere}>{matiere}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TITRE *
            </label>
            <textarea
              value={ficheData.titre}
              onChange={(e) => setFicheData({...ficheData, titre: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Titre de la leçon"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <ElementsPlanificationForm
      data={ficheData}
      onChange={(data) => setFicheData({...ficheData, ...data})}
    />
  );

  const renderStep3 = () => (
    <DeroulementBuilder
      deroulement={ficheData.deroulement}
      dureeTotal={parseInt(ficheData.duree) || 55}
      onChange={(deroulement) => setFicheData({...ficheData, deroulement})}
    />
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-4">Récapitulatif de la fiche</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Informations générales</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Titre:</span> {ficheData.titre}</p>
              <p><span className="font-medium">Matière:</span> {ficheData.matiere}</p>
              <p><span className="font-medium">Niveau:</span> {niveauxScolaires[ficheData.niveauScolaire]?.nom} - {ficheData.classe}</p>
              <p><span className="font-medium">Durée:</span> {ficheData.duree} minutes</p>
              <p><span className="font-medium">SA N°:</span> {ficheData.saNumero}</p>
              <p><span className="font-medium">Séquence N°:</span> {ficheData.sequenceNumero}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Éléments de planification</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Compétences:</span> {ficheData.competences.length} définie(s)</p>
              <p><span className="font-medium">Objectifs spécifiques:</span> {ficheData.objectifsSpecifiques.length} défini(s)</p>
              <p><span className="font-medium">Prérequis:</span> {ficheData.prerequis.length} identifié(s)</p>
              <p><span className="font-medium">Stratégies:</span> {ficheData.strategiesEnseignement.length} définie(s)</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Phases du déroulement</h4>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {Object.entries(ficheData.deroulement).map(([phase, data]) => (
              <div key={phase} className="bg-white p-2 rounded border">
                <p className="font-medium capitalize">{phase}</p>
                <p className="text-xs text-gray-600">{data.duree} min</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Actions après sauvegarde</h4>
        <div className="space-y-2 text-sm text-yellow-800">
          <p>• La fiche sera sauvegardée comme brouillon</p>
          <p>• Vous pourrez la modifier avant envoi au directeur</p>
          <p>• Une notification sera envoyée sur WhatsApp lors de l'envoi</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header avec étapes */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Nouvelle Fiche Pédagogique</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepChange(step.id)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step.id === currentStep
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : step.id < currentStep
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}
              >
                <step.icon className="w-5 h-5" />
              </button>
              <span className={`ml-2 text-sm font-medium ${
                step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Footer avec navigation */}
      <div className="border-t border-gray-200 p-6 flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </button>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              disabled={!validateCurrentStep()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                // Sauvegarder la fiche
                console.log('Sauvegarde de la fiche:', ficheData);
                onSave();
              }}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FicheCreateForm;