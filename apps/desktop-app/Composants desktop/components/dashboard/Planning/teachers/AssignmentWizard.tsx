import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar,
  AlertTriangle,
  Info,
  Baby,
  GraduationCap
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import { EducationalCycle } from './TeachersTab';
import { sortClassesByLevel, getLevelDisplayName, getLevelCategory } from '../../../../utils/levelUtils';

interface AssignmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignmentData: any) => Promise<void>;
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  selectedCycle: EducationalCycle;
  editingAssignment?: any;
}

type WizardStep = 'cycle' | 'teacher' | 'assignment' | 'confirmation';

interface AssignmentData {
  mode: 'maternelle' | 'primaire' | 'secondaire';
  teacherId: string;
  teacherName: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  classIds?: string[];
  classNames?: string[];
  subjectIds?: string[];
  subjectNames?: string[];
  classSubjectPairs?: Array<{ classId: string; className: string; subjectId: string; subjectName: string }>;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
  notes: string;
}

const AssignmentWizard: React.FC<AssignmentWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  teachers,
  classes,
  subjects,
  selectedCycle,
  editingAssignment
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('cycle');
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    mode: selectedCycle === 'all' ? 'primaire' : selectedCycle as 'maternelle' | 'primaire' | 'secondaire',
    teacherId: '',
    teacherName: '',
    classIds: [],
    classNames: [],
    subjectIds: [],
    subjectNames: [],
    classSubjectPairs: [],
    hoursPerWeek: 18,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fonction pour calculer les vraies heures d'un enseignant
  const getTeacherRealHours = (teacherId: string) => {
    // Utiliser directement les heures de l'enseignant
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.hoursPerWeek || 0;
  };

  // Fonction pour obtenir les vraies matières d'un enseignant
  const getTeacherRealSubjects = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return [];
    }
    
    // Vérifier si l'enseignant a déjà des affectations (classes assignées)
    const hasAssignments = teacher.classes && teacher.classes.length > 0;
    
    // Si l'enseignant n'a pas d'affectations, ne pas afficher de matières
    if (!hasAssignments) {
      return [];
    }
    
    // Pour la maternelle et primaire, récupérer toutes les matières du niveau
    if (assignmentData.mode === 'maternelle' || assignmentData.mode === 'primaire') {
      // Récupérer toutes les matières du niveau depuis la liste des matières
      const levelSubjects = subjects.filter(subject => 
        subject.level.toLowerCase().includes(assignmentData.mode)
      );
      return levelSubjects.map(subject => ({ 
        name: subject.name, 
        id: subject.id 
      }));
    } else {
      // Pour le secondaire, utiliser la matière spécifique
      if (teacher.subject) {
        return [{ name: teacher.subject, id: 'static' }];
      }
    }
    
    return [];
  };

  // Réinitialiser quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (editingAssignment) {
        // Mode édition : pré-remplir avec les données existantes
        setCurrentStep('confirmation'); // Aller directement à la confirmation
        setAssignmentData({
          mode: editingAssignment.mode || 'primaire',
          teacherId: editingAssignment.teacherId || '',
          teacherName: editingAssignment.teacherName || '',
          classId: editingAssignment.classId || '',
          className: editingAssignment.className || '',
          subjectId: editingAssignment.subjectId || '',
          subjectName: editingAssignment.subjectName || '',
          classIds: editingAssignment.classIds || [],
          classNames: editingAssignment.classNames || [],
          hoursPerWeek: editingAssignment.hoursPerWeek || 18,
          startDate: editingAssignment.startDate || new Date().toISOString().split('T')[0],
          endDate: editingAssignment.endDate || '',
          notes: editingAssignment.notes || ''
        });
      } else {
        // Mode création : valeurs par défaut
        setCurrentStep('cycle');
        setAssignmentData({
          mode: selectedCycle === 'all' ? 'primaire' : selectedCycle as 'maternelle' | 'primaire' | 'secondaire',
          teacherId: '',
          teacherName: '',
          classId: '',
          className: '',
          subjectId: '',
          subjectName: '',
          classIds: [],
          classNames: [],
          hoursPerWeek: 18,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, selectedCycle, editingAssignment]);

  // Fonction pour déterminer le mode d'un enseignant basé sur ses affectations
  const getTeacherMode = (teacher: any) => {
    if (!teacher.classes || teacher.classes.length === 0) {
      return null; // Pas d'affectation
    }
    
    // Analyser les classes de l'enseignant pour déterminer son mode
    const hasMaternelle = teacher.classes.some((className: string) => {
      const classObj = classes.find(c => c.name === className);
      return classObj && getLevelCategory(classObj.level) === 'Maternelle';
    });
    
    const hasPrimaire = teacher.classes.some((className: string) => {
      const classObj = classes.find(c => c.name === className);
      return classObj && getLevelCategory(classObj.level) === 'Primaire';
    });
    
    const hasSecondaire = teacher.classes.some((className: string) => {
      const classObj = classes.find(c => c.name === className);
      return classObj && (getLevelCategory(classObj.level) === '1er Cycle secondaire' || 
                         getLevelCategory(classObj.level) === '2nd Cycle secondaire');
    });
    
    // Retourner le mode principal de l'enseignant
    if (hasMaternelle) return 'maternelle';
    if (hasPrimaire) return 'primaire';
    if (hasSecondaire) return 'secondaire';
    
    return null;
  };

  // Filtrer les enseignants disponibles (sans affectation ou avec peu d'heures)
  const availableTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // Enseignants actifs seulement
      if (teacher.status !== 'active') return false;
      
      // Déterminer le mode actuel de l'enseignant
      const teacherCurrentMode = getTeacherMode(teacher);
      
      // Si l'enseignant est déjà affecté dans un autre mode, l'exclure
      if (teacherCurrentMode && teacherCurrentMode !== assignmentData.mode) {
        return false;
      }
      
      // Pour maternelle/primaire : enseignants sans classe ou avec peu d'heures
      if (assignmentData.mode === 'maternelle' || assignmentData.mode === 'primaire') {
        return !teacher.classes || teacher.classes.length === 0 || (teacher.hoursPerWeek || 0) < 20;
      }
      
      // Pour secondaire : enseignants avec matière compatible
      return true;
    });
  }, [teachers, assignmentData.mode, classes]);

  // Filtrer les classes disponibles selon le mode
  const availableClasses = useMemo(() => {
    const filtered = classes.filter(classObj => {
      if (!classObj.level) return false;
      
      const category = getLevelCategory(classObj.level);
      
      switch (assignmentData.mode) {
        case 'maternelle':
          return category === 'Maternelle';
        case 'primaire':
          return category === 'Primaire';
        case 'secondaire':
          // Vérifier la catégorie ET le niveau directement
          const isSecondaryByCategory = category === '1er Cycle secondaire' || category === '2nd Cycle secondaire';
          const levelLower = classObj.level.toLowerCase();
          const isSecondaryByLevel = levelLower.includes('6') || levelLower.includes('5') || 
                                    levelLower.includes('4') || levelLower.includes('3') ||
                                    levelLower.includes('2nde') || levelLower.includes('1ère') || 
                                    levelLower.includes('tle') || levelLower.includes('terminale');
          
          return isSecondaryByCategory || isSecondaryByLevel;
        default:
          return true;
      }
    });
    
    // Trier les classes selon l'ordre hiérarchique
    const sorted = sortClassesByLevel(filtered);
    
    // Tri spécial pour les classes du secondaire : 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Tle
    if (assignmentData.mode === 'secondaire') {
      return sorted.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        
        // Ordre spécifique pour le secondaire
        const secondaryOrder = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];
        
        const indexA = secondaryOrder.findIndex(order => nameA.includes(order));
        const indexB = secondaryOrder.findIndex(order => nameB.includes(order));
        
        // Si les deux classes sont dans l'ordre spécifique, utiliser cet ordre
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // Sinon, utiliser l'ordre alphabétique
        return nameA.localeCompare(nameB);
      });
    }
    
    return sorted;
  }, [classes, assignmentData.mode]);

  // Filtrer les matières disponibles pour le secondaire basées sur les classes sélectionnées
  const availableSubjects = useMemo(() => {
    if (assignmentData.mode !== 'secondaire') return [];
    
    // Si aucune classe n'est sélectionnée, retourner toutes les matières du secondaire
    if (!assignmentData.classIds || assignmentData.classIds.length === 0) {
      return subjects.filter(subject => {
        if (!subject.level) return true;
        const category = getLevelCategory(subject.level);
        return category === '1er Cycle secondaire' || 
               category === '2nd Cycle secondaire' || 
               subject.level.toLowerCase().includes('tous') ||
               subject.level.toLowerCase().includes('all');
      });
    }
    
    // Déterminer le niveau des classes sélectionnées
    const selectedClasses = classes.filter(c => assignmentData.classIds?.includes(c.id));
    const hasFirstCycle = selectedClasses.some(c => {
      const category = getLevelCategory(c.level);
      return category === '1er Cycle secondaire';
    });
    const hasSecondCycle = selectedClasses.some(c => {
      const category = getLevelCategory(c.level);
      return category === '2nd Cycle secondaire';
    });
    
    // Filtrer les matières selon le niveau des classes sélectionnées
    return subjects.filter(subject => {
      if (!subject.level) return true;
      
      const category = getLevelCategory(subject.level);
      
      // Si les classes sont du 1er cycle, inclure les matières du 1er cycle
      if (hasFirstCycle && !hasSecondCycle) {
        return category === '1er Cycle secondaire' || 
               subject.level.toLowerCase().includes('tous') ||
               subject.level.toLowerCase().includes('all');
      }
      
      // Si les classes sont du 2nd cycle, inclure les matières du 2nd cycle
      if (hasSecondCycle && !hasFirstCycle) {
        return category === '2nd Cycle secondaire' || 
               subject.level.toLowerCase().includes('tous') ||
               subject.level.toLowerCase().includes('all');
      }
      
      // Si les classes sont mixtes (1er et 2nd cycle), inclure toutes les matières du secondaire
      if (hasFirstCycle && hasSecondCycle) {
        return category === '1er Cycle secondaire' || 
               category === '2nd Cycle secondaire' || 
               subject.level.toLowerCase().includes('tous') ||
               subject.level.toLowerCase().includes('all');
      }
      
      return false;
    });
  }, [subjects, assignmentData.mode, assignmentData.classIds, classes]);

  const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'cycle', title: 'Cycle éducatif', description: 'Choisir le type d\'affectation' },
    { id: 'teacher', title: 'Enseignant', description: 'Sélectionner l\'enseignant' },
    { id: 'assignment', title: 'Affectation', description: 'Définir classes et matières' },
    { id: 'confirmation', title: 'Confirmation', description: 'Valider l\'affectation' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'cycle':
        if (!assignmentData.mode) {
          newErrors.mode = 'Veuillez sélectionner un cycle éducatif';
        }
        break;
      
      case 'teacher':
        if (!assignmentData.teacherId) {
          newErrors.teacherId = 'Veuillez sélectionner un enseignant';
        }
        break;
      
      case 'assignment':
        if (assignmentData.mode === 'secondaire') {
          if (!assignmentData.classIds || assignmentData.classIds.length === 0) {
            newErrors.classIds = 'Veuillez sélectionner au moins une classe';
          }
          if (!assignmentData.subjectIds || assignmentData.subjectIds.length === 0) {
            newErrors.subjectIds = 'Veuillez sélectionner au moins une matière';
          }
          if (!assignmentData.classSubjectPairs || assignmentData.classSubjectPairs.length === 0) {
            newErrors.classSubjectPairs = 'Veuillez créer au moins une association classe-matière';
          }
        } else {
          if (!assignmentData.classId) {
            newErrors.classId = 'Veuillez sélectionner une classe';
          }
        }
        if (assignmentData.hoursPerWeek <= 0) {
          newErrors.hoursPerWeek = 'Les heures par semaine doivent être supérieures à 0';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevIndex].id);
  };

  const handleSave = async () => {
    if (!validateStep('assignment')) return;

    setSaving(true);
    try {
      const saveData = {
        mode: assignmentData.mode,
        teacherId: assignmentData.teacherId,
        ...(assignmentData.mode === 'secondaire' ? {
          classSubjectPairs: assignmentData.classSubjectPairs || [],
          classIds: assignmentData.classIds,
          subjectIds: assignmentData.subjectIds
        } : {
          classId: assignmentData.classId
        }),
        hoursPerWeek: assignmentData.hoursPerWeek,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate,
        notes: assignmentData.notes
      };

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ general: 'Erreur lors de la sauvegarde de l\'affectation' });
    } finally {
      setSaving(false);
    }
  };

  const handleTeacherSelect = (teacher: PlanningTeacher) => {
    setAssignmentData(prev => ({
      ...prev,
      teacherId: teacher.id,
      teacherName: teacher.name,
      // Pré-remplir la matière si l'enseignant en a une
      subjectId: teacher.subject && assignmentData.mode === 'secondaire' ? 
        subjects.find(s => s.name === teacher.subject)?.id || '' : prev.subjectId
    }));
  };

  const handleClassToggle = (classObj: PlanningClass) => {
    if (assignmentData.mode === 'secondaire') {
      const currentIds = assignmentData.classIds || [];
      const currentNames = assignmentData.classNames || [];
      
      if (currentIds.includes(classObj.id)) {
        setAssignmentData(prev => ({
          ...prev,
          classIds: currentIds.filter(id => id !== classObj.id),
          classNames: currentNames.filter(name => name !== classObj.name),
          // Réinitialiser la matière quand les classes changent
          subjectId: '',
          subjectName: ''
        }));
      } else {
        setAssignmentData(prev => ({
          ...prev,
          classIds: [...currentIds, classObj.id],
          classNames: [...currentNames, classObj.name],
          // Réinitialiser la matière quand les classes changent
          subjectId: '',
          subjectName: ''
        }));
      }
    } else {
      setAssignmentData(prev => ({
        ...prev,
        classId: classObj.id,
        className: classObj.name
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {editingAssignment ? 'Modifier l\'Affectation' : 'Assistant d\'Affectation'}
              </h2>
              <p className="text-orange-100">
                {editingAssignment ? 'Modification des paramètres d\'affectation' : 'Configuration simplifiée selon le cycle éducatif'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer l'assistant"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index < currentStepIndex 
                    ? 'bg-green-600 text-white' 
                    : index === currentStepIndex
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    index <= currentStepIndex 
                      ? 'text-gray-900 dark:text-gray-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Étape 1: Cycle */}
          {currentStep === 'cycle' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Choisissez le type d'affectation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Le mode d'affectation dépend du cycle éducatif de votre établissement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'maternelle',
                    name: 'Maternelle',
                    description: 'Un enseignant par classe',
                    details: 'L\'enseignant enseigne toutes les matières de sa classe',
                    icon: Baby,
                    color: 'pink'
                  },
                  {
                    id: 'primaire',
                    name: 'Primaire',
                    description: 'Un enseignant par classe',
                    details: 'L\'enseignant enseigne toutes les matières de sa classe',
                    icon: BookOpen,
                    color: 'blue'
                  },
                  {
                    id: 'secondaire',
                    name: 'Secondaire',
                    description: 'Un enseignant par matière',
                    details: 'L\'enseignant peut enseigner dans plusieurs classes',
                    icon: GraduationCap,
                    color: 'purple'
                  }
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = assignmentData.mode === mode.id;
                  
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setAssignmentData(prev => ({ ...prev, mode: mode.id as any }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? `border-${mode.color}-500 bg-${mode.color}-50 dark:bg-${mode.color}-900/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? `bg-${mode.color}-500 text-white`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {mode.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {mode.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {mode.details}
                      </p>
                    </button>
                  );
                })}
              </div>

              {errors.mode && (
                <div className="text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.mode}
                </div>
              )}
            </div>
          )}

          {/* Étape 2: Enseignant */}
          {currentStep === 'teacher' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Sélectionnez un enseignant
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choisissez l'enseignant à affecter en mode {assignmentData.mode}.
                </p>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {availableTeachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    onClick={() => handleTeacherSelect(teacher)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      assignmentData.teacherId === teacher.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const realSubjects = getTeacherRealSubjects(teacher.id);
                            const hasAssignments = teacher.classes && teacher.classes.length > 0;
                            const teacherCurrentMode = getTeacherMode(teacher);
                            
                            if (hasAssignments) {
                              let subjectText = '';
                              if (realSubjects.length > 0) {
                                if (realSubjects.length === 1) {
                                  subjectText = realSubjects[0].name;
                                } else if (realSubjects.length <= 3) {
                                  subjectText = realSubjects.map(s => s.name).join(', ');
                                } else {
                                  subjectText = `${realSubjects.length} matières (${realSubjects.slice(0, 2).map(s => s.name).join(', ')}...)`;
                                }
                              } else {
                                subjectText = teacher.subject || 'Aucune matière';
                              }
                              
                              // Ajouter l'indication du mode si différent du mode actuel
                              if (teacherCurrentMode && teacherCurrentMode !== assignmentData.mode) {
                                const modeLabels = {
                                  'maternelle': 'Maternelle',
                                  'primaire': 'Primaire',
                                  'secondaire': 'Secondaire'
                                };
                                return `${subjectText} (${modeLabels[teacherCurrentMode as keyof typeof modeLabels]})`;
                              }
                              
                              return subjectText;
                            } else {
                              return 'Non affecté';
                            }
                          })()} • {getTeacherRealHours(teacher.id)}h/semaine
                        </div>
                      </div>
                      {assignmentData.teacherId === teacher.id && (
                        <Check className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {availableTeachers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun enseignant disponible pour ce cycle</p>
                </div>
              )}

              {errors.teacherId && (
                <div className="text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.teacherId}
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Affectation */}
          {currentStep === 'assignment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Configurez l'affectation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {assignmentData.mode === 'secondaire' 
                    ? 'Sélectionnez une matière et les classes où l\'enseignant interviendra.'
                    : 'Sélectionnez la classe dont l\'enseignant sera titulaire.'
                  }
                </p>
              </div>

              {/* Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {assignmentData.mode === 'secondaire' ? 'Classes (sélection multiple)' : 'Classe titulaire'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableClasses.map((classObj) => {
                    const isSelected = assignmentData.mode === 'secondaire'
                      ? (assignmentData.classIds || []).includes(classObj.id)
                      : assignmentData.classId === classObj.id;
                    
                    return (
                      <button
                        key={classObj.id}
                        onClick={() => handleClassToggle(classObj)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {classObj.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {getLevelDisplayName(classObj.level)} • {classObj.capacity} élèves max
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {(errors.classId || errors.classIds) && (
                  <div className="text-red-600 text-sm mt-1">
                    {errors.classId || errors.classIds}
                  </div>
                )}
              </div>

              {/* Matières (secondaire uniquement) */}
              {assignmentData.mode === 'secondaire' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matières spécialisées
                    {assignmentData.classIds && assignmentData.classIds.length > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        (Filtrées selon les classes sélectionnées)
                      </span>
                    )}
                  </label>
                  
                  {/* Sélection multiple de matières */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableSubjects.map(subject => (
                      <label key={subject.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assignmentData.subjectIds?.includes(subject.id) || false}
                          onChange={(e) => {
                            const currentIds = assignmentData.subjectIds || [];
                            const currentNames = assignmentData.subjectNames || [];
                            
                            if (e.target.checked) {
                              setAssignmentData(prev => ({
                                ...prev,
                                subjectIds: [...currentIds, subject.id],
                                subjectNames: [...currentNames, subject.name]
                              }));
                            } else {
                              setAssignmentData(prev => ({
                                ...prev,
                                subjectIds: currentIds.filter(id => id !== subject.id),
                                subjectNames: currentNames.filter(name => name !== subject.name)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {subject.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            ({getLevelCategory(subject.level)})
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {availableSubjects.length === 0 && assignmentData.classIds && assignmentData.classIds.length > 0 && (
                    <div className="text-amber-600 text-sm mt-1">
                      Aucune matière disponible pour les classes sélectionnées
                    </div>
                  )}
                  {errors.subjectIds && (
                    <div className="text-red-600 text-sm mt-1">{errors.subjectIds}</div>
                  )}
                  
                  {/* Associations classe-matière */}
                  {assignmentData.classIds && assignmentData.classIds.length > 0 && assignmentData.subjectIds && assignmentData.subjectIds.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Associations classe-matière
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          (Cochez les associations souhaitées)
                        </span>
                      </label>
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          </div>
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-1">Filtrage automatique par cycle :</p>
                            <ul className="text-xs space-y-1">
                              <li>• <strong>Classes 1er cycle</strong> (6ème, 5ème, 4ème, 3ème) → <strong>Matières 1er cycle</strong></li>
                              <li>• <strong>Classes 2nd cycle</strong> (2nde, 1ère, Tle) → <strong>Matières 2nd cycle</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assignmentData.classIds.map(classId => {
                          const className = assignmentData.classNames?.find((_, index) => assignmentData.classIds?.[index] === classId) || '';
                          return (
                            <div key={classId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                                <div className="flex items-center">
                                  <GraduationCap className="w-4 h-4 mr-2 text-orange-600" />
                                  {className}
                                </div>
                                {(() => {
                                  const classObj = classes.find(c => c.id === classId);
                                  const classCategory = classObj ? getLevelCategory(classObj.level) : '';
                                  const isFirstCycle = classCategory === '1er Cycle secondaire';
                                  const isSecondCycle = classCategory === '2nd Cycle secondaire';
                                  
                                  if (isFirstCycle) {
                                    return (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        1er Cycle
                                      </span>
                                    );
                                  } else if (isSecondCycle) {
                                    return (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        2nd Cycle
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(() => {
                                  // Déterminer le cycle de la classe
                                  const classObj = classes.find(c => c.id === classId);
                                  const classCategory = classObj ? getLevelCategory(classObj.level) : '';
                                  const isFirstCycle = classCategory === '1er Cycle secondaire';
                                  const isSecondCycle = classCategory === '2nd Cycle secondaire';
                                  
                                  // Filtrer les matières selon le cycle de la classe
                                  const filteredSubjects = assignmentData.subjectIds.filter(subjectId => {
                                    const subject = availableSubjects.find(s => s.id === subjectId);
                                    if (!subject) return false;
                                    
                                    const subjectCategory = getLevelCategory(subject.level);
                                    
                                    if (isFirstCycle) {
                                      return subjectCategory === '1er Cycle secondaire';
                                    } else if (isSecondCycle) {
                                      return subjectCategory === '2nd Cycle secondaire';
                                    }
                                    
                                    return false;
                                  });
                                  
                                  return filteredSubjects.map(subjectId => {
                                    const subjectName = assignmentData.subjectNames?.find((_, index) => assignmentData.subjectIds?.[index] === subjectId) || '';
                                    const subject = availableSubjects.find(s => s.id === subjectId);
                                    return (
                                      <label key={`${classId}-${subjectId}`} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={assignmentData.classSubjectPairs?.some(pair => pair.classId === classId && pair.subjectId === subjectId) || false}
                                          onChange={(e) => {
                                            const currentPairs = assignmentData.classSubjectPairs || [];
                                            
                                            if (e.target.checked) {
                                              setAssignmentData(prev => ({
                                                ...prev,
                                                classSubjectPairs: [...currentPairs, {
                                                  classId,
                                                  className,
                                                  subjectId,
                                                  subjectName
                                                }]
                                              }));
                                            } else {
                                              setAssignmentData(prev => ({
                                                ...prev,
                                                classSubjectPairs: currentPairs.filter(pair => 
                                                  !(pair.classId === classId && pair.subjectId === subjectId)
                                                )
                                              }));
                                            }
                                          }}
                                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {subjectName} ({subject ? getLevelCategory(subject.level) : ''})
                                        </span>
                                      </label>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {errors.classSubjectPairs && (
                        <div className="text-red-600 text-sm mt-2">{errors.classSubjectPairs}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Heures par semaine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heures par semaine
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={assignmentData.hoursPerWeek}
                    onChange={(e) => setAssignmentData(prev => ({
                      ...prev,
                      hoursPerWeek: parseInt(e.target.value) || 0
                    }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    title="Nombre d'heures par semaine"
                  />
                  {errors.hoursPerWeek && (
                    <div className="text-red-600 text-sm mt-1">{errors.hoursPerWeek}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={assignmentData.startDate}
                    onChange={(e) => setAssignmentData(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    title="Date de début de l'affectation"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={assignmentData.notes}
                  onChange={(e) => setAssignmentData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
          )}

          {/* Étape 4: Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Confirmez l'affectation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Vérifiez les informations avant de valider l'affectation.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Informations générales
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                        <span className="font-medium">{assignmentData.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Enseignant:</span>
                        <span className="font-medium">{assignmentData.teacherName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Charge:</span>
                        <span className="font-medium">{assignmentData.hoursPerWeek}h/semaine</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Début:</span>
                        <span className="font-medium">{assignmentData.startDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Affectation détaillée
                    </h4>
                    <div className="space-y-2 text-sm">
                      {assignmentData.mode === 'secondaire' ? (
                        <>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Associations classe-matière:</span>
                            <div className="mt-2 space-y-2">
                              {(assignmentData.classSubjectPairs || []).map((pair, index) => (
                                <div key={index} className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                    {pair.className}
                                  </span>
                                  <span className="text-sm text-orange-600 dark:text-orange-400">
                                    {pair.subjectName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Classe:</span>
                          <span className="font-medium">{assignmentData.className}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {assignmentData.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{assignmentData.notes}</p>
                  </div>
                )}
              </div>

              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.general}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Annuler
            </button>
            
            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingAssignment ? 'Modifier l\'affectation' : 'Confirmer l\'affectation'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentWizard;
