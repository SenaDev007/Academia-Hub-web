import React, { useState, useEffect } from 'react';
import { Check, Plus, BookOpen, Hash, Users2, Target, X, Zap, FileText, Award, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { PlanningSubject } from '../../types/planning';
import { planningService } from '../../services/planningService';

interface MultipleSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjects: Partial<PlanningSubject>[]) => Promise<void>;
  educationLevel: string;
  schoolId: string;
  existingSubjects?: PlanningSubject[];
  allowLevelSelection?: boolean;
}

// Types pour les matières pré-définies
type SubjectCategory = {
  [key: string]: string[];
};

type PredefinedSubjects = {
  [key: string]: SubjectCategory;
};

// Matières pré-définies par niveau scolaire
const PREDEFINED_SUBJECTS: PredefinedSubjects = {
  'maternelle': {
    'Domaine 1: Développement du bien-être (santé et environnement)': [
      'Education pour la santé',
      'Education à des réflexions de santé'
    ],
    'Domaine 2: Développement du bien-être physique et du développement moteur (Expression corporelle)': [
      'Education du mouvement',
      'Gestuelle',
      'Rythmique'
    ],
    'Domaine 3: Développement de la réflexion des aptitudes cognitives et intellectuelles (Santé des pré-apprentissages)': [
      'Observation',
      'Education sensorielle',
      'Pré-lecture',
      'Pré-écriture',
      'Pré-mathématique'
    ],
    'Domaine 4: Développement des sentiments et des émotions (Santé émotionnelle)': [
      'Expression plastique',
      'Expression émotionnelle'
    ],
    'Domaine 5: Développement des relations et de l\'interaction sociale et socio-affective': [
      'Langage',
      'Conte',
      'Comptine',
      'Poésie',
      'Chant'
    ]
  },
  'primaire': {
    'Langue et Littérature': [
      'Communication orale',
      'Expression écrite',
      'Lecture',
      'Dictée',
      'Anglais'
    ],
    'Mathématiques et Sciences': [
      'Mathématiques',
      'Education Scientifique et Technologique'
    ],
    'Sciences Humaines': [
      'Education Sociale'
    ],
    'Arts et Expression': [
      'EA Dessin',
      'EA Couture',
      'EA Poésie',
      'EA Chant',
      'EA Conte'
    ],
    'Sport et Développement': [
      'Education Physique et Sportive'
    ],
    'Développement Personnel': [
      'Entrepreneuriat'
    ]
  },
  'secondaire_1er_cycle': {
    'Langue et Littérature': [
      'Anglais',
      'Communication Ecrite',
      'Lecture',
      'Français'
    ],
    'Sciences Humaines': [
      'Histoire & Géographie',
      'Philosophie'
    ],
    'Mathématiques et Sciences': [
      'Mathématiques',
      'Physique Chimie et Technologie',
      'Science de la Vie et de la Terre'
    ],
    'Langues Etrangères': [
      'Allemand',
      'Espagnol'
    ],
    'Sport et Développement': [
      'Education Physique et Sportive'
    ],
    'Développement Personnel': [
      'Entrepreneuriat'
    ]
  },
  'secondaire_2nd_cycle': {
    'Langue et Littérature': [
      'Anglais',
      'Communication Ecrite',
      'Lecture',
      'Français'
    ],
    'Sciences Humaines': [
      'Histoire & Géographie',
      'Philosophie'
    ],
    'Mathématiques et Sciences': [
      'Mathématiques',
      'Physique Chimie et Technologie',
      'Science de la Vie et de la Terre'
    ],
    'Langues Etrangères': [
      'Allemand',
      'Espagnol'
    ],
    'Sport et Développement': [
      'Education Physique et Sportive'
    ],
    'Développement Personnel': [
      'Entrepreneuriat'
    ]
  }
};

// Types pour les coefficients
type SubjectCoefficients = {
  [key: string]: { [key: string]: number };
};

