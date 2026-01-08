import React, { useState } from 'react';
import { Users, Lightbulb, Target, BookOpen, Plus, X, Search, Star } from 'lucide-react';

const StrategieBuilder = ({ strategies, onChange, matiere, niveauScolaire }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Banque de stratégies par matière et niveau
  const strategiesBank = {
    'maternelle': {
      'Mathématiques': [
        {
          nom: 'Manipulation d\'objets',
          description: 'Utilisation d\'objets concrets pour découvrir les concepts',
          type: 'active',
          dureeRecommandee: '15-20 min',
          materielNecessaire: ['Objets à compter', 'Formes géométriques'],
          populaire: true
        },
        {
          nom: 'Jeux mathématiques',
          description: 'Apprentissage par le jeu et l\'amusement',
          type: 'ludique',
          dureeRecommandee: '10-15 min',
          materielNecessaire: ['Jeux de société', 'Cartes'],
          populaire: true
        }
      ],
      'Français': [
        {
          nom: 'Comptines et chansons',
          description: 'Apprentissage du langage par la musique et le rythme',
          type: 'artistique',
          dureeRecommandee: '10-15 min',
          materielNecessaire: ['Support audio', 'Instruments simples'],
          populaire: true
        }
      ]
    },
    'primaire': {
      'Mathématiques': [
        {
          nom: 'Résolution de problèmes en groupe',
          description: 'Travail collaboratif sur des situations problèmes',
          type: 'collaborative',
          dureeRecommandee: '20-25 min',
          materielNecessaire: ['Fiches problèmes', 'Matériel de manipulation'],
          populaire: true
        },
        {
          nom: 'Méthode interrogative',
          description: 'Questions-réponses pour faire découvrir les concepts',
          type: 'interactive',
          dureeRecommandee: '15-20 min',
          materielNecessaire: ['Tableau', 'Supports visuels'],
          populaire: true
        }
      ],
      'Français': [
        {
          nom: 'Lecture partagée',
          description: 'Lecture collective avec échanges et discussions',
          type: 'collaborative',
          dureeRecommandee: '20-25 min',
          materielNecessaire: ['Textes', 'Supports de lecture'],
          populaire: true
        }
      ]
    },
    'secondaire': {
      'Mathématiques': [
        {
          nom: 'Démarche d\'investigation',
          description: 'Les élèves cherchent et découvrent par eux-mêmes',
          type: 'investigative',
          dureeRecommandee: '25-30 min',
          materielNecessaire: ['Fiches de recherche', 'Calculatrices'],
          populaire: true
        },
        {
          nom: 'Classe inversée',
          description: 'Préparation à la maison, application en classe',
          type: 'moderne',
          dureeRecommandee: '30-35 min',
          materielNecessaire: ['Supports numériques', 'Exercices'],
          populaire: false
        }
      ],
      'Sciences Physiques': [
        {
          nom: 'Démarche expérimentale',
          description: 'Observation, hypothèse, expérience, conclusion',
          type: 'experimentale',
          dureeRecommandee: '30-40 min',
          materielNecessaire: ['Matériel de laboratoire', 'Fiches protocole'],
          populaire: true
        }
      ]
    }
  };

  const getStrategiesForContext = () => {
    return strategiesBank[niveauScolaire]?.[matiere] || [];
  };

  const filteredStrategies = getStrategiesForContext().filter(strat =>
    strat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    strat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addStrategy = (strategy) => {
    const newStrategy = {
      id: Date.now(),
      nom: strategy.nom,
      description: strategy.description,
      type: strategy.type,
      dureeRecommandee: strategy.dureeRecommandee,
      materielNecessaire: strategy.materielNecessaire || [],
      personnalisee: false
    };
    onChange([...strategies, newStrategy]);
    setShowSuggestions(false);
  };

  const addCustomStrategy = () => {
    const newStrategy = {
      id: Date.now(),
      nom: '',
      description: '',
      type: 'personnalisee',
      dureeRecommandee: '',
      materielNecessaire: [],
      personnalisee: true
    };
    onChange([...strategies, newStrategy]);
  };

  const updateStrategy = (id, field, value) => {
    onChange(strategies.map(strat =>
      strat.id === id ? { ...strat, [field]: value } : strat
    ));
  };

  const removeStrategy = (id) => {
    onChange(strategies.filter(strat => strat.id !== id));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'collaborative': return Users;
      case 'interactive': return Target;
      case 'investigative': return Search;
      case 'experimentale': return Lightbulb;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'collaborative': return 'bg-blue-100 text-blue-800';
      case 'interactive': return 'bg-green-100 text-green-800';
      case 'investigative': return 'bg-purple-100 text-purple-800';
      case 'experimentale': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assistant Stratégies d'Enseignement</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSuggestions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </button>
          <button
            onClick={addCustomStrategy}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Stratégie personnalisée
          </button>
        </div>
      </div>

      {/* Modal des suggestions */}
      {showSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Banque de stratégies</h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une stratégie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-4">
                {filteredStrategies.map((strategy, index) => {
                  const TypeIcon = getTypeIcon(strategy.type);
                  
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TypeIcon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium">{strategy.nom}</h4>
                            {strategy.populaire && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                <Star className="w-3 h-3" />
                                Populaire
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(strategy.type)}`}>
                              {strategy.type}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>⏱️ {strategy.dureeRecommandee}</span>
                            <span>📦 {strategy.materielNecessaire.length} matériel(s)</span>
                          </div>
                          
                          {strategy.materielNecessaire.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">Matériel nécessaire :</div>
                              <div className="flex flex-wrap gap-1">
                                {strategy.materielNecessaire.map((materiel, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {materiel}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => addStrategy(strategy)}
                          className="ml-4 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {filteredStrategies.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune stratégie trouvée pour "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des stratégies sélectionnées */}
      <div className="space-y-4">
        {strategies.map((strategy, index) => {
          const TypeIcon = getTypeIcon(strategy.type);
          
          return (
            <div key={strategy.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <TypeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      Stratégie {index + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(strategy.type)}`}>
                      {strategy.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la stratégie
                      </label>
                      <input
                        type="text"
                        value={strategy.nom}
                        onChange={(e) => updateStrategy(strategy.id, 'nom', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Ex: Travail en groupe, Méthode interrogative..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée recommandée
                      </label>
                      <input
                        type="text"
                        value={strategy.dureeRecommandee}
                        onChange={(e) => updateStrategy(strategy.id, 'dureeRecommandee', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Ex: 15-20 min"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description et mise en œuvre
                    </label>
                    <textarea
                      value={strategy.description}
                      onChange={(e) => updateStrategy(strategy.id, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows="3"
                      placeholder="Décrivez comment mettre en œuvre cette stratégie..."
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => removeStrategy(strategy.id)}
                  className="flex-shrink-0 p-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        
        {strategies.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Aucune stratégie d'enseignement définie</p>
            <p className="text-sm text-gray-500">
              Utilisez les suggestions ou créez une stratégie personnalisée
            </p>
          </div>
        )}
      </div>

      {/* Conseils pédagogiques */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Conseils pour les stratégies</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Variez les stratégies pour maintenir l'attention des élèves</p>
          <p>• Adaptez les méthodes au niveau et aux besoins des élèves</p>
          <p>• Prévoyez des stratégies de différenciation pour les élèves en difficulté</p>
          <p>• Intégrez des moments d'interaction et de participation active</p>
        </div>
      </div>
    </div>
  );
};

export default StrategieBuilder;