import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Users, Clock, Star, Copy, Eye, Plus } from 'lucide-react';

interface Template {
  id: string;
  nom: string;
  matiere: string;
  niveau: string;
  duree: number;
  objectifs: string;
  competences: string[];
  deroulement: string;
  supports: string;
  evaluation: string;
  auteur: string;
  utilise: number;
  note: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

interface TemplateSelectionProps {
  onSelectTemplate: (template: Template) => void;
  onBack: () => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ onSelectTemplate, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Templates prédéfinis selon le système éducatif béninois
  const templates: Template[] = [
    {
      id: '1',
      nom: 'Lecture syllabique - Méthode APC',
      matiere: 'Français',
      niveau: 'CP1',
      duree: 45,
      objectifs: 'À la fin de cette séance, l\'élève sera capable de lire et écrire les syllabes simples avec les consonnes m, l, r.',
      competences: ['Lecture', 'Écriture', 'Compréhension'],
      deroulement: `1. Révision (5 min)
- Rappel des lettres vues
- Lecture de syllabes connues

2. Présentation (15 min)
- Introduction de la nouvelle consonne
- Formation de syllabes
- Lecture collective

3. Application (20 min)
- Exercices de lecture individuelle
- Écriture sur ardoise
- Jeux de syllabes

4. Évaluation (5 min)
- Questions orales
- Vérification des acquis`,
      supports: 'Tableau, ardoises, images, syllabaire, cahiers',
      evaluation: 'Observation directe, questions orales, exercices écrits',
      auteur: 'Marie KOUASSI',
      utilise: 45,
      note: 4.8,
      tags: ['APC', 'Lecture', 'Syllabique', 'CP1'],
      isPublic: true,
      createdAt: '2025-01-10T08:00:00Z'
    },
    {
      id: '2',
      nom: 'Numération - Les nombres de 0 à 10',
      matiere: 'Mathématiques',
      niveau: 'CP1',
      duree: 50,
      objectifs: 'À la fin de cette séance, l\'élève sera capable de compter, lire et écrire les nombres de 0 à 10.',
      competences: ['Numération', 'Calcul mental', 'Résolution de problèmes'],
      deroulement: `1. Mise en situation (10 min)
- Comptage d'objets concrets
- Jeu de dénombrement

2. Développement (25 min)
- Présentation des nombres
- Écriture chiffrée et littérale
- Ordre croissant et décroissant

3. Application (10 min)
- Exercices pratiques
- Manipulation d'objets

4. Synthèse (5 min)
- Récapitulatif
- Évaluation formative`,
      supports: 'Objets à compter, tableau numérique, cahiers, boulier',
      evaluation: 'Exercices pratiques, observation, questions orales',
      auteur: 'Jean AKPOVI',
      utilise: 38,
      note: 4.6,
      tags: ['Numération', 'Mathématiques', 'CP1', 'Concret'],
      isPublic: true,
      createdAt: '2025-01-08T10:30:00Z'
    },
    {
      id: '3',
      nom: 'Sciences - Les parties du corps humain',
      matiere: 'Sciences',
      niveau: 'CE1',
      duree: 60,
      objectifs: 'À la fin de cette séance, l\'élève sera capable d\'identifier et nommer les principales parties du corps humain.',
      competences: ['Observation', 'Classification', 'Expression orale'],
      deroulement: `1. Éveil de l'intérêt (10 min)
- Chanson sur le corps
- Questions d'exploration

2. Observation (20 min)
- Observation directe
- Utilisation d'images
- Nomenclature

3. Structuration (20 min)
- Classification des parties
- Schéma du corps humain
- Étiquetage

4. Évaluation (10 min)
- Jeu de reconnaissance
- Questions de contrôle`,
      supports: 'Images du corps humain, miroir, étiquettes, cahiers',
      evaluation: 'Jeu de reconnaissance, schéma à compléter',
      auteur: 'Fatou DOSSOU',
      utilise: 29,
      note: 4.7,
      tags: ['Sciences', 'Corps humain', 'CE1', 'Observation'],
      isPublic: true,
      createdAt: '2025-01-05T14:15:00Z'
    },
    {
      id: '4',
      nom: 'Histoire - Les symboles du Bénin',
      matiere: 'Histoire-Géographie',
      niveau: 'CE2',
      duree: 45,
      objectifs: 'À la fin de cette séance, l\'élève sera capable d\'identifier et expliquer la signification des symboles nationaux du Bénin.',
      competences: ['Connaissance historique', 'Éducation civique', 'Expression orale'],
      deroulement: `1. Introduction (10 min)
- Questions sur la patrie
- Présentation du thème

2. Développement (25 min)
- Présentation du drapeau
- L'hymne national
- Les armoiries
- La devise nationale

3. Application (8 min)
- Récitation de l'hymne
- Description des symboles

4. Conclusion (2 min)
- Synthèse
- Devoir à domicile`,
      supports: 'Drapeau du Bénin, images des armoiries, texte de l\'hymne',
      evaluation: 'Questions orales, récitation, description',
      auteur: 'Prosper AGBODJI',
      utilise: 52,
      note: 4.9,
      tags: ['Histoire', 'Bénin', 'Symboles', 'CE2', 'Civisme'],
      isPublic: true,
      createdAt: '2025-01-03T09:45:00Z'
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.objectifs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMatiere = !filterMatiere || template.matiere === filterMatiere;
    const matchesNiveau = !filterNiveau || template.niveau === filterNiveau;

    return matchesSearch && matchesMatiere && matchesNiveau;
  });