// Coefficients par niveau et matière
const SUBJECT_COEFFICIENTS: SubjectCoefficients = {
  'maternelle': {}, // Pas de coefficients
  'primaire': {
    // Toutes les matières ont un coefficient de 1
    'Français': 1,
    'Mathématiques': 1,
    'Sciences': 1,
    'Histoire': 1,
    'Géographie': 1,
    'Anglais': 1,
    'EPS': 1,
    'Arts plastiques': 1,
    'Musique': 1,
    'Théâtre': 1,
    'Danse': 1,
    'Sport': 1,
    'Jeux collectifs': 1,
    'Géométrie': 1,
    'Calcul mental': 1,
    'Environnement': 1,
    'Langues locales': 1
  },
  'secondaire_1er_cycle': {
    // Toutes les matières ont un coefficient de 1
    'Français': 1,
    'Mathématiques': 1,
    'Physique': 1,
    'Chimie': 1,
    'SVT': 1,
    'Histoire': 1,
    'Géographie': 1,
    'Anglais': 1,
    'Espagnol': 1,
    'Allemand': 1,
    'EPS': 1,
    'Arts plastiques': 1,
    'Musique': 1,
    'Théâtre': 1,
    'Géométrie': 1,
    'Algèbre': 1,
    'Technologie': 1,
    'Éducation civique': 1,
    'Sport': 1
  },
  'secondaire_2nd_cycle': {
    // Coefficients variables selon l'importance de la matière
    'Anglais': 3,
    'Communication Ecrite': 4,
    'Lecture': 4,
    'Français': 4,
    'Histoire & Géographie': 3,
    'Philosophie': 3,
    'Mathématiques': 4,
    'Physique Chimie et Technologie': 4,
    'Science de la Vie et de la Terre': 3,
    'Allemand': 2,
    'Espagnol': 2,
    'Education Physique et Sportive': 1,
    'Entrepreneuriat': 2
  }
};

