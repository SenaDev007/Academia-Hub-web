import React, { useState } from 'react';
import { Plus, X, Target, BookOpen, Wrench, Users, CheckSquare, AlertTriangle, Lightbulb } from 'lucide-react';
import CompetencesPicker from './CompetencesPicker';

const ElementsPlanificationForm = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState('competences');
  const [showCompetencesPicker, setShowCompetencesPicker] = useState(false);

  const sections = [
    { id: 'competences', title: 'Compétences', icon: Target, required: true },
    { id: 'objectifs', title: 'Objectifs spécifiques', icon: CheckSquare, required: true },
    { id: 'prerequis', title: 'Prérequis', icon: BookOpen, required: false },
    { id: 'materiel', title: 'Matériel didactique', icon: Wrench, required: true },
    { id: 'strategies', title: 'Stratégies d\'enseignement', icon: Users, required: true },
    { id: 'evaluation', title: 'Modalités d\'évaluation', icon: CheckSquare, required: true },
    { id: 'difficultes', title: 'Difficultés prévues', icon: AlertTriangle, required: false },
    { id: 'solutions', title: 'Solutions envisagées', icon: Lightbulb, required: false }
  ];

  const typesCompetences = ['Disciplinaire', 'Transversale', 'Méthodologique', 'Sociale'];

  const addItem = (section, item) => {
    const currentItems = data[section] || [];
    onChange({
      [section]: [...currentItems, item]
    });
  };

  const removeItem = (section, index) => {
    const currentItems = data[section] || [];
    onChange({
      [section]: currentItems.filter((_, i) => i !== index)
    });
  };

  const updateItem = (section, index, updatedItem) => {
    const currentItems = data[section] || [];
    const newItems = [...currentItems];
    newItems[index] = updatedItem;
    onChange({
      [section]: newItems
    });
  };

  const renderCompetences = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Types de compétences (APC)</h4>
        <p className="text-sm text-blue-800">
          Selon l'Approche Par Compétences, chaque fiche doit inclure au moins une compétence de chaque type.
        </p>
        <button
          onClick={() => setShowCompetencesPicker(true)}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Target className="w-4 h-4" />
          Sélectionner depuis le référentiel
        </button>
      </div>

      {showCompetencesPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Référentiel des compétences</h3>
              <button
                onClick={() => setShowCompetencesPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <CompetencesPicker
                selectedCompetences={data.competences || []}
                onCompetencesChange={(competences) => onChange({ competences })}
                niveauScolaire={data.niveauScolaire}
                classe={data.classe}
                matiere={data.matiere}
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowCompetencesPicker(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Terminer la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {(data.competences || []).map((comp, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de compétence</label>
                <select
                  value={comp.type || ''}
                  onChange={(e) => updateItem('competences', index, {...comp, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner un type</option>
                  {typesCompetences.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={comp.description || ''}
                  onChange={(e) => updateItem('competences', index, {...comp, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Décrire la compétence visée..."
                />
              </div>
            </div>
            <button
              onClick={() => removeItem('competences', index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addItem('competences', { type: '', description: '' })}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter une compétence
      </button>
    </div>
  );

  const renderObjectifs = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Objectifs spécifiques</h4>
        <p className="text-sm text-green-800">
          Formuler des objectifs mesurables et observables (utiliser des verbes d'action).
        </p>
      </div>

      {(data.objectifsSpecifiques || []).map((obj, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <textarea
                value={obj.description || ''}
                onChange={(e) => updateItem('objectifsSpecifiques', index, {...obj, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
                placeholder="Ex: À la fin de cette séance, l'élève sera capable de..."
              />
            </div>
            <button
              onClick={() => removeItem('objectifsSpecifiques', index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addItem('objectifsSpecifiques', { description: '' })}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter un objectif
      </button>
    </div>
  );

  const renderMateriel = () => (
    <div className="space-y-4">
      {(data.materielDidactique || []).map((mat, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matériel</label>
                <input
                  type="text"
                  value={mat.nom || ''}
                  onChange={(e) => updateItem('materielDidactique', index, {...mat, nom: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Tableau, règle, calculatrice..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="text"
                  value={mat.quantite || ''}
                  onChange={(e) => updateItem('materielDidactique', index, {...mat, quantite: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: 1 par élève, 5 par groupe..."
                />
              </div>
            </div>
            <button
              onClick={() => removeItem('materielDidactique', index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addItem('materielDidactique', { nom: '', quantite: '' })}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter du matériel
      </button>
    </div>
  );

  const renderStrategies = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">Stratégies d'enseignement</h4>
        <p className="text-sm text-purple-800">
          Méthodes et approches pédagogiques utilisées pour atteindre les objectifs.
        </p>
      </div>

      {(data.strategiesEnseignement || []).map((strat, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={strat.nom || ''}
                onChange={(e) => updateItem('strategiesEnseignement', index, {...strat, nom: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nom de la stratégie (ex: Travail en groupe, Méthode interrogative...)"
              />
              <textarea
                value={strat.description || ''}
                onChange={(e) => updateItem('strategiesEnseignement', index, {...strat, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
                placeholder="Description de la mise en œuvre..."
              />
            </div>
            <button
              onClick={() => removeItem('strategiesEnseignement', index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addItem('strategiesEnseignement', { nom: '', description: '' })}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter une stratégie
      </button>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'competences':
        return renderCompetences();
      case 'objectifs':
        return renderObjectifs();
      case 'materiel':
        return renderMateriel();
      case 'strategies':
        return renderStrategies();
      default:
        return (
          <div className="space-y-4">
            {(data[activeSection] || []).map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => updateItem(activeSection, index, {...item, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="2"
                    placeholder="Description..."
                  />
                  <button
                    onClick={() => removeItem(activeSection, index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem(activeSection, { description: '' })}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un élément
            </button>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Navigation des sections */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-4">Section I - Éléments de planification</h3>
        {sections.map(section => {
          const Icon = section.icon;
          const itemCount = (data[section.id] || []).length;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{section.title}</span>
                  {section.required && <span className="text-red-500 text-xs">*</span>}
                </div>
                <span className="text-xs text-gray-500">{itemCount} élément(s)</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenu de la section sélectionnée */}
      <div className="col-span-3">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            {sections.find(s => s.id === activeSection)?.title}
          </h4>
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  );
};

export default ElementsPlanificationForm;