  const matieres = [...new Set(templates.map(t => t.matiere))];
  const niveaux = [...new Set(templates.map(t => t.niveau))];

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template);
  };

  if (showPreview && selectedTemplate) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.nom}</h2>
                  <p className="text-gray-600">{selectedTemplate.matiere} - {selectedTemplate.niveau}</p>
                </div>
              </div>
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Copy size={20} />
                Utiliser ce modèle
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Durée</span>
                </div>
                <p className="text-blue-900 font-semibold">{selectedTemplate.duree} minutes</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Star size={16} />
                  <span className="text-sm font-medium">Note</span>
                </div>
                <p className="text-green-900 font-semibold">{selectedTemplate.note}/5</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Users size={16} />
                  <span className="text-sm font-medium">Utilisations</span>
                </div>
                <p className="text-purple-900 font-semibold">{selectedTemplate.utilise} fois</p>
              </div>
            </div>

            {/* Objectifs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Objectifs pédagogiques</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedTemplate.objectifs}</p>
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Compétences visées</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.competences.map((competence, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {competence}
                  </span>
                ))}
              </div>
            </div>

            {/* Déroulement */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Déroulement</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans">{selectedTemplate.deroulement}</pre>
              </div>
            </div>

            {/* Supports */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Supports et matériels</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedTemplate.supports}</p>
              </div>
            </div>

            {/* Évaluation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Modalités d'évaluation</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedTemplate.evaluation}</p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Mots-clés</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modèles de Séances</h1>
              <p className="text-gray-600">Choisissez un modèle pour créer rapidement vos séances</p>
            </div>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Créer un modèle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterMatiere}
            onChange={(e) => setFilterMatiere(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Toutes les matières</option>
            {matieres.map(matiere => (
              <option key={matiere} value={matiere}>{matiere}</option>
            ))}
          </select>

          <select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les niveaux</option>
            {niveaux.map(niveau => (
              <option key={niveau} value={niveau}>{niveau}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
              Mes modèles
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Publics
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{template.nom}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {template.matiere}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {template.niveau}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {template.duree}min
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-medium">{template.note}</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{template.objectifs}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  #{tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Par {template.auteur}</span>
              <span>{template.utilise} utilisations</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(template)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                Aperçu
              </button>
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={14} />
                Utiliser
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun modèle trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;