// Génération de codes modernes avec gestion de l'unicité et codes spécifiques
const generateModernCode = (subjectName: string, level: string, existingSubjects: any[] = []): string => {
  const levelPrefixes = {
    'maternelle': 'MAT',
    'primaire': 'PRI',
    'secondaire_1er_cycle': 'SEC1',
    'secondaire_2nd_cycle': 'SEC2'
  };

  // Mapping spécifique pour chaque matière avec codes uniques et distincts
  const specificSubjectCodes: { [key: string]: string } = {
    // Matières maternelles - codes spécifiques et uniques
    'education pour la santé': 'ESANT',
    'education à des réflexions de santé': 'EREFLEX',
    'education du mouvement': 'EMOUV',
    'gestuelle': 'GEST',
    'rythmique': 'RYTH',
    'observation': 'OBS',
    'education sensorielle': 'ESENS',
    'pré-lecture': 'PLECT',
    'pré-écriture': 'PECRIT',
    'pré-mathématique': 'PMATH',
    'expression plastique': 'EPLAS',
    'expression émotionnelle': 'EEMOT',
    'langage': 'LANG',
    'conte': 'CONTE',
    'comptine': 'COMP',
    'poésie': 'POESIE',
    'chant': 'CHANT',
    
    // Matières primaires - codes spécifiques et uniques
    'communication orale': 'CORAL',
    'expression écrite': 'EECRIT',
    'lecture': 'LECT',
    'dictée': 'DICT',
    'mathématiques': 'MATH',
    'education scientifique et technologique': 'EST',
    'education sociale': 'ESOC',
    'ea dessin': 'DESSIN',
    'ea couture': 'COUTURE',
    'ea poésie': 'POESIE',
    'ea chant': 'CHANT',
    'ea conte': 'CONTE',
    'anglais': 'ANG',
    'entrepreneuriat': 'ENT',
    'education physique et sportive': 'EPS',
    
    // Matières secondaires - codes spécifiques et uniques
    'communication écrite': 'CECRIT',
    'français': 'FR',
    'histoire & géographie': 'HISTGEO',
    'physique chimie et technologie': 'PCT',
    'science de la vie et de la terre': 'SVT',
    'philosophie': 'PHILO',
    'allemand': 'DE',
    'espagnol': 'ES'
  };

  const cleanName = subjectName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  // Chercher d'abord un code spécifique exact
  let subjectCode = specificSubjectCodes[cleanName];
  
  // Si pas de code spécifique, créer un code basé sur les mots-clés uniques
  if (!subjectCode) {
    const words = cleanName.split(' ').filter(word => word.length > 2);
    
    if (words.length >= 2) {
      // Prendre les 2 premiers mots et leurs 3 premières lettres pour plus d'unicité
      const firstWord = words[0].substring(0, Math.min(3, words[0].length)).toUpperCase();
      const secondWord = words[1].substring(0, Math.min(3, words[1].length)).toUpperCase();
      subjectCode = firstWord + secondWord;
    } else if (words.length === 1) {
      // Pour un seul mot, prendre les 4 premières lettres
      subjectCode = words[0].substring(0, Math.min(4, words[0].length)).toUpperCase();
    } else {
      // Fallback : prendre les 5 premières lettres du nom complet
      subjectCode = cleanName.substring(0, Math.min(5, cleanName.length)).toUpperCase();
    }
  }

  const levelPrefix = levelPrefixes[level as keyof typeof levelPrefixes] || 'SUB';
  let finalCode = `${levelPrefix}-${subjectCode}`;
  
  // Vérifier l'unicité et ajouter un suffixe numérique si nécessaire
  // Note: Les codes sont déjà uniques par niveau grâce aux préfixes (MAT-, PRI-, SEC1-, SEC2-)
  // Mais on vérifie quand même pour éviter les conflits dans le même niveau
  let counter = 1;
  while (existingSubjects.some(subject => subject.code === finalCode && subject.level === level)) {
    finalCode = `${levelPrefix}-${subjectCode}${counter}`;
    counter++;
    if (counter > 100) {
      // Éviter les boucles infinies et créer un code unique avec timestamp
      const timestamp = Date.now().toString().slice(-4);
      finalCode = `${levelPrefix}-${subjectCode}${timestamp}`;
      break;
    }
  }
  
  return finalCode;
};

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <Check className="h-5 w-5 text-green-400" />
          ) : (
            <X className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${
            type === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 ${
              type === 'success' 
                ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30' 
                : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
            }`}
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MultipleSubjectsModal({
  isOpen,
  onClose,
  onSave,
  educationLevel,
  schoolId,
  existingSubjects = [],
  allowLevelSelection = false
}: MultipleSubjectsModalProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(educationLevel);
  const [customCoefficients, setCustomCoefficients] = useState<{ [key: string]: number }>({});
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Charger les classes pour le 2nd cycle du secondaire
  useEffect(() => {
    const loadClasses = async () => {
      console.log('🔍 MultipleSubjectsModal - useEffect déclenché, selectedLevel:', selectedLevel);
      
      if (selectedLevel === 'secondaire_2nd_cycle') {
        console.log('📡 MultipleSubjectsModal - Chargement des classes du 2nd cycle...');
        try {
          // Charger toutes les classes et filtrer celles du 2nd cycle
          const allClasses = await planningService.getClasses('school-1'); // Utiliser un schoolId par défaut
          console.log('📊 MultipleSubjectsModal - Toutes les classes chargées:', allClasses.length);
          
          // Filtrer les classes du 2nd cycle
          const secondCycleClasses = allClasses.filter(classe => 
            classe.level === '2nd-cycle-secondaire'
          );
          console.log('📊 MultipleSubjectsModal - Classes du 2nd cycle filtrées:', secondCycleClasses.length);
          
          if (secondCycleClasses.length > 0) {
            console.log('✅ MultipleSubjectsModal - Classes du 2nd cycle chargées:', secondCycleClasses.length);
            setAvailableClasses(secondCycleClasses);
          } else {
            console.warn('⚠️ MultipleSubjectsModal - Aucune classe du 2nd cycle trouvée');
            setAvailableClasses([]);
          }
        } catch (error) {
          console.error('❌ MultipleSubjectsModal - Erreur lors du chargement des classes:', error);
          setAvailableClasses([]);
        }
      } else {
        console.log('🔄 MultipleSubjectsModal - Niveau différent du 2nd cycle, réinitialisation des classes');
        setAvailableClasses([]);
        setSelectedClass('');
      }
    };

    loadClasses();
  }, [selectedLevel]);

  // Obtenir les matières disponibles pour ce niveau
  const availableSubjects = PREDEFINED_SUBJECTS[selectedLevel as keyof typeof PREDEFINED_SUBJECTS] || {};
  
  // Obtenir les coefficients pour ce niveau
  const coefficients = SUBJECT_COEFFICIENTS[selectedLevel as keyof typeof SUBJECT_COEFFICIENTS] || {};

  // Vérifier si une matière est déjà sélectionnée
  const isSubjectSelected = (subjectName: string): boolean => {
    return selectedSubjects.has(subjectName);
  };

  // Vérifier si une matière existe déjà dans la classe
  const isSubjectExisting = (subjectName: string): boolean => {
    // Pour le 2nd cycle du secondaire, vérifier aussi la classe spécifique
    if (selectedLevel === 'secondaire_2nd_cycle' && selectedClass) {
      return existingSubjects.some(subject => 
        subject.name === subjectName && 
        subject.level === selectedLevel && 
        subject.classId === selectedClass
      );
    }
    
    // Pour les autres niveaux, vérifier seulement le nom et le niveau
    return existingSubjects.some(subject => 
      subject.name === subjectName && subject.level === selectedLevel
    );
  };

  // Gérer la sélection/désélection d'une matière
  const toggleSubject = (subjectName: string) => {
    if (isSubjectExisting(subjectName)) {
      return; // Ne pas permettre la modification des matières existantes
    }

    setSelectedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectName)) {
        newSet.delete(subjectName);
      } else {
        newSet.add(subjectName);
      }
      return newSet;
    });
  };

  // Sélectionner toutes les matières d'une catégorie
  const selectCategory = (categoryName: string) => {
    const categorySubjects = availableSubjects[categoryName] || [];
    const newSubjects = categorySubjects.filter(subject => !isSubjectExisting(subject));
    
    setSelectedSubjects(prev => {
      const newSet = new Set(prev);
      newSubjects.forEach(subject => newSet.add(subject));
      return newSet;
    });
  };

  // Désélectionner toutes les matières d'une catégorie
  const deselectCategory = (categoryName: string) => {
    const categorySubjects = availableSubjects[categoryName] || [];
    
    setSelectedSubjects(prev => {
      const newSet = new Set(prev);
      categorySubjects.forEach(subject => newSet.delete(subject));
      return newSet;
    });
  };

  // Sélectionner toutes les matières disponibles
  const selectAll = () => {
    const allSubjects = Object.values(availableSubjects).flat();
    const newSubjects = allSubjects.filter(subject => !isSubjectExisting(subject));
    
    setSelectedSubjects(new Set(newSubjects));
  };

  // Désélectionner toutes les matières
  const deselectAll = () => {
    setSelectedSubjects(new Set());
  };

  // Gérer la modification d'un coefficient
  const handleCoefficientChange = (subjectName: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setCustomCoefficients(prev => ({
      ...prev,
      [subjectName]: numValue
    }));
  };

  // Obtenir le coefficient final d'une matière (personnalisé ou par défaut)
  const getFinalCoefficient = (subjectName: string): number => {
    if (customCoefficients[subjectName] !== undefined) {
      return customCoefficients[subjectName];
    }
    return coefficients[subjectName] || 1;
  };

  // Réinitialiser les coefficients personnalisés
  const resetCustomCoefficients = () => {
    setCustomCoefficients({});
  };

  // Fonction pour afficher les toasts
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Sauvegarder les matières sélectionnées
  const handleSave = async () => {
    console.log('🔍 MultipleSubjectsModal - handleSave appelé');
    console.log('🔍 selectedLevel:', selectedLevel);
    console.log('🔍 selectedClass:', selectedClass);
    console.log('🔍 selectedSubjects:', Array.from(selectedSubjects));
    
    if (selectedSubjects.size === 0) {
      showToastMessage('Veuillez sélectionner au moins une matière', 'error');
      return;
    }

    // Validation spécifique pour le 2nd cycle du secondaire
    if (selectedLevel === 'secondaire_2nd_cycle' && !selectedClass) {
      showToastMessage('Veuillez sélectionner une classe pour le 2nd cycle du secondaire', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const subjectsToCreate = Array.from(selectedSubjects).map(subjectName => ({
        name: subjectName,
        code: generateModernCode(subjectName, selectedLevel, existingSubjects),
        level: selectedLevel,
        coefficient: getFinalCoefficient(subjectName),
        classId: selectedLevel === 'secondaire_2nd_cycle' ? selectedClass : undefined,
        schoolId: schoolId
      }));

      console.log('🔍 MultipleSubjectsModal - subjectsToCreate:', subjectsToCreate);
      console.log('🔍 MultipleSubjectsModal - classId dans chaque matière:', subjectsToCreate.map(s => ({ name: s.name, classId: s.classId })));

      await onSave(subjectsToCreate);
      showToastMessage(
        `${selectedSubjects.size} matière(s) créée(s) avec succès`,
        'success'
      );
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la création des matières:', error);
      showToastMessage('Erreur lors de la création des matières', 'error');
      setIsLoading(false);
    }
  };

  // Réinitialiser la sélection à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setSelectedSubjects(new Set());
      setCustomCoefficients({});
      setSelectedClass('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Ajouter plusieurs matières
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Sélectionnez les matières à créer pour votre établissement
                  </p>
                </div>
          </div>
            <button
              onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                title="Fermer le modal"
                aria-label="Fermer le modal"
            >
                <X className="w-5 h-5 text-white" />
            </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
        {/* En-tête avec informations */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
            <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {allowLevelSelection ? 'Sélection du niveau scolaire' : `Niveau : ${selectedLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                {allowLevelSelection 
                  ? 'Sélectionnez d\'abord le niveau scolaire, puis les matières à créer.'
                  : 'Sélectionnez les matières à ajouter. Les matières déjà présentes sont désactivées.'
                }
              </p>
                    </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAll}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                      <Check className="w-4 h-4" />
                      <span>Tout sélectionner</span>
              </button>
              <button
                type="button"
                onClick={deselectAll}
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
              >
                      <X className="w-4 h-4" />
                      <span>Tout désélectionner</span>
              </button>
              {selectedLevel === 'secondaire_2nd_cycle' && Object.keys(customCoefficients).length > 0 && (
                <button
                  type="button"
                  onClick={resetCustomCoefficients}
                        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-xl hover:bg-orange-700 transition-all duration-200 flex items-center space-x-2"
                >
                        <Award className="w-4 h-4" />
                        <span>Réinitialiser coefficients</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sélecteur de niveau si autorisé */}
        {allowLevelSelection && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Niveau scolaire</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Niveau scolaire *
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                        setSelectedSubjects(new Set());
                        setCustomCoefficients({});
                        setSelectedClass('');
              }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              required
                      aria-label="Niveau scolaire"
            >
              <option value="">Sélectionner un niveau</option>
              <option value="maternelle">Maternelle</option>
              <option value="primaire">Primaire</option>
              <option value="secondaire_1er_cycle">1er Cycle secondaire</option>
              <option value="secondaire_2nd_cycle">2nd Cycle secondaire</option>
            </select>
                  </div>
          </div>
        )}

        {/* Sélecteur de classe pour le 2nd cycle du secondaire */}
        {(() => {
          console.log('🔍 MultipleSubjectsModal - Vérification condition d\'affichage:');
          console.log('   selectedLevel:', selectedLevel);
          console.log('   selectedLevel === "secondaire_2nd_cycle":', selectedLevel === 'secondaire_2nd_cycle');
          console.log('   availableClasses.length:', availableClasses.length);
          console.log('   Condition complète:', selectedLevel === 'secondaire_2nd_cycle' && availableClasses.length > 0);
          return selectedLevel === 'secondaire_2nd_cycle' && availableClasses.length > 0;
        })() && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Classe spécifique</h3>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Classe *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                required
                aria-label="Sélectionner une classe"
              >
                <option value="">Sélectionner une classe</option>
                {availableClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                💡 Pour le 2nd cycle du secondaire, sélectionnez la classe spécifique pour ces matières.
              </p>
            </div>
          </div>
        )}

        {/* Liste des matières par catégorie */}
        {selectedLevel && (
          <div className="space-y-6">
            {Object.entries(availableSubjects).map(([categoryName, subjects]) => (
                    <div key={categoryName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              {/* En-tête de catégorie */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    {categoryName}
                  </h5>
                          </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => selectCategory(categoryName)}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-all duration-200 flex items-center space-x-1"
                    >
                              <Check className="w-3 h-3" />
                              <span>Sélectionner tout</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deselectCategory(categoryName)}
                              className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-all duration-200 flex items-center space-x-1"
                    >
                              <X className="w-3 h-3" />
                              <span>Désélectionner tout</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des matières de la catégorie */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subjectName) => {
                    const isSelected = isSubjectSelected(subjectName);
                    const isExisting = isSubjectExisting(subjectName);
                                         const coefficient = coefficients[subjectName] || 1;
                     const code = generateModernCode(subjectName, selectedLevel, existingSubjects);

                    return (
                      <div
                        key={subjectName}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isExisting
                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => !isExisting && toggleSubject(subjectName)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {isExisting ? (
                                        <div className="w-5 h-5 rounded-full bg-gray-400 mr-3 flex-shrink-0"></div>
                              ) : isSelected ? (
                                        <div className="w-5 h-5 rounded-full bg-blue-600 mr-3 flex-shrink-0 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 mr-3 flex-shrink-0"></div>
                              )}
                              <span className={`font-medium ${
                                isExisting ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {subjectName}
                              </span>
                            </div>
                            
                                    <div className="ml-8 mt-2 space-y-2">
                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Hash className="w-3 h-3 mr-1" />
                                        <span>Code:</span>
                                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded ml-1 font-mono">{code}</code>
                              </div>
                              {selectedLevel !== 'maternelle' && (
                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                  <Users2 className="w-3 h-3 mr-1" />
                                          <span>Coefficient:</span>
                                  {selectedLevel === 'secondaire_2nd_cycle' ? (
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={getFinalCoefficient(subjectName)}
                                      onChange={(e) => handleCoefficientChange(subjectName, e.target.value)}
                                              className="w-16 ml-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      onClick={(e) => e.stopPropagation()}
                                              aria-label={`Coefficient pour ${subjectName}`}
                                    />
                                  ) : (
                                    <span className="font-medium ml-1">{coefficient}</span>
                                  )}
                                </div>
                              )}
                              {isExisting && (
                                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                  Déjà présente dans ce niveau
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Résumé de la sélection */}
        {selectedSubjects.size > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Résumé de la sélection</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {selectedSubjects.size} matière(s) sélectionnée(s)
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">Informations :</h5>
                          <ul className="space-y-1 text-green-800 dark:text-green-400">
                            <li>• {selectedSubjects.size} matière(s) seront créées</li>
                            <li>• Les codes seront générés automatiquement</li>
                            <li>• Les matières peuvent être communes entre niveaux</li>
              {selectedLevel !== 'maternelle' && (
                              <li>• Les coefficients seront appliqués selon le niveau</li>
              )}
                          </ul>
                        </div>
                        
              {selectedLevel === 'secondaire_2nd_cycle' && Object.keys(customCoefficients).length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">Coefficients personnalisés :</h5>
                            <div className="space-y-1">
                    {Array.from(selectedSubjects).map(subjectName => {
                      const customCoeff = customCoefficients[subjectName];
                      if (customCoeff !== undefined) {
                        return (
                                    <div key={subjectName} className="text-xs flex justify-between">
                                      <span className="font-medium text-green-800 dark:text-green-400">{subjectName}</span>
                                      <span className="font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">{customCoeff}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSubjects.size} matière(s) sélectionnée(s)
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={selectedSubjects.size === 0 || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Créer {selectedSubjects.size} matière(s)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
