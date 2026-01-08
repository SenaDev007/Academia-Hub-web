import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  AlertCircle,
  BookOpen,
  RefreshCw,
  CheckCircle,
  Circle
} from 'lucide-react';
import { useAcademicYear } from '../../hooks/useAcademicYear';
import { usePlanningData } from '../../hooks/usePlanningData';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import ValidationModal from './ValidationModal';

interface FeeConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feeData: unknown) => void;
  isEditMode?: boolean;
  selectedConfiguration?: any;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

const FeeConfigurationModal: React.FC<FeeConfigurationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isEditMode = false,
  selectedConfiguration = null
}) => {
  // Hooks pour la gestion des années scolaires
  const {
    academicYears,
    loading: academicYearLoading,
    getAcademicYearOptions
  } = useAcademicYear();

  // État pour l'année scolaire sélectionnée avec persistance
  const {
    selectedAcademicYear: selectedSchoolYear, 
    setSelectedAcademicYear: setSelectedSchoolYear 
  } = useAcademicYearState('fee-configuration');

  // Utiliser le hook Planning pour récupérer les classes
  const { classes, loading: classesLoading, refreshData: refreshClasses } = usePlanningData();

  // États pour les frais
  const [inscriptionFee, setInscriptionFee] = useState<number>(0);
  const [reinscriptionFee, setReinscriptionFee] = useState<number>(0);
  const [tuitionFee, setTuitionFee] = useState<number>(0);
  const [isReinscriptionFree, setIsReinscriptionFree] = useState<boolean>(false);

  // État pour les classes sélectionnées
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  // Date d'effet par défaut (aujourd'hui)
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // État pour le modal de validation
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState({ 
    title: '', 
    message: '', 
    type: 'warning' as 'error' | 'warning' | 'info' | 'success' 
  });

  // Précharger les données en mode édition
  useEffect(() => {
    if (isOpen && isEditMode && selectedConfiguration) {
      console.log('🔄 Préchargement des données pour l\'édition:', selectedConfiguration);
      
      // Précharger les données de la configuration sélectionnée
      if (selectedConfiguration.inscriptionFee) {
        setInscriptionFee(selectedConfiguration.inscriptionFee);
      }
      if (selectedConfiguration.reinscriptionFee) {
        setReinscriptionFee(selectedConfiguration.reinscriptionFee);
        setIsReinscriptionFree(selectedConfiguration.reinscriptionFee === 0);
      }
      if (selectedConfiguration.tuitionFee) {
        setTuitionFee(selectedConfiguration.tuitionFee);
      }
      if (selectedConfiguration.effectiveDate) {
        setEffectiveDate(selectedConfiguration.effectiveDate);
      }
      
      // Précharger l'année scolaire si disponible
      if (selectedConfiguration.academicYearId) {
        const academicYearOptions = getAcademicYearOptions();
        const year = academicYearOptions.find(y => (y as any).value === selectedConfiguration.academicYearId);
        if (year) {
          setSelectedSchoolYear(year as any);
        }
      }
      
      // Précharger les classes sélectionnées si disponibles
      if (selectedConfiguration.classId) {
        setSelectedClasses(new Set([selectedConfiguration.classId]));
      }
    } else if (isOpen && !isEditMode) {
      // Réinitialiser le formulaire en mode création
      setInscriptionFee(0);
      setReinscriptionFee(0);
      setTuitionFee(0);
      setIsReinscriptionFree(false);
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setSelectedClasses(new Set());
    }
  }, [isOpen, isEditMode, selectedConfiguration]);

  // Grouper les classes par niveau avec ordre défini
  const groupedClasses = classes.reduce((acc: {[key: string]: Class[]}, cls: Class) => {
    if (!acc[cls.level]) {
      acc[cls.level] = [];
    }
    acc[cls.level].push(cls);
    return acc;
  }, {});

  // Définir l'ordre des niveaux : Maternelle, Primaire, 1er Cycle Secondaire, 2nd Cycle Secondaire
  const levelOrder = ['maternelle', 'primaire', '1er-cycle-secondaire', '2nd-cycle-secondaire'];
  
  // Définir l'ordre des classes pour chaque niveau
  const classOrderByLevel: { [key: string]: string[] } = {
    'primaire': ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    '1er-cycle-secondaire': ['6ème', '5ème', '4ème', '3ème'],
    '2nd-cycle-secondaire': ['2nde', '1ère', 'Tle']
  };
  
  // Fonction pour trier les classes par niveau
  const sortClassesByLevel = (classes: Class[], level: string) => {
    const classOrder = classOrderByLevel[level];
    if (!classOrder) return classes; // Pas d'ordre spécifique pour ce niveau
    
    return classes.sort((a, b) => {
      const aClassName = a.name || '';
      const bClassName = b.name || '';
      
      const aIndex = classOrder.findIndex(className => 
        aClassName.toLowerCase().includes(className.toLowerCase())
      );
      const bIndex = classOrder.findIndex(className => 
        bClassName.toLowerCase().includes(className.toLowerCase())
      );
      
      // Si les deux classes sont trouvées dans l'ordre, trier par index
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // Si une seule classe est trouvée, la mettre en premier
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Si aucune classe n'est trouvée, trier alphabétiquement
      return aClassName.localeCompare(bClassName);
    });
  };
  
  // Trier les niveaux selon l'ordre défini et trier les classes dans chaque niveau
  const sortedGroupedClasses = Object.keys(groupedClasses)
    .sort((a, b) => {
      const indexA = levelOrder.indexOf(a);
      const indexB = levelOrder.indexOf(b);
      // Si le niveau n'est pas dans la liste, le mettre à la fin
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .reduce((acc, level) => {
      // Trier les classes de ce niveau selon l'ordre spécifié
      acc[level] = sortClassesByLevel(groupedClasses[level], level);
      return acc;
    }, {} as {[key: string]: Class[]});

  // Utiliser sortedGroupedClasses pour l'affichage ordonné
  const displayGroupedClasses = sortedGroupedClasses;

  // Fonction pour formater l'année scolaire
  const formatAcademicYear = (academicYear: any) => {
    if (!academicYear) return 'Chargement...';
    
    // Si c'est un objet avec une propriété name, l'utiliser
    if (typeof academicYear === 'object' && academicYear.name) {
      return academicYear.name;
    }
    
    // Si c'est un objet avec une propriété id, extraire l'année de l'ID
    if (typeof academicYear === 'object' && academicYear.id) {
      // Chercher d'abord le pattern academic-year-YYYY-YYYY
      const match = academicYear.id.match(/academic-year-(\d{4}-\d{4})/);
      if (match) {
        return match[1]; // Retourne "2025-2026"
      }
      
      // Si c'est un UUID, chercher l'année académique correspondante
      if (academicYears && academicYears.length > 0) {
        const year = academicYears.find(y => (y as any).id === academicYear.id);
        if (year && (year as any).name) {
          return (year as any).name;
        }
      }
      
      return academicYear.id;
    }
    
    // Si c'est une chaîne, traiter comme avant
    if (typeof academicYear === 'string') {
      const match = academicYear.match(/academic-year-(\d{4}-\d{4})/);
      if (match) {
        return match[1]; // Retourne "2025-2026"
      }
      return academicYear;
    }
    
    // Fallback
    return 'Année non définie';
  };

  // Recharger automatiquement les classes quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Rechargement automatique des classes...');
      refreshClasses();
    }
  }, [isOpen, refreshClasses]);

  // Debug des classes
  useEffect(() => {
    console.log('🔍 Classes dans FeeConfigurationModal:', classes);
    console.log('🔍 Nombre de classes:', classes.length);
    if (classes.length > 0) {
      console.log('🔍 Première classe:', classes[0]);
      console.log('🔍 Level de la première classe:', classes[0].level);
    }
  }, [classes]);

  // Fonction pour basculer la sélection d'une classe
  const toggleClassSelection = (classId: string) => {
    setSelectedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  // Fonction pour sélectionner/désélectionner toutes les classes d'un niveau
  const toggleLevelSelection = (level: string) => {
    const levelClasses = displayGroupedClasses[level] || [];
    const levelClassIds = levelClasses.map(cls => cls.id);
    
    setSelectedClasses(prev => {
      const newSet = new Set(prev);
      const allSelected = levelClassIds.every(id => newSet.has(id));
      
      if (allSelected) {
        // Désélectionner toutes les classes de ce niveau
        levelClassIds.forEach(id => newSet.delete(id));
      } else {
        // Sélectionner toutes les classes de ce niveau
        levelClassIds.forEach(id => newSet.add(id));
      }
      
      return newSet;
    });
  };

  // Fonction pour sélectionner toutes les classes
  const selectAllClasses = () => {
    const allClassIds = classes.map(cls => cls.id);
    setSelectedClasses(new Set(allClassIds));
  };

  // Fonction pour désélectionner toutes les classes
  const deselectAllClasses = () => {
    setSelectedClasses(new Set());
  };

  // Capitaliser le niveau scolaire
  const capitalizeLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'maternelle': 'Maternelle',
      'primaire': 'Primaire',
      '1er-cycle-secondaire': '1er Cycle Secondaire',
      '2nd-cycle-secondaire': '2nd Cycle Secondaire'
    };
    return levelMap[level] || level;
  };

  // Fonction pour obtenir les informations d'un niveau
  const getLevelInfo = (level: string) => {
    const levelMap: {[key: string]: {icon: any, color: string, bgColor: string, textColor: string, description: string}} = {
      'maternelle': {
        icon: BookOpen,
        color: 'from-pink-500 to-rose-600',
        bgColor: 'from-pink-50 to-rose-50',
        textColor: 'text-pink-700',
        description: 'Éducation préscolaire (3-5 ans)'
      },
      'primaire': {
        icon: GraduationCap,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50',
        textColor: 'text-blue-700',
        description: 'Enseignement fondamental (6-11 ans)'
      },
      '1er-cycle-secondaire': {
        icon: BookOpen,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50',
        textColor: 'text-green-700',
        description: 'Premier cycle du secondaire (12-15 ans)'
      },
      '2nd-cycle-secondaire': {
        icon: GraduationCap,
        color: 'from-purple-500 to-violet-600',
        bgColor: 'from-purple-50 to-violet-50',
        textColor: 'text-purple-700',
        description: 'Deuxième cycle du secondaire (16-18 ans)'
      }
    };
    
    return levelMap[level] || {
      icon: BookOpen,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      textColor: 'text-gray-700',
      description: 'Niveau d\'éducation'
    };
  };


  // Fonction pour trouver une classe par ID
  const findClassById = (classId: string): Class | undefined => {
    return classes.find(cls => cls.id === classId);
  };

  // Fonction de soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit appelé - Début de la soumission');
    console.log('📊 Données actuelles:', {
      inscriptionFee,
      reinscriptionFee,
      tuitionFee,
      selectedClasses: Array.from(selectedClasses),
      classesCount: classes.length,
      selectedSchoolYear,
      effectiveDate
    });
    
    // Validation des données saisies
    const hasValidFees = inscriptionFee > 0 || (!isReinscriptionFree && reinscriptionFee > 0) || tuitionFee > 0;
    const hasSelectedClasses = selectedClasses.size > 0;
    const hasClasses = classes.length > 0;

    if (!hasClasses) {
      setValidationMessage({
        title: 'Aucune classe disponible',
        message: 'Aucune classe n\'est disponible dans le système. Veuillez créer des classes dans l\'onglet Planning avant de configurer les frais.',
        type: 'error'
      });
      setIsValidationModalOpen(true);
      return;
    }

    if (!hasValidFees) {
      setValidationMessage({
        title: 'Validation requise',
        message: 'Veuillez saisir au moins un montant de frais pour pouvoir enregistrer la configuration.',
        type: 'warning'
      });
      setIsValidationModalOpen(true);
      return;
    }

    if (!hasSelectedClasses) {
      setValidationMessage({
        title: 'Sélection requise',
        message: 'Veuillez sélectionner au moins une classe pour appliquer les frais.',
        type: 'warning'
      });
      setIsValidationModalOpen(true);
      return;
    }

    // Préparer les données pour chaque classe sélectionnée
    const feeData = {
      academicYearId: selectedSchoolYear,
      effectiveDate,
      configurations: Array.from(selectedClasses).map(classId => {
        const classInfo = findClassById(classId);
        console.log(`🔍 Classe ${classId}:`, classInfo);
        console.log(`🔍 Level de la classe:`, classInfo?.level);
        
        if (!classInfo) {
          throw new Error(`Classe ${classId} non trouvée`);
        }
        
        if (!classInfo.level) {
          throw new Error(`Niveau manquant pour la classe ${classInfo.name || classId}`);
        }
        
        return {
          level: classInfo.level,
          classId: classId,
          inscriptionFee: inscriptionFee,
          reinscriptionFee: isReinscriptionFree ? 0 : reinscriptionFee,
          tuitionFees: tuitionFee > 0 ? [tuitionFee] : [],
          effectiveDate: effectiveDate,
          schoolId: 'school-1'
        };
      })
    };

    console.log('✅ Validation réussie - Données de frais à sauvegarder:', feeData);
    onSave(feeData);
    console.log('📤 onSave appelé avec succès');
  };

  // Fonction pour fermer le modal
  const handleClose = () => {
    // Réinitialiser les états
    setInscriptionFee(0);
    setReinscriptionFee(0);
    setTuitionFee(0);
    setSelectedClasses(new Set());
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {isEditMode ? 'Modifier la Configuration des Frais' : 'Configuration des Frais Scolaires'}
                    </h2>
                    <p className="text-indigo-100 text-sm">
                      {isEditMode ? 'Modifiez les frais et les classes concernées' : 'Définissez les frais et sélectionnez les classes concernées'}
                    </p>
                  </div>
                </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="fee-configuration-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Informations générales et frais */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Informations Générales
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Définissez l'année scolaire, la date d'application et les montants des frais
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label htmlFor="academicYear" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Année Scolaire *
              </label>
              <select
                      id="academicYear"
                      value={selectedSchoolYear || ''}
                      onChange={(e) => setSelectedSchoolYear(e.target.value)}
                required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                      aria-label="Sélectionner l'année scolaire"
                      disabled={academicYearLoading}
                    >
                      {academicYearLoading ? (
                        <option value="">Chargement des années scolaires...</option>
                      ) : selectedSchoolYear ? (
                        getAcademicYearOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} {option.isCurrent ? '(Actuelle)' : ''}
                          </option>
                        ))
                      ) : (
                        <option value="">Sélectionner une année scolaire...</option>
                      )}
              </select>
            </div>
            
                  <div className="space-y-2">
                    <label htmlFor="effectiveDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date d'Application *
              </label>
              <input
                type="date"
                id="effectiveDate"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
              />
          </div>
        </div>

                {/* Frais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frais d'inscription */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Frais d'Inscription
                                        </label>
                                        <div className="relative">
                                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                        value={inscriptionFee}
                        onChange={(e) => setInscriptionFee(parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right font-semibold transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                          placeholder="0"
                          min="0"
                          max="999999999"
                          step="1"
                        />
                          </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">F CFA</div>
                      </div>

            {/* Frais de réinscription */}
                  <div className="space-y-2">
                                <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Frais de Réinscription
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isReinscriptionFree"
                          checked={isReinscriptionFree}
                          onChange={(e) => {
                            setIsReinscriptionFree(e.target.checked);
                            if (e.target.checked) {
                              setReinscriptionFee(0);
                            }
                          }}
                          className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="isReinscriptionFree" className="text-sm text-gray-600 dark:text-gray-400">
                          Réinscription gratuite
                        </label>
                                    </div>
                                    </div>
                    <>
                      {!isReinscriptionFree && (
                        <>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              value={reinscriptionFee}
                              onChange={(e) => setReinscriptionFee(parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right font-semibold transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                              placeholder="0"
                              min="0"
                              max="999999999"
                              step="1"
                            />
                                  </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">F CFA</div>
                        </>
                      )}
                      {isReinscriptionFree && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                            Réinscription gratuite pour cette configuration
                                      </span>
                        </div>
                      )}
                    </>
                </div>

                  {/* Frais de scolarité */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Frais de Scolarité
                                        </label>
                                        <div className="relative">
                                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                        value={tuitionFee}
                        onChange={(e) => setTuitionFee(parseInt(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right font-semibold transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                          placeholder="0"
                          min="0"
                          max="999999999"
                          step="1"
                        />
                                        </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">F CFA</div>
                                        </div>
                      </div>
                  </div>

              {/* Section 2: Sélection des classes */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                      <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Sélection des Classes
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choisissez les classes auxquelles appliquer les frais
                            </p>
                          </div>
                        </div>
                  <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🔄 Rechargement manuel des classes...');
                            refreshClasses();
                          }}
                      disabled={classesLoading}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                      <RefreshCw className={`w-4 h-4 ${classesLoading ? 'animate-spin' : ''}`} />
                      <span>{classesLoading ? 'Actualisation...' : 'Actualiser'}</span>
                        </button>
                    <span className="text-xs text-gray-500">
                      {classes.length} classes disponibles
                    </span>
                  </div>
                      </div>

                {/* Actions globales */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedClasses.size} classe(s) sélectionnée(s) sur {classes.length}
                                      </span>
                                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={selectAllClasses}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllClasses}
                      className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Tout désélectionner
                        </button>
                  </div>
                </div>

                {/* Message de chargement */}
                {classesLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Chargement des classes...
                                              </span>
                </div>
              </div>
            )}

                {/* Message quand aucune classe n'est disponible */}
                {!classesLoading && classes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Aucune classe disponible
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Aucune classe n'a été trouvée dans le système. Veuillez créer des classes dans l'onglet Planning avant de configurer les frais.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                          console.log('🔄 Rechargement des classes...');
                            refreshClasses();
                          }}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Actualiser</span>
                        </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Fermer
                        </button>
                        </div>
                  </div>
                )}

                {/* Liste des classes groupées par niveau */}
                {!classesLoading && classes.length > 0 && (
                  <div className="space-y-3">
                    {Object.entries(displayGroupedClasses).map(([level, levelClasses]) => {
                          const levelInfo = getLevelInfo(level);
                    const levelClassIds = levelClasses.map(cls => cls.id);
                    const selectedCount = levelClassIds.filter(id => selectedClasses.has(id)).length;
                    const allSelected = levelClassIds.length > 0 && selectedCount === levelClassIds.length;
                    const someSelected = selectedCount > 0 && selectedCount < levelClassIds.length;
                          
                          return (
                            <div key={level} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                              {/* En-tête du niveau */}
                              <div 
                          className={`bg-gradient-to-r ${levelInfo.bgColor} dark:from-gray-700 dark:to-gray-600 px-4 py-3 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200`}
                          onClick={() => toggleLevelSelection(level)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${levelInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                      <levelInfo.icon className="w-5 h-5 text-white" />
                            </div>
                                    <div>
                                      <h4 className={`text-lg font-bold ${levelInfo.textColor} dark:text-gray-100`}>
                                        {capitalizeLevel(level)}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {levelInfo.description}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {levelClasses.length} classe(s) • {selectedCount} sélectionnée(s)
                                      </p>
                        </div>
                      </div>
                                  <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {allSelected ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : someSelected ? (
                                  <div className="w-5 h-5 border-2 border-amber-500 rounded-full bg-amber-100"></div>
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {allSelected ? 'Tout sélectionné' : someSelected ? 'Partiellement sélectionné' : 'Aucune sélection'}
                                      </span>
                                  </div>
                  </div>
                </div>
                        </div>

                        {/* Liste des classes */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {levelClasses.map((cls) => {
                              const isSelected = selectedClasses.has(cls.id);
                                            
                                            return (
                                <div
                                  key={cls.id}
                                  onClick={() => toggleClassSelection(cls.id)}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      {isSelected ? (
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                      )}
                            </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium ${
                                        isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                                      }`}>
                                        {cls.name}
                                      </p>
                                    </div>
                                  </div>
                              </div>
                                            );
                                          })}
                        </div>
                                          </div>
                            </div>
                          );
                        })}
              </div>
            )}
        </div>

              {/* Message d'information */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      Information Importante
          </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Cette configuration sera appliquée automatiquement à tous les élèves 
                      des classes sélectionnées pour l'année scolaire <strong>{formatAcademicYear(selectedSchoolYear)}</strong> à partir de la date d'application.
                    </p>
                  </div>
                </div>
              </div>
            </form>
            </div>
            
          {/* Footer */}
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Configuration pour l'année {formatAcademicYear(selectedSchoolYear)}</span>
              </div>
            </div>
            
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="fee-configuration-form"
                  disabled={classesLoading || classes.length === 0}
                  onClick={() => console.log('🖱️ Bouton Enregistrer cliqué')}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    classesLoading || classes.length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  <span>
                    {classesLoading 
                      ? 'Chargement...' 
                      : classes.length === 0 
                        ? 'Aucune classe disponible' 
                        : 'Enregistrer la Configuration'
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de validation */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        title={validationMessage.title}
        message={validationMessage.message}
        type={validationMessage.type}
      />
    </>
  );
};

export default FeeConfigurationModal;