import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  BookOpen, 
  Users, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  GraduationCap,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  FileText,
  ClipboardList,
  Calendar,
  Clock,
  Star,
  Zap,
  Shield,
  Brain,
  ArrowRight,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Settings,
  MoreHorizontal,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import AcademicYearSelector from '../../../components/common/AcademicYearSelector';
import QuarterSelector from '../../../components/common/QuarterSelector';
import ModernModal from '../../../components/common/ModernModal';
import { useAcademicYearState } from '../../../hooks/useAcademicYearState';
import { useQuarterState } from '../../../hooks/useQuarterState';
import { useModal } from '../../../hooks/useModal';

export function SaisieNotes() {
  // Hooks pour la gestion des années scolaires et trimestres
  const {
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentAcademicYear,
    academicYearLoading
  } = useAcademicYearState('saisie-notes');

  const {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter,
    quarterLoading
  } = useQuarterState('saisie-notes');

  // Hook pour le modal moderne
  const { modalState, hideModal, showError, showSuccess, showWarning } = useModal();

  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  // États pour les notifications
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{count: number, message: string}>({count: 0, message: ''});
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState<{type: 'error' | 'warning', message: string}>({type: 'error', message: ''});

  // État pour les données réelles
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const niveauxScolaires = [
    { id: '', label: 'Sélectionnez un niveau' },
    { id: 'maternelle', label: 'Maternelle' },
    { id: 'primaire', label: 'Primaire' },
    { id: '1er_cycle', label: '1er Cycle Secondaire' },
    { id: '2nd_cycle', label: '2nd Cycle Secondaire' }
  ];
  
  // Options d'évaluation selon le niveau
  const getEvaluationOptions = () => {
    const baseOptions = [
      { id: '', label: 'Toutes les évaluations' }
    ];
    
    switch (selectedLevel) {
      case 'maternelle':
      case 'primaire':
        return [
          ...baseOptions,
          { id: 'em1', label: 'Évaluation mensuelle 1' },
          { id: 'em2', label: 'Évaluation mensuelle 2' },
          { id: 'ec', label: 'Évaluation certificative' }
        ];
      case '1er_cycle':
      case '2nd_cycle':
        return [
          ...baseOptions,
          { id: 'ie1', label: 'Interrogation 1' },
          { id: 'ie2', label: 'Interrogation 2' },
          { id: 'ds1', label: 'Devoir surveillé 1' },
          { id: 'ds2', label: 'Devoir surveillé 2' }
        ];
      default:
        return baseOptions;
    }
  };

  // Charger les données réelles
  useEffect(() => {
    console.log('🔄 useEffect - Sélections changées:', {
      selectedLevel,
      selectedClass,
      selectedSubject,
      selectedAcademicYear,
      selectedQuarter,
      selectedEvaluation
    });
    
    // Ne charger les données que si un niveau est sélectionné
    if (selectedLevel) {
      loadStudents();
      loadClasses();
      loadSubjects();
      
      // Charger les notes existantes seulement si tous les paramètres requis sont présents
      if (selectedAcademicYear && selectedQuarter && selectedClass && selectedSubject) {
        loadExistingNotes();
      }
    } else {
      // Réinitialiser les données si aucun niveau n'est sélectionné
      setStudents([]);
      setClasses([]);
      setSubjects([]);
      setNotes({}); // Réinitialiser les notes
      setExistingNotes({}); // Réinitialiser les notes existantes
      setExistingNotesDetails({}); // Réinitialiser les notes existantes détaillées
    }
  }, [selectedLevel, selectedClass, selectedSubject, selectedAcademicYear, selectedQuarter]);

  // Charger les notes existantes quand l'évaluation change (si tous les autres paramètres sont présents)
  useEffect(() => {
    if (selectedAcademicYear && selectedQuarter && selectedLevel && selectedClass && selectedSubject) {
      console.log('🔄 Évaluation changée, rechargement des notes existantes');
      loadExistingNotes();
    }
  }, [selectedEvaluation]);

  // Réinitialiser la classe, matière et évaluation sélectionnées quand l'année académique change
  useEffect(() => {
    if (selectedAcademicYear) {
      console.log('🔄 Année académique changée, réinitialisation de la classe, matière et évaluation sélectionnées');
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedEvaluation('');
    }
  }, [selectedAcademicYear]);

  // Réinitialiser la matière et évaluation quand le niveau change
  useEffect(() => {
    if (selectedLevel) {
      console.log('🔄 Niveau changé, réinitialisation de la matière et évaluation sélectionnées');
      setSelectedSubject('');
      setSelectedEvaluation(''); // Sélectionner "Toutes les évaluations" par défaut
    } else {
      // Si aucun niveau n'est sélectionné, réinitialiser tout
      console.log('🔄 Aucun niveau sélectionné, réinitialisation complète');
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedEvaluation('');
    }
  }, [selectedLevel]);

  // Cette logique est maintenant gérée dans le useEffect principal ci-dessus

  const loadStudents = async () => {
    try {
      setIsLoadingData(true);
      const classId = selectedClass && selectedClass !== 'Toutes' ? (typeof selectedClass === 'object' ? selectedClass.id : selectedClass) : undefined;
      console.log('🔍 Chargement des étudiants pour la classe:', classId);
      console.log('🔍 Année académique sélectionnée:', selectedAcademicYear);
      console.log('🔍 Filtres appliqués:', { classId, academicYearId: selectedAcademicYear, status: 'active' });
      
      const response = await apiService.getEleves({
        classId,
        academicYearId: selectedAcademicYear,
        status: 'active'
      });
      
      if (response.data) {
        console.log('📚 Étudiants récupérés:', response.data.length);
        const studentsData = response.data.map((student: any) => ({
          id: student.id,
          nom: student.lastName,
          prenom: student.firstName,
          sexe: student.gender,
          numeroEducmaster: student.registrationNumber || student.numeroEducmaster || `E${student.id.slice(-4)}`,
          rang: 0, // À calculer
          moyenne: 0 // À calculer
        }));
        console.log('📚 Étudiants mappés:', studentsData);
        setStudents(studentsData);
      } else {
        console.log('⚠️ Aucun étudiant trouvé pour la classe:', classId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadClasses = async () => {
    try {
      console.log('🔄 Chargement des classes pour le niveau:', selectedLevel);
      console.log('🔄 Année académique pour les classes:', selectedAcademicYear);
      const response = await apiService.getClasses({
        academicYearId: selectedAcademicYear,
        level: selectedLevel
      });
      
      if (response.data) {
        console.log('📚 Classes chargées:', response.data);
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      // LOGIQUE SPÉCIALE POUR LE 2ND CYCLE SECONDAIRE
      if (selectedLevel === '2nd_cycle') {
        if (!selectedClass || selectedClass === 'Toutes') {
          console.log('🟡 2nd cycle SANS classe sélectionnée : sélecteur matière vidé.');
          setSubjects([]);
          return;
        }
        // 2nd cycle + classe: on charge UNIQUEMENT les matières liées à cette classe
        console.log('🟢 2nd cycle AVEC classe sélectionnée : filtrage strict par classId ET level...');
        const response = await apiService.getMatieres({
          classId: typeof selectedClass === 'object' ? selectedClass.id : selectedClass,
          level: selectedLevel
        });
        if (response.data) {
          console.log(`✅ Matières du 2nd cycle (classe ${selectedClass}) : ${response.data.length}`);
          setSubjects(response.data);
          return;
        } else {
          setSubjects([]);
          return;
        }
      }
      // CAS PAR DÉFAUT (autres niveaux)
      console.log('🔵 Filtrage matière : logique normale (niveau:', selectedLevel, ', classe:', selectedClass, ')');
      const response = await apiService.getMatieres({
        classId: selectedClass && selectedClass !== 'Toutes' ? (typeof selectedClass === 'object' ? selectedClass.id : selectedClass) : undefined,
        level: selectedLevel
      });
      if (response.data) {
        setSubjects(response.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matières:', error);
      setSubjects([]);
    }
  };

  // Charger les notes existantes depuis la base de données
  const loadExistingNotes = async () => {
    try {
      console.log('📚 Chargement des notes existantes...');
      console.log('📚 Paramètres actuels:', {
        selectedAcademicYear,
        selectedQuarter,
        selectedLevel,
        selectedClass: typeof selectedClass === 'object' ? selectedClass.id : selectedClass,
        selectedSubject: typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject,
        selectedEvaluation
      });
      
      // Vérifier les paramètres minimum requis (sans selectedSubject pour éviter de vider les notes)
      if (!selectedAcademicYear || !selectedQuarter || !selectedLevel || !selectedClass) {
        console.log('⚠️ Paramètres manquants pour charger les notes');
        console.log('🔍 Détail des paramètres:', {
          selectedAcademicYear: selectedAcademicYear || 'MANQUANT',
          selectedQuarter: selectedQuarter || 'MANQUANT',
          selectedLevel: selectedLevel || 'MANQUANT',
          selectedClass: selectedClass || 'MANQUANT',
          selectedSubject: selectedSubject || 'MANQUANT'
        });
        
        // Ne vider les notes que si c'est vraiment nécessaire (pas de niveau sélectionné)
        if (!selectedLevel) {
          setNotes({});
          setExistingNotes({});
          setExistingNotesDetails({});
        }
        return;
      }
      
      // Si selectedSubject est manquant, ne pas charger de nouvelles notes mais garder les existantes
      if (!selectedSubject) {
        console.log('⚠️ Matière non sélectionnée, conservation des notes existantes');
        return;
      }

      const response = await apiService.getExistingGrades({
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: typeof selectedClass === 'object' ? selectedClass.id : selectedClass,
        subjectId: typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject,
        evaluationType: 'all' // Toujours charger les notes avec 'all' pour qu'elles soient visibles dans toutes les évaluations
      });

      console.log('📚 Réponse complète de getExistingGrades:', response);

      // La fonction getExistingGrades retourne directement un tableau
      if (Array.isArray(response) && response.length > 0) {
        console.log('📚 Notes existantes récupérées:', response);
        
        // Convertir les données en format attendu par le composant
        const notesData: { [key: string]: any } = {};
        
        response.forEach((grade: any) => {
          if (grade.notes) {
            try {
              // Les notes sont déjà parsées dans getExistingGrades
              const parsedNotes = typeof grade.notes === 'string' ? JSON.parse(grade.notes) : grade.notes;
              
              // Si l'étudiant n'a pas encore de notes, initialiser
              if (!notesData[grade.studentId]) {
                notesData[grade.studentId] = {};
              }
              
              // Fusionner les notes de cet enregistrement avec les notes existantes
              notesData[grade.studentId] = { ...notesData[grade.studentId], ...parsedNotes };
              
              console.log(`📚 Notes pour étudiant ${grade.studentId}:`, notesData[grade.studentId]);
            } catch (error) {
              console.error('Erreur lors du parsing des notes:', error);
            }
          }
        });
        
        console.log('📚 Notes parsées:', notesData);
        setNotes(notesData);
        
        // Marquer les notes comme existantes
        const existingNotesMap: { [key: string]: boolean } = {};
        const existingNotesDetailsMap: { [key: string]: {[key: string]: any} } = {};
        
        response.forEach((grade: any) => {
          existingNotesMap[grade.studentId] = true;
          
          // Stocker les détails des notes existantes pour le grisage précis
          if (!existingNotesDetailsMap[grade.studentId]) {
            existingNotesDetailsMap[grade.studentId] = {};
          }
          
          // Parser les notes pour chaque évaluation
          try {
            const parsedNotes = typeof grade.notes === 'string' ? JSON.parse(grade.notes) : grade.notes;
            if (parsedNotes && typeof parsedNotes === 'object') {
              Object.keys(parsedNotes).forEach(evaluationKey => {
                if (parsedNotes[evaluationKey] && parsedNotes[evaluationKey] !== '') {
                  existingNotesDetailsMap[grade.studentId][evaluationKey] = parsedNotes[evaluationKey];
                }
              });
            }
          } catch (error) {
            console.log('⚠️ Erreur lors du parsing des notes existantes:', error);
          }
        });
        
        setExistingNotes(existingNotesMap);
        setExistingNotesDetails(existingNotesDetailsMap);
        console.log('📚 Notes existantes détaillées stockées:', existingNotesDetailsMap);
        
      } else {
        console.log('📚 Aucune note existante trouvée');
        setNotes({});
        setExistingNotes({});
        setExistingNotesDetails({});
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notes existantes:', error);
      setNotes({});
      setExistingNotes({});
      setExistingNotesDetails({});
    }
  };

  const [notes, setNotes] = useState<{[key: string]: any}>({});
  const [validatedNotes, setValidatedNotes] = useState<{[key: string]: boolean}>({});

  // Notes existantes initialement chargées depuis la base de données
  const [existingNotes, setExistingNotes] = useState<{[key: string]: boolean}>({});
  
  // Notes existantes détaillées par élève et colonne (pour le grisage précis)
  const [existingNotesDetails, setExistingNotesDetails] = useState<{[key: string]: {[key: string]: any}}>({});

  // Fonction pour calculer la moyenne d'une évaluation spécifique
  const calculateMoyenneForSingleEvaluation = (studentId: string, evaluationKey: string, singleEvaluationNotes: any) => {
    // Pour les niveaux maternelle (TS/S/PS)
    if (selectedLevel === 'maternelle') {
      const value = singleEvaluationNotes[evaluationKey];
      if (!value || value === '') return '-';
      
      const convertToNumber = (val: string) => {
        switch (val) {
          case 'TS': return 3;
          case 'S': return 2;
          case 'PS': return 1;
          default: return 0;
        }
      };
      return convertToNumber(value).toFixed(2);
    }
    
    // Pour le primaire avec colonnes groupées (CM + CP)
    if (selectedLevel === 'primaire') {
      const cmKey = `${evaluationKey}_cm`;
      const cpKey = `${evaluationKey}_cp`;
      const cmValue = parseFloat(singleEvaluationNotes[cmKey] || '0');
      const cpValue = parseFloat(singleEvaluationNotes[cpKey] || '0');
      
      // Si aucune des deux valeurs n'est présente, retourner '-'
      if (isNaN(cmValue) && isNaN(cpValue)) return '-';
      
      // Calculer la moyenne CM + CP
      const moyenne = (cmValue + cpValue).toFixed(2);
      return moyenne;
    }
    
    // Pour les autres niveaux (notes numériques directes)
    const value = singleEvaluationNotes[evaluationKey];
    if (!value || value === '') return '-';
    
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '-' : numValue.toFixed(2);
  };

  // Fonction pour calculer le rang d'une évaluation spécifique
  const calculateDynamicRangForSingleEvaluation = (studentId: string, allStudents: any[], evaluationKey: string) => {
    // Calculer les moyennes pour tous les étudiants pour cette évaluation spécifique
    const studentsWithMoyennes = allStudents.map(student => ({
      ...student,
      moyenne: calculateMoyenneForSingleEvaluation(student.id, evaluationKey, notes[student.id] || {})
    })).filter(student => student.moyenne !== '-');

    // Trier par moyenne décroissante
    studentsWithMoyennes.sort((a, b) => parseFloat(b.moyenne) - parseFloat(a.moyenne));

    // Trouver le rang de l'étudiant
    const studentIndex = studentsWithMoyennes.findIndex(student => student.id === studentId);
    
    if (studentIndex === -1) return '-';
    
    const rang = studentIndex + 1;
    const student = studentsWithMoyennes[studentIndex];
    const moyenne = parseFloat(student.moyenne);

    // Vérifier s'il y a des ex-aequo
    const studentsWithSameMoyenne = studentsWithMoyennes.filter(s => 
      Math.abs(parseFloat(s.moyenne) - moyenne) < 0.01
    );
    const isExAequo = studentsWithSameMoyenne.length > 1;
    
    let suffix = '';
    if (rang === 1) {
      suffix = student.sexe === 'F' ? 'ère' : 'er';
    } else {
      suffix = 'ème';
    }
    
    const baseRang = `${rang}${suffix}`;
    return isExAequo ? `${baseRang} ex-æquo` : baseRang;
  };

  // Fonction pour calculer le rang dynamiquement basé sur les moyennes actuelles
  const calculateDynamicRang = (studentId: string, allStudents: any[], columns: any[]) => {
    // Si une évaluation spécifique est sélectionnée, utiliser la logique pour une seule évaluation
    if (selectedEvaluation && selectedEvaluation !== '') {
      return calculateDynamicRangForSingleEvaluation(studentId, allStudents, selectedEvaluation);
    }
    
    // Calculer les moyennes pour tous les étudiants
    const studentsWithMoyennes = allStudents.map(student => ({
      ...student,
      moyenne: calculateMoyenne(student.id, columns)
    })).filter(student => student.moyenne !== '-');

    // Trier par moyenne décroissante
    studentsWithMoyennes.sort((a, b) => {
      const moyenneA = parseFloat(a.moyenne);
      const moyenneB = parseFloat(b.moyenne);
      return moyenneB - moyenneA;
    });

    // Trouver le rang de l'étudiant
    const studentIndex = studentsWithMoyennes.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return '-';

    const rang = studentIndex + 1;
    const student = studentsWithMoyennes[studentIndex];
    const moyenne = parseFloat(student.moyenne);

    // Vérifier s'il y a des ex-aequo
    const studentsWithSameMoyenne = studentsWithMoyennes.filter(s => 
      Math.abs(parseFloat(s.moyenne) - moyenne) < 0.01
    );
    const isExAequo = studentsWithSameMoyenne.length > 1;
    
    let suffix = '';
    if (rang === 1) {
      suffix = student.sexe === 'F' ? 'ère' : 'er';
    } else {
      suffix = 'ème';
    }
    
    const baseRang = `${rang}${suffix}`;
    return isExAequo ? `${baseRang} ex-æquo` : baseRang;
  };

  // Fonction pour formater le rang avec gestion des ex-aequo et du sexe (version statique)
  const formatRang = (rang: number, sexe: string, moyenne: number, allStudents: any[]) => {
    // Vérifier s'il y a des ex-aequo
    const studentsWithSameMoyenne = allStudents.filter(s => s.moyenne === moyenne);
    const isExAequo = studentsWithSameMoyenne.length > 1;
    
    let suffix = '';
    if (rang === 1) {
      suffix = sexe === 'F' ? 'ère' : 'er';
    } else {
      suffix = 'ème';
    }
    
    const baseRang = `${rang}${suffix}`;
    return isExAequo ? `${baseRang} ex-æquo` : baseRang;
  };

  // Fonction pour obtenir les colonnes d'évaluation selon le niveau et l'évaluation sélectionnée
  const getEvaluationColumns = () => {
    if (!selectedLevel) return [];
    
    // Définir toutes les colonnes possibles par niveau
    const allColumns = {
      'maternelle': [
        { key: 'em1', label: 'EM1', type: 'radio', options: ['TS', 'S', 'PS'] },
        { key: 'em2', label: 'EM2', type: 'radio', options: ['TS', 'S', 'PS'] },
        { key: 'ec', label: 'EC', type: 'radio', options: ['TS', 'S', 'PS'] },
      ],
      'primaire': [
          { 
            key: 'em1', 
            label: 'EM1', 
            type: 'group',
            subcolumns: [
              { key: 'em1_cm', label: 'CM', sublabel: '/18', type: 'number', max: 18 },
              { key: 'em1_cp', label: 'CP', sublabel: '/2', type: 'number', max: 2 },
              { key: 'em1_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { 
            key: 'em2', 
            label: 'EM2', 
            type: 'group',
            subcolumns: [
              { key: 'em2_cm', label: 'CM', sublabel: '/18', type: 'number', max: 18 },
              { key: 'em2_cp', label: 'CP', sublabel: '/2', type: 'number', max: 2 },
              { key: 'em2_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { 
            key: 'ec', 
            label: 'EC', 
            type: 'group',
            subcolumns: [
              { key: 'ec_cm', label: 'CM', sublabel: '/18', type: 'number', max: 18 },
              { key: 'ec_cp', label: 'CP', sublabel: '/2', type: 'number', max: 2 },
              { key: 'ec_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { key: 'moyenne', label: 'Moyenne', type: 'calculated' }
      ],
      '1er_cycle': [
          { key: 'ie1', label: 'IE1', type: 'number', max: 20 },
          { key: 'ie2', label: 'IE2', type: 'number', max: 20 },
          { key: 'moy_ie', label: 'Moy. IE', type: 'calculated' },
          { key: 'ds1', label: 'DS1', type: 'number', max: 20 },
          { key: 'ds2', label: 'DS2', type: 'number', max: 20 },
          { key: 'moyenne', label: 'Moyenne', type: 'calculated' }
      ],
      '2nd_cycle': [
          { key: 'ie1', label: 'IE1', type: 'number', max: 20 },
          { key: 'ie2', label: 'IE2', type: 'number', max: 20 },
          { key: 'moy_ie', label: 'Moy. IE', type: 'calculated' },
          { key: 'ds1', label: 'DS1', type: 'number', max: 20 },
          { key: 'ds2', label: 'DS2', type: 'number', max: 20 },
          { key: 'moy', label: 'Moy.', type: 'calculated' },
          { key: 'coef', label: 'Coef', type: 'coefficient' },
          { key: 'moyenne', label: 'Moyenne coef', type: 'calculated' }
      ]
    };
    
    const columns = allColumns[selectedLevel as keyof typeof allColumns] || [];
    
    // Si aucune évaluation spécifique n'est sélectionnée (Toutes les évaluations)
    if (!selectedEvaluation || selectedEvaluation === '') {
      return columns;
    }
    
    // Filtrer les colonnes selon l'évaluation sélectionnée
    switch (selectedEvaluation) {
      // Évaluations pour Maternelle et Primaire
      case 'em1':
        return columns.filter(col => col.key === 'em1');
      case 'em2':
        return columns.filter(col => col.key === 'em2');
      case 'ec':
        return columns.filter(col => col.key === 'ec');
      
      // Évaluations pour 1er et 2nd Cycle
      case 'ie1':
        return columns.filter(col => col.key === 'ie1');
      case 'ie2':
        return columns.filter(col => col.key === 'ie2');
      case 'ds1':
        return columns.filter(col => col.key === 'ds1');
      case 'ds2':
        return columns.filter(col => col.key === 'ds2');
      
      // Si aucune évaluation spécifique ou "Toutes les évaluations"
      default:
        return columns;
    }
  };

  // Fonction pour obtenir le coefficient selon la matière sélectionnée (mapping dynamique)
  const getCoefficient = () => {
    if (!selectedSubject) return 1;
    const found = subjects.find(s => (s.id === selectedSubject) || (typeof selectedSubject === 'object' && s.id === selectedSubject.id));
    if (found && typeof found.coefficient !== 'undefined' && found.coefficient !== null) {
      return Number(found.coefficient) || 1;
    }
    return 1;
  };

  // Fonction pour calculer la moyenne selon le niveau et les colonnes visibles
  const calculateMoyenne = (studentId: string, columns: any[]) => {
    const studentNotes = notes[studentId] || {};
    
    console.log(`🔍 calculateMoyenne pour étudiant ${studentId}:`, {
      studentNotes,
      columns: columns.map(c => ({ key: c.key, type: c.type, label: c.label })),
      selectedLevel,
      selectedEvaluation
    });
    
    // Si une seule colonne d'évaluation est visible, retourner sa valeur
    const evaluationColumns = columns.filter(col => 
      ['em1', 'em2', 'ec', 'ie1', 'ie2', 'ds1', 'ds2', 'em1_cm', 'em1_cp', 'em2_cm', 'em2_cp', 'ec_cm', 'ec_cp'].includes(col.key)
    );
    
    console.log(`🔍 Colonnes d'évaluation filtrées:`, evaluationColumns.map(c => ({ key: c.key, type: c.type })));
    
    if (evaluationColumns.length === 1) {
      const col = evaluationColumns[0];
      const value = studentNotes[col.key];
      
      console.log(`🔍 Colonne unique trouvée:`, { key: col.key, type: col.type, value });
      
      if (!value || value === '') return '-';
      
      // Pour les niveaux maternelle (TS/S/PS)
      if (selectedLevel === 'maternelle' && col.type === 'radio') {
        const convertToNumber = (val: string) => {
          switch (val) {
            case 'TS': return 3;
            case 'S': return 2;
            case 'PS': return 1;
            default: return 0;
          }
        };
        const result = convertToNumber(value).toFixed(2);
        console.log(`🔍 Conversion maternelle: ${value} -> ${result}`);
        return result;
      }
      
      // Pour les autres niveaux (notes numériques)
      if (col.type === 'number') {
        const numValue = parseFloat(value);
        return isNaN(numValue) ? '-' : numValue.toFixed(2);
      }
      
      return value;
    }
    
    // Calcul de moyenne complète pour toutes les évaluations
    switch (selectedLevel) {
      case 'maternelle':
        const em1_mat = studentNotes['em1'];
        const em2_mat = studentNotes['em2'];
        const ec_mat = studentNotes['ec'];
        if (em1_mat && em2_mat && ec_mat) {
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
          return ((moyenneEM + ec_num) / 2).toFixed(2);
        }
        break;
      case 'primaire':
        // Calculer les notes EM1, EM2, EC à partir de CM + CP
        const em1_cm = parseFloat(studentNotes['em1_cm'] || '0');
        const em1_cp = parseFloat(studentNotes['em1_cp'] || '0');
        const em2_cm = parseFloat(studentNotes['em2_cm'] || '0');
        const em2_cp = parseFloat(studentNotes['em2_cp'] || '0');
        const ec_cm = parseFloat(studentNotes['ec_cm'] || '0');
        const ec_cp = parseFloat(studentNotes['ec_cp'] || '0');
        
        const em1 = em1_cm + em1_cp;
        const em2 = em2_cm + em2_cp;
        const ec = ec_cm + ec_cp;
        
        if (em1 && em2 && ec) {
          const moyenneEM = (em1 + em2) / 2;
          return ((moyenneEM + ec) / 2).toFixed(2);
        }
        break;
      case '1er_cycle':
        const ie1_1er = parseFloat(studentNotes['ie1'] || '0');
        const ie2_1er = parseFloat(studentNotes['ie2'] || '0');
        const ds1_1er = parseFloat(studentNotes['ds1'] || '0');
        const ds2_1er = parseFloat(studentNotes['ds2'] || '0');
        if (ie1_1er && ie2_1er && ds1_1er && ds2_1er) {
          const moyenneIE = (ie1_1er + ie2_1er) / 2;
          return ((moyenneIE + ds1_1er + ds2_1er) / 3).toFixed(2);
        }
        break;
      case '2nd_cycle':
        const ie1_2nd = parseFloat(studentNotes['ie1'] || '0');
        const ie2_2nd = parseFloat(studentNotes['ie2'] || '0');
        const ds1_2nd = parseFloat(studentNotes['ds1'] || '0');
        const ds2_2nd = parseFloat(studentNotes['ds2'] || '0');
        const coef = getCoefficient();
        if (ie1_2nd && ie2_2nd && ds1_2nd && ds2_2nd) {
          const moyenneIE = (ie1_2nd + ie2_2nd) / 2;
          const moyenneBase = (moyenneIE + ds1_2nd + ds2_2nd) / 3;
          return (moyenneBase * coef).toFixed(2);
        }
        break;
      default:
        return '-';
    }
    return '-';
  };

  // Fonction pour calculer la moyenne IE
  const calculateMoyenneIE = (studentId: number) => {
    const studentNotes = notes[studentId] || {};
    const ie1 = parseFloat(studentNotes['ie1'] || '0');
    const ie2 = parseFloat(studentNotes['ie2'] || '0');
    
    if (ie1 && ie2) {
      return ((ie1 + ie2) / 2).toFixed(2);
    }
    return '-';
  };

  // Fonction pour calculer la Moy. (moyenne sans coefficient) pour 2nd cycle
  const calculateMoy = (studentId: number) => {
    const studentNotes = notes[studentId] || {};
    const ie1 = parseFloat(studentNotes['ie1'] || '0');
    const ie2 = parseFloat(studentNotes['ie2'] || '0');
    const ds1 = parseFloat(studentNotes['ds1'] || '0');
    const ds2 = parseFloat(studentNotes['ds2'] || '0');
    
    if (ie1 && ie2 && ds1 && ds2) {
      const moyenneIE = (ie1 + ie2) / 2;
      return ((moyenneIE + ds1 + ds2) / 3).toFixed(2);
    }
    return '-';
  };

  const handleModeChange = async (newMode: 'add' | 'edit') => {
    setMode(newMode);
    setEditingStudentId(null);
    
    if (newMode === 'edit') {
      // En mode modification, charger les notes existantes au lieu de les effacer
      console.log('🔄 Passage en mode modification - chargement des notes existantes');
      await loadExistingNotes();
    } else if (newMode === 'add') {
      // En mode ajout, charger les notes existantes pour les griser
      console.log('🔄 Passage en mode ajout - chargement des notes existantes pour protection');
      await loadExistingNotes();
    }
  };

  const handleEditStudent = async (studentId: string) => {
    console.log('🔄 Mode modification activé pour l\'étudiant:', studentId);
    setMode('edit');
    setEditingStudentId(studentId);
    
    // Charger les notes existantes de l'élève pour modification
    try {
      console.log('📚 Chargement des notes existantes pour modification...');
      
      if (!selectedAcademicYear || !selectedQuarter || !selectedLevel || !selectedClass || !selectedSubject) {
        console.log('⚠️ Paramètres manquants pour charger les notes de modification');
        return;
      }

      const response = await apiService.getExistingGrades({
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: typeof selectedClass === 'object' ? selectedClass.id : selectedClass,
        subjectId: typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject,
        evaluationType: 'all' // Toujours charger les notes avec 'all' pour qu'elles soient visibles dans toutes les évaluations
      });

      console.log('📚 Réponse de getExistingGrades pour modification:', response);

      if (Array.isArray(response) && response.length > 0) {
        // Trouver les notes de cet étudiant spécifique
        const studentGrades = response.filter(grade => grade.studentId === studentId);
        
        if (studentGrades.length > 0) {
          console.log('📚 Notes trouvées pour l\'étudiant:', studentGrades);
          
          // Convertir les notes en format attendu par le composant
          const studentNotes: { [key: string]: any } = {};
          
          studentGrades.forEach((grade: any) => {
            if (grade.notes) {
              try {
                const parsedNotes = typeof grade.notes === 'string' ? JSON.parse(grade.notes) : grade.notes;
                Object.assign(studentNotes, parsedNotes);
              } catch (error) {
                console.error('Erreur lors du parsing des notes pour modification:', error);
              }
            }
          });
          
          console.log('📚 Notes parsées pour modification:', studentNotes);
          
          // Mettre à jour les notes en préservant les autres étudiants
          setNotes(prevNotes => ({
            ...prevNotes,
            [studentId]: studentNotes
          }));
          
          // Marquer les notes comme existantes
          setExistingNotes(prev => ({
            ...prev,
            [studentId]: true
          }));
          
        } else {
          console.log('⚠️ Aucune note trouvée pour cet étudiant');
          // Garder les notes existantes si aucune note n'est trouvée
        }
      } else {
        console.log('⚠️ Aucune note existante trouvée pour modification');
        // Garder les notes existantes si aucune note n'est trouvée
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notes pour modification:', error);
      // En cas d'erreur, garder les notes existantes
    }
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    
    try {
      console.log('💾 Sauvegarde des notes en cours...');
      console.log('📊 Données de sauvegarde:', {
        selectedAcademicYear,
        selectedQuarter,
        selectedLevel,
        selectedClass,
        selectedSubject,
        selectedEvaluation,
        notes: Object.keys(notes).length
      });

      // Vérifier que tous les paramètres requis sont présents
      if (!selectedAcademicYear || !selectedQuarter || !selectedLevel || !selectedClass || !selectedSubject) {
        showError(
          'Paramètres manquants',
          'Veuillez sélectionner tous les paramètres requis : année scolaire, trimestre, niveau, classe et matière.'
        );
        setIsLoading(false);
        return;
      }

      // Utiliser la même logique que BordereauNotes pour la sauvegarde
      const gradesToSave: any[] = [];

      // Parcourir les notes pour créer les enregistrements (même logique que Bordereau de Notes)
      console.log('🔍 Toutes les notes à traiter:', notes);
      console.log('🔍 Nombre d\'étudiants avec des notes:', Object.keys(notes).length);
      
      Object.entries(notes).forEach(([studentId, studentNotes]) => {
        const columns = getEvaluationColumns();
        
        console.log(`🔍 Traitement des notes pour l'étudiant ${studentId}:`, studentNotes);
        console.log(`🔍 Colonnes d'évaluation disponibles:`, columns.map(c => {
          if (c.type === 'group' && c.subcolumns) {
            return `${c.key} (grouped): [${c.subcolumns.map(sc => sc.key).join(', ')}]`;
          } else {
            return c.key;
          }
        }));
        
        // Créer un objet notes avec toutes les évaluations pour ce sujet
        const notesForSubject = {};
        let hasValidNotes = false;
        
        columns.forEach(col => {
          if (col.type === 'group' && col.subcolumns) {
            // Pour les colonnes groupées (primaire, secondaire), traiter chaque sous-colonne
            col.subcolumns.forEach(subcol => {
              const value = studentNotes[subcol.key];
              
              console.log(`🔍 Sous-colonne ${subcol.key}: valeur = "${value}" (type: ${typeof value})`);
              
              // Ne sauvegarder que si c'est une note valide (pas moyenne, rang, etc.)
              // Accepter les valeurs numériques (y compris 0) et les valeurs non vides
              // Exclure les colonnes calculées et les colonnes système
              if (value !== undefined && value !== null && value !== '' && 
                  !['moyenne', 'rang', 'appreciation', 'coef'].includes(subcol.key) &&
                  subcol.type !== 'calculated') {
                notesForSubject[subcol.key] = value;
                hasValidNotes = true;
                console.log(`✅ Note valide ajoutée: ${subcol.key} = ${value}`);
              } else {
                console.log(`❌ Note ignorée: ${subcol.key} = ${value} (raison: ${!value ? 'valeur vide' : subcol.type === 'calculated' ? 'colonne calculée' : 'colonne exclue'})`);
              }
            });
          } else {
            // Pour les colonnes simples (maternelle)
            const value = studentNotes[col.key];
            
            console.log(`🔍 Colonne ${col.key}: valeur = "${value}" (type: ${typeof value})`);
            
            // Ne sauvegarder que si c'est une note valide (pas moyenne, rang, etc.)
            // Accepter les valeurs numériques (y compris 0) et les valeurs non vides
            // Pour la maternelle, accepter aussi les valeurs TS, S, PS
            // Exclure les colonnes calculées et les colonnes système
            if (value !== undefined && value !== null && value !== '' && 
                !['moyenne', 'rang', 'appreciation', 'coef'].includes(col.key) &&
                col.type !== 'calculated') {
              notesForSubject[col.key] = value;
              hasValidNotes = true;
              console.log(`✅ Note valide ajoutée: ${col.key} = ${value}`);
            } else {
              console.log(`❌ Note ignorée: ${col.key} = ${value} (raison: ${!value ? 'valeur vide' : col.type === 'calculated' ? 'colonne calculée' : 'colonne exclue'})`);
            }
          }
        });
        
        console.log(`🔍 Notes pour le sujet:`, notesForSubject);
        console.log(`🔍 A des notes valides:`, hasValidNotes);
        console.log(`🔍 Nombre de notes dans notesForSubject:`, Object.keys(notesForSubject).length);
        console.log(`🔍 Clés des notes dans notesForSubject:`, Object.keys(notesForSubject));
        
        // Si on a des notes valides pour ce sujet, créer un enregistrement
        if (hasValidNotes) {
          console.log(`🔍 Création d'un enregistrement pour l'étudiant ${studentId}`);
          console.log(`🔍 Liste des étudiants disponibles:`, students.map(s => ({ id: s.id, nom: s.nom, prenom: s.prenom })));
          
          // Calculer la moyenne et le rang pour ce sujet (même logique que Bordereau de Notes)
          console.log(`🔍 Recherche de l'étudiant avec ID: ${studentId} (type: ${typeof studentId})`);
          const student = students.find(s => s.id === studentId); // Pas de conversion, les IDs sont des strings
          console.log(`🔍 Étudiant trouvé:`, student);
          
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
            
            // Calculer le rang (utiliser la logique existante)
            const rang = calculateDynamicRang(parseInt(studentId), students, columns);
            let rangNumerique = 0;
            if (rang !== '-') {
              const rangMatch = rang.match(/(\d+)/);
              if (rangMatch) {
                rangNumerique = parseInt(rangMatch[1]);
              }
            }
            
            // Obtenir l'appréciation
            const appreciation = getAppreciation(moyenne);
            
            const gradeRecord = {
              studentId: student.id, // Utiliser l'ID de l'étudiant trouvé (même logique que BordereauNotes)
              notes: notesForSubject, // Utiliser la même structure que Bordereau de Notes
              moyenne: moyenne,
              rang: rangNumerique,
              appreciation: appreciation?.text || '',
              subjectId: typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject,
              evaluationType: 'all' // Toujours sauvegarder avec 'all' pour que les notes soient visibles dans toutes les évaluations
            };
            
            console.log(`🔍 Enregistrement créé:`, gradeRecord);
            gradesToSave.push(gradeRecord);
            console.log(`🔍 Enregistrement ajouté au tableau. Taille actuelle:`, gradesToSave.length);
          } else {
            console.log(`❌ Étudiant non trouvé pour l'ID: ${studentId}`);
          }
        } else {
          console.log(`❌ Pas de notes valides pour l'étudiant ${studentId}`);
        }
      });

      console.log('💾 Notes à sauvegarder:', gradesToSave);
      console.log('💾 Nombre total de notes à sauvegarder:', gradesToSave.length);

      // Préparer les données complètes pour la sauvegarde (même structure que Bordereau de Notes)
      const gradeData = {
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: typeof selectedClass === 'object' ? selectedClass.id : selectedClass,
        subjectId: typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject,
        evaluationType: selectedEvaluation || 'all', // Utiliser 'all' si aucune évaluation spécifique
        studentsGrades: gradesToSave
      };

      console.log('📋 Données préparées pour la sauvegarde:', gradeData);
      console.log('📋 Nombre d\'étudiants avec des notes:', gradeData.studentsGrades.length);

      // Appeler l'API de sauvegarde
      const response = await apiService.saveGrades(gradeData);
      
      if (response.success) {
        console.log('✅ Notes sauvegardées avec succès:', response.message);
        
        // Marquer les notes comme existantes après sauvegarde (comme dans Bordereau de Notes)
      if (mode === 'add') {
        const newExistingNotes = { ...existingNotes };
        Object.keys(notes).forEach(studentId => {
          newExistingNotes[parseInt(studentId)] = true;
        });
        setExistingNotes(newExistingNotes);
      }
      
      setMode('view');
      setEditingStudentId(null);
        
        // Calculer le nombre total de notes individuelles sauvegardées
        const totalNotesCount = gradesToSave.reduce((total, gradeRecord) => {
          const notesCount = Object.keys(gradeRecord.notes).length;
          console.log(`🔍 Étudiant ${gradeRecord.studentId}: ${notesCount} notes individuelles`);
          return total + notesCount;
        }, 0);
        
        console.log(`🔍 Total des notes individuelles sauvegardées: ${totalNotesCount}`);
        
        // Afficher le modal de succès
        showSuccessModalWithData(
          totalNotesCount,
          `Notes ${mode === 'add' ? 'ajoutées' : 'modifiées'} avec succès !`
        );
        
        // Recharger les données
        loadStudents();
      } else {
        console.error('❌ Erreur lors de la sauvegarde:', response.message);
        showErrorToast(`Erreur lors de la sauvegarde: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      showErrorToast(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    
    setIsLoading(false);
  };

  const getGradeFromScore = (score: number): string => {
    if (score >= 18) return 'Excellent';
    if (score >= 16) return 'Très Bien';
    if (score >= 14) return 'Bien';
    if (score >= 12) return 'Assez Bien';
    if (score >= 10) return 'Passable';
    if (score >= 8) return 'Insuffisant';
    return 'Très Insuffisant';
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    // Simulation d'une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    showSuccess(
      'Sauvegarde réussie',
      'Toutes les notes ont été sauvegardées avec succès dans la base de données.'
    );
  };

  // Fonction pour afficher le toast d'erreur
  const showErrorToast = (message: string) => {
    setToastData({ type: 'error', message });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Fonction pour afficher le toast d'avertissement
  const showWarningToast = (message: string) => {
    setToastData({ type: 'warning', message });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Fonction pour afficher le modal de succès
  const showSuccessModalWithData = (count: number, message: string) => {
    setSuccessData({ count, message });
    setShowSuccessModal(true);
  };


  const handleNoteChange = (studentId: number, column: string, value: string) => {
    if (selectedLevel === 'maternelle') {
      // Pour la maternelle, validation des options TS/S/PS
      if (value === '' || ['TS', 'S', 'PS'].includes(value)) {
        setNotes(prev => ({ 
          ...prev, 
          [studentId]: { ...prev[studentId], [column]: value }
        }));
        setValidatedNotes(prev => ({ ...prev, [studentId]: false }));
      }
    } else {
      // Pour les autres niveaux, validation numérique
      
      // Permettre toujours la suppression de la note (champ vide)
      if (value === '' || value === null || value === undefined) {
        setNotes(prev => ({ 
          ...prev, 
          [studentId]: { ...prev[studentId], [column]: value }
        }));
        setValidatedNotes(prev => ({ ...prev, [studentId]: false }));
        return;
      }
      
      const numNote = parseFloat(value);
      
      // Vérifier si la valeur est un nombre valide
      if (!isNaN(numNote)) {
        // Validation spécifique pour le primaire (CM et CP)
        if (selectedLevel === 'primaire') {
          if (column.includes('_cm')) {
            // CM ne doit pas dépasser 18
            if (numNote < 0) {
              showWarning(
                'Note CM invalide', 
                `La note CM ne peut pas être négative. Vous avez saisi ${numNote}.`
              );
              return;
            } else if (numNote > 18) {
              showWarning(
                'Note CM invalide', 
                `La note CM ne peut pas être supérieure à 18. Vous avez saisi ${numNote}.`
              );
              return;
            }
          } else if (column.includes('_cp')) {
            // CP ne doit pas dépasser 2
            if (numNote < 0) {
              showWarning(
                'Note CP invalide', 
                `La note CP ne peut pas être négative. Vous avez saisi ${numNote}.`
              );
              return;
            } else if (numNote > 2) {
              showWarning(
                'Note CP invalide', 
                `La note CP ne peut pas être supérieure à 2. Vous avez saisi ${numNote}.`
              );
              return;
            }
          }
        } else {
          // Pour les autres niveaux (1er cycle, 2nd cycle), validation 0-20
          if (numNote < 0) {
            showWarning(
              'Note invalide', 
              `La note ne peut pas être négative. Vous avez saisi ${numNote}.`
            );
            return;
          } else if (numNote > 20) {
            showWarning(
              'Note invalide', 
              `La note ne peut pas être supérieure à 20. Vous avez saisi ${numNote}.`
            );
            return;
          }
        }
        
        // Note valide, permettre la mise à jour
        setNotes(prev => ({ 
          ...prev, 
          [studentId]: { ...prev[studentId], [column]: value }
        }));
        setValidatedNotes(prev => ({ ...prev, [studentId]: false }));
      }
    }
  };

  const validateNote = (studentId: number) => {
    const studentNotes = notes[studentId] || {};
    const columns = getEvaluationColumns();
    
    // Vérifier que toutes les notes requises sont saisies
    const requiredColumns = columns.filter(col => col.type !== 'calculated');
    const allNotesEntered = requiredColumns.every(col => studentNotes[col.key]);
    
    if (allNotesEntered) {
      setValidatedNotes(prev => ({ ...prev, [studentId]: false }));
    }
  };


  const getAppreciation = (note: number) => {
    if (note >= 18) return { text: 'Excellent', color: 'text-green-700', emoji: '🌟' };
    if (note >= 16) return { text: 'Très Bien', color: 'text-blue-700', emoji: '😊' };
    if (note >= 14) return { text: 'Bien', color: 'text-blue-600', emoji: '👍' };
    if (note >= 12) return { text: 'Assez Bien', color: 'text-yellow-600', emoji: '😐' };
    if (note >= 10) return { text: 'Passable', color: 'text-orange-600', emoji: '⚠️' };
    if (note >= 8) return { text: 'Insuffisant', color: 'text-red-600', emoji: '❌' };
    return { text: 'Très Insuffisant', color: 'text-red-700', emoji: '🚫' };
  };

  const getCurrentEvaluationTypes = () => {
    if (!selectedLevel) return [];
    return getEvaluationOptions().map(option => option.id);
  };

  const getAvailableClasses = () => {
    // Les classes sont déjà filtrées par niveau dans loadClasses()
    if (!classes || classes.length === 0) {
      console.log('⚠️ Aucune classe disponible pour le niveau:', selectedLevel);
      return [];
    }
    console.log('✅ Classes disponibles pour le niveau', selectedLevel, ':', classes);
    return classes;
  };

  // Fonction pour récupérer le nom de la classe à partir de son ID
  const getClassName = () => {
    console.log('🔍 getClassName - selectedClass:', selectedClass);
    console.log('🔍 getClassName - classes disponibles:', classes);
    
    if (!selectedClass || selectedClass === '') {
      console.log('🔍 getClassName - aucune classe sélectionnée');
      return 'Sélectionner une classe';
    }
    
    if (typeof selectedClass === 'object') {
      const name = selectedClass?.name || 'Sélectionner une classe';
      console.log('🔍 getClassName - objet trouvé:', name);
      return name;
    }
    
    if (selectedClass && selectedClass !== 'Toutes') {
      const classObj = classes.find(cls => cls.id === selectedClass);
      console.log('🔍 getClassName - classe trouvée:', classObj);
      const name = classObj?.name || selectedClass;
      console.log('🔍 getClassName - nom final:', name);
      return name;
    }
    
    console.log('🔍 getClassName - défaut: Sélectionner une classe');
    return 'Sélectionner une classe';
  };

  // Fonction pour récupérer le nom de la matière à partir de son ID
  const getSubjectName = () => {
    console.log('🔍 getSubjectName - selectedSubject:', selectedSubject);
    console.log('🔍 getSubjectName - subjects disponibles:', subjects);
    
    if (!selectedSubject || selectedSubject === '') {
      console.log('🔍 getSubjectName - aucune matière sélectionnée');
      return 'Sélectionner une matière';
    }
    
    if (typeof selectedSubject === 'object') {
      const name = selectedSubject?.name || 'Sélectionner une matière';
      console.log('🔍 getSubjectName - objet trouvé:', name);
      return name;
    }
    
    if (selectedSubject && selectedSubject !== 'Toutes') {
      const subjectObj = subjects.find(subj => subj.id === selectedSubject);
      console.log('🔍 getSubjectName - matière trouvée:', subjectObj);
      const name = subjectObj?.name || selectedSubject;
      console.log('🔍 getSubjectName - nom final:', name);
      return name;
    }
    
    console.log('🔍 getSubjectName - défaut: Sélectionner une matière');
    return 'Sélectionner une matière';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 p-6">
        {/* Header moderne avec gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-start">
              <div className="text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
            Saisie des Notes d'Évaluation
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Gérez les notes et évaluations des élèves
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{currentAcademicYear?.name || 'Chargement...'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{currentQuarter?.name || 'Chargement...'}</span>
                  </div>
                </div>
              </div>
          <div className="flex space-x-3">
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <Shield className="h-4 w-4" />
                  <span>Interface de saisie des notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres modernes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Filtres de Sélection
              </h2>
              <p className="text-gray-600">
                Configurez les paramètres pour afficher les données
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div>
            <AcademicYearSelector
              moduleName="saisie-notes"
              className="w-full"
              onChange={(yearId) => {
                setSelectedAcademicYear(yearId);
                console.log('Année scolaire sélectionnée:', yearId);
              }}
            />
          </div>
          <div>
            <QuarterSelector
              moduleName="saisie-notes"
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
                  const newLevel = e.target.value;
                  setSelectedLevel(newLevel);
                  setSelectedClass('');
                  setSelectedSubject('');
                  setSelectedEvaluation(''); // Sélectionner "Toutes les évaluations" par défaut
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Sélectionner un niveau scolaire"
            >
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
                value={typeof selectedClass === 'object' ? selectedClass?.id || '' : selectedClass}
                onChange={(e) => {
                  const classId = e.target.value;
                  setSelectedClass(classId);
                  setSelectedSubject('');
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Sélectionner une classe"
              >
                <option value="">Sélectionner une classe</option>
              {getAvailableClasses().map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Matière
              </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Sélectionner une matière"
            >
                <option value="">Sélectionner une matière</option>
              {subjects.map(subject => (
                  <option key={subject.id || subject} value={subject.id || subject}>{subject.name || subject}</option>
              ))}
            </select>
          </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Évaluation
              </label>
              <select
                value={selectedEvaluation}
                onChange={(e) => setSelectedEvaluation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={!selectedLevel}
                aria-label="Sélectionner une évaluation"
              >
                <option value="">Sélectionner une évaluation</option>
                {getEvaluationOptions().map(evaluation => (
                  <option key={evaluation.id} value={evaluation.id}>{evaluation.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

        {/* Info système éducatif moderne */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
        </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Mode de Fonctionnement
              </h3>
              <p className="text-sm text-gray-600">
                {mode === 'view' ? 'Consultation des notes' : mode === 'add' ? 'Ajout de nouvelles notes' : 'Modification des notes existantes'}
              </p>
            </div>
          </div>
          
          {selectedLevel && selectedLevel !== '' && (
            <div className="p-4 bg-white/60 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedLevel === 'maternelle' ? 'bg-pink-500' :
                  selectedLevel === 'primaire' ? 'bg-green-500' :
                  selectedLevel === '1er_cycle' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <span className="font-semibold text-gray-900">
                  {selectedLevel === 'maternelle' ? 'Maternelle' : 
                            selectedLevel === 'primaire' ? 'Primaire' : 
                            selectedLevel === '1er_cycle' ? '1er Cycle Secondaire' : 
                   '2nd Cycle Secondaire'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
            {selectedLevel === 'maternelle' 
                  ? 'Évaluation qualitative par observation continue - Échelle TS/S/PS'
              : selectedLevel === 'primaire' 
                  ? 'EM1, EM2 (Évaluations Mensuelles), EC (Évaluation Certificative) - Sans coefficient'
              : selectedLevel === '1er_cycle'
                  ? 'IE1, IE2 (Interrogations Écrites), DS1, DS2 (Devoirs Surveillés) - Sans coefficient'
                  : 'IE1, IE2 (Interrogations Écrites), DS1, DS2 (Devoirs Surveillés) - Avec coefficient par série'
            }
              </p>
        </div>
          )}
      </div>

        {/* Message d'information moderne */}
        {(!selectedLevel || selectedLevel === '' || !selectedClass || selectedClass === 'Toutes') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {!selectedLevel || selectedLevel === '' 
                    ? 'Sélectionnez un niveau d\'enseignement' 
                    : 'Sélectionnez une classe'
                  }
          </h3>
                <p className="text-gray-600 text-lg">
                  {!selectedLevel || selectedLevel === ''
                    ? 'Choisissez un niveau dans le sélecteur ci-dessus pour commencer la saisie des notes.'
                    : 'Choisissez une classe dans le sélecteur ci-dessus pour afficher les élèves et leurs notes.'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Données sécurisées et sauvegardées automatiquement</span>
              </div>
            </div>
          </div>
        )}

        {/* Tableau de saisie moderne */}
        {selectedLevel && selectedLevel !== '' && selectedClass && selectedClass !== 'Toutes' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Liste des Élèves
                    </h3>
                    <p className="text-lg text-gray-600">
                      {getClassName()} - {getSubjectName()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{getEvaluationOptions().find(e => e.id === selectedEvaluation)?.label || 'Toutes les évaluations'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{currentQuarter?.name || 'Chargement...'}</span>
                  </div>
                </div>
              </div>
              
              {/* Boutons d'action dans le header */}
              <div className="flex items-center space-x-3">
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
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button 
                      onClick={() => setMode('view')}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune classe sélectionnée
                  </h3>
                  <p className="text-gray-600">
                    Sélectionnez une classe dans le sélecteur ci-dessus pour afficher les élèves.
                  </p>
                </div>
              </div>
            </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom de l'élève</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Sexe</th>
                {getEvaluationColumns().map(col => {
                  if (col.type === 'group' && col.subcolumns) {
                    // Pour les colonnes de type group (primaire), afficher les sous-colonnes
                    return (
                  <th key={col.key} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                        <div className="flex flex-col gap-1">
                          <div className="text-center font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
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
                                <div className="text-xs font-medium">{subcol.label}</div>
                                {subcol.sublabel && <div className="text-xs opacity-75">{subcol.sublabel}</div>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </th>
                    );
                  } else {
                    // Pour les colonnes normales
                    return (
                      <th key={col.key} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                        <div className="flex flex-col">
                          <span>{col.label}</span>
                          {col.sublabel && (
                            <span className="text-xs text-gray-500 mt-1 font-normal">
                              {col.sublabel}
                            </span>
                          )}
                        </div>
                  </th>
                    );
                  }
                })}
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Rang</th>
                {mode === 'view' && <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Statut</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => {
                const studentNotes = notes[student.id] || {};
                const columns = getEvaluationColumns();
                const moyenne = calculateMoyenne(student.id, columns);
                const moyenneIE = calculateMoyenneIE(student.id);
                const moy = calculateMoy(student.id);
                const appreciation = moyenne !== '-' ? getAppreciation(parseFloat(moyenne)) : null;
                const isValidated = validatedNotes[student.id];
                const rang = calculateDynamicRang(student.id, students, columns);
                const hasExistingNotes = existingNotes[student.id];
                const isRowDisabled = (mode === 'edit' && editingStudentId !== null && editingStudentId !== student.id);
                const canEdit = mode === 'edit' && hasExistingNotes;
                
                // Fonction pour vérifier si l'étudiant a des notes pour l'évaluation sélectionnée
                const hasNotesForSelectedEvaluation = () => {
                  if (!selectedEvaluation || selectedEvaluation === '') {
                    // Si aucune évaluation spécifique, vérifier s'il a des notes pour n'importe quelle évaluation
                    return hasExistingNotes;
                  }
                  
                  // Vérifier s'il a des notes pour l'évaluation spécifique
                  const existingStudentNotes = existingNotesDetails[student.id] || {};
                  const columns = getEvaluationColumns();
                  
                  return columns.some(col => {
                    if (col.type === 'group' && col.subcolumns) {
                      // Pour les colonnes groupées, vérifier les sous-colonnes
                      return col.subcolumns.some(subcol => 
                        existingStudentNotes[subcol.key] && existingStudentNotes[subcol.key] !== ''
                      );
                    } else {
                      // Pour les colonnes simples
                      return existingStudentNotes[col.key] && existingStudentNotes[col.key] !== '';
                    }
                  });
                };
                
                // Fonction pour vérifier si une note spécifique existe déjà (basée sur les notes initialement chargées)
                const hasExistingNoteForColumn = (columnKey: string) => {
                  if (mode !== 'add') return false;
                  const existingStudentNotes = existingNotesDetails[student.id] || {};
                  return existingStudentNotes[columnKey] && existingStudentNotes[columnKey] !== '';
                };

                // Fonction pour vérifier si on peut modifier une note (en mode add, on peut ajouter de nouvelles notes)
                const canModifyNote = (columnKey: string) => {
                  if (mode === 'view') return false;
                  if (mode === 'edit') return true;
                  if (mode === 'add') {
                    // En mode add, on peut toujours ajouter de nouvelles notes
                    return true;
                  }
                  return false;
                };

                return (
                  <tr key={student.id} className={`transition-colors ${
                    isRowDisabled ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'
                  } ${editingStudentId === student.id ? 'bg-blue-50 border-blue-200' : ''} ${
                    mode === 'add' && hasExistingNotes ? 'bg-yellow-50' : ''
                  }`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.nom} {student.prenom}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {student.numeroEducmaster}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        student.sexe === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.sexe}
                      </span>
                    </td>
                    {columns.map(col => {
                      if (col.type === 'group' && col.subcolumns) {
                        // Pour les colonnes de type group (primaire), afficher les sous-colonnes
                        return (
                          <td key={col.key} className="px-4 py-4 text-center relative">
                            <div className="flex justify-center gap-1">
                              {col.subcolumns.map(subcol => {
                                const hasExisting = hasExistingNoteForColumn(subcol.key);
                                
                                return (
                                  <div key={subcol.key} className="relative w-16">
                                    {hasExisting && (
                                      <div className="absolute -top-1 -right-1 z-10">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                                          <span className="text-xs text-white font-bold">!</span>
                                        </div>
                                      </div>
                                    )}
                                    {subcol.type === 'calculated' ? (
                                      // Pour les colonnes calculées (Note /20)
                                      (() => {
                                        let calculatedValue = '-';
                                        if (subcol.key === 'em1_note') {
                                          const cm = parseFloat(studentNotes['em1_cm'] || '0');
                                          const cp = parseFloat(studentNotes['em1_cp'] || '0');
                                          const note = cm + cp;
                                          calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                        } else if (subcol.key === 'em2_note') {
                                          const cm = parseFloat(studentNotes['em2_cm'] || '0');
                                          const cp = parseFloat(studentNotes['em2_cp'] || '0');
                                          const note = cm + cp;
                                          calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                        } else if (subcol.key === 'ec_note') {
                                          const cm = parseFloat(studentNotes['ec_cm'] || '0');
                                          const cp = parseFloat(studentNotes['ec_cp'] || '0');
                                          const note = cm + cp;
                                          calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                        }
                                        
                                        return (
                                          <span className={`w-16 text-center px-1 py-1 rounded text-sm font-semibold ${
                                            calculatedValue !== '-' ? 'bg-green-100 text-green-800' : 'text-gray-500'
                                          }`}>
                                            {calculatedValue}
                                          </span>
                                        );
                                      })()
                                    ) : (
                                      // Pour les colonnes CM et CP
                                      (() => {
                                        const maxValue = subcol.key.includes('_cm') ? 18 : 2;
                                        const canModify = canModifyNote(subcol.key);
                                        
                                        return (
                                          <input
                                            type="number"
                                            min="0"
                                            max={maxValue}
                                            step="0.5"
                                            value={studentNotes[subcol.key] || ''}
                                            onChange={(e) => handleNoteChange(student.id, subcol.key, e.target.value)}
                                            className={`w-16 text-center px-1 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                                              hasExisting && studentNotes[subcol.key] 
                                                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                : 'border-gray-300'
                                            }`}
                                            placeholder="-"
                                            disabled={!canModify || (hasExisting && studentNotes[subcol.key])}
                                          />
                                        );
                                      })()
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      } else {
                        // Pour les colonnes normales
                        return (
                          <td key={col.key} className="px-4 py-4 text-center relative">
                            {hasExistingNoteForColumn(col.key) && (
                              <div className="absolute -top-1 -right-1 z-10">
                                <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">!</span>
                                </div>
                              </div>
                            )}
                        {col.type === 'calculated' ? (
                          col.key === 'moy_ie' ? (
                            <span className={`px-2 py-1 rounded font-semibold ${
                              moyenneIE !== '-' ? 'text-blue-700 bg-blue-50' : 'text-gray-500'
                            }`}>
                              {moyenneIE}
                            </span>
                          ) : col.key === 'moy' ? (
                            <span className={`px-2 py-1 rounded font-semibold ${
                              moy !== '-' ? 'text-purple-700 bg-purple-50' : 'text-gray-500'
                            }`}>
                              {moy}
                            </span>
                          ) : col.key === 'em1_note' ? (
                            <span className={`px-2 py-1 rounded font-semibold ${
                              (() => {
                                const cm = parseFloat(studentNotes['em1_cm'] || '0');
                                const cp = parseFloat(studentNotes['em1_cp'] || '0');
                                const note = cm + cp;
                                return note > 0 ? 'text-green-700 bg-green-50' : 'text-gray-500';
                              })()
                            }`}>
                              {(() => {
                                const cm = parseFloat(studentNotes['em1_cm'] || '0');
                                const cp = parseFloat(studentNotes['em1_cp'] || '0');
                                const note = cm + cp;
                                return note > 0 ? note.toFixed(2) : '-';
                              })()}
                            </span>
                          ) : col.key === 'em2_note' ? (
                            <span className={`px-2 py-1 rounded font-semibold ${
                              (() => {
                                const cm = parseFloat(studentNotes['em2_cm'] || '0');
                                const cp = parseFloat(studentNotes['em2_cp'] || '0');
                                const note = cm + cp;
                                return note > 0 ? 'text-green-700 bg-green-50' : 'text-gray-500';
                              })()
                            }`}>
                              {(() => {
                                const cm = parseFloat(studentNotes['em2_cm'] || '0');
                                const cp = parseFloat(studentNotes['em2_cp'] || '0');
                                const note = cm + cp;
                                return note > 0 ? note.toFixed(2) : '-';
                              })()}
                            </span>
                          ) : col.key === 'ec_note' ? (
                            <span className={`px-2 py-1 rounded font-semibold ${
                              (() => {
                                const cm = parseFloat(studentNotes['ec_cm'] || '0');
                                const cp = parseFloat(studentNotes['ec_cp'] || '0');
                                const note = cm + cp;
                                return note > 0 ? 'text-green-700 bg-green-50' : 'text-gray-500';
                              })()
                            }`}>
                              {(() => {
                                const cm = parseFloat(studentNotes['ec_cm'] || '0');
                                const cp = parseFloat(studentNotes['ec_cp'] || '0');
                                const note = cm + cp;
                                return note > 0 ? note.toFixed(2) : '-';
                              })()}
                            </span>
                          ) : (
                            <span className={`px-2 py-1 rounded font-semibold ${
                              moyenne !== '-' ? getAppreciation(parseFloat(moyenne)).color + ' bg-opacity-10' : 'text-gray-500'
                            }`}>
                              {moyenne}
                            </span>
                          )
                        ) : col.type === 'coefficient' ? (
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold">
                            {getCoefficient()}
                          </span>
                        ) : col.type === 'select' ? (
                          <select
                            value={studentNotes[col.key] || ''}
                            onChange={(e) => handleNoteChange(student.id, col.key, e.target.value)}
                            className={`w-16 p-1 text-center border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              hasExistingNoteForColumn(col.key) && studentNotes[col.key] 
                                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                : 'border-gray-300'
                            }`}
                            disabled={isValidated || mode === 'view' || isRowDisabled || !canModifyNote(col.key) || (hasExistingNoteForColumn(col.key) && studentNotes[col.key])}
                            aria-label={`${col.label} pour ${student.firstName} ${student.lastName}`}
                          >
                            <option value="">-</option>
                            {col.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : col.type === 'radio' ? (
                          <div className="flex justify-center space-x-2">
                            {col.options?.map(option => (
                              <label key={option} className={`flex items-center ${
                                hasExistingNoteForColumn(col.key) && studentNotes[col.key] === option 
                                  ? 'cursor-not-allowed opacity-50' 
                                  : 'cursor-pointer'
                              }`}>
                                <input
                                  type="radio"
                                  name={`${student.id}_${col.key}`}
                                  value={option}
                                  checked={studentNotes[col.key] === option}
                                  onChange={(e) => handleNoteChange(student.id, col.key, e.target.value)}
                                  disabled={isValidated || mode === 'view' || isRowDisabled || !canModifyNote(col.key) || (hasExistingNoteForColumn(col.key) && studentNotes[col.key] === option)}
                                  className={`mr-2 w-4 h-4 ${
                                    studentNotes[col.key] === option 
                                      ? 'text-blue-600 border-blue-600 bg-blue-600' 
                                      : 'text-gray-400 border-gray-300'
                                  } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    hasExistingNoteForColumn(col.key) ? 'cursor-not-allowed' : ''
                                  }`}
                                  aria-label={`${col.label} - ${option}`}
                                />
                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                  hasExistingNoteForColumn(col.key) && studentNotes[col.key] === option
                                    ? 'bg-gray-100 text-gray-500'
                                    : option === 'TS' ? 'bg-green-100 text-green-800' :
                                  option === 'S' ? 'bg-blue-100 text-blue-800' :
                                  'bg-orange-100 text-orange-800'
                                } ${studentNotes[col.key] === option ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max={col.max}
                            step="0.25"
                            value={studentNotes[col.key] || ''}
                            onChange={(e) => handleNoteChange(student.id, col.key, e.target.value)}
                            className={`w-20 p-2 text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              hasExistingNoteForColumn(col.key) && studentNotes[col.key] 
                                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            disabled={isValidated || mode === 'view' || isRowDisabled || !canModifyNote(col.key) || (hasExistingNoteForColumn(col.key) && studentNotes[col.key])}
                            aria-label={`${col.label} pour ${student.firstName} ${student.lastName}`}
                          />
                        )}
                      </td>
                    );
                  }
                })}
                    <td className="px-4 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        student.rang === 1 ? 'bg-yellow-100 text-yellow-800' :
                        student.rang === 2 ? 'bg-gray-100 text-gray-800' :
                        student.rang === 3 ? 'bg-orange-100 text-orange-800' :
                        student.rang <= 10 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rang}
                      </div>
                    </td>
                    {mode === 'view' && (
                      <td className="px-6 py-4 text-center">
                        {hasNotesForSelectedEvaluation() ? (
                          <div className="flex items-center justify-center text-green-600">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Saisie</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Pas de notes
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Statistiques rapides - Affichées seulement s'il y a des élèves */}
        {students.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          {(() => {
            console.log('📊 Calcul des statistiques...');
            console.log('📊 Notes actuelles:', notes);
            console.log('📊 Élèves:', students.length);
            console.log('📊 Colonnes d\'évaluation:', getEvaluationColumns());
          })()}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {students.length}
              </div>
              <div className="text-sm text-gray-600">Total élèves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(() => {
                  // Compter le nombre total de notes individuelles saisies pour l'évaluation sélectionnée
                  let totalNotes = 0;
                  students.forEach(student => {
                    const studentNotes = notes[student.id] || {};
                    const columns = getEvaluationColumns();
                    columns.forEach(col => {
                      if (col.type === 'group' && col.subcolumns) {
                        // Pour les colonnes groupées, compter les sous-colonnes
                        col.subcolumns.forEach(subcol => {
                          if (subcol.type !== 'calculated' && studentNotes[subcol.key] && studentNotes[subcol.key] !== '') {
                            totalNotes++;
                          }
                        });
                      } else if (col.type !== 'calculated') {
                        // Pour les colonnes simples (sauf calculées)
                        if (studentNotes[col.key] && studentNotes[col.key] !== '') {
                          totalNotes++;
                        }
                      }
                    });
                  });
                  return totalNotes;
                })()}
              </div>
              <div className="text-sm text-gray-600">Notes saisies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(() => {
                  const studentsWithNotes = students.filter(student => {
                    const studentNotes = notes[student.id] || {};
                    const columns = getEvaluationColumns();
                    return columns.some(col => {
                      if (col.type === 'group' && col.subcolumns) {
                        // Pour les colonnes groupées, vérifier les sous-colonnes
                        return col.subcolumns.some(subcol => 
                          subcol.type !== 'calculated' && studentNotes[subcol.key] && studentNotes[subcol.key] !== ''
                        );
                      } else if (col.type !== 'calculated') {
                        // Pour les colonnes simples (sauf calculées)
                        return studentNotes[col.key] && studentNotes[col.key] !== '';
                      }
                      return false;
                    });
                  });
                  
                  if (studentsWithNotes.length === 0) return '0.00';
                  
                  const totalMoyenne = studentsWithNotes.reduce((sum, student) => {
                    const moyenne = calculateMoyenne(student.id, getEvaluationColumns());
                    return sum + (moyenne !== '-' ? parseFloat(moyenne) : 0);
                  }, 0);
                  
                  return (totalMoyenne / studentsWithNotes.length).toFixed(2);
                })()}
              </div>
              <div className="text-sm text-gray-600">Moyenne classe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  if (selectedLevel === 'maternelle') {
                    // Pour la maternelle, compter les élèves avec TS (Très Satisfaisant)
                    return students.filter(student => {
                      const studentNotes = notes[student.id] || {};
                      const columns = getEvaluationColumns();
                      return columns.some(col => studentNotes[col.key] === 'TS');
                    }).length;
                  } else {
                    // Pour les autres niveaux, utiliser la logique numérique
                    return students.filter(student => {
                      const moyenne = calculateMoyenne(student.id, getEvaluationColumns());
                      return moyenne !== '-' && parseFloat(moyenne) >= 10;
                    }).length;
                  }
                })()}
              </div>
              <div className="text-sm text-gray-600">
                {selectedLevel === 'maternelle' ? 'Élèves TS' : 'Élèves ≥ 10'}
              </div>
            </div>
          </div>
          
          {mode !== 'view' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Mode {mode === 'add' ? 'Ajout' : 'Modification'} :</strong>
                {mode === 'add' && ' Saisissez les notes pour les élèves qui n\'en ont pas encore. Les notes existantes (marquées par 🟠) sont protégées.'}
                {mode === 'edit' && ' Modifiez les notes existantes directement dans le tableau.'}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
      )}


      {/* Modal de succès moderne */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Sauvegarde Réussie !
              </h3>
              <p className="text-gray-600 mb-6">
                {successData.message}
              </p>
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
              </div>
                  <span className="text-sm font-semibold text-green-800">
                    {successData.count} note{successData.count > 1 ? 's' : ''} sauvegardée{successData.count > 1 ? 's' : ''}
                  </span>
            </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold"
              >
                Parfait !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast d'erreur moderne */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300">
          <div className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border ${
            toastData.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              toastData.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {toastData.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {toastData.type === 'error' ? 'Erreur' : 'Avertissement'}
              </p>
              <p className="text-sm">{toastData.message}</p>
            </div>
              <button
              onClick={() => setShowToast(false)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="h-4 w-4" />
              </button>
          </div>
        </div>
      )}

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