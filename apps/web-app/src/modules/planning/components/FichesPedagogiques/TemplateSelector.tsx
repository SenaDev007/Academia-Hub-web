import React, { useState } from 'react';
import { FileText, Eye, Download, Star } from 'lucide-react';

const TemplateSelector = ({ niveauScolaire, classe, matiere, onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Templates prédéfinis par matière et niveau scolaire
  const templates = {
    'maternelle': {
      'Mathématiques': [
        {
          id: 1,
          nom: 'Découverte des nombres',
          description: 'Template pour l\'apprentissage des nombres en maternelle',
          phases: ['Manipulation', 'Observation', 'Verbalisation', 'Trace'],
          competences: ['Dénombrer', 'Comparer', 'Ordonner'],
          populaire: true
        }
      ],
      'Français': [
        {
          id: 2,
          nom: 'Langage oral',
          description: 'Template pour développer le langage oral',
          phases: ['Écoute', 'Expression', 'Interaction', 'Structuration'],
          competences: ['Écouter', 'Parler', 'Comprendre']
        }
      ]
    },
    'primaire': {
      'Mathématiques': [
        {
          id: 3,
          nom: 'Résolution de problèmes',
          description: 'Template pour les problèmes mathématiques au primaire',
          phases: ['Compréhension', 'Recherche', 'Validation', 'Institutionnalisation'],
          competences: ['Résoudre', 'Raisonner', 'Communiquer'],
          populaire: true
        }
      ],
      'Français': [
        {
          id: 4,
          nom: 'Lecture compréhension',
          description: 'Template pour la lecture au primaire',
          phases: ['Découverte', 'Lecture', 'Compréhension', 'Synthèse'],
          competences: ['Lire', 'Comprendre', 'Analyser']
        }
      ]
    },
    'secondaire': {
      'Mathématiques': [
        {
          id: 5,
          nom: 'Résolution de problèmes',
          description: 'Template pour les leçons de mathématiques avec focus sur la résolution de problèmes',
          phases: ['Situation problème', 'Recherche', 'Mise en commun', 'Institutionnalisation'],
          competences: ['Résoudre des problèmes', 'Raisonner', 'Communiquer'],
          populaire: true
        },
        {
          id: 6,
          nom: 'Découverte de notion',
          description: 'Template pour introduire de nouveaux concepts mathématiques',
          phases: ['Rappel', 'Situation de découverte', 'Formalisation', 'Application'],
          competences: ['Chercher', 'Modéliser', 'Représenter']
        }
      ],
      'Français': [
        {
          id: 7,
          nom: 'Compréhension de texte',
          description: 'Template pour les séances de lecture et compréhension',
          phases: ['Découverte du texte', 'Lecture silencieuse', 'Analyse', 'Synthèse'],
          competences: ['Lire', 'Comprendre', 'Interpréter'],
          populaire: true
        },
        {
          id: 8,
          nom: 'Expression écrite',
          description: 'Template pour les séances de production écrite',
          phases: ['Préparation', 'Rédaction', 'Révision', 'Réécriture'],
          competences: ['Écrire', 'Organiser', 'Réviser']
        }
      ],
      'Sciences Physiques': [
        {
          id: 9,
          nom: 'Démarche expérimentale',
          description: 'Template pour les séances avec expérimentation',
          phases: ['Problématique', 'Hypothèses', 'Expérimentation', 'Conclusion'],
          competences: ['Observer', 'Expérimenter', 'Analyser'],
          populaire: true
        }
      ]
    }
  };

  const getTemplatesForMatiere = () => {
    return templates[niveauScolaire]?.[matiere] || [];
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Préparer les données du template pour l'intégration
    const templateData = {
      competences: template.competences.map(comp => ({ nom: comp, type: 'disciplinaire' })),
      strategiesEnseignement: template.phases.map(phase => ({ nom: phase, description: '' })),
      deroulement: template.phases.reduce((acc, phase, index) => {
        const phaseKey = phase.toLowerCase().replace(/\s+/g, '_');
        acc[phaseKey] = {
          consignes: `Instructions pour ${phase}`,
          resultats: `Résultats attendus pour ${phase}`,
          duree: Math.floor((parseInt('55') || 55) / template.phases.length)
        };
        return acc;
      }, {})
    };

    onTemplateSelect(templateData);
  };

  const templatesList = getTemplatesForMatiere();

  if (!niveauScolaire || !matiere) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Sélectionnez un niveau scolaire et une matière pour voir les templates disponibles</p>
      </div>
    );
  }

  if (templatesList.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">Aucun template disponible pour {matiere} en {niveauScolaire}</p>
        <p className="text-sm text-gray-500">Vous pouvez créer une fiche vierge ou nous contacter pour ajouter des templates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Templates disponibles pour {matiere} ({niveauScolaire})</h4>
        <span className="text-sm text-gray-500">{templatesList.length} template(s)</span>
      </div>

      <div className="grid gap-4">
        {templatesList.map(template => (
          <div
            key={template.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-md ${
              selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium">{template.nom}</h5>
                  {template.populaire && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      <Star className="w-3 h-3" />
                      Populaire
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-700">Phases :</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.phases.map((phase, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {phase}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-700">Compétences :</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.competences.map((comp, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {selectedTemplate?.id === template.id && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  ✓ Template sélectionné - Les éléments seront pré-remplis automatiquement
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <button 
          onClick={() => onTemplateSelect({})}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          Créer une fiche vierge (sans template)
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;