import React, { useState, useEffect } from 'react';
import { Save, BookOpen, GraduationCap, Hash, Check, Plus, X, Zap, FileText, Users, Award } from 'lucide-react';
import { planningService } from '../../services/planningService';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: any) => void;
  subjectData?: any;
  isEdit?: boolean;
}

// Matières pré-définies par niveau scolaire
const PREDEFINED_SUBJECTS = {
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

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    name: subjectData?.name || '',
    code: subjectData?.code || '',
    level: subjectData?.level || '',
    coefficient: subjectData?.coefficient || null,
    classId: subjectData?.classId || '', // Pour le 2nd cycle : classe spécifique
    classCoefficients: subjectData?.classCoefficients || {}
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  const educationLevels = [
    { id: 'maternelle', name: 'Maternelle', hasCoefficient: false, hasClassCoefficients: false },
    { id: 'primaire', name: 'Primaire', hasCoefficient: false, hasClassCoefficients: false },
    { id: 'secondaire_1er_cycle', name: 'Secondaire 1er cycle (6ème à 3ème)', hasCoefficient: false, hasClassCoefficients: false },
    { id: 'secondaire_2nd_cycle', name: 'Secondaire 2nd cycle (2nde à Terminale)', hasCoefficient: true, hasClassCoefficients: true }
  ];

  // Mettre à jour le formulaire quand subjectData change (mode édition)
  useEffect(() => {
    if (isEdit && subjectData) {
      console.log('🔍 SubjectModal - Mode édition détecté, mise à jour du formulaire avec:', subjectData);
      setFormData({
        name: subjectData.name || '',
        code: subjectData.code || '',
        level: subjectData.level || '',
        coefficient: subjectData.coefficient || null,
        classId: subjectData.classId || '',
        classCoefficients: subjectData.classCoefficients || {}
      });
    } else if (!isEdit) {
      // Mode création : réinitialiser le formulaire
      console.log('🔍 SubjectModal - Mode création, réinitialisation du formulaire');
      setFormData({
        name: '',
        code: '',
        level: '',
        coefficient: null,
        classId: '',
        classCoefficients: {}
      });
    }
  }, [isEdit, subjectData]);

  // Charger les classes pour le 2nd cycle du secondaire
  useEffect(() => {
    const loadClasses = async () => {
      const levelToCheck = formData.level || subjectData?.level;
      console.log('🔍 SubjectModal - useEffect déclenché, formData.level:', formData.level, 'subjectData?.level:', subjectData?.level);
      
      if (levelToCheck === 'secondaire_2nd_cycle') {
        console.log('📡 SubjectModal - Chargement des classes du 2nd cycle...');
        try {
          // Charger toutes les classes et filtrer celles du 2nd cycle
          const allClasses = await planningService.getClasses('school-1'); // Utiliser un schoolId par défaut
          console.log('📊 SubjectModal - Toutes les classes chargées:', allClasses.length);
          
          // Filtrer les classes du 2nd cycle
          const secondCycleClasses = allClasses.filter(classe => 
            classe.level === '2nd-cycle-secondaire'
          );
          console.log('📊 SubjectModal - Classes du 2nd cycle filtrées:', secondCycleClasses.length);
          
          if (secondCycleClasses.length > 0) {
            console.log('✅ SubjectModal - Classes du 2nd cycle chargées:', secondCycleClasses.length);
            setAvailableClasses(secondCycleClasses);
          } else {
            console.warn('⚠️ SubjectModal - Aucune classe du 2nd cycle trouvée');
            setAvailableClasses([]);
          }
        } catch (error) {
          console.error('❌ SubjectModal - Erreur lors du chargement des classes:', error);
          setAvailableClasses([]);
        }
      } else {
        console.log('🔄 SubjectModal - Niveau différent du 2nd cycle, réinitialisation des classes');
        setAvailableClasses([]);
        // Réinitialiser la classe sélectionnée si on change de niveau
        setFormData(prev => ({ ...prev, classId: '' }));
      }
    };

    loadClasses();
  }, [formData.level, subjectData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'level') {
      const selectedLevel = educationLevels.find(level => level.id === value);
      setFormData(prev => {
        const newFormData = {
        ...prev,
        [name]: value,
        coefficient: selectedLevel?.hasCoefficient ? (prev.coefficient || 1) : null,
        classId: selectedLevel?.hasClassCoefficients ? prev.classId : '', // Réinitialiser la classe si pas 2nd cycle
        classCoefficients: selectedLevel?.hasClassCoefficients ? prev.classCoefficients : {}
        };
        
        // Générer automatiquement le code si le nom et le niveau sont présents
        if (newFormData.name && newFormData.level) {
          newFormData.code = generateModernCode(newFormData.name, newFormData.level, []);
        }
        
        return newFormData;
      });
    } else if (name === 'classId') {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [name]: value
        };
        
        // Générer automatiquement le code si le nom, niveau et classe sont présents
        if (newFormData.name && newFormData.level && newFormData.classId) {
          newFormData.code = generateModernCode(newFormData.name, newFormData.level, []);
        }
        
        return newFormData;
      });
    } else if (name === 'name') {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [name]: value
        };
        
        // Générer automatiquement le code si le nom et le niveau sont présents
        if (newFormData.name && newFormData.level) {
          newFormData.code = generateModernCode(newFormData.name, newFormData.level, []);
        }
        
        return newFormData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || null : value
      }));
    }
  };


  // Système moderne de génération de codes pour les matières avec gestion de l'unicité et codes spécifiques
  const generateModernCode = (subjectName: string, level: string, existingSubjects: any[] = []) => {
    if (!subjectName || !level) return '';
    
    // Mapping des niveaux vers des préfixes
    const levelPrefixes = {
      'maternelle': 'MAT',
      'primaire': 'PRI',
      'secondaire_1er_cycle': 'SEC1',
      'secondaire_2nd_cycle': 'SEC2'
    };
    
    // Mapping spécifique pour chaque matière avec codes uniques
    const specificSubjectCodes: { [key: string]: string } = {
      // Matières maternelles - codes spécifiques
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
      
      // Matières primaires - codes spécifiques
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
      
      // Matières secondaires - codes spécifiques
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
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s]/g, '') // Garder seulement lettres, chiffres et espaces
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
    
    // Construire le code final avec gestion de l'unicité
    const levelPrefix = levelPrefixes[level as keyof typeof levelPrefixes] || 'SUB';
    let finalCode = `${levelPrefix}-${subjectCode}`;
    
    // Vérifier l'unicité et ajouter un suffixe numérique si nécessaire
    let counter = 1;
    while (existingSubjects.some(subject => subject.code === finalCode)) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 SubjectModal - handleSubmit appelé');
    console.log('🔍 formData complet:', formData);
    console.log('🔍 selectedLevel:', selectedLevel);
    console.log('🔍 hasClassCoefficients:', selectedLevel?.hasClassCoefficients);
    console.log('🔍 classId dans formData:', formData.classId);
    
    if (!formData.name?.trim()) {
      showToastMessage('Le nom de la matière est requis', 'error');
      return;
    }

    if (!formData.code?.trim()) {
      showToastMessage('Le code de la matière est requis', 'error');
      return;
    }

    if (!formData.level?.trim()) {
      showToastMessage('Le niveau scolaire est requis', 'error');
      return;
    }

    // Validation spécifique pour le 2nd cycle du secondaire
    if (selectedLevel?.hasClassCoefficients) {
      if (!formData.classId) {
        showToastMessage('Veuillez sélectionner une classe pour le 2nd cycle du secondaire', 'error');
        return;
      }
      
      if (!formData.coefficient || formData.coefficient < 1 || formData.coefficient > 10) {
        showToastMessage('Veuillez définir un coefficient valide (1-10) pour cette matière', 'error');
        return;
      }
    }

    console.log('🔍 SubjectModal - Appel de onSave avec formData:', formData);
    setIsLoading(true);
    try {
      await onSave(formData);
      showToastMessage(
        isEdit ? 'Matière modifiée avec succès' : 'Matière créée avec succès',
        'success'
      );
      setTimeout(() => {
    onClose();
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      showToastMessage('Erreur lors de la sauvegarde', 'error');
      setIsLoading(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fonction pour obtenir les matières suggérées selon le niveau
  const getSuggestedSubjects = (levelId: string) => {
    return PREDEFINED_SUBJECTS[levelId as keyof typeof PREDEFINED_SUBJECTS] || {};
  };

  // Fonction pour ajouter une matière suggérée
  const handleAddSuggestedSubject = (subjectName: string) => {
    const modernCode = generateModernCode(subjectName, formData.level, []);
    setFormData(prev => ({
      ...prev,
      name: subjectName,
      code: modernCode
    }));
  };

  const selectedLevel = educationLevels.find(level => level.id === formData.level);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isEdit ? 'Modifier la matière' : 'Créer une nouvelle matière'}
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    {isEdit ? 'Modifiez les informations de la matière' : 'Configurez une nouvelle matière pour votre établissement'}
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
            <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de base</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Niveau scolaire */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Niveau scolaire *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                required
                      aria-label="Niveau scolaire"
              >
                <option value="">Sélectionner un niveau</option>
                {educationLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            
            {/* Sélecteur de classe pour le 2nd cycle du secondaire */}
            {(() => {
              console.log('🔍 SubjectModal - Vérification condition d\'affichage:');
              console.log('   selectedLevel:', selectedLevel);
              console.log('   selectedLevel?.hasClassCoefficients:', selectedLevel?.hasClassCoefficients);
              console.log('   availableClasses.length:', availableClasses.length);
              console.log('   Condition complète:', selectedLevel?.hasClassCoefficients && availableClasses.length > 0);
              return selectedLevel?.hasClassCoefficients && availableClasses.length > 0;
            })() && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Classe *
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Pour le 2nd cycle du secondaire, sélectionnez la classe spécifique pour cette matière.
                </p>
              </div>
            )}
            
                  {/* Nom de la matière */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nom de la matière *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Ex: Mathématiques, Français, Anglais..."
                required
              />
            </div>
            
                  {/* Code de la matière */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Ex: SEC1-MATH"
                required
              />
            </div>
            
                  {/* Coefficient (conditionnel) */}
            {selectedLevel?.hasCoefficient && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Coefficient *
                </label>
                <input
                  type="number"
                  name="coefficient"
                  value={formData.coefficient || ''}
                  onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        placeholder="Ex: 4"
                  required={selectedLevel.hasCoefficient}
                  min="1"
                  max="10"
                />
              </div>
            )}

                </div>
              </div>
            
            {/* Matières suggérées selon le niveau */}
            {formData.level && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Matières suggérées</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Pour le niveau {selectedLevel?.name}
                      </p>
                    </div>
                  </div>
                  
                <div className="space-y-4">
                  {Object.entries(getSuggestedSubjects(formData.level)).map(([category, subjects]) => (
                      <div key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {category}
                        </h5>
                        <button
                          type="button"
                          onClick={() => {
                            const availableSubjects = subjects.filter(subject => formData.name !== subject);
                            if (availableSubjects.length > 0) {
                              const firstSubject = availableSubjects[0];
                              handleAddSuggestedSubject(firstSubject);
                            }
                          }}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 flex items-center space-x-1"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Ajouter</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {subjects.map((subject, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAddSuggestedSubject(subject)}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              formData.name === subject
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                            }`}
                          >
                            {formData.name === subject ? (
                                <div className="flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>{subject}</span>
                                </div>
                            ) : (
                              subject
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                      <strong>💡 Astuce :</strong> Cliquez sur une matière pour la sélectionner automatiquement. Le code sera généré automatiquement.
                    </p>
                  </div>
              </div>
            )}
            

              {/* Système de codes modernes */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Système de codes modernes</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Génération automatique de codes professionnels
                    </p>
          </div>
            </div>
        
                <div className="space-y-4">
                  <p className="text-purple-800 dark:text-purple-300">
              Notre système génère <strong>automatiquement</strong> des codes professionnels et cohérents dès que vous saisissez le nom de la matière et sélectionnez le niveau.
            </p>
            
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                      <h5 className="font-medium text-purple-900 dark:text-purple-300 mb-3">Format des codes :</h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-sm text-purple-800 dark:text-purple-400"><strong>MAT-</strong> : Maternelle</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-sm text-purple-800 dark:text-purple-400"><strong>PRI-</strong> : Primaire</span>
              </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-sm text-purple-800 dark:text-purple-400"><strong>SEC1-</strong> : 1er Cycle</span>
              </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-sm text-purple-800 dark:text-purple-400"><strong>SEC2-</strong> : 2nd Cycle</span>
            </div>
          </div>
        </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                      <h5 className="font-medium text-purple-900 dark:text-purple-300 mb-3">Exemples de codes :</h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <code className="bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded text-xs font-mono">SEC1-MATH</code>
                          <span className="text-xs text-purple-600 dark:text-purple-400">Mathématiques 1er cycle</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded text-xs font-mono">PRI-FR</code>
                          <span className="text-xs text-purple-600 dark:text-purple-400">Français primaire</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded text-xs font-mono">MAT-LANG</code>
                          <span className="text-xs text-purple-600 dark:text-purple-400">Langage maternelle</span>
                        </div>
                </div>
                </div>
              </div>
            </div>
          </div>

        
        {/* Informations sur les coefficients */}
        {selectedLevel?.hasCoefficient && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedLevel?.hasClassCoefficients ? 'Coefficients par classe' : 'Coefficients'}
                      </h3>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        {selectedLevel?.hasClassCoefficients 
                          ? 'Pour le 2nd cycle du secondaire - Coefficients spécifiques par classe/série'
                          : `Pour le niveau ${selectedLevel.name}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedLevel?.hasClassCoefficients ? (
                      <div>
                        <p className="text-orange-800 dark:text-orange-300 mb-4">
                          <strong>🎯 Spécificité du 2nd cycle :</strong> Chaque matière est associée à une classe spécifique avec son coefficient.
                        </p>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                          <h5 className="font-medium text-orange-900 dark:text-orange-300 mb-3">Exemples par classe :</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-orange-800 dark:text-orange-400">2nde A (Littéraire)</span>
                              <span className="text-orange-600 dark:text-orange-400">Français: 4, Math: 2</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-800 dark:text-orange-400">1ère C (Scientifique)</span>
                              <span className="text-orange-600 dark:text-orange-400">Math: 4, Physique: 3</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-800 dark:text-orange-400">Tle D (Sciences)</span>
                              <span className="text-orange-600 dark:text-orange-400">SVT: 3, Chimie: 2</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg mt-4">
                          <p className="text-orange-800 dark:text-orange-300 text-sm">
                            <strong>💡 Note :</strong> Pour le 2nd cycle, vous devez créer une matière séparée pour chaque classe/série.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                    <p className="text-orange-800 dark:text-orange-300">
                      Les matières ont des coefficients qui influencent le calcul de la moyenne générale.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                        <h5 className="font-medium text-orange-900 dark:text-orange-300 mb-3">Coefficients courants :</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-orange-800 dark:text-orange-400">Mathématiques</span>
                            <span className="font-mono bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded">4</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-800 dark:text-orange-400">Français</span>
                            <span className="font-mono bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded">4</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-800 dark:text-orange-400">Histoire & Géographie</span>
                            <span className="font-mono bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-800 dark:text-orange-400">Anglais</span>
                            <span className="font-mono bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded">3</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                        <h5 className="font-medium text-orange-900 dark:text-orange-300 mb-3">Calcul de la moyenne :</h5>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                          <code className="text-orange-800 dark:text-orange-300 font-mono text-sm">
                    Moyenne = (Σ(Note × Coefficient)) / Σ(Coefficients)
                          </code>
                        </div>
                </div>
              </div>
                      </div>
                    )}
            </div>
          </div>
        )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Modifier la matière' : 'Créer la matière'}</span>
                </>
              )}
            </button>
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
};

export default SubjectModal;