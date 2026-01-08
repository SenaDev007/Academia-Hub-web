import React, { useState } from 'react';
import { Search, Plus, Check, Target, BookOpen, Users, Lightbulb } from 'lucide-react';

const CompetencesPicker = ({ selectedCompetences = [], onCompetencesChange, niveauScolaire, classe, matiere }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('disciplinaires');

  // Référentiel des compétences par niveau scolaire et matière
  const competencesReferentiel = {
    'maternelle': {
      'Mathématiques': {
        disciplinaires: [
          'Dénombrer des collections d\'objets',
          'Comparer des quantités',
          'Reconnaître les formes géométriques simples',
          'Se repérer dans l\'espace',
          'Ordonner des objets selon leur taille'
        ],
        transversales: [
          'Observer et décrire',
          'Manipuler et expérimenter',
          'Verbaliser ses actions'
        ]
      },
      'Français': {
        disciplinaires: [
          'Écouter et comprendre des histoires',
          'S\'exprimer oralement',
          'Reconnaître les lettres de l\'alphabet',
          'Produire des tracés',
          'Comprendre le principe alphabétique'
        ],
        transversales: [
          'Communiquer avec les autres',
          'Respecter les règles de communication',
          'Développer sa créativité'
        ]
      }
    },
    'primaire': {
      'Mathématiques': {
        disciplinaires: [
          'Résoudre des problèmes numériques',
          'Effectuer des calculs mentaux',
          'Maîtriser les opérations arithmétiques',
          'Mesurer des grandeurs',
          'Reconnaître et construire des figures géométriques',
          'Organiser et traiter des données'
        ],
        transversales: [
          'Raisonner et argumenter',
          'Communiquer en mathématiques',
          'Utiliser des outils mathématiques'
        ],
        methodologiques: [
          'Chercher et expérimenter',
          'Modéliser des situations',
          'Représenter des données'
        ]
      },
      'Français': {
        disciplinaires: [
          'Lire avec fluidité',
          'Comprendre des textes variés',
          'Produire des écrits',
          'Maîtriser l\'orthographe',
          'Enrichir son vocabulaire',
          'Maîtriser la grammaire'
        ],
        transversales: [
          'Développer son esprit critique',
          'Communiquer efficacement',
          'Apprécier la littérature'
        ]
      }
    },
    'secondaire': {
      'Mathématiques': {
        disciplinaires: [
          'Résoudre des problèmes complexes',
          'Maîtriser le calcul algébrique',
          'Étudier les fonctions',
          'Appliquer la géométrie analytique',
          'Utiliser les statistiques et probabilités',
          'Démontrer des propriétés mathématiques'
        ],
        transversales: [
          'Développer l\'esprit logique',
          'Argumenter et démontrer',
          'Modéliser des phénomènes'
        ],
        methodologiques: [
          'Utiliser les outils numériques',
          'Mener une démarche scientifique',
          'Communiquer en langage mathématique'
        ]
      },
      'Français': {
        disciplinaires: [
          'Analyser des textes littéraires',
          'Maîtriser l\'expression écrite',
          'Développer l\'argumentation',
          'Étudier la langue française',
          'Comprendre l\'évolution de la langue',
          'Apprécier la diversité culturelle'
        ],
        transversales: [
          'Développer l\'esprit critique',
          'Communiquer avec nuance',
          'S\'ouvrir à la culture'
        ]
      },
      'Sciences Physiques': {
        disciplinaires: [
          'Observer et expérimenter',
          'Modéliser des phénomènes',
          'Analyser des résultats',
          'Utiliser les mathématiques en sciences',
          'Comprendre l\'univers et la matière',
          'Appliquer les lois physiques'
        ],
        transversales: [
          'Développer l\'esprit scientifique',
          'Adopter une démarche expérimentale',
          'Communiquer en sciences'
        ]
      }
    }
  };

  const categories = [
    { id: 'disciplinaires', nom: 'Disciplinaires', icon: Target, color: 'blue' },
    { id: 'transversales', nom: 'Transversales', icon: Users, color: 'green' },
    { id: 'methodologiques', nom: 'Méthodologiques', icon: Lightbulb, color: 'purple' },
    { id: 'sociales', nom: 'Sociales', icon: BookOpen, color: 'orange' }
  ];

  const getCompetencesForCategory = (category) => {
    const competences = competencesReferentiel[niveauScolaire]?.[matiere]?.[category] || [];
    
    if (!searchTerm) return competences;
    
    return competences.filter(comp => 
      comp.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const isCompetenceSelected = (competence) => {
    return selectedCompetences.some(selected => 
      selected.description === competence && selected.type === activeCategory
    );
  };

  const toggleCompetence = (competence) => {
    const isSelected = isCompetenceSelected(competence);
    
    if (isSelected) {
      // Retirer la compétence
      const newCompetences = selectedCompetences.filter(selected => 
        !(selected.description === competence && selected.type === activeCategory)
      );
      onCompetencesChange(newCompetences);
    } else {
      // Ajouter la compétence
      const newCompetence = {
        type: activeCategory,
        description: competence
      };
      onCompetencesChange([...selectedCompetences, newCompetence]);
    }
  };

  const getCategoryColor = (categoryId, type = 'bg') => {
    const category = categories.find(c => c.id === categoryId);
    const color = category?.color || 'gray';
    
    const colors = {
      bg: {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        purple: 'bg-purple-100 text-purple-800',
        orange: 'bg-orange-100 text-orange-800',
        gray: 'bg-gray-100 text-gray-800'
      },
      border: {
        blue: 'border-blue-300',
        green: 'border-green-300',
        purple: 'border-purple-300',
        orange: 'border-orange-300',
        gray: 'border-gray-300'
      }
    };
    
    return colors[type][color];
  };

  if (!niveauScolaire || !matiere) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Sélectionnez un niveau scolaire et une matière pour voir les compétences disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sélection des compétences</h3>
        <div className="text-sm text-gray-600">
          {selectedCompetences.length} compétence(s) sélectionnée(s)
        </div>
      </div>

      {/* Compétences sélectionnées */}
      {selectedCompetences.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Compétences sélectionnées</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCompetences.map((comp, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getCategoryColor(comp.type)}`}
              >
                {comp.description}
                <button
                  onClick={() => toggleCompetence(comp.description)}
                  className="hover:bg-black/10 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Navigation des catégories */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
          {categories.map(category => {
            const Icon = category.icon;
            const competencesCount = getCompetencesForCategory(category.id).length;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-900 border border-${category.color}-300`
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{category.nom}</div>
                  <div className="text-xs text-gray-500">{competencesCount} compétence(s)</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Liste des compétences */}
        <div className="col-span-3 space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Compétences */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium">
                Compétences {categories.find(c => c.id === activeCategory)?.nom.toLowerCase()}
              </h4>
            </div>
            
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {getCompetencesForCategory(activeCategory).map((competence, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isCompetenceSelected(competence)
                      ? `${getCategoryColor(activeCategory)} ${getCategoryColor(activeCategory, 'border')}`
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleCompetence(competence)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isCompetenceSelected(competence)
                      ? 'bg-current border-current text-white'
                      : 'border-gray-300'
                  }`}>
                    {isCompetenceSelected(competence) && <Check className="w-3 h-3" />}
                  </div>
                  <span className="flex-1 text-sm">{competence}</span>
                </div>
              ))}
              
              {getCompetencesForCategory(activeCategory).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTerm 
                      ? 'Aucune compétence trouvée pour cette recherche'
                      : 'Aucune compétence disponible dans cette catégorie'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencesPicker;