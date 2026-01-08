import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FileText, Filter, Eye, BarChart3, Users, RefreshCw, Edit3, Save, X, Plus, Download } from 'lucide-react';
import AcademicYearSelector from '../../../components/common/AcademicYearSelector';
import QuarterSelector from '../../../components/common/QuarterSelector';
import ModernModal from '../../../components/common/ModernModal';
import BordereauPreviewModal from '../../../components/modals/BordereauPreviewModal';
import { useAcademicYearState } from '../../../hooks/useAcademicYearState';
import { useQuarterState } from '../../../hooks/useQuarterState';
import { useModal } from '../../../hooks/useModal';

export function BordereauNotes() {
  // Hooks pour la gestion des années scolaires et trimestres
  const {
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentAcademicYear,
    academicYearLoading
  } = useAcademicYearState('bordereaux');

  const {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter,
    quarterLoading
  } = useQuarterState('bordereaux');

  // Hook pour le modal moderne
  const { modalState, hideModal, showError, showSuccess, showWarning } = useModal();

  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showBordereauPreview, setShowBordereauPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour les données dynamiques
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [bordereauxData, setBordereauxData] = useState<any[]>([]);
  
  // États pour la section d'édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableNotes, setEditableNotes] = useState<{[key: string]: any}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingAverages, setIsSavingAverages] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // États pour les modes (comme dans Saisie des Notes)
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [existingNotes, setExistingNotes] = useState<{[key: string]: boolean}>({});
  
  // Notes existantes détaillées par élève, matière et évaluation (pour le grisage précis)
  const [existingNotesDetails, setExistingNotesDetails] = useState<{[key: string]: {[key: string]: {[key: string]: any}}}>({});

  const niveauxScolaires = [
    { id: 'maternelle', label: 'Maternelle' },
    { id: 'primaire', label: 'Primaire' },
    { id: '1er_cycle', label: '1er Cycle Secondaire' },
    { id: '2nd_cycle', label: '2nd Cycle Secondaire' }
  ];
  
  
  // Fonction pour charger les classes selon le niveau
  const loadClasses = async () => {
    if (!selectedLevel) {
      setClasses([]);
      return;
    }

    try {
      console.log('🔍 Chargement des classes pour le niveau:', selectedLevel);
      console.log('🔍 Année académique sélectionnée:', selectedAcademicYear);
      
      const response = await apiService.getClasses({
        academicYearId: selectedAcademicYear,
        level: selectedLevel
      });
      
      if (response.data) {
        console.log('📚 Classes chargées:', response.data.length);
        setClasses(response.data);
      } else {
        setClasses([]);
        console.log('⚠️ Aucune classe trouvée pour ce niveau');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des classes:', error);
      setClasses([]);
      showError('Erreur', 'Erreur lors du chargement des classes.');
    }
  };

  // Fonction pour charger les matières selon la classe (même approche que SaisieNotes)
  const loadSubjects = async () => {
    if (!selectedClass || !selectedLevel) {
      setSubjects([]);
      return;
    }

    try {
      console.log('🔍 Chargement des matières pour la classe:', selectedClass, 'niveau:', selectedLevel);
      const response = await apiService.getMatieres({
        classId: selectedClass,
        level: selectedLevel
      });
      
      if (response.data) {
        console.log('📚 Matières chargées:', response.data.length);
        setSubjects(response.data);
      } else {
        setSubjects([]);
        console.log('⚠️ Aucune matière trouvée pour cette classe');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matières:', error);
      setSubjects([]);
      showError('Erreur', 'Erreur lors du chargement des matières.');
    }
  };

  // Fonction pour charger les données du bordereau
  const loadBordereauData = async (isRefresh = false) => {
    if (!selectedAcademicYear || !selectedQuarter || !selectedLevel || !selectedClass) {
      setBordereauxData([]);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      console.log('🔍 Chargement des données du bordereau...');
      console.log('🔍 Paramètres envoyés:', {
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClass
      });
      
      // Utiliser la même approche que SaisieNotes : charger les notes directement
      const gradesResponse = await apiService.getExistingGrades({
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClass,
        subjectId: '', // Toutes les matières
        evaluationType: 'all' // Toutes les évaluations
      });

      console.log('📚 Notes récupérées:', gradesResponse);
      console.log('📚 Nombre de notes récupérées:', Array.isArray(gradesResponse) ? gradesResponse.length : 'Non-array');

      // Charger les étudiants (même approche que SaisieNotes)
      const studentsResponse = await apiService.getEleves({
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        status: 'active'
      });

      console.log('👥 Étudiants récupérés:', studentsResponse);

        // Charger les matières pour récupérer les coefficients
        const subjectsResponse = await apiService.getMatieres({
          classId: selectedClass,
          level: selectedLevel
        });

      console.log('📚 Matières récupérées:', subjectsResponse);

      if (studentsResponse.data && studentsResponse.data.length > 0) {
        // Créer un map des coefficients par matière
        const coefficientsMap: { [key: string]: number } = {};
        if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
          subjectsResponse.data.forEach((subject: any) => {
            coefficientsMap[subject.id] = subject.coefficient || 1;
          });
        }

        // Traiter les notes comme dans SaisieNotes
        const notesData: { [key: string]: any } = {};
        
        if (Array.isArray(gradesResponse) && gradesResponse.length > 0) {
          gradesResponse.forEach((grade: any) => {
            if (grade.notes) {
              try {
                let parsedNotes;
                
                // Essayer de parser comme JSON, sinon utiliser la valeur directement
                if (typeof grade.notes === 'string') {
                  try {
                    parsedNotes = JSON.parse(grade.notes);
                  } catch (jsonError) {
                    // Si ce n'est pas du JSON valide, utiliser la valeur directement
                    parsedNotes = { [grade.evaluationType]: grade.notes };
                  }
                } else {
                  parsedNotes = grade.notes;
                }
                
                if (!notesData[grade.studentId]) {
                  notesData[grade.studentId] = {};
                }
                
                // Normaliser les clés avant fusion (important pour Primaire)
                const normalized = normalizeNotesForLevel(parsedNotes);
                
                // Calculer la moyenne par matière à partir des notes existantes
                const calculatedMoyenne = calculateSubjectAverage(normalized, selectedLevel);
                
                notesData[grade.studentId][grade.subjectId] = {
                  ...notesData[grade.studentId][grade.subjectId],
                  ...normalized,
                  coef: coefficientsMap[grade.subjectId] || 1,
                  moyenne: calculatedMoyenne > 0 ? calculatedMoyenne : (grade.moyenne || 0),
                  rang: grade.rang,
                  appreciation: grade.appreciation
                };
                
                console.log(`📚 Notes pour étudiant ${grade.studentId}, matière ${grade.subjectId}:`, notesData[grade.studentId][grade.subjectId]);
              } catch (error) {
                console.error('Erreur lors du parsing des notes:', error);
              }
            }
          });
        }

        // S'assurer que tous les étudiants ont des entrées pour toutes les matières avec coefficients
        if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
          studentsResponse.data.forEach((student: any) => {
            if (!notesData[student.id]) {
              notesData[student.id] = {};
            }
            subjectsResponse.data.forEach((subject: any) => {
              if (!notesData[student.id][subject.id]) {
                notesData[student.id][subject.id] = {
                  coef: subject.coefficient || 1,
                  moyenne: 0
                };
              } else {
                if (!notesData[student.id][subject.id].coef) {
                  notesData[student.id][subject.id].coef = subject.coefficient || 1;
                }
                // Recalculer la moyenne si elle n'est pas présente ou est 0
                if (!notesData[student.id][subject.id].moyenne || notesData[student.id][subject.id].moyenne === 0) {
                  const calculatedMoyenne = calculateSubjectAverage(notesData[student.id][subject.id], selectedLevel);
                  notesData[student.id][subject.id].moyenne = calculatedMoyenne;
                }
              }
            });
          });
        }

        // Créer les données du bordereau
        const bordereauData = studentsResponse.data.map((student: any) => {
          const studentNotes = notesData[student.id] || {};
          
          console.log(`🔍 Étudiant ${student.id} (${student.lastName || student.nom}):`, {
            studentNotes,
            notesDataKeys: Object.keys(notesData),
            studentId: student.id
          });
          
          // Calculer la moyenne générale selon le niveau
          let moyenneGenerale: number | string | null = null;
          if (Object.keys(studentNotes).length > 0) {
            if (selectedLevel === 'maternelle') {
              // Pour la maternelle, calculer l'annotation générale basée sur les "Moy." de toutes les matières
              const subjectAverages = Object.values(studentNotes).map((subjectData: any) => {
                // Calculer la moyenne qualitative pour chaque matière
                const em1 = subjectData.em1 || subjectData.EM1 || '-';
                const em2 = subjectData.em2 || subjectData.EM2 || '-';
                const ec = subjectData.ec || subjectData.EC || '-';
                console.log(`🔍 Calcul moyenne générale - EM1: ${em1}, EM2: ${em2}, EC: ${ec}`);
                const result = calculateQualitativeAverage(em1, em2, ec);
                console.log(`🔍 Résultat calcul: ${result}`);
                return result;
              }).filter(avg => avg !== '-');
              
              console.log(`🔍 Moyennes par matière:`, subjectAverages);
              
              if (subjectAverages.length > 0) {
                // Convertir les annotations en valeurs numériques pour le calcul
                const numericAverages = subjectAverages.map(avg => {
                  switch (avg) {
                    case 'TS': return 3;
                    case 'S': return 2;
                    case 'PS': return 1;
                    default: return 0;
                  }
                });
                const numericAverage = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
                
                console.log(`🔍 Valeurs numériques:`, numericAverages, `Moyenne: ${numericAverage}`);
                
                // Convertir la moyenne numérique en annotation qualitative
                if (numericAverage >= 2.5) moyenneGenerale = 'TS';
                else if (numericAverage >= 1.5) moyenneGenerale = 'S';
                else moyenneGenerale = 'PS';
                
                console.log(`🔍 Moyenne générale finale: ${moyenneGenerale}`);
              } else {
                console.log(`🔍 Aucune moyenne calculée, résultat: -`);
                moyenneGenerale = '-';
              }
            } else if (selectedLevel === '2nd_cycle') {
              // Pour le 2nd cycle, calculer la moyenne générale avec coefficients
              const subjectData = Object.values(studentNotes);
              let totalMoyenneCoef = 0;
              let totalCoeffs = 0;
              
              subjectData.forEach((subject: any) => {
                const coef = subject.coef || 1;
                const moyenneCoef = subject.moyenne || 0; // Moyenne coef déjà calculée
                if (moyenneCoef > 0) {
                  totalMoyenneCoef += moyenneCoef * coef;
                  totalCoeffs += coef;
                }
              });
              
              if (totalCoeffs > 0) {
                moyenneGenerale = totalMoyenneCoef / totalCoeffs;
              } else {
                moyenneGenerale = null;
              }
            } else {
              // Pour les autres niveaux, calculer la moyenne numérique en utilisant la même logique que SaisieNotes
              const subjectAverages = Object.values(studentNotes).map((subjectData: any) => {
                return calculateSubjectAverage(subjectData, selectedLevel);
              }).filter(avg => avg !== null && avg > 0);
              
              if (subjectAverages.length > 0) {
                moyenneGenerale = subjectAverages.reduce((sum, avg) => sum + avg, 0) / subjectAverages.length;
              } else {
                moyenneGenerale = null;
              }
            }
          }

          return {
            id: student.id,
            nom: student.lastName || student.nom,
            prenom: student.firstName || student.prenom,
            numeroEducmaster: student.registrationNumber || student.numeroEducmaster || `E${student.id.slice(-4)}`,
            sexe: student.gender || student.sexe || 'M',
            notes: studentNotes,
            moyenneGenerale: selectedLevel === 'maternelle' ? moyenneGenerale : 
              (typeof moyenneGenerale === 'string' ? null : (moyenneGenerale === null ? null : parseFloat(moyenneGenerale.toFixed(2)))),
            rang: 0 // Sera calculé après
          };
        });

        // Calculer les rangs selon le niveau
        if (selectedLevel === 'maternelle') {
          // Pour la maternelle, trier par annotation qualitative (TS > S > PS)
          bordereauData.sort((a, b) => {
            const getNumericValue = (annotation: string | number) => {
              if (typeof annotation === 'string') {
                switch (annotation) {
                  case 'TS': return 3;
                  case 'S': return 2;
                  case 'PS': return 1;
                  default: return 0;
                }
              }
              return annotation;
            };
            return getNumericValue(b.moyenneGenerale) - getNumericValue(a.moyenneGenerale);
          });
        } else {
          // Pour les autres niveaux, trier par valeur numérique
          bordereauData.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
        }
        
        bordereauData.forEach((student, index) => {
          student.rang = index + 1;
        });

        setBordereauxData(bordereauData);
        console.log('📊 Données du bordereau chargées:', bordereauData.length, 'étudiants');
        console.log('📊 Données détaillées:', bordereauData);
        
        // Charger les notes existantes dans editableNotes pour la section d'édition
        const editableNotesData: { [key: string]: any } = {};
        
        // Charger depuis notesData (données brutes de la base de données)
        Object.keys(notesData).forEach(studentId => {
          editableNotesData[studentId] = {};
          Object.keys(notesData[studentId]).forEach(subjectId => {
            editableNotesData[studentId][subjectId] = { ...notesData[studentId][subjectId] };
          });
        });
        
        // Aussi charger depuis bordereauData pour s'assurer de la cohérence
        bordereauData.forEach(student => {
          if (student.notes && Object.keys(student.notes).length > 0) {
            if (!editableNotesData[student.id]) {
              editableNotesData[student.id] = {};
            }
            Object.keys(student.notes).forEach(subjectId => {
              editableNotesData[student.id][subjectId] = { ...student.notes[subjectId] };
            });
          }
        });
        
        console.log('📝 Notes chargées dans editableNotes:', editableNotesData);
        setEditableNotes(editableNotesData);
        
        // Stocker les notes existantes détaillées pour le grisage précis
        const existingNotesDetailsMap: { [key: string]: {[key: string]: {[key: string]: any}} } = {};
        
        if (Array.isArray(gradesResponse) && gradesResponse.length > 0) {
          gradesResponse.forEach((grade: any) => {
            if (grade.notes) {
              try {
                let parsedNotes;
                
                // Essayer de parser comme JSON, sinon utiliser la valeur directement
                if (typeof grade.notes === 'string') {
                  try {
                    parsedNotes = JSON.parse(grade.notes);
                  } catch (jsonError) {
                    // Si ce n'est pas du JSON valide, utiliser la valeur directement
                    parsedNotes = { [grade.evaluationType]: grade.notes };
                  }
                } else {
                  parsedNotes = grade.notes;
                }
                
                if (!existingNotesDetailsMap[grade.studentId]) {
                  existingNotesDetailsMap[grade.studentId] = {};
                }
                
                if (!existingNotesDetailsMap[grade.studentId][grade.subjectId]) {
                  existingNotesDetailsMap[grade.studentId][grade.subjectId] = {};
                }
                
                // Stocker les notes existantes pour chaque évaluation
                Object.keys(parsedNotes).forEach(evaluationKey => {
                  if (parsedNotes[evaluationKey] && parsedNotes[evaluationKey] !== '') {
                    existingNotesDetailsMap[grade.studentId][grade.subjectId][evaluationKey] = parsedNotes[evaluationKey];
                  }
                });
                
              } catch (error) {
                console.error('Erreur lors du parsing des notes existantes:', error);
              }
            }
          });
        }
        
        setExistingNotesDetails(existingNotesDetailsMap);
        console.log('📚 Notes existantes détaillées stockées:', existingNotesDetailsMap);
      } else {
        console.log('❌ Aucun étudiant trouvé');
        setBordereauxData([]);
        setExistingNotesDetails({});
        showWarning('Aucune donnée', 'Aucun étudiant trouvé pour cette classe.');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du bordereau:', error);
      setBordereauxData([]);
      setExistingNotesDetails({});
      showError('Erreur', 'Erreur lors du chargement des données du bordereau.');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Réinitialiser la classe quand l'année académique change
  useEffect(() => {
    if (selectedAcademicYear) {
      console.log('🔄 Année académique changée, réinitialisation de la classe sélectionnée');
      setSelectedClass('');
    }
  }, [selectedAcademicYear]);

  // Réinitialiser la classe et l'évaluation quand le niveau change
  useEffect(() => {
    if (selectedLevel) {
      console.log('🔄 Niveau changé, réinitialisation de la classe sélectionnée');
      setSelectedClass('');
    } else {
      // Si aucun niveau n'est sélectionné, réinitialiser tout
      console.log('🔄 Aucun niveau sélectionné, réinitialisation complète');
      setSelectedClass('');
    }
  }, [selectedLevel]);

  // useEffect pour charger les classes quand le niveau change
  useEffect(() => {
    if (selectedLevel) {
      loadClasses();
      setSelectedClass(''); // Réinitialiser la classe sélectionnée
    } else {
      // Réinitialiser les données si aucun niveau n'est sélectionné
      setClasses([]);
      setSubjects([]);
      setBordereauxData([]);
    }
  }, [selectedLevel]);

  // useEffect pour charger les matières quand la classe change
  useEffect(() => {
    if (selectedClass) {
      loadSubjects();
    } else {
      // Réinitialiser les matières si aucune classe n'est sélectionnée
      setSubjects([]);
      setBordereauxData([]);
    }
  }, [selectedClass]);

  // useEffect pour charger les données du bordereau quand les paramètres changent
  useEffect(() => {
    if (selectedAcademicYear && selectedQuarter && selectedLevel && selectedClass) {
      loadBordereauData();
    } else {
      // Réinitialiser les données du bordereau si des paramètres manquent
      setBordereauxData([]);
    }
  }, [selectedAcademicYear, selectedQuarter, selectedLevel, selectedClass]);

  // useEffect pour l'auto-sauvegarde des moyennes
  useEffect(() => {
    if (bordereauxData.length > 0 && selectedAcademicYear && selectedQuarter && selectedLevel && selectedClass) {
      // Auto-sauvegarde après 30 secondes de délai
      const autoSaveTimer = setTimeout(() => {
        autoSaveAverages();
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [bordereauxData, selectedAcademicYear, selectedQuarter, selectedLevel, selectedClass]);

  // Fonction pour obtenir les classes disponibles (comme dans Saisie des Notes)
  const getAvailableClasses = () => {
    if (!selectedLevel || !selectedAcademicYear) {
      return [];
    }
    console.log('✅ Classes disponibles pour le niveau', selectedLevel, ':', classes);
    return classes;
  };

  // Fonction pour calculer la moyenne qualitative (TS/S/PS) - même approche que SaisieNotes
  const calculateQualitativeAverage = (em1: string, em2: string, ec: string): string => {
    const values = [em1, em2, ec].filter(note => note && note !== '-');
    if (values.length === 0) return '-';
    
    // Convertir TS=3, S=2, PS=1 (même logique que SaisieNotes)
    const numericValues = values.map(note => {
      switch (note) {
        case 'TS': return 3;
        case 'S': return 2;
        case 'PS': return 1;
        default: return 0;
      }
    });
    
    const average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    
    // Convertir la moyenne numérique en annotation qualitative
    if (average >= 2.5) return 'TS';
    if (average >= 1.5) return 'S';
    return 'PS';
  };

  // Fonction pour calculer la moyenne selon le niveau (identique à SaisieNotes)
  const calculateSubjectAverage = (subjectNotes: any, level: string): number | null => {
    if (!subjectNotes) return null;
    
    switch (level) {
      case 'maternelle':
        const em1_mat = subjectNotes['em1'] || subjectNotes['EM1'];
        const em2_mat = subjectNotes['em2'] || subjectNotes['EM2'];
        const ec_mat = subjectNotes['ec'] || subjectNotes['EC'];
        if (em1_mat && em2_mat && ec_mat && em1_mat !== '-' && em2_mat !== '-' && ec_mat !== '-') {
          const convertToNumber = (value: string) => {
            switch (value) {
              case 'TS': return 3;
              case 'S': return 2;
              case 'PS': return 1;
              default: return 0;
            }
          };
          const em1_num = convertToNumber(em1_mat);
          const em2_num = convertToNumber(em2_mat);
          const ec_num = convertToNumber(ec_mat);
          const moyenneEM = (em1_num + em2_num) / 2;
          return (moyenneEM + ec_num) / 2;
        }
        return null;
      case 'primaire':
        // Calculer les notes EM1, EM2, EC à partir de CM + CP
        const em1_cm = parseFloat(subjectNotes['em1_cm'] || '0');
        const em1_cp = parseFloat(subjectNotes['em1_cp'] || '0');
        const em2_cm = parseFloat(subjectNotes['em2_cm'] || '0');
        const em2_cp = parseFloat(subjectNotes['em2_cp'] || '0');
        const ec_cm = parseFloat(subjectNotes['ec_cm'] || '0');
        const ec_cp = parseFloat(subjectNotes['ec_cp'] || '0');
        
        const em1 = em1_cm + em1_cp;
        const em2 = em2_cm + em2_cp;
        const ec = ec_cm + ec_cp;
        
        // Formule spécifique pour le primaire: (((EM1+EM2)/2)+EC)/2
        if (em1 > 0 && em2 > 0 && ec > 0) {
          const moyenneEM = (em1 + em2) / 2;
          return (moyenneEM + ec) / 2;
        }
        
        // Si toutes les notes ne sont pas disponibles, calculer avec celles disponibles
        const availableNotes = [em1, em2, ec].filter(note => note > 0);
        if (availableNotes.length > 0) {
          return availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length;
        }
        return null;
      case '1er_cycle':
        const ie1_1er = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
        const ie2_1er = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
        const ds1_1er = parseFloat(subjectNotes['ds1'] || subjectNotes['DS1'] || '0');
        const ds2_1er = parseFloat(subjectNotes['ds2'] || subjectNotes['DS2'] || '0');
        
        // Formule spécifique pour le 1er cycle: Moy = (Moy IE + DS1 + DS2) / 3
        // où Moy IE = (IE1 + IE2) / 2
        if (ie1_1er > 0 && ie2_1er > 0) {
          const moyIE = (ie1_1er + ie2_1er) / 2;
          const availableNotes = [moyIE, ds1_1er, ds2_1er].filter(note => note > 0);
          if (availableNotes.length > 0) {
            return availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length;
          }
        }
        
        // Si IE1 et IE2 ne sont pas tous les deux disponibles, calculer avec les notes disponibles
        const availableNotes1er = [ie1_1er, ie2_1er, ds1_1er, ds2_1er].filter(note => note > 0);
        if (availableNotes1er.length > 0) {
          return availableNotes1er.reduce((sum, note) => sum + note, 0) / availableNotes1er.length;
        }
        return null;
      case '2nd_cycle':
        const ie1_2nd = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
        const ie2_2nd = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
        const ds1_2nd = parseFloat(subjectNotes['ds1'] || subjectNotes['DS1'] || '0');
        const ds2_2nd = parseFloat(subjectNotes['ds2'] || subjectNotes['DS2'] || '0');
        const coef = subjectNotes['coef'] || 1;
        
        // Calculer la moyenne avec les notes disponibles
        const availableNotes2nd = [ie1_2nd, ie2_2nd, ds1_2nd, ds2_2nd].filter(note => note > 0);
        
        if (availableNotes2nd.length > 0) {
          const moyenneBase = availableNotes2nd.reduce((sum, note) => sum + note, 0) / availableNotes2nd.length;
          return moyenneBase * coef;
        }
        return null;
    }
    return null;
  };

  // Fonction pour calculer la moyenne IE (identique à SaisieNotes)
  const calculateMoyenneIE = (subjectNotes: any): string => {
    if (!subjectNotes) return '-';
    
    const ie1 = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
    const ie2 = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
    
    if (ie1 && ie2) {
      return ((ie1 + ie2) / 2).toFixed(2);
    }
    return '-';
  };

  // Fonction pour calculer la Moy. (moyenne sans coefficient) pour 2nd cycle
  const calculateMoy = (subjectNotes: any): string => {
    if (!subjectNotes) return '-';
    
    const ie1 = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
    const ie2 = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
    const ds1 = parseFloat(subjectNotes['ds1'] || subjectNotes['DS1'] || '0');
    const ds2 = parseFloat(subjectNotes['ds2'] || subjectNotes['DS2'] || '0');
    
    // Calculer la moyenne avec les notes disponibles
    const availableNotes = [ie1, ie2, ds1, ds2].filter(note => note > 0);
    
    if (availableNotes.length > 0) {
      return (availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length).toFixed(2);
    }
    return '-';
  };

  // Fonction pour obtenir les colonnes selon le niveau scolaire (même logique que SaisieNotes)
  const getColumnsForLevel = () => {
    switch (selectedLevel) {
      case 'maternelle':
        return [
          { key: 'em1', label: 'EM1', type: 'radio', options: ['TS', 'S', 'PS'] },
          { key: 'em2', label: 'EM2', type: 'radio', options: ['TS', 'S', 'PS'] },
          { key: 'ec', label: 'EC', type: 'radio', options: ['TS', 'S', 'PS'] },
          { key: 'moyenne', label: 'Moy.', type: 'calculated' }
        ];
      case 'primaire':
        return [
          { 
            key: 'em1', 
            label: 'EM1', 
            type: 'group',
            subcolumns: [
              { key: 'em1_cm', label: 'CM', sublabel: '/18', type: 'number' },
              { key: 'em1_cp', label: 'CP', sublabel: '/2', type: 'number' },
              { key: 'em1_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { 
            key: 'em2', 
            label: 'EM2', 
            type: 'group',
            subcolumns: [
              { key: 'em2_cm', label: 'CM', sublabel: '/18', type: 'number' },
              { key: 'em2_cp', label: 'CP', sublabel: '/2', type: 'number' },
              { key: 'em2_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { 
            key: 'ec', 
            label: 'EC', 
            type: 'group',
            subcolumns: [
              { key: 'ec_cm', label: 'CM', sublabel: '/18', type: 'number' },
              { key: 'ec_cp', label: 'CP', sublabel: '/2', type: 'number' },
              { key: 'ec_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { key: 'moyenne', label: 'Moy', type: 'calculated' }
        ];
      case '1er_cycle':
        return [
          { key: 'ie1', label: 'IE1', type: 'number' },
          { key: 'ie2', label: 'IE2', type: 'number' },
          { key: 'moy_ie', label: 'Moy. IE', type: 'calculated' },
          { key: 'ds1', label: 'DS1', type: 'number' },
          { key: 'ds2', label: 'DS2', type: 'number' },
          { key: 'moyenne', label: 'Moy', type: 'calculated' }
        ];
      case '2nd_cycle':
        return [
          { key: 'ie1', label: 'IE1', type: 'number' },
          { key: 'ie2', label: 'IE2', type: 'number' },
          { key: 'moy_ie', label: 'Moy. IE', type: 'calculated' },
          { key: 'ds1', label: 'DS1', type: 'number' },
          { key: 'ds2', label: 'DS2', type: 'number' },
          { key: 'moy', label: 'Moy.', type: 'calculated' },
          { key: 'coef', label: 'Coef', type: 'coefficient' },
          { key: 'moyenne', label: 'Moy. coef', type: 'calculated' }
        ];
      default:
        return [];
    }
  };


  // Fonction pour formater le rang avec gestion du sexe et ex-aequo
  const formatRang = (rang: number, sexe: string) => {
    let suffix = '';
    if (rang === 1) {
      suffix = sexe === 'F' ? 'ère' : 'er';
    } else {
      suffix = 'ème';
    }
    return `${rang}${suffix}`;
  };

  // Fonction pour calculer la moyenne générale en temps réel (en combinant bordereauxData et editableNotes)
  const calculateRealtimeMoyenneGenerale = (studentId: string) => {
    const student = bordereauxData.find(s => s.id === studentId);
    if (!student) return selectedLevel === 'maternelle' ? '-' : null;

    // Si l'étudiant a des notes en cours d'édition, les utiliser
    const currentNotes = editableNotes[studentId] || {};
    
    if (Object.keys(currentNotes).length > 0) {
      // Recalculer la moyenne générale avec les notes en cours d'édition
      if (selectedLevel === 'maternelle') {
        // Pour la maternelle, calculer l'annotation générale basée sur les moyennes de toutes les matières
        const subjectAverages = Object.values(currentNotes).map((subjectData: any) => {
          const em1 = subjectData.em1 || subjectData.EM1 || '-';
          const em2 = subjectData.em2 || subjectData.EM2 || '-';
          const ec = subjectData.ec || subjectData.EC || '-';
          
          if (em1 !== '-' && em2 !== '-' && ec !== '-') {
            return calculateQualitativeAverage(em1, em2, ec);
          }
          return null;
        }).filter(avg => avg !== null);

        if (subjectAverages.length > 0) {
          const numericAverages = subjectAverages.map(avg => {
            switch (avg) {
              case 'TS': return 3;
              case 'S': return 2;
              case 'PS': return 1;
              default: return 0;
            }
          });
          const numericAverage = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
          
          if (numericAverage >= 2.5) return 'TS';
          else if (numericAverage >= 1.5) return 'S';
          else return 'PS';
        }
        return '-';
      } else {
        // Pour les autres niveaux, calculer la moyenne numérique en utilisant les moyennes par matière en temps réel
        const subjectIds = Object.keys(currentNotes);
        const subjectAverages = subjectIds.map(subjectId => {
          return calculateRealtimeSubjectMoyenne(studentId, subjectId);
        }).filter(avg => avg !== null && avg > 0);
        
        if (subjectAverages.length > 0) {
          return subjectAverages.reduce((sum, avg) => sum + avg, 0) / subjectAverages.length;
        }
        return null;
      }
    }

    // Sinon, recalculer la moyenne générale à partir des notes existantes
    if (selectedLevel === 'maternelle') {
      // Pour la maternelle, calculer l'annotation générale basée sur les moyennes de toutes les matières
      const subjectAverages = Object.values(student.notes || {}).map((subjectData: any) => {
        const em1 = subjectData.em1 || subjectData.EM1 || '-';
        const em2 = subjectData.em2 || subjectData.EM2 || '-';
        const ec = subjectData.ec || subjectData.EC || '-';
        
        if (em1 !== '-' && em2 !== '-' && ec !== '-') {
          return calculateQualitativeAverage(em1, em2, ec);
        }
        return null;
      }).filter(avg => avg !== null);

      if (subjectAverages.length > 0) {
        const numericAverages = subjectAverages.map(avg => {
          switch (avg) {
            case 'TS': return 3;
            case 'S': return 2;
            case 'PS': return 1;
            default: return 0;
          }
        });
        const numericAverage = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
        
        if (numericAverage >= 2.5) return 'TS';
        else if (numericAverage >= 1.5) return 'S';
        else return 'PS';
      }
      return '-';
    } else {
      // Pour les autres niveaux, calculer la moyenne numérique en utilisant les moyennes par matière
      const subjectIds = Object.keys(student.notes || {});
      const subjectAverages = subjectIds.map(subjectId => {
        return calculateSubjectAverage(student.notes[subjectId], selectedLevel);
      }).filter(avg => avg !== null && avg > 0);
      
      if (subjectAverages.length > 0) {
        return subjectAverages.reduce((sum, avg) => sum + avg, 0) / subjectAverages.length;
      }
      return null;
    }
  };

  // Fonction pour calculer la moyenne d'une matière spécifique en temps réel
  const calculateRealtimeSubjectMoyenne = (studentId: string, subjectId: string) => {
    const student = bordereauxData.find(s => s.id === studentId);
    if (!student) return null;

    // Si l'étudiant a des notes en cours d'édition pour cette matière, les utiliser
    const currentNotes = editableNotes[studentId] || {};
    const subjectNotes = currentNotes[subjectId];
    
    if (subjectNotes) {
      // Recalculer la moyenne de la matière avec les notes en cours d'édition
      if (selectedLevel === 'maternelle') {
        // Pour la maternelle, calculer la moyenne qualitative
        const em1 = subjectNotes.em1 || subjectNotes.EM1 || '-';
        const em2 = subjectNotes.em2 || subjectNotes.EM2 || '-';
        const ec = subjectNotes.ec || subjectNotes.EC || '-';
        
        if (em1 !== '-' && em2 !== '-' && ec !== '-') {
          const result = calculateQualitativeAverage(em1, em2, ec);
          // Convertir en numérique pour l'affichage
          switch (result) {
            case 'TS': return 3;
            case 'S': return 2;
            case 'PS': return 1;
            default: return 0;
          }
        }
        return null;
      } else {
        // Pour les autres niveaux, calculer la moyenne numérique
        const em1_cm = parseFloat(subjectNotes.em1_cm || '0');
        const em1_cp = parseFloat(subjectNotes.em1_cp || '0');
        const em2_cm = parseFloat(subjectNotes.em2_cm || '0');
        const em2_cp = parseFloat(subjectNotes.em2_cp || '0');
        const ec_cm = parseFloat(subjectNotes.ec_cm || '0');
        const ec_cp = parseFloat(subjectNotes.ec_cp || '0');
        
        const em1_note = em1_cm + em1_cp;
        const em2_note = em2_cm + em2_cp;
        const ec_note = ec_cm + ec_cp;
        
        // Formule spécifique pour le primaire: (((EM1+EM2)/2)+EC)/2
        if (selectedLevel === 'primaire' && em1_note > 0 && em2_note > 0 && ec_note > 0) {
          const moyenneEM = (em1_note + em2_note) / 2;
          return (moyenneEM + ec_note) / 2;
        }
        
        // Pour les autres niveaux ou si toutes les notes ne sont pas disponibles
        const notes = [em1_note, em2_note, ec_note].filter(note => note > 0);
        if (notes.length > 0) {
          return notes.reduce((sum, note) => sum + note, 0) / notes.length;
        }
        return null;
      }
    }

    // Sinon, recalculer la moyenne à partir des notes statiques
    const staticSubjectNotes = student.notes && student.notes[subjectId];
    if (staticSubjectNotes) {
      // Recalculer la moyenne en utilisant la même logique que calculateSubjectAverage
      return calculateSubjectAverage(staticSubjectNotes, selectedLevel);
    }
    return null;
  };

  // Fonction pour calculer le rang en temps réel
  const calculateRealtimeRang = (studentId: string) => {
    // Créer une liste de tous les étudiants avec leurs moyennes en temps réel
    const studentsWithMoyennes = bordereauxData.map(student => ({
      ...student,
      moyenneGenerale: calculateRealtimeMoyenneGenerale(student.id)
    }));

    // Trier selon le niveau
    if (selectedLevel === 'maternelle') {
      studentsWithMoyennes.sort((a, b) => {
        const getNumericValue = (annotation: string | number) => {
          switch (annotation) {
            case 'TS': return 3;
            case 'S': return 2;
            case 'PS': return 1;
            default: return 0;
          }
        };
        return getNumericValue(b.moyenneGenerale) - getNumericValue(a.moyenneGenerale);
      });
    } else {
      studentsWithMoyennes.sort((a, b) => {
        const avgA = typeof a.moyenneGenerale === 'string' ? 0 : (a.moyenneGenerale === null ? 0 : a.moyenneGenerale);
        const avgB = typeof b.moyenneGenerale === 'string' ? 0 : (b.moyenneGenerale === null ? 0 : b.moyenneGenerale);
        return avgB - avgA;
      });
    }

    // Trouver le rang de l'étudiant
    const studentIndex = studentsWithMoyennes.findIndex(s => s.id === studentId);
    return studentIndex + 1;
  };
  const getAppreciationColor = (moyenne: number) => {
    if (moyenne >= 16) return 'text-green-700 bg-green-50';
    if (moyenne >= 14) return 'text-blue-700 bg-blue-50';
    if (moyenne >= 12) return 'text-yellow-700 bg-yellow-50';
    if (moyenne >= 10) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };

  const getAppreciationText = (moyenne: number) => {
    if (moyenne >= 18) return 'Excellent 🌟';
    if (moyenne >= 16) return 'Très Bien 😊';
    if (moyenne >= 14) return 'Bien 👍';
    if (moyenne >= 12) return 'Assez Bien 😐';
    if (moyenne >= 10) return 'Passable ⚠️';
    if (moyenne >= 8) return 'Insuffisant ❌';
    return 'Très Insuffisant 🚫';
  };


  const handlePreview = () => {
    setShowBordereauPreview(true);
  };



  // Fonction pour changer de mode (comme dans Saisie des Notes)
  const handleModeChange = (newMode: 'view' | 'add' | 'edit') => {
    setMode(newMode);
    setEditingStudentId(null);
    
    if (newMode === 'add' || newMode === 'edit') {
      initializeEditableNotes();
    }
  };

  // Fonction pour basculer le mode d'édition
  const toggleEditMode = () => {
    if (!isEditMode) {
      initializeEditableNotes();
    }
    setIsEditMode(!isEditMode);
  };

  // Fonction pour gérer les changements de notes
  const handleNoteChange = (studentId: string, subjectId: string, evaluationType: string, value: string) => {
    // Permettre toujours la suppression de la note (champ vide)
    if (value === '' || value === null || value === undefined) {
      setEditableNotes(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subjectId]: {
            ...prev[studentId]?.[subjectId],
            [evaluationType]: value
          }
        }
      }));
      return;
    }

    // Validation pour les niveaux avec notes numériques
    if (selectedLevel === 'primaire' || selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle') {
      const numericValue = parseFloat(value);
      
      // Vérifier si la valeur est un nombre valide
      if (!isNaN(numericValue)) {
        // Validation spécifique pour le primaire (CM et CP)
        if (selectedLevel === 'primaire') {
          if (evaluationType.includes('_cm')) {
            // CM ne doit pas dépasser 18
            if (numericValue < 0) {
              showWarning(
                'Note CM invalide', 
                `La note CM ne peut pas être négative. Vous avez saisi ${numericValue}.`
              );
              return;
            } else if (numericValue > 18) {
              showWarning(
                'Note CM invalide', 
                `La note CM ne peut pas être supérieure à 18. Vous avez saisi ${numericValue}.`
              );
              return;
            }
          } else if (evaluationType.includes('_cp')) {
            // CP ne doit pas dépasser 2
            if (numericValue < 0) {
              showWarning(
                'Note CP invalide', 
                `La note CP ne peut pas être négative. Vous avez saisi ${numericValue}.`
              );
              return;
            } else if (numericValue > 2) {
              showWarning(
                'Note CP invalide', 
                `La note CP ne peut pas être supérieure à 2. Vous avez saisi ${numericValue}.`
              );
              return;
            }
          }
        } else {
          // Pour les autres niveaux (1er cycle, 2nd cycle), validation 0-20
          if (numericValue < 0) {
            showWarning(
              'Note invalide', 
              `La note ne peut pas être négative. Vous avez saisi ${numericValue}.`
            );
            return;
          } else if (numericValue > 20) {
            showWarning(
              'Note invalide', 
              `La note ne peut pas être supérieure à 20. Vous avez saisi ${numericValue}.`
            );
            return;
          }
        }
      }
    }

    // Mise à jour si la validation passe
    setEditableNotes(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [evaluationType]: value
        }
      }
    }));
  };

  // Fonction pour initialiser les notes éditables
  const initializeEditableNotes = () => {
    if (!bordereauxData || bordereauxData.length === 0) {
      console.log('⚠️ Aucune donnée de bordereau disponible pour l\'initialisation');
      setEditableNotes({});
      return;
    }

    if (!selectedLevel) {
      console.log('⚠️ Aucun niveau sélectionné pour l\'initialisation');
      setEditableNotes({});
      return;
    }

    const notes: {[key: string]: any} = {};
    
    console.log('🔧 Initialisation des notes éditables pour', bordereauxData.length, 'étudiants');
    
    bordereauxData.forEach(student => {
      notes[student.id] = {};
      
      // Parcourir toutes les matières (pas seulement celles avec des notes)
      subjects.forEach(subject => {
        const subjectNotes = student.notes?.[subject.id] || {};
        notes[student.id][subject.id] = {};
        
        // Initialiser les notes pour chaque évaluation
        const evaluationColumns = getColumnsForLevel();
        evaluationColumns.forEach(col => {
          if (col.type === 'input' || col.type === 'radio' || col.type === 'number') {
            const value = subjectNotes[col.key] || '';
            notes[student.id][subject.id][col.key] = value;
          }
        });
      });
    });
    
    console.log('🔧 Notes éditables initialisées:', notes);
    setEditableNotes(notes);
  };

  // Fonction pour vérifier si une note spécifique existe déjà (pour griser en mode ajout)
  const hasExistingNoteForEvaluation = (studentId: string, subjectId: string, evaluationType: string) => {
    if (mode !== 'add') return false;
    const existingStudentNotes = existingNotesDetails[studentId]?.[subjectId] || {};
    return existingStudentNotes[evaluationType] && existingStudentNotes[evaluationType] !== '';
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveNotes = async () => {
    if (!selectedAcademicYear || !selectedQuarter || !selectedClass) {
      showWarning('Paramètres manquants', 'Veuillez sélectionner une année, un trimestre et une classe.');
      return;
    }

    // Vérifier que les notes éditables sont initialisées
    if (Object.keys(editableNotes).length === 0) {
      showWarning('Aucune note à sauvegarder', 'Veuillez d\'abord cliquer sur "Modifier" pour initialiser les notes éditables.');
      return;
    }

    setIsSaving(true);

    try {
      const gradesToSave: any[] = [];

      // Parcourir les notes éditables pour créer les enregistrements (même logique que Saisie des Notes)
      Object.keys(editableNotes).forEach(studentId => {
        const studentNotes = editableNotes[studentId];
        
        Object.keys(studentNotes).forEach(subjectId => {
          const subjectNotes = studentNotes[subjectId];
          
          // Créer un objet notes avec toutes les évaluations pour ce sujet
          const notesForSubject = {};
          let hasValidNotes = false;
          
          Object.keys(subjectNotes).forEach(evaluationType => {
            const value = subjectNotes[evaluationType];
            
            // Ne sauvegarder que si c'est une note valide (pas moyenne, rang, etc.)
            if (value && !['moyenne', 'rang', 'appreciation', 'coef'].includes(evaluationType)) {
              notesForSubject[evaluationType] = value;
              hasValidNotes = true;
            }
          });
          
          // Si on a des notes valides pour ce sujet, créer un enregistrement
          if (hasValidNotes) {
            // Calculer la moyenne et le rang pour ce sujet (même logique que Saisie des Notes)
            const student = bordereauxData.find(s => s.id === studentId);
            if (student) {
              // Calculer la moyenne basée sur les notes de ce sujet
              let moyenne = 0;
              if (selectedLevel === 'maternelle') {
                // Pour la maternelle, calculer la moyenne qualitative
                const values = Object.values(notesForSubject);
                if (values.length > 0) {
                  const numericValues = values.map(v => {
                    switch (v) {
                      case 'TS': return 3;
                      case 'S': return 2;
                      case 'PS': return 1;
                      default: return 0;
                    }
                  });
                  const avg = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
                  moyenne = avg;
                }
              } else {
                // Pour les autres niveaux, calculer la moyenne numérique
                const values = Object.values(notesForSubject).map(v => parseFloat(v) || 0);
                if (values.length > 0) {
                  moyenne = values.reduce((sum, val) => sum + val, 0) / values.length;
                }
              }
              
              // Calculer le rang (simplifié pour le bordereau)
              const rang = 1; // Pour le bordereau, on peut simplifier le calcul du rang
              
              // Obtenir l'appréciation
              const appreciation = getAppreciationText(moyenne);
              
              gradesToSave.push({
                studentId,
                notes: notesForSubject, // Utiliser la même structure que Saisie des Notes
                moyenne: moyenne,
                rang: rang,
                appreciation: appreciation,
                subjectId: subjectId,
                evaluationType: 'all' // Pour le bordereau, on sauvegarde toutes les évaluations
              });
            }
          }
        });
      });

      console.log('💾 Notes à sauvegarder:', gradesToSave);

      // Préparer les données complètes pour la sauvegarde (même structure que Saisie des Notes)
      const gradeData = {
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClass,
        subjectId: '', // Pour le bordereau, on gère plusieurs matières
        evaluationType: 'all', // Pour le bordereau, on sauvegarde toutes les évaluations
        studentsGrades: gradesToSave
      };

      console.log('📋 Données préparées pour la sauvegarde:', gradeData);

      // Appeler l'API de sauvegarde
      const response = await apiService.saveGrades(gradeData);

      if (response.success) {
        showSuccess('Sauvegarde réussie', `Notes ${mode === 'add' ? 'ajoutées' : 'modifiées'} avec succès !`);
        
        // Marquer les notes comme existantes après sauvegarde (comme dans Saisie des Notes)
        if (mode === 'add') {
          const newExistingNotes = { ...existingNotes };
          Object.keys(editableNotes).forEach(studentId => {
            newExistingNotes[studentId] = true;
          });
          setExistingNotes(newExistingNotes);
        }
        
        setEditingStudentId(null);
        
        // Attendre un court délai pour s'assurer que la sauvegarde est terminée
        setTimeout(async () => {
          try {
            // Recharger les données du bordereau avec l'indicateur de rechargement
            await loadBordereauData(true);
            console.log('✅ Données du bordereau rechargées après sauvegarde');
          } catch (error) {
            console.error('❌ Erreur lors du rechargement des données:', error);
          }
        }, 500);
        
        // Revenir en mode view après sauvegarde
        setMode('view');
        setIsEditMode(false);
      } else {
        showError('Erreur de sauvegarde', response.message || 'Une erreur est survenue lors de la sauvegarde.');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur de sauvegarde', 'Une erreur est survenue lors de la sauvegarde des notes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour sauvegarder les moyennes calculées
  const handleSaveAverages = async () => {
    if (!selectedAcademicYear || !selectedQuarter || !selectedClass || !selectedLevel) {
      showWarning('Paramètres manquants', 'Veuillez sélectionner une année, un trimestre, un niveau et une classe.');
      return;
    }

    if (bordereauxData.length === 0) {
      showWarning('Aucune donnée', 'Aucune donnée de bordereau à sauvegarder.');
      return;
    }

    setIsSavingAverages(true);

    try {
      const studentsAverages = bordereauxData.map(student => {
        const subjectAverages: Record<string, any> = {};
        
        // Calculer les moyennes par matière
        Object.keys(student.notes || {}).forEach(subjectId => {
          const subjectData = student.notes[subjectId];
          const moyenne = calculateSubjectAverage(subjectData, selectedLevel);
          
          subjectAverages[subjectId] = {
            moyenne: moyenne,
            moyIE: selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle' ? 
              calculateMoyenneIE(subjectData) !== '-' ? parseFloat(calculateMoyenneIE(subjectData)) : null : null,
            moy: selectedLevel === '2nd_cycle' ? 
              calculateMoy(subjectData) !== '-' ? parseFloat(calculateMoy(subjectData)) : null : null,
            coef: subjectData.coef || 1
          };
        });

        return {
          studentId: student.id,
          subjectAverages,
          moyenneGenerale: student.moyenneGenerale,
          rang: student.rang,
          appreciation: getAppreciationText(student.moyenneGenerale)
        };
      });

      const averagesData = {
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClass,
        studentsAverages
      };

      console.log('💾 Sauvegarde des moyennes:', averagesData);

      const response = await apiService.saveAverages(averagesData);

      if (response.success) {
        setLastAutoSave(new Date());
        showSuccess('Sauvegarde réussie', `${studentsAverages.length} moyennes sauvegardées avec succès !`);
      } else {
        showError('Erreur de sauvegarde', response.message || 'Une erreur est survenue lors de la sauvegarde des moyennes.');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des moyennes:', error);
      showError('Erreur de sauvegarde', 'Une erreur est survenue lors de la sauvegarde des moyennes.');
    } finally {
      setIsSavingAverages(false);
    }
  };

  // Fonction d'auto-sauvegarde
  const autoSaveAverages = async () => {
    if (!selectedAcademicYear || !selectedQuarter || !selectedClass || !selectedLevel || bordereauxData.length === 0) {
      return;
    }

    try {
      const studentsAverages = bordereauxData.map(student => {
        const subjectAverages: Record<string, any> = {};
        
        Object.keys(student.notes || {}).forEach(subjectId => {
          const subjectData = student.notes[subjectId];
          const moyenne = calculateSubjectAverage(subjectData, selectedLevel);
          
          subjectAverages[subjectId] = {
            moyenne: moyenne,
            moyIE: selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle' ? 
              calculateMoyenneIE(subjectData) !== '-' ? parseFloat(calculateMoyenneIE(subjectData)) : null : null,
            moy: selectedLevel === '2nd_cycle' ? 
              calculateMoy(subjectData) !== '-' ? parseFloat(calculateMoy(subjectData)) : null : null,
            coef: subjectData.coef || 1
          };
        });

        return {
          studentId: student.id,
          subjectAverages,
          moyenneGenerale: student.moyenneGenerale,
          rang: student.rang,
          appreciation: getAppreciationText(student.moyenneGenerale)
        };
      });

      const averagesData = {
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClass,
        studentsAverages
      };

      const response = await apiService.saveAverages(averagesData);
      
      if (response.success) {
        setLastAutoSave(new Date());
        console.log('✅ Auto-sauvegarde des moyennes réussie');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'auto-sauvegarde des moyennes:', error);
    }
  };

  // Fonction pour annuler les modifications
  const handleCancelEdit = () => {
    setEditableNotes({});
    setIsEditMode(false);
    setMode('view');
    setEditingStudentId(null);
  };

  // Normalise les clés de notes provenant de la BDD vers le format attendu par le composant
  const normalizeNotesForLevel = (notes: any) => {
    if (!notes || typeof notes !== 'object') return notes;
    const n: any = { ...notes };

    // Helper pour déplacer si la clé source existe
    const move = (fromKeys: string[], toKey: string) => {
      for (const k of fromKeys) {
        if (n[k] !== undefined && n[toKey] === undefined) {
          n[toKey] = n[k];
        }
      }
    };

    // Unification de la casse simple
    Object.keys(n).forEach(k => {
      const lower = k.toLowerCase();
      if (lower !== k && n[lower] === undefined) {
        n[lower] = n[k];
      }
    });

    // Mapping spécifique Primaire: EM1/EM2/EC avec CM/CP
    // Accepte variantes: 'EM1_CM', 'em1CM', 'Em1_Cm', etc.
    move(['em1_cm', 'em1cm', 'EM1_CM', 'Em1_Cm'], 'em1_cm');
    move(['em1_cp', 'em1cp', 'EM1_CP', 'Em1_Cp'], 'em1_cp');
    move(['em2_cm', 'em2cm', 'EM2_CM', 'Em2_Cm'], 'em2_cm');
    move(['em2_cp', 'em2cp', 'EM2_CP', 'Em2_Cp'], 'em2_cp');
    move(['ec_cm', 'eccm', 'EC_CM', 'Ec_Cm'], 'ec_cm');
    move(['ec_cp', 'eccp', 'EC_CP', 'Ec_Cp'], 'ec_cp');

    // Note calculée éventuelle (non bloquante)
    move(['em1_note', 'EM1_NOTE'], 'em1_note');
    move(['em2_note', 'EM2_NOTE'], 'em2_note');
    move(['ec_note', 'EC_NOTE'], 'ec_note');

    return n;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-7 w-7 mr-3 text-blue-600" />
            Bordereau de Notes
          </h2>
          <div className="flex space-x-3">
            <button 
              onClick={handlePreview}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <AcademicYearSelector
              moduleName="bordereaux"
              className="w-full"
              onChange={(yearId) => {
                setSelectedAcademicYear(yearId);
                console.log('Année scolaire sélectionnée:', yearId);
              }}
            />
          </div>

          <div>
            <QuarterSelector
              moduleName="bordereaux"
              className="w-full"
              academicYearId={selectedAcademicYear}
              onChange={(quarterId) => {
                setSelectedQuarter(quarterId);
                console.log('Trimestre sélectionné:', quarterId);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Niveau Scolaire
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedClass('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              aria-label="Sélectionner le niveau scolaire"
            >
              <option value="">Sélectionner un niveau</option>
              {niveauxScolaires.map(niveau => (
                <option key={niveau.id} value={niveau.id}>{niveau.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={!selectedLevel || !selectedAcademicYear || getAvailableClasses().length === 0}
              aria-label="Sélectionner une classe"
            >
              <option value="">Sélectionner une classe</option>
              {getAvailableClasses().map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          </div>

        {/* Info système éducatif moderne */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          <div>
              <h3 className="font-semibold text-gray-900">
                Mode de Fonctionnement
              </h3>
              <p className="text-sm text-gray-600">
                Génération des bordereaux de notes par classe (toutes les matières)
              </p>
          </div>
          </div>
          
          {selectedLevel && selectedLevel !== '' && (
            <div className="text-sm text-gray-600">
              {selectedLevel === 'maternelle' 
                ? 'Évaluation qualitative par observation continue - Échelle TS/S/PS'
                : selectedLevel === 'primaire' 
                ? 'EM1, EM2 (Évaluations Mensuelles), EC (Évaluation Certificative) - Sans coefficient'
                : selectedLevel === '1er_cycle'
                ? 'IE1, IE2 (Interrogations Écrites), DS1, DS2 (Devoirs Surveillés) - Sans coefficient'
                : selectedLevel === '2nd_cycle'
                ? 'IE1, IE2 (Interrogations Écrites), DS1, DS2 (Devoirs Surveillés) - Sans coefficient'
                : 'Système d\'évaluation standard'
              }
            </div>
          )}
        </div>
      </div>

      {/* Statistiques de classe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {bordereauxData.length}
              </p>
              <p className="text-sm text-gray-600">Élèves</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {selectedLevel === 'maternelle' ? (
                  bordereauxData.length > 0 ? 
                    (() => {
                      // Pour la maternelle, calculer la moyenne générale qualitative
                      const studentAverages = bordereauxData.map(s => {
                        if (s.notes && Object.keys(s.notes).length > 0) {
                          const subjectAverages = Object.values(s.notes).map((subjectData: any) => {
                            const em1 = subjectData.em1 || subjectData.EM1 || '-';
                            const em2 = subjectData.em2 || subjectData.EM2 || '-';
                            const ec = subjectData.ec || subjectData.EC || '-';
                            return calculateQualitativeAverage(em1, em2, ec);
                          }).filter(avg => avg !== '-');
                          
                          if (subjectAverages.length > 0) {
                            const numericAverages = subjectAverages.map(avg => {
                              switch (avg) {
                                case 'TS': return 3;
                                case 'S': return 2;
                                case 'PS': return 1;
                                default: return 0;
                              }
                            });
                            return numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
                          }
                        }
                        return 0;
                      });
                      
                      const classAverage = studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length;
                      
                      // Convertir en annotation qualitative
                      if (classAverage >= 2.5) return 'TS';
                      if (classAverage >= 1.5) return 'S';
                      return 'PS';
                    })() : '-'
                ) : (
                  bordereauxData.length > 0 ? 
                    (() => {
                      const numericAverages = bordereauxData.map(student => {
                        // S'assurer que moyenneGenerale est un nombre pour les niveaux non-maternelle
                        const avg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                        return avg;
                      });
                      return (numericAverages.reduce((sum, avg) => sum + avg, 0) / numericAverages.length).toFixed(2);
                    })() : '0.00'
                )}
              </p>
              <p className="text-sm text-gray-600">Moyenne Classe</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {selectedLevel === 'maternelle' ? (
                  bordereauxData.filter(student => {
                    // Pour la maternelle, "admis" = TS ou S
                    return student.moyenneGenerale === 'TS' || student.moyenneGenerale === 'S';
                  }).length
                ) : (
                  bordereauxData.filter(student => {
                    // S'assurer que moyenneGenerale est un nombre pour les niveaux non-maternelle
                    const avg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
                    return avg >= 10;
                  }).length
                )}
              </p>
              <p className="text-sm text-gray-600">Admis</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 font-bold">✗</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {selectedLevel === 'maternelle' ? (
                  bordereauxData.filter(student => {
                    // Pour la maternelle, "en difficulté" = PS
                    return student.moyenneGenerale === 'PS';
                  }).length
                ) : (
                  bordereauxData.filter(student => {
                    // S'assurer que moyenneGenerale est un nombre pour les niveaux non-maternelle
                    const avg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
                    return avg < 10;
                  }).length
                )}
              </p>
              <p className="text-sm text-gray-600">En difficulté</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de sauvegarde */}
      {lastAutoSave && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Dernière auto-sauvegarde des moyennes
              </p>
              <p className="text-sm text-green-600">
                {lastAutoSave.toLocaleString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bordereau détaillé */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
              Bordereau de Notes - {classes.find(c => c.id === selectedClass)?.name || selectedClass} - {currentQuarter?.name || 'Chargement...'}
          </h3>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSaveAverages}
                disabled={isSavingAverages || bordereauxData.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingAverages ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isSavingAverages ? 'Sauvegarde...' : 'Sauvegarder Moyennes'}
              </button>
              {isRefreshing && (
                <div className="flex items-center text-sm text-blue-600">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selectedLevel === 'maternelle' ? 
              'Système Maternelle: EM1, EM2 (Évaluations Mensuelles) + EC (Évaluation Certificative)' :
              selectedLevel === 'primaire' ? 
              'Système Primaire: EM1, EM2 (Évaluations Mensuelles) + EC (Évaluation Certificative)' :
              selectedLevel === '1er_cycle' ? 
              '' :
              selectedLevel === '2nd_cycle' ? 
              'Système 2nd Cycle Secondaire: IE1, IE2 (Interrogations Écrites) + DS1, DS2 (Devoirs Surveillés) + Coefficients' :
              'Sélectionnez un niveau scolaire'
            }
          </p>
        </div>

        <div className="overflow-x-auto">
          {bordereauxData.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun bordereau disponible
                  </h3>
                  <p className="text-gray-600">
                    {!selectedLevel ? 'Veuillez sélectionner un niveau scolaire' :
                     !selectedClass ? 'Veuillez sélectionner une classe' :
                     !selectedAcademicYear || !selectedQuarter ? 'Veuillez sélectionner une année scolaire et un trimestre' :
                     'Aucune donnée trouvée pour les critères sélectionnés'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                  <div className="text-center font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                  Élève
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                  <div className="text-center font-bold text-pink-700 bg-pink-50 px-2 py-1 rounded-md border border-pink-200">
                  Sexe
                  </div>
                </th>
                {(() => {
                  // Afficher toutes les matières de la classe (pas seulement celles avec des notes)
                  return subjects.map(subject => {
                    
                    return (
                      <th key={subject.id} className="px-3 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                        <div className="space-y-2">
                          <div className="text-center font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            {subject.name}
                          </div>
                          <div className={`flex justify-center gap-1 text-xs`}>
                          {getColumnsForLevel().map(col => {
                            if (col.type === 'group' && col.subcolumns) {
                              // Pour les colonnes de type group (primaire), afficher les sous-colonnes
                              return (
                                <div key={col.key} className="flex flex-col gap-1 flex-1">
                                  <div className="text-center font-semibold text-blue-700 bg-blue-50 px-1 py-1 rounded border border-blue-200">
                              {col.label}
                                  </div>
                                  <div className="flex justify-center gap-1">
                                    {col.subcolumns.map(subcol => (
                                      <span key={subcol.key} className={`px-1 py-1 rounded border text-center w-16 ${
                                        subcol.key.includes('_cm') ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                        subcol.key.includes('_cp') ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                        subcol.key.includes('_note') ? 'bg-green-100 border-green-200 text-green-800' :
                                        'bg-gray-100 border-gray-200 text-gray-800'
                                      }`}>
                                        {subcol.label}
                                        {subcol.sublabel && <div className="text-xs opacity-75">{subcol.sublabel}</div>}
                            </span>
                          ))}
                                  </div>
                                </div>
                              );
                            } else {
                              // Pour les colonnes normales
                              return (
                                <span key={col.key} className={`px-2 py-1 rounded border flex-1 text-center ${
                                  col.key === 'moyenne' ? 'bg-purple-100 border-purple-200 text-purple-800' :
                                  col.key === 'moy_ie' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
                                  col.key === 'moy' ? 'bg-pink-100 border-pink-200 text-pink-800' :
                                  col.key === 'coef' ? 'bg-gray-100 border-gray-200 text-gray-800' :
                                    col.key === 'rang' ? 'bg-indigo-100 border-indigo-200 text-indigo-800' :
                                  col.key.includes('em') ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                  col.key === 'ec' ? 'bg-green-100 border-green-200 text-green-800' :
                                    col.key.includes('ie') ? 'bg-orange-100 border-orange-200 text-orange-800' :
                                    col.key.includes('ds') ? 'bg-red-100 border-red-200 text-red-800' :
                                    'bg-gray-100 border-gray-200 text-gray-800'
                                }`}>
                                  {col.label}
                                  {col.sublabel && <div className="text-xs opacity-75">{col.sublabel}</div>}
                                </span>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </th>
                    );
                  });
                })()}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                  <div className="text-center font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                  Moyenne Générale
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                  <div className="text-center font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                  Rang
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  <div className="text-center font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                  Appréciation
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bordereauxData.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4">
                      <div>
                      <div className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                        {student.prenom} {student.nom}
                        </div>
                        <div className="text-xs text-gray-500">{student.numeroEducmaster}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      student.sexe === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {student.sexe}
                    </span>
                  </td>
                  {(() => {
                    // Afficher toutes les matières de la classe (pas seulement celles avec des notes)
                    return subjects.map(subject => {
                      
                      const noteData = student.notes && student.notes[subject.id] ? student.notes[subject.id] : null;
                      const columns = getColumnsForLevel();
                      
                      return (
                        <td key={subject.id} className="px-3 py-4 text-center">
                      <div className="space-y-1">
                            <div className={`flex justify-center gap-1 text-xs`}>
                              {columns.map(col => {
                                if (col.type === 'group' && col.subcolumns) {
                                  // Pour les colonnes de type group (primaire), afficher les sous-colonnes
                                  return (
                                    <div key={col.key} className="flex flex-col gap-1 flex-1">
                                      <div className="flex justify-center gap-1">
                                        {col.subcolumns.map(subcol => {
                                          if (subcol.type === 'calculated') {
                                            // Pour les colonnes calculées (Note /20)
                                            let calculatedValue = '-';
                                            if (subcol.key === 'em1_note') {
                                              const cm = parseFloat(noteData?.em1_cm || '0');
                                              const cp = parseFloat(noteData?.em1_cp || '0');
                                              const note = cm + cp;
                                              calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                            } else if (subcol.key === 'em2_note') {
                                              const cm = parseFloat(noteData?.em2_cm || '0');
                                              const cp = parseFloat(noteData?.em2_cp || '0');
                                              const note = cm + cp;
                                              calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                            } else if (subcol.key === 'ec_note') {
                                              const cm = parseFloat(noteData?.ec_cm || '0');
                                              const cp = parseFloat(noteData?.ec_cp || '0');
                                              const note = cm + cp;
                                              calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                            }
                                            
                                            return (
                                              <span key={subcol.key} className={`px-1 py-1 rounded font-semibold text-center w-16 ${
                                                calculatedValue !== '-' ? 'bg-green-100 text-green-800' : 'text-gray-500'
                                              }`}>
                                                {calculatedValue}
                          </span>
                                            );
                                          } else {
                                            // Pour les colonnes CM et CP
                                            const value = noteData?.[subcol.key] || '-';
                                            return (
                                              <span key={subcol.key} className={`px-1 py-1 rounded font-semibold text-center w-16 ${
                                                value !== '-' ? 'bg-blue-100 text-blue-800' : 'text-gray-500'
                                              }`}>
                                                {value}
                                              </span>
                                            );
                                          }
                                        })}
                                      </div>
                                    </div>
                                  );
                                } else if (col.type === 'calculated') {
                                  // Pour les colonnes calculées (moyenne, moy_ie)
                                  let calculatedValue = '-';
                                  if (col.key === 'moyenne') {
                                    // Calculer la moyenne directement à partir des données des notes
                                    const moyenne = calculateSubjectAverage(noteData, selectedLevel);
                                    
                                    console.log(`🔍 Calcul moyenne ${subject.name} pour ${student.nom}:`, {
                                      studentId: student.id,
                                      subjectId: subject.id,
                                      moyenne,
                                      noteData,
                                      selectedLevel
                                    });
                                    
                                    if (selectedLevel === 'maternelle') {
                                      // Pour la maternelle, convertir en annotation qualitative
                                      if (moyenne >= 2.5) calculatedValue = 'TS';
                                      else if (moyenne >= 1.5) calculatedValue = 'S';
                                      else if (moyenne > 0) calculatedValue = 'PS';
                                    } else {
                                      // Pour les autres niveaux, afficher la valeur numérique
                                      calculatedValue = moyenne > 0 ? moyenne.toFixed(2) : '-';
                                    }
                                  } else if (col.key === 'moy_ie') {
                                    // Recalculer la moyenne IE en utilisant la même logique que SaisieNotes
                                    calculatedValue = calculateMoyenneIE(noteData);
                                  } else if (col.key === 'moy') {
                                    // Recalculer la Moy. en utilisant la même logique que SaisieNotes
                                    calculatedValue = calculateMoy(noteData);
                                  } else if (col.key === 'em1_note') {
                                    // Calculer EM1 Note = CM + CP
                                    const cm = parseFloat(noteData?.em1_cm || '0');
                                    const cp = parseFloat(noteData?.em1_cp || '0');
                                    const note = cm + cp;
                                    calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                  } else if (col.key === 'em2_note') {
                                    // Calculer EM2 Note = CM + CP
                                    const cm = parseFloat(noteData?.em2_cm || '0');
                                    const cp = parseFloat(noteData?.em2_cp || '0');
                                    const note = cm + cp;
                                    calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                  } else if (col.key === 'ec_note') {
                                    // Calculer EC Note = CM + CP
                                    const cm = parseFloat(noteData?.ec_cm || '0');
                                    const cp = parseFloat(noteData?.ec_cp || '0');
                                    const note = cm + cp;
                                    calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                  }
                                  
                                  return (
                                    <span key={col.key} className={`px-2 py-1 rounded font-semibold w-16 text-center ${
                                      selectedLevel === 'maternelle' && col.key === 'moyenne' ? (
                                        calculatedValue === 'TS' ? 'bg-green-100 text-green-800' :
                                        calculatedValue === 'S' ? 'bg-blue-100 text-blue-800' :
                                        calculatedValue === 'PS' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-500'
                                      ) : col.key === 'moy' ? (
                                        calculatedValue !== '-' ? 'bg-pink-100 text-pink-800' : 'text-gray-500'
                                      ) : (col.key === 'em1_note' || col.key === 'em2_note' || col.key === 'ec_note') ? (
                                        calculatedValue !== '-' ? 'bg-green-100 text-green-800' : 'text-gray-500'
                                      ) : (
                                        calculatedValue !== '-' ? getAppreciationColor(parseFloat(calculatedValue)) : 'text-gray-500'
                                      )
                                    }`}>
                                      {calculatedValue}
                          </span>
                                  );
                                } else if (col.type === 'coefficient') {
                                  // Pour les coefficients
                                  return (
                                    <span key={col.key} className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex-1 text-center">
                                      {noteData?.coef || '-'}
                                    </span>
                                  );
                                } else if (col.type === 'radio') {
                                  // Pour la maternelle (TS/S/PS)
                                  const value = noteData?.[col.key] || '-';
                                  return (
                                    <span key={col.key} className={`px-2 py-1 rounded font-medium text-xs flex-1 text-center ${
                                      value === 'TS' ? 'bg-green-100 text-green-800' :
                                      value === 'S' ? 'bg-blue-100 text-blue-800' :
                                      value === 'PS' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-500'
                                    }`}>
                                      {value}
                                    </span>
                                  );
                                } else {
                                  // Pour les notes numériques
                                  const value = noteData?.[col.key] || '-';
                                  return (
                                    <span key={col.key} className={`px-2 py-1 rounded font-medium flex-1 text-center ${
                                      value !== '-' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      {value}
                                    </span>
                                  );
                                }
                              })}
                        </div>
                      </div>
                    </td>
                      );
                    });
                  })()}
                  <td className="px-4 py-4 text-center">
                    {(() => {
                      const moyenneGenerale = student.moyenneGenerale;
                      return (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedLevel === 'maternelle' ? (
                            moyenneGenerale === 'TS' ? 'bg-green-100 text-green-800' :
                            moyenneGenerale === 'S' ? 'bg-blue-100 text-blue-800' :
                            moyenneGenerale === 'PS' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-500'
                          ) : getAppreciationColor(typeof moyenneGenerale === 'string' ? 0 : (moyenneGenerale === null ? 0 : moyenneGenerale))
                        }`}>
                          {selectedLevel === 'maternelle' ? moyenneGenerale : 
                            (typeof moyenneGenerale === 'string' ? '0.00' : (moyenneGenerale === null ? '-' : moyenneGenerale.toFixed(2)))}
                    </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {(() => {
                      const rang = student.rang;
                      return (
                    <div className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-bold ${
                          rang === 1 ? 'bg-yellow-100 text-yellow-800' :
                          rang === 2 ? 'bg-gray-100 text-gray-800' :
                          rang === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                          {formatRang(rang, student.sexe)}
                    </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {(() => {
                      const moyenneGenerale = student.moyenneGenerale;
                      return (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedLevel === 'maternelle' ? (
                            moyenneGenerale === 'TS' ? 'bg-green-100 text-green-800' :
                            moyenneGenerale === 'S' ? 'bg-blue-100 text-blue-800' :
                            moyenneGenerale === 'PS' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-500'
                          ) : getAppreciationColor(typeof moyenneGenerale === 'string' ? 0 : (moyenneGenerale === null ? 0 : moyenneGenerale))
                        }`}>
                          {selectedLevel === 'maternelle' ? (
                            moyenneGenerale === 'TS' ? 'Très Satisfaisant' :
                            moyenneGenerale === 'S' ? 'Satisfaisant' :
                            moyenneGenerale === 'PS' ? 'Peu Satisfaisant' :
                            '-'
                          ) : getAppreciationText(typeof moyenneGenerale === 'string' ? 0 : moyenneGenerale)}
                    </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Résumé statistique */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {selectedLevel === 'maternelle' ? 'Répartition par Évaluation' : 'Répartition par Mention'}
              </h4>
              <div className="space-y-1 text-xs">
                {selectedLevel === 'maternelle' ? (
                  <>
                <div className="flex justify-between">
                      <span>Très Satisfaisant (TS):</span>
                  <span className="font-semibold text-green-600">
                        {bordereauxData.filter(s => {
                          if (!s.notes) return false;
                          return Object.values(s.notes).some((subjectNotes: any) => 
                            subjectNotes.em1 === 'TS' || subjectNotes.em2 === 'TS' || subjectNotes.ec === 'TS' ||
                            subjectNotes.EM1 === 'TS' || subjectNotes.EM2 === 'TS' || subjectNotes.EC === 'TS'
                          );
                        }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                      <span>Satisfaisant (S):</span>
                      <span className="font-semibold text-yellow-600">
                        {bordereauxData.filter(s => {
                          if (!s.notes) return false;
                          return Object.values(s.notes).some((subjectNotes: any) => 
                            subjectNotes.em1 === 'S' || subjectNotes.em2 === 'S' || subjectNotes.ec === 'S' ||
                            subjectNotes.EM1 === 'S' || subjectNotes.EM2 === 'S' || subjectNotes.EC === 'S'
                          );
                        }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                      <span>Peu Satisfaisant (PS):</span>
                      <span className="font-semibold text-red-600">
                        {bordereauxData.filter(s => {
                          if (!s.notes) return false;
                          return Object.values(s.notes).some((subjectNotes: any) => 
                            subjectNotes.em1 === 'PS' || subjectNotes.em2 === 'PS' || subjectNotes.ec === 'PS' ||
                            subjectNotes.EM1 === 'PS' || subjectNotes.EM2 === 'PS' || subjectNotes.EC === 'PS'
                          );
                        }).length}
                  </span>
                    </div>
                  </>
                ) : (
                  <>
                {(() => {
                  // Utiliser directement les moyennes générales de bordereauxData
                  const excellent = bordereauxData.filter(student => {
                    const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                    return numAvg >= 18;
                  }).length;
                  
                  const tresBien = bordereauxData.filter(student => {
                    const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                    return numAvg >= 16 && numAvg < 18;
                  }).length;
                  
                  const bien = bordereauxData.filter(student => {
                    const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                    return numAvg >= 14 && numAvg < 16;
                  }).length;
                  
                  const assezBien = bordereauxData.filter(student => {
                    const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                    return numAvg >= 12 && numAvg < 14;
                  }).length;
                  
                  const passable = bordereauxData.filter(student => {
                    const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                    return numAvg >= 10 && numAvg < 12;
                  }).length;
                  
                  const insuffisant = bordereauxData.filter(student => {
                    const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                    return numAvg < 10;
                  }).length;
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Excellent (≥18):</span>
                        <span className="font-semibold text-green-600">{excellent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Très Bien (16-17.99):</span>
                        <span className="font-semibold text-blue-600">{tresBien}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bien (14-15.99):</span>
                        <span className="font-semibold text-blue-500">{bien}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assez Bien (12-13.99):</span>
                        <span className="font-semibold text-yellow-600">{assezBien}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passable (10-11.99):</span>
                        <span className="font-semibold text-orange-600">{passable}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insuffisant (&lt;10):</span>
                        <span className="font-semibold text-red-600">{insuffisant}</span>
                </div>
                    </>
                  );
                })()}
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Statistiques Générales</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Moyenne de classe:</span>
                  <div className="font-bold text-lg text-blue-600">
                    {(() => {
                      // Utiliser directement les moyennes générales de bordereauxData
                      if (selectedLevel === 'maternelle') {
                        const numericAverages = bordereauxData.map(student => {
                          switch (student.moyenneGenerale) {
                            case 'TS': return 3;
                            case 'S': return 2;
                            case 'PS': return 1;
                            default: return 0;
                          }
                        });
                        return (numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length).toFixed(2) + '/3';
                      } else {
                        const numericAverages = bordereauxData.map(student => {
                          return typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                        });
                        return (numericAverages.reduce((sum, avg) => sum + avg, 0) / numericAverages.length).toFixed(2) + '/20';
                      }
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Taux de réussite:</span>
                  <div className="font-bold text-lg text-green-600">
                    {(() => {
                      // Utiliser directement les moyennes générales de bordereauxData
                      if (selectedLevel === 'maternelle') {
                        const successCount = bordereauxData.filter(student => 
                          student.moyenneGenerale === 'TS' || student.moyenneGenerale === 'S'
                        ).length;
                        return ((successCount / bordereauxData.length) * 100).toFixed(1) + '%';
                      } else {
                        const successCount = bordereauxData.filter(student => {
                          const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                          return numAvg >= 10;
                        }).length;
                        return ((successCount / bordereauxData.length) * 100).toFixed(1) + '%';
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Extrêmes</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Meilleure moyenne:</span>
                  <div className="font-bold text-lg text-green-600">
                    {(() => {
                      // Utiliser directement les moyennes générales de bordereauxData
                      if (selectedLevel === 'maternelle') {
                        const numericAverages = bordereauxData.map(student => {
                          switch (student.moyenneGenerale) {
                            case 'TS': return 3;
                            case 'S': return 2;
                            case 'PS': return 1;
                            default: return 0;
                          }
                        });
                        return Math.max(...numericAverages).toFixed(2) + '/3';
                      } else {
                        const numericAverages = bordereauxData.map(student => {
                          return typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                        });
                        return Math.max(...numericAverages).toFixed(2) + '/20';
                      }
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Plus faible moyenne:</span>
                  <div className="font-bold text-lg text-red-600">
                    {(() => {
                      // Utiliser directement les moyennes générales de bordereauxData
                      if (selectedLevel === 'maternelle') {
                        const numericAverages = bordereauxData.map(student => {
                          switch (student.moyenneGenerale) {
                            case 'TS': return 3;
                            case 'S': return 2;
                            case 'PS': return 1;
                            default: return 0;
                          }
                        });
                        return Math.min(...numericAverages).toFixed(2) + '/3';
                      } else {
                        const numericAverages = bordereauxData.map(student => {
                          return typeof student.moyenneGenerale === 'string' ? 0 : (student.moyenneGenerale === null ? 0 : student.moyenneGenerale);
                        });
                        return Math.min(...numericAverages).toFixed(2) + '/20';
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section d'édition des notes */}
      {selectedClass && bordereauxData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Saisie et Modification des Notes
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {mode === 'view' ? 'Sélectionnez un mode pour commencer à saisir ou modifier les notes' :
                   mode === 'add' ? 'Mode ajout - Saisissez les nouvelles notes pour les élèves' :
                   'Mode modification - Modifiez les notes existantes directement dans le tableau'}
                </p>
              </div>
              <div className="flex gap-3">
                {mode === 'view' && (
                  <>
                <button
                      onClick={() => handleModeChange('add')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                </button>
                    <button 
                      onClick={() => handleModeChange('edit')}
                      className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </button>
                  </>
                )}
                {(mode === 'add' || mode === 'edit') && (
                  <>
                    <button 
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
              </div>
              
          {(mode === 'add' || mode === 'edit') && (
              <div className="overflow-x-auto">
              {selectedLevel === 'maternelle' && (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Élève
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Sexe
                      </th>
                      {subjects.map(subject => (
                        <th key={subject.id} className="px-2 py-3 text-center border-r border-gray-200">
                          <div className="text-center font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            {subject.name}
                          </div>
                          <div className="flex justify-center gap-1 text-xs mt-1">
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-blue-100 border-blue-200 text-blue-800">EM1</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-blue-100 border-blue-200 text-blue-800">EM2</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-green-100 border-green-200 text-green-800">EC</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {bordereauxData.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">{student.nom} {student.prenom}</div>
                          <div className="text-xs text-gray-500">{student.numeroEducmaster}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 border-r border-gray-200">
                          {student.sexe}
                        </td>
                        {subjects.map(subject => {
                          const noteData = editableNotes[student.id]?.[subject.id] || {};
                          return (
                            <td key={subject.id} className="px-2 py-3 border-r border-gray-200">
                              <div className="flex justify-center gap-1">
                                {['em1', 'em2', 'ec'].map(evalType => {
                                  const hasExisting = hasExistingNoteForEvaluation(student.id, subject.id, evalType);
                                  return (
                                    <select
                                      key={evalType}
                                      value={noteData[evalType] || ''}
                                      onChange={(e) => handleNoteChange(student.id, subject.id, evalType, e.target.value)}
                                      aria-label={`Note ${evalType.toUpperCase()} pour ${subject.name}`}
                                      className={`flex-1 text-center px-1 py-1 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                                        hasExisting && noteData[evalType] 
                                          ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                          : 'border-gray-300'
                                      }`}
                                      disabled={hasExisting && noteData[evalType]}
                                    >
                                      <option value="">-</option>
                                      <option value="TS">TS</option>
                                      <option value="S">S</option>
                                      <option value="PS">PS</option>
                                    </select>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedLevel === 'primaire' && (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Élève
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Sexe
                      </th>
                      {subjects.map(subject => (
                        <th key={subject.id} className="px-2 py-3 text-center border-r border-gray-200">
                          <div className="text-center font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            {subject.name}
              </div>
                          <div className="flex justify-center gap-1 text-xs mt-1">
                            {getColumnsForLevel().map(col => {
                              if (col.type === 'group' && col.subcolumns) {
                                // Pour les colonnes de type group (primaire), afficher les sous-colonnes
                                return (
                                  <div key={col.key} className="flex flex-col gap-1 flex-1">
                                    <div className="text-center font-semibold text-blue-700 bg-blue-50 px-1 py-1 rounded border border-blue-200">
                                      {col.label}
                                    </div>
                                    <div className="flex gap-1">
                                      {col.subcolumns.map(subcol => (
                                        <span key={subcol.key} className={`px-1 py-1 rounded border text-center w-12 ${
                                          subcol.key.includes('_cm') ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                          subcol.key.includes('_cp') ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                          subcol.key.includes('_note') ? 'bg-green-100 border-green-200 text-green-800' :
                                          'bg-gray-100 border-gray-200 text-gray-800'
                                        }`}>
                                          {subcol.label}
                                          {subcol.sublabel && <div className="text-xs opacity-75">{subcol.sublabel}</div>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Pour les colonnes normales
                                return (
                                  <span key={col.key} className={`px-2 py-1 rounded border flex-1 text-center ${
                                    col.key === 'moyenne' ? 'bg-purple-100 border-purple-200 text-purple-800' :
                                    col.key === 'moy_ie' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
                                    col.key === 'moy' ? 'bg-pink-100 border-pink-200 text-pink-800' :
                                    col.key === 'coef' ? 'bg-gray-100 border-gray-200 text-gray-800' :
                                      col.key === 'rang' ? 'bg-indigo-100 border-indigo-200 text-indigo-800' :
                                    col.key.includes('em') ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                    col.key === 'ec' ? 'bg-green-100 border-green-200 text-green-800' :
                                      col.key.includes('ie') ? 'bg-orange-100 border-orange-200 text-orange-800' :
                                      col.key.includes('ds') ? 'bg-red-100 border-red-200 text-red-800' :
                                      'bg-gray-100 border-gray-200 text-gray-800'
                                  }`}>
                                    {col.label}
                                    {col.sublabel && <div className="text-xs opacity-75">{col.sublabel}</div>}
                                  </span>
                                );
                              }
                            })}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {bordereauxData.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">{student.nom} {student.prenom}</div>
                          <div className="text-xs text-gray-500">{student.numeroEducmaster}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 border-r border-gray-200">
                          {student.sexe}
                        </td>
                        {subjects.map(subject => {
                          const noteData = editableNotes[student.id]?.[subject.id] || {};
                          return (
                            <td key={subject.id} className="px-2 py-3 border-r border-gray-200">
                              <div className="flex justify-center gap-1">
                                {getColumnsForLevel().map(col => {
                                  if (col.type === 'group' && col.subcolumns) {
                                    // Pour les colonnes de type group (primaire), afficher les sous-colonnes
                                    return (
                                      <div key={col.key} className="flex flex-col gap-1 flex-1">
                                        <div className="flex gap-1">
                                          {col.subcolumns.map(subcol => {
                                            const hasExisting = hasExistingNoteForEvaluation(student.id, subject.id, subcol.key);
                                            
                                            if (subcol.type === 'calculated') {
                                              // Pour les colonnes calculées (Note /20)
                                              let calculatedValue = '-';
                                              if (subcol.key === 'em1_note') {
                                                const cm = parseFloat(noteData['em1_cm'] || '0');
                                                const cp = parseFloat(noteData['em1_cp'] || '0');
                                                const note = cm + cp;
                                                calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                              } else if (subcol.key === 'em2_note') {
                                                const cm = parseFloat(noteData['em2_cm'] || '0');
                                                const cp = parseFloat(noteData['em2_cp'] || '0');
                                                const note = cm + cp;
                                                calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                              } else if (subcol.key === 'ec_note') {
                                                const cm = parseFloat(noteData['ec_cm'] || '0');
                                                const cp = parseFloat(noteData['ec_cp'] || '0');
                                                const note = cm + cp;
                                                calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                              }
                                              
                                              return (
                                                <span
                                                  key={subcol.key}
                                                  className={`w-12 text-center px-1 py-1 rounded text-sm font-semibold ${
                                                    calculatedValue !== '-' ? 'bg-green-100 text-green-800' : 'text-gray-500'
                                                  }`}
                                                >
                                                  {calculatedValue}
                                                </span>
                                              );
                                            } else {
                                              // Pour les colonnes CM et CP
                                              const maxValue = subcol.key.includes('_cm') ? 18 : 2;
                                              return (
                                                <input
                                                  key={subcol.key}
                                                  type="number"
                                                  min="0"
                                                  max={maxValue}
                                                  step="0.5"
                                                  value={noteData[subcol.key] || ''}
                                                  onChange={(e) => handleNoteChange(student.id, subject.id, subcol.key, e.target.value)}
                                                  className={`w-12 text-center px-1 py-1 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                                                    hasExisting && noteData[subcol.key] 
                                                      ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                      : 'border-gray-300'
                                                  }`}
                                                  placeholder="-"
                                                  disabled={hasExisting && noteData[subcol.key]}
                                                />
                                              );
                                            }
                                          })}
              </div>
            </div>
                                    );
                                  } else {
                                    // Pour les colonnes normales (moyenne, etc.)
                                    let calculatedValue = '-';
                                    
                                    if (col.key === 'moyenne') {
                                      // Moyenne par matière
                                      const moyenne = calculateSubjectAverage(noteData, selectedLevel);
                                      calculatedValue = moyenne > 0 ? moyenne.toFixed(2) : '-';
                                    } else if (col.key === 'moy_ie') {
                                      // Moyenne IE
                                      calculatedValue = calculateMoyenneIE(noteData);
                                    } else if (col.key === 'moy') {
                                      // Moy. (moyenne sans coefficient pour 2nd cycle)
                                      calculatedValue = calculateMoy(noteData);
                                    } else if (col.key === 'coef') {
                                      // Coefficient
                                      calculatedValue = noteData.coef || '-';
                                    } else if (col.key === 'rang') {
                                      // Rang
                                      calculatedValue = noteData.rang || '-';
                                    } else if (col.key === 'appreciation') {
                                      // Appréciation
                                      calculatedValue = noteData.appreciation || '-';
                                    }
                                    
                                    return (
                                      <span key={col.key} className={`flex-1 text-center px-1 py-1 rounded text-sm font-semibold ${
                                        col.key === 'moyenne' ? 'bg-purple-100 border-purple-200 text-purple-800' :
                                        col.key === 'moy_ie' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
                                        col.key === 'moy' ? 'bg-pink-100 border-pink-200 text-pink-800' :
                                        col.key === 'coef' ? 'bg-gray-100 border-gray-200 text-gray-800' :
                                        col.key === 'rang' ? 'bg-indigo-100 border-indigo-200 text-indigo-800' :
                                        col.key === 'appreciation' ? 'bg-green-100 border-green-200 text-green-800' :
                                        'bg-gray-100 border-gray-200 text-gray-800'
                                      }`}>
                                        {calculatedValue}
                                      </span>
                                    );
                                  }
                                })}
          </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedLevel === '1er_cycle' && (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Élève
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Sexe
                      </th>
                      {subjects.map(subject => (
                        <th key={subject.id} className="px-2 py-3 text-center border-r border-gray-200">
                          <div className="text-center font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            {subject.name}
        </div>
                          <div className="flex justify-center gap-1 text-xs mt-1">
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-orange-100 border-orange-200 text-orange-800">IE1</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-orange-100 border-orange-200 text-orange-800">IE2</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-red-100 border-red-200 text-red-800">DS1</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-red-100 border-red-200 text-red-800">DS2</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {bordereauxData.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">{student.nom} {student.prenom}</div>
                          <div className="text-xs text-gray-500">{student.numeroEducmaster}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 border-r border-gray-200">
                          {student.sexe}
                        </td>
                        {subjects.map(subject => {
                          const noteData = editableNotes[student.id]?.[subject.id] || {};
                          return (
                            <td key={subject.id} className="px-2 py-3 border-r border-gray-200">
                              <div className="flex justify-center gap-1">
                                {getColumnsForLevel().map(col => {
                                  if (col.type === 'input' || col.type === 'radio' || col.type === 'number') {
                                    const evalType = col.key;
                                  const hasExisting = hasExistingNoteForEvaluation(student.id, subject.id, evalType);
                                  return (
                                    <input
                                      key={evalType}
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      value={noteData[evalType] || ''}
                                      onChange={(e) => handleNoteChange(student.id, subject.id, evalType, e.target.value)}
                                      className={`flex-1 text-center px-1 py-1 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-16 ${
                                        hasExisting && noteData[evalType] 
                                          ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                          : 'border-gray-300'
                                      }`}
                                      placeholder="-"
                                      disabled={hasExisting && noteData[evalType]}
                                    />
                                  );
                                  }
                                  return null;
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedLevel === '2nd_cycle' && (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Élève
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Sexe
                      </th>
                      {subjects.map(subject => (
                        <th key={subject.id} className="px-2 py-3 text-center border-r border-gray-200">
                          <div className="text-center font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            {subject.name}
                          </div>
                          <div className="flex justify-center gap-1 text-xs mt-1">
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-orange-100 border-orange-200 text-orange-800">IE1</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-orange-100 border-orange-200 text-orange-800">IE2</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-red-100 border-red-200 text-red-800">DS1</span>
                            <span className="px-2 py-1 rounded border flex-1 text-center bg-red-100 border-red-200 text-red-800">DS2</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {bordereauxData.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">{student.nom} {student.prenom}</div>
                          <div className="text-xs text-gray-500">{student.numeroEducmaster}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 border-r border-gray-200">
                          {student.sexe}
                        </td>
                        {subjects.map(subject => {
                          const noteData = editableNotes[student.id]?.[subject.id] || {};
                          return (
                            <td key={subject.id} className="px-2 py-3 border-r border-gray-200">
                              <div className="flex justify-center gap-1">
                                {getColumnsForLevel().map(col => {
                                  if (col.type === 'input' || col.type === 'radio' || col.type === 'number') {
                                    const evalType = col.key;
                                  const hasExisting = hasExistingNoteForEvaluation(student.id, subject.id, evalType);
                                  return (
                                    <input
                                      key={evalType}
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      value={noteData[evalType] || ''}
                                      onChange={(e) => handleNoteChange(student.id, subject.id, evalType, e.target.value)}
                                      className={`flex-1 text-center px-1 py-1 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-16 ${
                                        hasExisting && noteData[evalType] 
                                          ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                          : 'border-gray-300'
                                      }`}
                                      placeholder="-"
                                      disabled={hasExisting && noteData[evalType]}
                                    />
                                  );
                                  }
                                  return null;
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {mode !== 'view' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Mode {mode === 'add' ? 'Ajout' : 'Modification'} :</strong>
                {mode === 'add' && ' Saisissez les notes pour les élèves qui n\'en ont pas encore. Les notes existantes sont protégées.'}
                {mode === 'edit' && ' Modifiez les notes existantes directement dans le tableau.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal d'aperçu du bordereau */}
      <BordereauPreviewModal
        isOpen={showBordereauPreview}
        onClose={() => setShowBordereauPreview(false)}
        bordereauData={bordereauxData}
        subjects={subjects}
        academicYear={selectedAcademicYear || ''}
        quarter={currentQuarter?.name || ''}
        level={selectedLevel}
        className={classes.find(cls => cls.id === selectedClass)?.name || selectedClass}
        viewMode="list"
      />

      {/* Modal moderne */}
      <ModernModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        onConfirm={modalState.onConfirm}
        showCancel={modalState.showCancel}
        cancelText={modalState.cancelText}
        onCancel={modalState.onCancel}
      />
    </div>
  );
}