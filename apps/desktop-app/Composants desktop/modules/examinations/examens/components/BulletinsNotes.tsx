import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { examDatabaseService, Student, Class, GradeRecord } from '../services/databaseService';
import { formatRang } from '../utils/formatters';
import { NotificationPanel } from './NotificationPanel';
import { 
  GraduationCap, 
  Download, 
  Printer as Print, 
  Eye, 
  Users, 
  Award, 
  Calendar, 
  CheckCircle, 
  RefreshCw, 
  Send,
  Filter,
  Search,
  FileText,
  TrendingUp,
  Star,
  Shield,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Hash,
  BookOpen,
  IdCard
} from 'lucide-react';
import { useAcademicYearState } from '../../../hooks/useAcademicYearState';
import { useQuarterState } from '../../../hooks/useQuarterState';
import { useSchoolSettings } from '../../../hooks/useSchoolSettings';
import { useAcademicYear } from '../../../hooks/useAcademicYear';
import AcademicYearSelector from '../../../components/common/AcademicYearSelector';
import QuarterSelector from '../../../components/common/QuarterSelector';
import { memp, mestfp } from '../../../utils/imagePaths';

export function BulletinsNotes() {
  // Hook pour récupérer les années scolaires
  const { academicYears, getAcademicYearById } = useAcademicYear();
  
  // Hooks pour la gestion des années scolaires et trimestres
  const {
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentAcademicYear,
    academicYearLoading
  } = useAcademicYearState('bulletins');
  
  // Obtenir l'année scolaire sélectionnée (ou l'année courante si aucune sélection)
  const selectedYearObject = selectedAcademicYear ? getAcademicYearById(selectedAcademicYear) : null;
  const displayAcademicYear = selectedYearObject || currentAcademicYear;
  
  // Fonction pour obtenir le label de l'année scolaire (compatible avec les deux formats)
  const getAcademicYearLabel = (year: any) => {
    if (!year) return '';
    // Certaines sources utilisent 'label', d'autres 'name'
    return year.label || year.name || '';
  };

  const {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter,
    quarterLoading
  } = useQuarterState('bulletins');
  
  // Log pour déboguer
  useEffect(() => {
    console.log('📅 selectedQuarter dans BulletinsNotes:', selectedQuarter);
    console.log('📅 currentQuarter dans BulletinsNotes:', currentQuarter);
  }, [selectedQuarter, currentQuarter]);

  // Hook pour récupérer les paramètres de l'école
  const { settings: schoolSettings, loading: schoolSettingsLoading } = useSchoolSettings();

  // États des sélecteurs
  const [selectedClass, setSelectedClass] = useState(''); // Stocke l'ID de la classe
  const [selectedClassName, setSelectedClassName] = useState(''); // Stocke le nom pour l'affichage
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedPeriodType, setSelectedPeriodType] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState('');
  const [selectedScope, setSelectedScope] = useState('eleve');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentBulletinPage, setCurrentBulletinPage] = useState<1 | 2>(1);
  const [editableRecommendation, setEditableRecommendation] = useState('');
  const [lastGeneratedStudentId, setLastGeneratedStudentId] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [directeurName, setDirecteurName] = useState('');
  const [enseignantName, setEnseignantName] = useState('');
  const [editableAssiduite, setEditableAssiduite] = useState('');
  const [editableDiscipline, setEditableDiscipline] = useState('');
  const [editableDefautsMajeurs, setEditableDefautsMajeurs] = useState('');
  const [editableQualitesRemarquables, setEditableQualitesRemarquables] = useState('');

  // Options d'évaluation selon le niveau (comme dans SaisieNotes)
  const getEvaluationOptions = () => {
    const baseOptions = [
      { id: '', label: 'Sélectionner une évaluation' }
    ];
    
    switch (selectedLevel) {
      case 'maternelle':
      case 'primaire':
        return [
          ...baseOptions,
          { id: 'em1', label: 'Évaluation mensuelle 1 (EM1)' },
          { id: 'em2', label: 'Évaluation mensuelle 2 (EM2)' },
          { id: 'ec', label: 'Évaluation certificative (EC)' }
        ];
      case '1er_cycle':
      case '2nd_cycle':
        return [
          ...baseOptions,
          { id: 'ie1', label: 'Interrogation 1 (IE1)' },
          { id: 'ie2', label: 'Interrogation 2 (IE2)' },
          { id: 'ds1', label: 'Devoir surveillé 1 (DS1)' },
          { id: 'ds2', label: 'Devoir surveillé 2 (DS2)' }
        ];
      default:
        return baseOptions;
    }
  };

  // Fonction pour obtenir le nom du ministère selon le niveau
  const getMinistryName = () => {
    if (selectedLevel === 'maternelle' || selectedLevel === 'primaire') {
      return 'Ministère des Enseignements Maternel et Primaire';
    } else if (selectedLevel === '1er cycle secondaire' || selectedLevel === '2nd cycle secondaire') {
      return 'Ministère des Enseignements Secondaire Technique et de la Formation Professionnelle';
    }
    return 'Ministère de l\'Enseignement Primaire et Secondaire'; // Valeur par défaut
  };

  // Fonction pour obtenir le logo du ministère selon le niveau
  const getMinistryLogo = () => {
    if (selectedLevel === 'maternelle' || selectedLevel === 'primaire') {
      return memp;
    } else if (selectedLevel === '1er cycle secondaire' || selectedLevel === '2nd cycle secondaire') {
      return mestfp;
    }
    return memp; // Valeur par défaut
  };

  // États de l'interface
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isSendingNotifications, setIsSendingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Service de base de données
  const dbService = examDatabaseService;

  // États pour les données
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [subjects, setSubjects] = useState<{id: string; name: string; coefficient?: number}[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Données du bulletin
  const [bulletinData, setBulletinData] = useState<any>(null);

  // useEffect pour initialiser le composant
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // useEffect pour charger les classes quand le niveau ou l'année change
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadClassesEffect = async () => {
      if (!selectedAcademicYear || !selectedLevel || selectedLevel === '' || selectedAcademicYear === '') {
        setClasses([]);
        return;
      }
    
    setIsLoadingData(true);
    try {
      console.log('🏫 Chargement des classes pour les bulletins...');
      const classesData = await dbService.getClasses({
        academicYearId: selectedAcademicYear,
        level: selectedLevel
      });
      setClasses(classesData);
      console.log('✅ Classes chargées:', classesData.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des classes:', error);
    } finally {
      setIsLoadingData(false);
    }
    };
    loadClassesEffect();
  }, [selectedLevel, selectedAcademicYear, isInitialized]);

  // useEffect pour charger les étudiants quand la classe change
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadStudentsEffect = async () => {
      if (!selectedClass || !selectedAcademicYear || selectedClass === '' || selectedAcademicYear === '') {
        setStudents([]);
        return;
      }
    
    setIsLoadingData(true);
    try {
      console.log('👥 Chargement des étudiants pour les bulletins...');
      
      const studentsResponse = await apiService.getEleves({
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        status: 'active'
      });
      
      if (studentsResponse.data) {
        const studentsData = studentsResponse.data.map((student: any) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          dateNaissance: student.dateNaissance,
          lieuNaissance: student.lieuNaissance,
          registrationNumber: student.registrationNumber || student.numeroEducmaster || `E${student.id.slice(-4)}`,
          parent: {
            nom: student.parentName || 'Non renseigné',
            email: student.parentEmail || '',
            telephone: student.parentPhone || '',
            whatsapp: student.parentPhone || ''
          }
        }));
        setStudents(studentsData);
        console.log('✅ Étudiants chargés:', studentsData.length, studentsData.map(s => `${s.lastName} ${s.firstName} (${s.id})`));
        
        // Réinitialiser la sélection d'étudiant si l'étudiant sélectionné n'existe plus dans la nouvelle liste
        if (selectedStudent && !studentsData.find(s => s.id === selectedStudent)) {
          console.log('⚠️ Étudiant sélectionné n\'existe plus, réinitialisation...');
          setSelectedStudent('');
        }
      } else {
        console.log('⚠️ Aucune donnée d\'étudiants dans la réponse');
        setStudents([]);
        setSelectedStudent('');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des étudiants:', error);
    } finally {
      setIsLoadingData(false);
    }
    };
    loadStudentsEffect();
  }, [selectedClass, selectedAcademicYear, isInitialized, selectedStudent]);

  // useEffect pour charger les matières quand la classe ou le niveau change
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadSubjectsEffect = async () => {
      if (!selectedClass || !selectedLevel || selectedClass === '' || selectedLevel === '') {
      setSubjects([]);
      return;
    }

    try {
        console.log('📚 Chargement des matières pour les bulletins...');
      const response = await apiService.getMatieres({
        classId: selectedClass,
        level: selectedLevel
      });
      
      if (response.data) {
        setSubjects(response.data);
        console.log('✅ Matières chargées:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matières:', error);
    }
    };
    loadSubjectsEffect();
  }, [selectedClass, selectedLevel, isInitialized]);

  // useEffect pour charger les notes quand le trimestre change
  useEffect(() => {
    if (!isInitialized) return;
    
    // Utiliser selectedQuarter ou currentQuarter.id si selectedQuarter est vide
    const quarterToUse = selectedQuarter || currentQuarter?.id || '';
    
    const loadGradesEffect = async () => {
      if (!selectedClass || !selectedAcademicYear || !quarterToUse || selectedClass === '' || selectedAcademicYear === '' || quarterToUse === '') {
        console.log('⚠️ Conditions de chargement des notes non remplies:', {
          selectedClass,
          selectedAcademicYear,
          selectedQuarter,
          quarterToUse,
          currentQuarter: currentQuarter?.id,
          selectedLevel
        });
        setGrades([]);
        return;
      }
    
    setIsLoadingData(true);
    try {
      console.log('📊 Chargement des notes pour les bulletins...');
       console.log('📊 Chargement des notes pour les bulletins avec paramètres:', {
          classId: selectedClass,
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
          level: selectedLevel
      });
       
       // Utiliser apiService comme dans Conseil de classe
       const gradesResponse = await apiService.getExistingGrades({
         academicYearId: selectedAcademicYear,
         quarterId: quarterToUse,
         level: selectedLevel,
         classId: selectedClass,
         subjectId: '', // Toutes les matières
         evaluationType: 'all' // Toutes les évaluations (inclut les moyennes sauvegardées)
       });
      
      console.log('📚 Notes récupérées pour les bulletins:', gradesResponse);
      console.log('📚 Nombre de notes récupérées:', Array.isArray(gradesResponse) ? gradesResponse.length : 'Non-array');
      
      // Convertir les données en format attendu par le composant (comme dans Conseil de classe)
      if (Array.isArray(gradesResponse) && gradesResponse.length > 0) {
        // Convertir les données en format GradeRecord
        const convertedGrades = gradesResponse.map((grade: any) => ({
          id: grade.id || `${grade.studentId}-${grade.subjectId}`,
          studentId: grade.studentId,
          subjectId: grade.subjectId,
          academicYearId: selectedAcademicYear,
          quarterId: quarterToUse,
          level: selectedLevel,
          classId: selectedClass,
          evaluationType: grade.evaluationType || 'all',
          notes: grade.notes || {},
          moyenne: grade.moyenne || 0,
          rang: grade.rang || 0,
          appreciation: grade.appreciation || '',
          moyenneGenerale: grade.moyenneGenerale || null,
          createdAt: grade.createdAt || new Date().toISOString(),
          updatedAt: grade.updatedAt || new Date().toISOString()
        })) as GradeRecord[];
        
        // Vérifier que les notes correspondent bien à l'année et au trimestre demandés
        const filteredGrades = convertedGrades.filter((grade: any) => {
          const matchesYear = grade.academicYearId === selectedAcademicYear;
          const matchesQuarter = grade.quarterId === quarterToUse;
          return matchesYear && matchesQuarter;
        });
        
        if (filteredGrades.length !== convertedGrades.length) {
          console.warn('⚠️ Certaines notes ne correspondent pas aux filtres:', {
            total: convertedGrades.length,
            filtered: filteredGrades.length
          });
        }
        
        setGrades(filteredGrades);
        console.log('📊 Notes converties pour les bulletins:', filteredGrades);
      } else {
        setGrades([]);
        console.log('📊 Aucune note trouvée pour les bulletins');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notes:', error);
      setGrades([]);
    } finally {
      setIsLoadingData(false);
    }
    };
    loadGradesEffect();
  }, [selectedQuarter, currentQuarter, selectedClass, selectedAcademicYear, selectedLevel, isInitialized]);

  // useEffect pour charger les bulletins
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadBulletinsEffect = async () => {
      if (!selectedClass || !selectedAcademicYear || !selectedQuarter || selectedClass === '' || selectedAcademicYear === '' || selectedQuarter === '') {
        setBulletins([]);
        return;
      }
    
    try {
      console.log('📋 Chargement des bulletins existants...');
        const bulletinsData = await apiService.getBulletins({
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter
      });
        setBulletins(bulletinsData.data || []);
        console.log('✅ Bulletins chargés:', bulletinsData.data?.length || 0);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des bulletins:', error);
    }
    };
    loadBulletinsEffect();
  }, [selectedClass, selectedAcademicYear, selectedQuarter, isInitialized]);

  // Fonction pour calculer la moyenne d'une matière selon le niveau (même logique que ConseilsClasse)
  // Définie en dehors de generateBulletinData pour être accessible partout
  const calculateSubjectAverage = useCallback((subjectNotes: any, level: string): number | null => {
    if (!subjectNotes) return null;
    
    switch (level) {
      case 'maternelle': {
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
      }
      case 'primaire': {
        const em1_cm = parseFloat(subjectNotes['em1_cm'] || '0');
        const em1_cp = parseFloat(subjectNotes['em1_cp'] || '0');
        const em2_cm = parseFloat(subjectNotes['em2_cm'] || '0');
        const em2_cp = parseFloat(subjectNotes['em2_cp'] || '0');
        const ec_cm = parseFloat(subjectNotes['ec_cm'] || '0');
        const ec_cp = parseFloat(subjectNotes['ec_cp'] || '0');
        
        const em1_note = em1_cm + em1_cp;
        const em2_note = em2_cm + em2_cp;
        const ec_note = ec_cm + ec_cp;
        
        // Formule spécifique pour le primaire: (((EM1+EM2)/2)+EC)/2
        if (em1_note > 0 && em2_note > 0 && ec_note > 0) {
          const moyenneEM = (em1_note + em2_note) / 2;
          return (moyenneEM + ec_note) / 2;
        }
        return null;
      }
      case '1er_cycle': {
        // Moy IE = (IE1 + IE2)/2 et Moy = (Moy IE + DS1+DS2)/3
        const ie1 = parseFloat(subjectNotes['ie1'] || '0');
        const ie2 = parseFloat(subjectNotes['ie2'] || '0');
        const ds1 = parseFloat(subjectNotes['ds1'] || '0');
        const ds2 = parseFloat(subjectNotes['ds2'] || '0');
        
        if (ie1 > 0 && ie2 > 0 && ds1 > 0 && ds2 > 0) {
          const moyenneIE = (ie1 + ie2) / 2;
          return (moyenneIE + ds1 + ds2) / 3;
        }
        return null;
      }
      case '2nd_cycle': {
        // Même logique que 1er cycle
        const ie1_2nd = parseFloat(subjectNotes['ie1'] || '0');
        const ie2_2nd = parseFloat(subjectNotes['ie2'] || '0');
        const ds1_2nd = parseFloat(subjectNotes['ds1'] || '0');
        const ds2_2nd = parseFloat(subjectNotes['ds2'] || '0');
        
        if (ie1_2nd > 0 && ie2_2nd > 0 && ds1_2nd > 0 && ds2_2nd > 0) {
          const moyenneIE_2nd = (ie1_2nd + ie2_2nd) / 2;
          return (moyenneIE_2nd + ds1_2nd + ds2_2nd) / 3;
        }
        return null;
      }
      default:
        return null;
    }
  }, []);

  // Fonction pour générer les données du bulletin à partir des vraies données
  const generateBulletinData = useCallback((studentId?: string) => {
    // Utiliser selectedQuarter ou currentQuarter.id si selectedQuarter est vide
    const quarterToUse = selectedQuarter || currentQuarter?.id || '';
    
    console.log('🎯 generateBulletinData appelé avec:', {
      studentId,
      selectedPeriodType,
      selectedEvaluation,
      studentsCount: students.length,
      subjectsCount: subjects.length,
      gradesCount: grades.length,
      selectedQuarter,
      quarterToUse,
      currentQuarter: currentQuarter?.id
    });
    if (!students.length || !subjects.length) {
      console.log('⚠️ Données insuffisantes pour générer le bulletin (étudiants ou matières manquants)');
      console.log('   - Étudiants:', students.length, students.map(s => `${s.lastName} ${s.firstName}`));
      console.log('   - Matières:', subjects.length, subjects.map(s => s.name));
      return null;
    }
    // Les notes peuvent être vides si elles n'ont pas encore été saisies

    const targetStudent = studentId 
      ? students.find(s => s.id === studentId)
      : students[0];

    if (!targetStudent) {
      console.log('❌ Étudiant non trouvé:', studentId);
      console.log('   - Étudiants disponibles:', students.map(s => ({ id: s.id, nom: `${s.lastName} ${s.firstName}` })));
      return null;
    }

    console.log('🎯 Génération bulletin pour:', targetStudent.lastName, targetStudent.firstName);

    // Filtrer les notes de l'étudiant ET vérifier qu'elles correspondent STRICTEMENT à l'année et au trimestre sélectionnés
    // IMPORTANT: Ne prendre QUE les notes qui correspondent exactement à l'année et au trimestre sélectionnés
    // Note: On ne filtre PAS par evaluationType ici car toutes les évaluations sont stockées dans l'objet notes
    // On extraira les valeurs spécifiques depuis l'objet notes plus tard (comme dans Conseil de classe)
    const studentGrades = grades.filter((grade: any) => {
      const matchesStudent = grade.studentId === targetStudent.id;
      const matchesYear = grade.academicYearId === selectedAcademicYear;
      const matchesQuarter = grade.quarterId === quarterToUse;
      
      if (matchesStudent && (!matchesYear || !matchesQuarter)) {
        console.log('🚫 Note exclue - ne correspond pas à l\'année/trimestre:', {
          gradeId: grade.id,
          gradeYear: grade.academicYearId,
          gradeQuarter: grade.quarterId,
          expectedYear: selectedAcademicYear,
          expectedQuarter: quarterToUse,
          studentId: targetStudent.id
        });
      }
      
      return matchesStudent && matchesYear && matchesQuarter;
    });
    
    console.log('📊 Notes filtrées pour l\'étudiant:', {
      studentId: targetStudent.id,
      studentName: `${targetStudent.lastName} ${targetStudent.firstName}`,
      selectedYear: selectedAcademicYear,
      selectedQuarter: selectedQuarter,
      totalGrades: grades.length,
      filteredGrades: studentGrades.length,
      studentGradesDetails: studentGrades.map((g: any) => ({
        id: g.id,
        subjectId: g.subjectId,
        year: g.academicYearId,
        quarter: g.quarterId,
        matchesYear: g.academicYearId === selectedAcademicYear,
        matchesQuarter: g.quarterId === selectedQuarter
      })),
      allGradesDetails: grades.filter((g: any) => g.studentId === targetStudent.id).map((g: any) => ({
        id: g.id,
        year: g.academicYearId,
        quarter: g.quarterId,
        matchesYear: g.academicYearId === selectedAcademicYear,
        matchesQuarter: g.quarterId === selectedQuarter
      }))
    });
    
    // Note: On continue même si aucune note ne correspond, car pour certaines matières
    // (surtout en maternelle), on peut générer un bulletin avec "Non évalué"
    if (studentGrades.length === 0 && grades.length > 0) {
      console.warn('⚠️ Aucune note ne correspond à l\'année/trimestre sélectionnés pour cet étudiant, mais on continue pour afficher "Non évalué"');
    }
    
    // Fonction helper pour convertir TS/S/PS en nombre (comme dans BordereauNotes)
    const convertQualitativeToNumber = (value: string): number => {
      switch (value) {
        case 'TS': return 3;
        case 'S': return 2;
        case 'PS': return 1;
        default: return 0;
      }
    };

    // Fonction helper pour calculer la moyenne qualitative (comme dans BordereauNotes)
    const calculateQualitativeAverage = (em1: string | number, em2: string | number, ec: string | number): string => {
      // Convertir en string si nécessaire
      const em1Str = typeof em1 === 'string' ? em1 : (em1 >= 16 ? 'TS' : em1 >= 12 ? 'S' : em1 >= 8 ? 'PS' : '-');
      const em2Str = typeof em2 === 'string' ? em2 : (em2 >= 16 ? 'TS' : em2 >= 12 ? 'S' : em2 >= 8 ? 'PS' : '-');
      const ecStr = typeof ec === 'string' ? ec : (ec >= 16 ? 'TS' : ec >= 12 ? 'S' : ec >= 8 ? 'PS' : '-');
      
      const values = [em1Str, em2Str, ecStr].filter(note => note && note !== '-' && note !== '');
      if (values.length === 0) return '-';
      
      const numericValues = values.map(note => convertQualitativeToNumber(note));
      const average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
      
      if (average >= 2.5) return 'TS';
      if (average >= 1.5) return 'S';
      return 'PS';
    };
    
    // Calculer les moyennes par matière
    const notesBySubject = subjects.map((subject: any) => {
      const subjectGrades = studentGrades.filter(grade => grade.subjectId === subject.id);
      
      if (subjectGrades.length === 0) {
        return {
          matiere: subject.name,
          EM1: '-',
          EM2: '-',
          EC: '-',
          moyenne: 0,
          moyenneQualitative: '-',
          appreciation: 'Non évalué',
          observations: 'Aucune note disponible'
        };
      }

      // Si on est en mode "Évaluation", récupérer uniquement la note de l'évaluation sélectionnée
      if (selectedPeriodType === 'evaluation' && selectedEvaluation) {
        const subjectGrade = subjectGrades[0]; // Prendre le premier grade (toutes les évaluations sont dans un seul enregistrement)
        
        if (!subjectGrade || !subjectGrade.notes) {
          return {
            matiere: subject.name,
            EM1: '-',
            EM2: '-',
            EC: '-',
            moyenne: 0,
            moyenneQualitative: '-',
            appreciation: 'Non évalué',
            observations: 'Aucune note disponible pour cette évaluation'
          };
        }

        // Utiliser exactement la même approche que Conseil de classe (ligne 1076)
        const noteData = subjectGrade.notes;
        console.log(`📚 Matière ${subject.name} - Données de notes brutes:`, noteData);
        console.log(`📚 Type de noteData:`, typeof noteData);
        
        // Les notes peuvent être déjà un objet ou une string JSON
        // Si c'est une string, la parser en JSON, sinon utiliser directement
        let parsedNotes: any = {};
        try {
          if (typeof noteData === 'string') {
            try {
              parsedNotes = JSON.parse(noteData);
            } catch {
              // Si le parsing JSON échoue, essayer d'interpréter comme une valeur unique
              parsedNotes = { [subjectGrade.evaluationType || 'all']: noteData };
            }
          } else {
            // Si c'est déjà un objet, l'utiliser directement (comme dans Conseil de classe)
            parsedNotes = noteData || {};
          }
        } catch (error) {
          console.error('Erreur parsing notes:', error);
          parsedNotes = {};
        }
        
        console.log(`📚 Matière ${subject.name} - Notes parsées:`, parsedNotes);
        console.log(`📚 Clés disponibles dans parsedNotes:`, Object.keys(parsedNotes));

        // Récupérer la note de l'évaluation sélectionnée selon le niveau
        let evaluationValue: string | number = '-';
        let moyenne = 0;
        let moyenneQualitative = '-';
      let appreciation = 'Non évalué';
        let observations = '';

        // Utiliser exactement la même logique que Conseil de classe (ligne 1080-1090)
        if (selectedLevel === 'maternelle') {
          // Pour la maternelle, utiliser exactement la même approche que Conseil de classe
          // noteData est déjà l'objet parsé, pas besoin de re-parser
          const noteData = parsedNotes;
          const em1 = noteData['em1'] || noteData['EM1'] || '-';
          const em2 = noteData['em2'] || noteData['EM2'] || '-';
          const ec = noteData['ec'] || noteData['EC'] || '-';
          
          console.log(`📝 Matière ${subject.name} - Notes extraites:`, { em1, em2, ec, selectedEvaluation });
          
          // Pour l'évaluation sélectionnée, prendre uniquement cette valeur
          if (selectedEvaluation === 'em1') {
            evaluationValue = em1;
          } else if (selectedEvaluation === 'em2') {
            evaluationValue = em2;
          } else if (selectedEvaluation === 'ec') {
            evaluationValue = ec;
          }
          
          if (evaluationValue !== '-' && evaluationValue !== '') {
            moyenneQualitative = evaluationValue as string;
            // Convertir en moyenne numérique approximative
            const numValue = convertQualitativeToNumber(evaluationValue as string);
            moyenne = numValue === 3 ? 16 : numValue === 2 ? 12 : 8;
            appreciation = evaluationValue as string;
            observations = `Évaluation: ${evaluationValue}`;
            console.log(`✅ Matière ${subject.name} - Note trouvée pour ${selectedEvaluation}: ${evaluationValue}`);
          } else {
            observations = 'Non évalué pour cette évaluation';
            console.log(`⚠️ Matière ${subject.name} - Aucune note trouvée pour ${selectedEvaluation}`);
          }
        } else if (selectedLevel === 'primaire') {
          // Pour le primaire, récupérer em1_cm + em1_cp, etc. (comme dans Conseil de classe)
          let noteValue: number | null = null;
          
          if (selectedEvaluation === 'em1') {
            const em1_cm = parseFloat(parsedNotes['em1_cm'] || '0');
            const em1_cp = parseFloat(parsedNotes['em1_cp'] || '0');
            noteValue = em1_cm + em1_cp;
          } else if (selectedEvaluation === 'em2') {
            const em2_cm = parseFloat(parsedNotes['em2_cm'] || '0');
            const em2_cp = parseFloat(parsedNotes['em2_cp'] || '0');
            noteValue = em2_cm + em2_cp;
          } else if (selectedEvaluation === 'ec') {
            const ec_cm = parseFloat(parsedNotes['ec_cm'] || '0');
            const ec_cp = parseFloat(parsedNotes['ec_cp'] || '0');
            noteValue = ec_cm + ec_cp;
          }
          
          evaluationValue = noteValue && noteValue > 0 ? noteValue : '-';
          
          if (evaluationValue !== '-' && typeof evaluationValue === 'number' && evaluationValue > 0) {
            moyenne = evaluationValue;
      if (moyenne >= 18) appreciation = 'Excellent';
      else if (moyenne >= 16) appreciation = 'Très Bien';
      else if (moyenne >= 14) appreciation = 'Bien';
      else if (moyenne >= 12) appreciation = 'Assez Bien';
      else if (moyenne >= 10) appreciation = 'Passable';
            else appreciation = 'Insuffisant';
            observations = `Note: ${evaluationValue.toFixed(2)}/20`;
          } else {
            observations = 'Non évalué pour cette évaluation';
          }
        } else if (selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle') {
          // Pour le secondaire, récupérer ie1, ie2, ds1, ds2 (comme dans Conseil de classe)
          let noteValue: number | null = null;
          
          if (selectedEvaluation === 'ie1') {
            noteValue = parseFloat(parsedNotes['ie1'] || parsedNotes['IE1'] || '0');
          } else if (selectedEvaluation === 'ie2') {
            noteValue = parseFloat(parsedNotes['ie2'] || parsedNotes['IE2'] || '0');
          } else if (selectedEvaluation === 'ds1') {
            noteValue = parseFloat(parsedNotes['ds1'] || parsedNotes['DS1'] || '0');
          } else if (selectedEvaluation === 'ds2') {
            noteValue = parseFloat(parsedNotes['ds2'] || parsedNotes['DS2'] || '0');
          }
          
          evaluationValue = noteValue && noteValue > 0 ? noteValue : '-';
          
          if (evaluationValue !== '-' && typeof evaluationValue === 'number' && evaluationValue > 0) {
            moyenne = evaluationValue;
            if (moyenne >= 18) appreciation = 'Excellent';
            else if (moyenne >= 16) appreciation = 'Très Bien';
            else if (moyenne >= 14) appreciation = 'Bien';
            else if (moyenne >= 12) appreciation = 'Assez Bien';
            else if (moyenne >= 10) appreciation = 'Passable';
            else appreciation = 'Insuffisant';
            observations = `Note: ${evaluationValue.toFixed(2)}/20`;
          } else {
            observations = 'Non évalué pour cette évaluation';
          }
        }

      return {
        matiere: subject.name,
          EM1: selectedEvaluation === 'em1' || selectedEvaluation === 'ie1' ? evaluationValue : '-',
          EM2: selectedEvaluation === 'em2' || selectedEvaluation === 'ie2' ? evaluationValue : '-',
          EC: selectedEvaluation === 'ec' ? evaluationValue : '-',
        moyenne: moyenne,
          moyenneQualitative: moyenneQualitative,
        appreciation: appreciation,
          observations: observations || 'Aucune note disponible pour cette évaluation'
        };
      }

      // Mode trimestre - utiliser exactement la même logique que ConseilsClasse
      // Récupérer les notes consolidées pour le trimestre
      const subjectGrade = subjectGrades.find(grade => grade.subjectId === subject.id);
      let noteData: any = {};
      
      if (subjectGrade && subjectGrade.notes) {
        // Parser les notes si nécessaire
        if (typeof subjectGrade.notes === 'string') {
          try {
            noteData = JSON.parse(subjectGrade.notes);
          } catch {
            noteData = subjectGrade.notes;
          }
        } else {
          noteData = subjectGrade.notes;
        }
      }

      // Calculer la moyenne du trimestre en utilisant calculateSubjectAverage (définie plus haut)
      const moyenne = calculateSubjectAverage(noteData, selectedLevel);
      
      // Extraire les valeurs EM1, EM2, EC pour l'affichage
      let em1Value: string | number = '-';
      let em2Value: string | number = '-';
      let ecValue: string | number = '-';
      let moyenneQualitative = '-';
      
      if (selectedLevel === 'maternelle') {
        em1Value = noteData['em1'] || noteData['EM1'] || '-';
        em2Value = noteData['em2'] || noteData['EM2'] || '-';
        ecValue = noteData['ec'] || noteData['EC'] || '-';
        moyenneQualitative = calculateQualitativeAverage(em1Value, em2Value, ecValue);
      } else if (selectedLevel === 'primaire') {
        const em1_cm = parseFloat(noteData['em1_cm'] || '0');
        const em1_cp = parseFloat(noteData['em1_cp'] || '0');
        const em2_cm = parseFloat(noteData['em2_cm'] || '0');
        const em2_cp = parseFloat(noteData['em2_cp'] || '0');
        const ec_cm = parseFloat(noteData['ec_cm'] || '0');
        const ec_cp = parseFloat(noteData['ec_cp'] || '0');
        
        em1Value = (em1_cm + em1_cp) > 0 ? (em1_cm + em1_cp) : '-';
        em2Value = (em2_cm + em2_cp) > 0 ? (em2_cm + em2_cp) : '-';
        ecValue = (ec_cm + ec_cp) > 0 ? (ec_cm + ec_cp) : '-';
      } else if (selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle') {
        em1Value = parseFloat(noteData['ie1'] || '0') > 0 ? parseFloat(noteData['ie1'] || '0') : '-';
        em2Value = parseFloat(noteData['ie2'] || '0') > 0 ? parseFloat(noteData['ie2'] || '0') : '-';
        ecValue = '-'; // Pas d'EC pour le secondaire
        // Pour le secondaire, on peut calculer la moyenne de IE et DS séparément
        const ds1 = parseFloat(noteData['ds1'] || '0');
        const ds2 = parseFloat(noteData['ds2'] || '0');
        if (ds1 > 0 || ds2 > 0) {
          // Afficher DS1 et DS2 dans EC pour l'affichage
          ecValue = ds1 > 0 && ds2 > 0 ? ((ds1 + ds2) / 2) : (ds1 > 0 ? ds1 : ds2);
        }
      }

      // Déterminer l'appréciation selon le niveau (même logique que ConseilsClasse)
      let appreciation = 'Non évalué';
      if (selectedLevel === 'maternelle') {
        if (moyenne !== null && moyenne >= 2.5) {
          moyenneQualitative = 'TS';
          appreciation = 'TS';
        } else if (moyenne !== null && moyenne >= 1.5) {
          moyenneQualitative = 'S';
          appreciation = 'S';
        } else if (moyenne !== null && moyenne > 0) {
          moyenneQualitative = 'PS';
          appreciation = 'PS';
        } else {
          moyenneQualitative = '-';
          appreciation = 'Non évalué';
        }
      } else {
        if (moyenne !== null) {
          if (moyenne >= 18) appreciation = 'Excellent';
          else if (moyenne >= 16) appreciation = 'Très Bien';
          else if (moyenne >= 14) appreciation = 'Bien';
          else if (moyenne >= 12) appreciation = 'Assez Bien';
          else if (moyenne >= 10) appreciation = 'Passable';
          else if (moyenne > 0) appreciation = 'Insuffisant';
          else appreciation = 'Non évalué';
        }
      }

      // Convertir moyenne null en 0 pour l'affichage
      const moyenneAffichage = moyenne !== null ? moyenne : 0;

      return {
        matiere: subject.name,
        EM1: em1Value,
        EM2: em2Value,
        EC: ecValue,
        moyenne: moyenneAffichage,
        moyenneQualitative: moyenneQualitative,
        appreciation: appreciation,
        observations: selectedLevel === 'maternelle' 
          ? (moyenneQualitative !== '-' ? `Moyenne trimestrielle: ${moyenneQualitative}` : 'Non évalué')
          : moyenne !== null ? `Moyenne trimestrielle: ${moyenneAffichage.toFixed(2)}/20` : 'Non évalué'
      };
    });

    // Calculer la moyenne générale selon le niveau (même logique que ConseilsClasse)
    let moyenneGenerale: number | string | null = null;
    let moyenneGeneraleQualitative = '-';
    
    if (selectedLevel === 'maternelle') {
      // Pour maternelle, calculer la moyenne qualitative (comme dans ConseilsClasse)
      const subjectAverages = notesBySubject
        .map((n: any) => n.moyenneQualitative)
        .filter(avg => avg && avg !== '-' && avg !== '');
      
      if (subjectAverages.length > 0) {
        // Convertir en valeurs numériques pour le calcul (même logique que ConseilsClasse)
        const numericAverages = subjectAverages.map(avg => {
          switch (avg) {
            case 'TS': return 3;
            case 'S': return 2;
            case 'PS': return 1;
            default: return 0;
          }
        });
        const numericAverage = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
        
        // Convertir la moyenne numérique en annotation qualitative (même logique que ConseilsClasse)
        if (numericAverage >= 2.5) moyenneGeneraleQualitative = 'TS';
        else if (numericAverage >= 1.5) moyenneGeneraleQualitative = 'S';
        else moyenneGeneraleQualitative = 'PS';
        
        moyenneGenerale = moyenneGeneraleQualitative;
      } else {
        moyenneGeneraleQualitative = '-';
        moyenneGenerale = null;
      }
    } else {
      // Pour les autres niveaux, calculer la moyenne numérique (comme dans ConseilsClasse)
      const numericAverages = notesBySubject
        .map((n: any) => n.moyenne)
        .filter((moyenne: number) => typeof moyenne === 'number' && moyenne !== null && moyenne > 0) as number[];
      
      if (numericAverages.length > 0) {
        moyenneGenerale = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
      } else {
        moyenneGenerale = null;
      }
    }

    // Déterminer l'appréciation générale (même logique que ConseilsClasse)
    let appreciationGenerale = 'Non évalué';
    if (selectedLevel === 'maternelle') {
      appreciationGenerale = moyenneGeneraleQualitative !== '-' ? moyenneGeneraleQualitative : 'Non évalué';
    } else {
      const numAvg = typeof moyenneGenerale === 'number' ? moyenneGenerale : 0;
      if (numAvg >= 18) appreciationGenerale = 'Excellent 🌟';
      else if (numAvg >= 16) appreciationGenerale = 'Très Bien 😊';
      else if (numAvg >= 14) appreciationGenerale = 'Bien 👍';
      else if (numAvg >= 12) appreciationGenerale = 'Assez Bien 😐';
      else if (numAvg >= 10) appreciationGenerale = 'Passable ⚠️';
      else if (numAvg > 0) appreciationGenerale = 'Insuffisant ❌';
      else appreciationGenerale = 'Non évalué';
    }

    // Calculer le rang (même logique que ConseilsClasse - utiliser les moyennes du trimestre)
    const sortedStudents = students
      .map((s: any) => {
        const sGrades = grades.filter(g => g.studentId === s.id);
        let sMoyenne: number | string | null = null;
        
        // Calculer la moyenne pour cet étudiant comme dans ConseilsClasse
        const sMoyennesMatières: Record<string, number | string | null> = {};
        
        subjects.forEach(subject => {
          const subjectGrade = sGrades.find(grade => grade.subjectId === subject.id);
          if (subjectGrade && subjectGrade.notes) {
            let noteData: any = {};
            if (typeof subjectGrade.notes === 'string') {
              try {
                noteData = JSON.parse(subjectGrade.notes);
              } catch {
                noteData = subjectGrade.notes;
              }
            } else {
              noteData = subjectGrade.notes;
            }
            
            // Utiliser la même fonction calculateSubjectAverage (définie plus haut)
            const moyenne = calculateSubjectAverage(noteData, selectedLevel);
            
            if (selectedLevel === 'maternelle') {
              if (moyenne !== null && moyenne >= 2.5) {
                sMoyennesMatières[subject.name] = 'TS';
              } else if (moyenne !== null && moyenne >= 1.5) {
                sMoyennesMatières[subject.name] = 'S';
              } else if (moyenne !== null && moyenne > 0) {
                sMoyennesMatières[subject.name] = 'PS';
              } else {
                sMoyennesMatières[subject.name] = null;
              }
            } else {
              sMoyennesMatières[subject.name] = moyenne;
            }
          } else {
            sMoyennesMatières[subject.name] = null;
          }
        });
        
        // Calculer la moyenne générale comme dans ConseilsClasse
        if (selectedLevel === 'maternelle') {
          const subjectAverages = Object.values(sMoyennesMatières).filter(moyenne => 
            typeof moyenne === 'string' && moyenne !== null
          ) as string[];
          
          if (subjectAverages.length > 0) {
            const numericAverages = subjectAverages.map(avg => {
              switch (avg) {
                case 'TS': return 3;
                case 'S': return 2;
                case 'PS': return 1;
                default: return 0;
              }
            });
            const numericAverage = numericAverages.reduce((sum: number, val: number) => sum + val, 0) / numericAverages.length;
            sMoyenne = numericAverage >= 2.5 ? 'TS' : numericAverage >= 1.5 ? 'S' : 'PS';
          } else {
            sMoyenne = null;
          }
        } else {
          const numericAverages = Object.values(sMoyennesMatières).filter(moyenne => 
            typeof moyenne === 'number' && moyenne !== null && moyenne > 0
          ) as number[];
          
          if (numericAverages.length > 0) {
            sMoyenne = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
          } else {
            sMoyenne = null;
          }
        }
        
        return { ...s, moyenne: sMoyenne };
      })
      .sort((a: any, b: any) => {
        // Trier selon le niveau (même logique que ConseilsClasse)
        if (selectedLevel === 'maternelle') {
          const order = { 'TS': 3, 'S': 2, 'PS': 1, null: 0 };
          const aVal = typeof a.moyenne === 'string' ? order[a.moyenne as keyof typeof order] || 0 : 0;
          const bVal = typeof b.moyenne === 'string' ? order[b.moyenne as keyof typeof order] || 0 : 0;
          return bVal - aVal;
        } else {
          const aVal = typeof a.moyenne === 'number' ? a.moyenne : 0;
          const bVal = typeof b.moyenne === 'number' ? b.moyenne : 0;
          return bVal - aVal;
        }
      });

    const rang = sortedStudents.findIndex(s => s.id === targetStudent.id) + 1;

    const bulletinData = {
      etablissement: schoolSettings.name || 'Complexe Scolaire Privé Entrepreneurial et Bilingue (CSPEB)',
      anneeScolaire: currentAcademicYear?.label || '',
      eleve: {
        id: targetStudent.id,
        nom: targetStudent.lastName,
        prenom: targetStudent.firstName,
        numeroEducmaster: targetStudent.registrationNumber || 'N/A',
        sexe: targetStudent.gender,
        dateNaissance: targetStudent.dateNaissance || 'Non renseigné',
        lieuNaissance: targetStudent.lieuNaissance || 'Non renseigné',
        classe: selectedClassName || classes.find(c => c.id === selectedClass)?.name || selectedClass,
        effectif: students.length,
        rang: rang
      },
      trimestre: selectedQuarter || '1er Trimestre',
      notes: notesBySubject,
      moyenneGenerale: moyenneGenerale,
      moyenneGeneraleQualitative: moyenneGeneraleQualitative,
      appreciation: appreciationGenerale,
      assiduité: {
        joursClasse: 60,
        joursPresence: 58,
        absences: 2,
        retards: 1
      },
      observations: '', // Sera calculée dynamiquement depuis le conseil de classe si nécessaire
      recommandations: editableRecommendation || '',
      attitudes: {
        assiduite: editableAssiduite || '',
        discipline: editableDiscipline || '',
        defautsMajeurs: editableDefautsMajeurs || '',
        qualitesRemarquables: editableQualitesRemarquables || ''
      },
      visa: {
        professeur: enseignantName || 'Non assigné',
        directeur: directeurName || 'Non défini',
        date: new Date().toLocaleDateString('fr-FR')
      }
    };

    console.log('✅ Données du bulletin générées pour:', targetStudent.lastName, targetStudent.firstName);
    return bulletinData;
  }, [students, grades, subjects, selectedAcademicYear, selectedQuarter, currentQuarter, selectedClass, selectedClassName, classes, schoolSettings, selectedPeriodType, selectedEvaluation, selectedLevel, currentAcademicYear, editableRecommendation, editableAssiduite, editableDiscipline, editableDefautsMajeurs, editableQualitesRemarquables, enseignantName, directeurName, calculateSubjectAverage]);
  
  // Fonction pour générer les recommandations à partir du conseil de classe (même logique que ConseilsClasse)
  const generateRecommendationFromCouncil = useCallback(async (studentId: string, bulletinData: any) => {
    if (!bulletinData || selectedLevel !== 'maternelle') return;
    
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      // Utiliser la même logique que ConseilsClasse pour générer les observations et recommandations
      const moyenneGenerale = bulletinData.moyenneGeneraleQualitative || bulletinData.moyenneGenerale;
      
      // Calculer les moyennes par matière pour les recommandations spécifiques
      const moyennesMatières: Record<string, number | string | null> = {};
      if (bulletinData.notes && Array.isArray(bulletinData.notes)) {
        bulletinData.notes.forEach((note: any) => {
          moyennesMatières[note.matiere] = note.moyenneQualitative || note.moyenne;
        });
      }
      
      // Générer les observations et recommandations basées sur la moyenne générale (même logique que ConseilsClasse ligne 577-630)
      let observations = '';
      let recommandation = '';
      
      if (selectedLevel === 'maternelle') {
        const avg = moyenneGenerale as string;
        if (avg === 'TS') {
          observations = 'Excellent travail ! L\'élève montre une très bonne maîtrise des compétences attendues.';
          recommandation = 'Continuer à encourager et maintenir ce niveau d\'excellence.';
        } else if (avg === 'S') {
          observations = 'Bon travail dans l\'ensemble. Quelques efforts supplémentaires seraient bénéfiques.';
          recommandation = 'Encourager l\'élève à persévérer et à approfondir ses connaissances.';
        } else if (avg === 'PS') {
          observations = 'Des difficultés sont observées dans plusieurs domaines. Un accompagnement renforcé est nécessaire.';
          recommandation = 'Mettre en place un suivi personnalisé et des activités de remédiation.';
        } else {
          observations = 'Évaluation en cours. Les résultats seront disponibles prochainement.';
          recommandation = 'Continuer à suivre les progrès de l\'élève.';
        }
      }
      
      // Ajouter des observations et recommandations spécifiques pour les matières faibles (même logique que ConseilsClasse)
      const weakSubjects = Object.entries(moyennesMatières).filter(([, moyenne]) => {
        if (selectedLevel === 'maternelle') {
          return moyenne === 'PS';
        } else {
          return typeof moyenne === 'number' && moyenne !== null && moyenne < 10;
        }
      });
      
      if (weakSubjects.length > 0) {
        observations += ` Difficultés particulières observées en ${weakSubjects.map(([matiere]) => matiere).join(', ')}.`;
        recommandation += ` Accorder une attention particulière à ${weakSubjects.map(([matiere]) => matiere).join(', ')}.`;
      }
      
      // Si aucune recommandation éditable n'est définie, utiliser celle générée
      if (!editableRecommendation && recommandation) {
        setEditableRecommendation(recommandation);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la génération de la recommandation:', error);
    }
  }, [students, selectedLevel]);

  // Fonction pour charger les enseignants avec leurs affectations (même logique que ConseilsClasse)
  const loadTeachers = useCallback(async () => {
    try {
      console.log('👥 === CHARGEMENT ENSEIGNANTS AVEC AFFECTATIONS ===');
      
      // 1. Récupérer les enseignants via l'API HR
      console.log('🔍 Étape 1: Récupération des enseignants via HR...');
      const hrResponse = await api.hr.getTeachers('school-1', {});
      
      if (!hrResponse.success || !hrResponse.data || !Array.isArray(hrResponse.data)) {
        console.log('❌ Aucun enseignant récupéré depuis le service HR');
        setTeachers([]);
        return;
      }
      
      const teachersData = hrResponse.data;
      console.log('✅ Enseignants récupérés:', teachersData.length);
      
      // 2. Récupérer les affectations via le service Planning
      console.log('🔍 Étape 2: Récupération des affectations via Planning...');
      const { planningService } = await import('../../../services/planningService');
      const assignmentsData = await planningService.getTeacherAssignments('school-1');
      console.log('✅ Affectations récupérées:', assignmentsData.length);
      
      // 3. Enrichir les enseignants avec leurs affectations
      const enrichedTeachers = teachersData.map((teacher: any) => {
        const teacherAssignments = assignmentsData.filter(assignment => assignment.teacher_id === teacher.id);
        const assignedClasses = teacherAssignments.map(a => a.class_name).filter(Boolean);
        const totalHours = teacherAssignments.reduce((sum, a) => sum + (a.hours_per_week || 0), 0);
        
        return {
          ...teacher,
          classes: assignedClasses,
          hoursPerWeek: totalHours,
          mode: teacherAssignments.length > 0 ? teacherAssignments[0].mode : 'maternelle'
        };
      });
      
      console.log('✅ Enseignants enrichis:', enrichedTeachers.length);
      setTeachers(enrichedTeachers);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des enseignants:', error);
      setTeachers([]);
    }
  }, []);

  // Fonction pour récupérer l'enseignant titulaire d'une classe (même logique que ConseilsClasse)
  const getClassTeacherName = useCallback((classId: string): string => {
    if (!teachers || !classes || teachers.length === 0 || classes.length === 0) {
      return 'Non assigné';
    }
    
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) {
      return 'Non assigné';
    }
    
    const level = classObj.level?.toLowerCase() || '';
    
    // Seulement pour maternelle et primaire
    if (!level.includes('maternelle') && !level.includes('primaire')) {
      return 'Non assigné';
    }
    
    const assignedTeacher = teachers.find(teacher => {
      const hasClass = teacher.classes && teacher.classes.includes(classObj.name);
      return hasClass;
    });
    
    if (assignedTeacher) {
      const teacherName = `${assignedTeacher.firstName || ''} ${assignedTeacher.lastName || ''}`.trim() || assignedTeacher.name || 'Enseignant inconnu';
      return teacherName;
    }
    
    return 'Non assigné';
  }, [teachers, classes]);

  // Fonction pour charger les noms du directeur et de l'enseignant
  const loadDirectorAndTeacher = useCallback(async () => {
    try {
      // Garantir que la liste des enseignants est chargée
      if (!teachers || teachers.length === 0) {
        await loadTeachers();
      }

      let directeur = '';
      let enseignantTitulaire = '';

      // Récupérer le directeur selon le niveau
      if (selectedLevel === 'maternelle' || selectedLevel === 'primaire') {
        const directeurMp = teachers?.find(teacher => teacher.positionId === 'POS-004');
        if (directeurMp) {
          directeur = `${directeurMp.gender || ''} ${directeurMp.firstName || ''} ${directeurMp.lastName || ''}`.trim();
        }
      } else if (selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle') {
        const directeurSecondaire = teachers?.find(teacher => teacher.positionId === 'POS-008');
        if (directeurSecondaire) {
          directeur = `${directeurSecondaire.gender || ''} ${directeurSecondaire.firstName || ''} ${directeurSecondaire.lastName || ''}`.trim();
        }
      }

      // Récupérer l'enseignant titulaire
      if (selectedLevel === 'maternelle' || selectedLevel === 'primaire') {
        enseignantTitulaire = getClassTeacherName(selectedClass);
      } else {
        enseignantTitulaire = 'Non assigné';
      }

      setDirecteurName(directeur || 'Non défini');
      setEnseignantName(enseignantTitulaire || 'Non assigné');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du directeur et de l\'enseignant:', error);
      setDirecteurName('Non défini');
      setEnseignantName('Non assigné');
    }
  }, [selectedLevel, selectedClass, teachers, classes, loadTeachers, getClassTeacherName]);

  // Charger les enseignants au montage et quand le niveau/classe change
  useEffect(() => {
    if (selectedLevel && selectedClass) {
      loadDirectorAndTeacher();
    }
  }, [selectedLevel, selectedClass, loadDirectorAndTeacher]);

  // Générer les données du bulletin quand les données changent
  useEffect(() => {
    if (!isInitialized) {
      console.log('⏳ En attente d\'initialisation...');
      return;
    }
    
    // Vérifier que toutes les sélections nécessaires sont faites
    // 1. Classe et niveau sont obligatoires
    if (!selectedClass || !selectedLevel) {
      console.log('⚠️ Sélections manquantes (classe ou niveau):', { selectedClass, selectedLevel });
      setBulletinData(null);
      return;
    }
    
    // 2. Type de période est obligatoire
    if (!selectedPeriodType) {
      console.log('⚠️ Type de période non sélectionné');
      setBulletinData(null);
      return;
    }
    
    // 3. Si type de période est "evaluation", l'évaluation doit être sélectionnée
    if (selectedPeriodType === 'evaluation' && !selectedEvaluation) {
      console.log('⚠️ Évaluation non sélectionnée pour le type "Évaluation"');
      setBulletinData(null);
      return;
    }
    
    // 4. Si type de période est "trimestre", le trimestre doit être sélectionné
    if (selectedPeriodType === 'trimestre' && !selectedQuarter) {
      console.log('⚠️ Trimestre non sélectionné pour le type "Trimestre"');
      setBulletinData(null);
      return;
    }
    
    // Attendre que le chargement soit terminé
    if (isLoadingData) {
      console.log('⏳ Données en cours de chargement...');
      return;
    }
    
    console.log('🔍 Tentative de génération du bulletin:', {
      studentsCount: students.length,
      subjectsCount: subjects.length,
      gradesCount: grades.length,
      selectedStudent,
      studentsIds: students.map(s => s.id),
      selectedClass,
      selectedQuarter,
      selectedLevel
    });
    
    // Vérifier que les notes correspondent à l'année et au trimestre sélectionnés
    const validGrades = grades.filter((g: any) => 
      g.academicYearId === selectedAcademicYear && g.quarterId === selectedQuarter
    );
    
    console.log('🔍 Vérification des notes pour le bulletin:', {
      totalGrades: grades.length,
      validGrades: validGrades.length,
      selectedYear: selectedAcademicYear,
      selectedQuarter: selectedQuarter,
      gradeYears: [...new Set(grades.map((g: any) => g.academicYearId))],
      gradeQuarters: [...new Set(grades.map((g: any) => g.quarterId))]
    });
    
    // Générer le bulletin si on a au moins des étudiants et des matières
    // Les notes peuvent être vides (pas encore saisies)
    if (students.length > 0 && subjects.length > 0) {
      // Vérifier si l'étudiant sélectionné existe dans la liste chargée
      let studentIdToUse = selectedStudent;
      
      // Si aucun étudiant n'est sélectionné ou si l'ID sélectionné n'existe pas, prendre le premier
      if (!studentIdToUse || !students.find(s => s.id === studentIdToUse)) {
        if (students.length > 0) {
          studentIdToUse = students[0].id;
          console.log('⚠️ Étudiant sélectionné invalide ou manquant, utilisation du premier étudiant:', studentIdToUse);
          // Mettre à jour la sélection
          setSelectedStudent(studentIdToUse);
        } else {
          console.log('❌ Aucun étudiant disponible');
          setBulletinData(null);
          return;
        }
      }
      
      // Réinitialiser à la page 1 seulement quand on change vraiment d'étudiant
      const studentChanged = lastGeneratedStudentId !== studentIdToUse && lastGeneratedStudentId !== '';
      if (studentChanged) {
        setCurrentBulletinPage(1);
      }
      if (lastGeneratedStudentId !== studentIdToUse) {
        setLastGeneratedStudentId(studentIdToUse);
      }
      
      console.log('✅ Génération du bulletin pour l\'étudiant:', studentIdToUse);
      const data = generateBulletinData(studentIdToUse);
      console.log('📊 Bulletin généré:', data ? 'SUCCESS' : 'FAILED', data);
      setBulletinData(data);
      
      // Charger les attitudes depuis les données existantes si disponibles
      if (data && data.attitudes) {
        setEditableAssiduite(data.attitudes.assiduite || '');
        setEditableDiscipline(data.attitudes.discipline || '');
        setEditableDefautsMajeurs(data.attitudes.defautsMajeurs || '');
        setEditableQualitesRemarquables(data.attitudes.qualitesRemarquables || '');
      } else if (studentChanged) {
        // Réinitialiser les attitudes si on change d'étudiant et qu'il n'y a pas de données existantes
        setEditableAssiduite('');
        setEditableDiscipline('');
        setEditableDefautsMajeurs('');
        setEditableQualitesRemarquables('');
      }
      
      // Générer et charger les recommandations du conseil de classe
      if (data && selectedLevel === 'maternelle') {
        // Réinitialiser la recommandation seulement quand on change d'étudiant
        if (studentChanged) {
          setEditableRecommendation('');
        }
        generateRecommendationFromCouncil(studentIdToUse, data);
      } else {
        // Réinitialiser si ce n'est pas maternelle et qu'on change d'étudiant
        if (studentChanged) {
          setEditableRecommendation('');
        }
      }
    } else {
      console.log('❌ Données insuffisantes:', {
        students: students.length,
        subjects: subjects.length,
        reason: students.length === 0 ? 'Pas d\'étudiants' : 'Pas de matières'
      });
      setBulletinData(null);
    }
  }, [students, grades, subjects, selectedStudent, selectedClass, selectedQuarter, selectedLevel, selectedPeriodType, selectedEvaluation, generateBulletinData, generateRecommendationFromCouncil, isInitialized, isLoadingData, lastGeneratedStudentId]);

  // Mettre à jour bulletinData quand les attitudes changent
  useEffect(() => {
    if (bulletinData && selectedStudent) {
      const updatedData = {
        ...bulletinData,
        attitudes: {
          assiduite: editableAssiduite || '',
          discipline: editableDiscipline || '',
          defautsMajeurs: editableDefautsMajeurs || '',
          qualitesRemarquables: editableQualitesRemarquables || ''
        }
      };
      setBulletinData(updatedData);
    }
  }, [editableAssiduite, editableDiscipline, editableDefautsMajeurs, editableQualitesRemarquables]);

  // Fonctions de gestion des actions
  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
    // Simulation de génération PDF
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulation de téléchargement
      const pdfContent = `BULLETIN DE NOTES - ${bulletinData?.trimestre}

ÉLÈVE: ${bulletinData?.eleve.nom} ${bulletinData?.eleve.prenom} (${bulletinData?.eleve.sexe})
CLASSE: ${bulletinData?.eleve.classe}
N° EDUCMASTER: ${bulletinData?.eleve.numeroEducmaster}

NOTES PAR MATIÈRE:
${bulletinData?.notes.map((note: any) => 
  `${note.matiere}: ${note.moyenne.toFixed(2)}/20 - ${note.appreciation}`
).join('\n')}

MOYENNE GÉNÉRALE: ${bulletinData?.moyenneGenerale.toFixed(2)}/20
RANG: ${formatRang(bulletinData?.eleve.rang, bulletinData?.eleve.sexe)}/${bulletinData?.eleve.effectif}

OBSERVATIONS: ${bulletinData?.observations}
RECOMMANDATIONS: ${bulletinData?.recommandations}`;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
      link.download = `Bulletin_${bulletinData?.eleve.nom}_${bulletinData?.trimestre}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
    } finally {
    setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🔄 Génération des bulletins...');
      console.log('📊 Paramètres:', {
        classe: selectedClass,
        trimestre: selectedQuarter,
        annee: selectedAcademicYear,
        type: selectedPeriodType,
        niveau: selectedLevel
      });

      // Générer les bulletins pour tous les étudiants de la classe
      const bulletinsToGenerate = students.map((student: any) => {
        const studentData = generateBulletinData(student.id);
        return {
          studentId: student.id,
          studentName: `${student.lastName} ${student.firstName}`,
          data: studentData
        };
      });

      // Sauvegarder les bulletins générés
      const response = await apiService.genererBulletins({
        classe_id: selectedClass,
        trimestre_id: selectedQuarter,
        annee_id: selectedAcademicYear,
        type_bulletin: selectedPeriodType === 'evaluation' ? 'Evaluation' : 
                      selectedPeriodType === 'trimestre' ? 'Trimestre' : 'Annuel',
        bulletins: bulletinsToGenerate
      });
      
      if (response.success) {
        alert(`${bulletinsToGenerate.length} bulletins générés avec succès !`);
        // Recharger les bulletins
        const bulletinsData = await apiService.getBulletins({
          classId: selectedClass,
          academicYearId: selectedAcademicYear,
          quarterId: selectedQuarter
        });
        setBulletins(bulletinsData.data || []);
      } else {
        alert('Erreur lors de la génération des bulletins');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la génération des bulletins:', error);
      alert('Erreur lors de la génération des bulletins');
    }
    
    setIsGenerating(false);
  };

  const handleDownloadZip = () => {
    alert('Téléchargement du fichier ZIP contenant tous les bulletins...');
  };

  const handleViewTableau = () => {
    alert('Redirection vers les tableaux d\'honneur...');
  };

  const handleSendNotifications = () => {
    setShowNotificationModal(true);
  };

  const handleConfirmSendNotifications = async () => {
    setIsSendingNotifications(true);
    // Simulation d'envoi des notifications
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSendingNotifications(false);
    setShowNotificationModal(false);
    alert('Notifications envoyées avec succès à tous les parents !');
  };

  const handlePrint = () => {
    window.print();
  };

  // Fonctions utilitaires pour les couleurs et appréciations
  const getAppreciationColor = (moyenne: number) => {
    if (moyenne >= 18) return 'text-green-700 bg-green-50';
    if (moyenne >= 16) return 'text-green-600 bg-green-50';
    if (moyenne >= 14) return 'text-blue-600 bg-blue-50';
    if (moyenne >= 12) return 'text-yellow-600 bg-yellow-50';
    if (moyenne >= 10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getAppreciationEmoji = (moyenne: number) => {
    if (moyenne >= 18) return '🌟';
    if (moyenne >= 16) return '😊';
    if (moyenne >= 14) return '👍';
    if (moyenne >= 12) return '😐';
    if (moyenne >= 10) return '⚠️';
    if (moyenne >= 8) return '❌';
    return '🚫';
  };

  // Fonction pour obtenir le niveau qualitatif pour la maternelle (TS, S, PS)
  const getMaternelleEvaluation = (moyenne: number) => {
    if (moyenne >= 16) return { code: 'TS', text: 'Très Satisfaisant', color: 'text-green-700 bg-green-50', emoji: '😊' };
    if (moyenne >= 12) return { code: 'S', text: 'Satisfaisant', color: 'text-yellow-600 bg-yellow-50', emoji: '😐' };
    if (moyenne >= 8) return { code: 'PS', text: 'Peu Satisfaisant', color: 'text-orange-600 bg-orange-50', emoji: '😞' };
    return { code: '', text: 'Non évalué', color: 'text-gray-600 bg-gray-50', emoji: '-' };
  };

  // Structure des domaines et sous-domaines pour la maternelle
  const maternelleDomaines = [
    {
      id: 1,
      titre: 'Développement du bien-être (santé et environnement)',
      sousTitre: 'Education pour la santé et à l\'environnement',
      activites: [
        { nom: 'Education pour la santé', key: 'education_pour_la_sante' },
        { nom: 'Education à des réflexions de santé', key: 'education_reflexions_sante' }
      ]
    },
    {
      id: 2,
      titre: 'Développement du bien-être physique et du développement moteur',
      sousTitre: 'Expression corporelle',
      activites: [
        { nom: 'Education du mouvement', key: 'education_mouvement' },
        { nom: 'Gestuelle', key: 'gestuelle' },
        { nom: 'Rythmique', key: 'rythmique' }
      ]
    },
    {
      id: 3,
      titre: 'Développement de la réflexion des aptitudes cognitives et intellectuelles',
      sousTitre: 'Santé des Pré-apprentissages',
      activites: [
        { nom: 'Observation', key: 'observation' },
        { nom: 'Education sensorielle', key: 'education_sensorielle' },
        { nom: 'Pré-lecture', key: 'pre_lecture' },
        { nom: 'Pré-écriture', key: 'pre_ecriture' },
        { nom: 'Pré-mathématique', key: 'pre_mathematique' }
      ]
    },
    {
      id: 4,
      titre: 'Développement des sentiments et des émotions',
      sousTitre: 'Santé émotionnelle',
      activites: [
        { nom: 'Expression plastique', key: 'expression_plastique' },
        { nom: 'Expression émotionnelle', key: 'expression_emotionnelle' }
      ]
    },
    {
      id: 5,
      titre: 'Développement des relations et de l\'interaction sociale et socio-affective',
      sousTitre: '',
      activites: [
        { nom: 'Langage', key: 'langage' },
        { nom: 'Conte', key: 'conte' },
        { nom: 'Comptine', key: 'comptine' },
        { nom: 'Poésie', key: 'poesie' },
        { nom: 'Chant', key: 'chant' }
      ]
    }
  ];

  // Fonction pour obtenir la mention (2nd cycle)
  const getMention = (moyenne: number) => {
    if (moyenne >= 18) return 'Très Bien';
    if (moyenne >= 16) return 'Bien';
    if (moyenne >= 14) return 'Assez Bien';
    if (moyenne >= 12) return 'Passable';
    if (moyenne >= 10) return 'Admis';
    return 'Non Admis';
  };

  // Fonction pour mapper une matière de la BDD à un domaine/activité
  const mapSubjectToDomain = (subjectName: string): { domaineId: number; activiteKey: string } | null => {
    const nameLower = subjectName.toLowerCase().trim();
    
    // Mapping complet des matières de la BDD vers les domaines/activités
    const mapping: { [key: string]: { domaineId: number; activiteKey: string } } = {
      'education pour la santé': { domaineId: 1, activiteKey: 'education_pour_la_sante' },
      'education à des réflexions de santé': { domaineId: 1, activiteKey: 'education_reflexions_sante' },
      'education du mouvement': { domaineId: 2, activiteKey: 'education_mouvement' },
      'gestuelle': { domaineId: 2, activiteKey: 'gestuelle' },
      'rythmique': { domaineId: 2, activiteKey: 'rythmique' },
      'observation': { domaineId: 3, activiteKey: 'observation' },
      'education sensorielle': { domaineId: 3, activiteKey: 'education_sensorielle' },
      'pré-lecture': { domaineId: 3, activiteKey: 'pre_lecture' },
      'pre-lecture': { domaineId: 3, activiteKey: 'pre_lecture' },
      'pré-écriture': { domaineId: 3, activiteKey: 'pre_ecriture' },
      'pre-ecriture': { domaineId: 3, activiteKey: 'pre_ecriture' },
      'pré-mathématique': { domaineId: 3, activiteKey: 'pre_mathematique' },
      'pre-mathematique': { domaineId: 3, activiteKey: 'pre_mathematique' },
      'expression plastique': { domaineId: 4, activiteKey: 'expression_plastique' },
      'expression émotionnelle': { domaineId: 4, activiteKey: 'expression_emotionnelle' },
      'langage': { domaineId: 5, activiteKey: 'langage' },
      'conte': { domaineId: 5, activiteKey: 'conte' },
      'comptine': { domaineId: 5, activiteKey: 'comptine' },
      'poésie': { domaineId: 5, activiteKey: 'poesie' },
      'poesie': { domaineId: 5, activiteKey: 'poesie' },
      'chant': { domaineId: 5, activiteKey: 'chant' }
    };
    
    // Recherche exacte
    if (mapping[nameLower]) {
      return mapping[nameLower];
    }
    
    // Recherche par inclusion
    for (const [key, value] of Object.entries(mapping)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return value;
      }
    }
    
    return null;
  };

  // Fonction helper pour trouver l'évaluation d'une activité depuis les notes
  const getActiviteEvaluation = (activiteKey: string, matiereName?: string) => {
    if (!bulletinData || !bulletinData.notes) {
      return { code: '', text: 'Non évalué', color: 'text-gray-600 bg-gray-50', emoji: '-' };
    }

    // Si un nom de matière est fourni, chercher directement par nom
    if (matiereName) {
      const note = bulletinData.notes.find((n: any) => {
        return n.matiere && n.matiere.toLowerCase().trim() === matiereName.toLowerCase().trim();
      });
      
      if (note) {
        return getEvaluationFromNote(note);
      }
    }

    // Sinon, chercher par clé d'activité (méthode de fallback)
    const note = bulletinData.notes.find((n: any) => {
      const nameLower = n.matiere.toLowerCase().trim();
      const keyLower = activiteKey.toLowerCase().replace(/_/g, ' ');
      
      // Recherche par inclusion
      if (nameLower.includes(keyLower) || keyLower.includes(nameLower)) return true;
      
      return false;
    });
    
    if (note) {
      return getEvaluationFromNote(note);
    }
    
    return { code: '', text: 'Non évalué', color: 'text-gray-600 bg-gray-50', emoji: '-' };
  };

  // Fonction helper pour extraire l'évaluation d'une note
  const getEvaluationFromNote = (note: any) => {
    // Pour maternelle, utiliser directement la valeur qualitative (TS/S/PS)
    if (selectedLevel === 'maternelle' && note.moyenneQualitative) {
      const qual = note.moyenneQualitative;
      if (qual === 'TS') return { code: 'TS', text: 'Très Satisfaisant', color: 'text-green-700 bg-green-50', emoji: '😊' };
      if (qual === 'S') return { code: 'S', text: 'Satisfaisant', color: 'text-yellow-600 bg-yellow-50', emoji: '😐' };
      if (qual === 'PS') return { code: 'PS', text: 'Peu Satisfaisant', color: 'text-orange-600 bg-orange-50', emoji: '😞' };
      return { code: '', text: 'Non évalué', color: 'text-gray-600 bg-gray-50', emoji: '-' };
    }
    // Pour les autres niveaux ou si pas de moyenneQualitative, utiliser getMaternelleEvaluation
    return getMaternelleEvaluation(note.moyenne || 0);
  };

  // Fonction pour obtenir le numéro du trimestre en français
  const getQuarterNumberText = () => {
    if (currentQuarter && currentQuarter.quarterNumber) {
      switch (currentQuarter.quarterNumber) {
        case 1:
          return '1er';
        case 2:
          return '2ème';
        case 3:
          return '3ème';
        default:
          return `${currentQuarter.quarterNumber}ème`;
      }
    }
    return '';
  };

  // Fonction pour obtenir le numéro de l'évaluation en français
  const getEvaluationNumberText = () => {
    if (!selectedEvaluation) return '';
    
    // Déterminer le numéro à partir de l'ID de l'évaluation
    if (selectedEvaluation.includes('1') || selectedEvaluation === 'em1' || selectedEvaluation === 'ie1' || selectedEvaluation === 'ds1') {
      return '1ère';
    }
    if (selectedEvaluation.includes('2') || selectedEvaluation === 'em2' || selectedEvaluation === 'ie2' || selectedEvaluation === 'ds2') {
      return '2ème';
    }
    // Pour EC ou autres évaluations, on ne met pas de numéro
    return '';
  };

  // Fonction pour obtenir le nom de l'évaluation dynamiquement
  const getEvaluationName = () => {
    const quarterText = getQuarterNumberText();
    
    if (selectedPeriodType === 'evaluation' && selectedEvaluation) {
      const evaluationNumberText = getEvaluationNumberText();
      const evaluationOption = getEvaluationOptions().find(opt => opt.id === selectedEvaluation);
      
      if (evaluationOption) {
        // Nettoyer le label pour retirer les parenthèses et extraire le nom de base
        let evaluationLabel = evaluationOption.label.replace(/\([^)]*\)/g, '').trim();
        
        // Retirer le numéro existant du label (le numéro peut être au début ou à la fin)
        // Exemples: "Évaluation mensuelle 1" ou "1 Évaluation mensuelle" ou "Interrogation 1"
        evaluationLabel = evaluationLabel
          .replace(/^\d+(ère|ème)?\s+/i, '') // Retirer au début avec "1ère" ou "1ème"
          .replace(/^\d+\s+/i, '') // Retirer juste un chiffre au début
          .replace(/\s+\d+(ère|ème)?\s*$/i, '') // Retirer à la fin avec "1ère" ou "1ème"
          .replace(/\s+\d+\s*$/i, '') // Retirer juste un chiffre à la fin (ex: "1" dans "Évaluation mensuelle 1")
          .replace(/\s+/g, ' ') // Normaliser les espaces multiples
          .trim();
        
        // Construire le label avec le numéro au début
        const finalLabel = evaluationNumberText 
          ? `${evaluationNumberText} ${evaluationLabel}`
          : evaluationLabel;
        
        // Ajouter le numéro du trimestre si disponible
        return quarterText ? `${finalLabel} du ${quarterText} Trimestre` : finalLabel;
      }
      
      // Fallback si pas d'option trouvée
      const evalNumber = getEvaluationNumberText();
      const evalName = selectedEvaluation.toUpperCase();
      return quarterText 
        ? `${evalNumber ? evalNumber + ' ' : ''}${evalName} du ${quarterText} Trimestre`
        : `${evalNumber ? evalNumber + ' ' : ''}${evalName}`;
    }
    // Par défaut, si on est en mode trimestre, afficher "Evaluation Sommative Mensuelle du Xème Trimestre"
    return quarterText ? `Evaluation Sommative Mensuelle du ${quarterText} Trimestre` : 'Evaluation Sommative Mensuelle';
  };

  // Fonction pour obtenir le mois et l'année selon le trimestre
  const getEvaluationPeriod = () => {
    if (currentQuarter && currentQuarter.startDate) {
      const startDate = new Date(currentQuarter.startDate);
      const month = startDate.toLocaleDateString('fr-FR', { month: 'long' });
      const year = startDate.getFullYear();
      return { month, year };
    }
    // Fallback sur la date actuelle
    const currentDate = new Date();
    return {
      month: currentDate.toLocaleDateString('fr-FR', { month: 'long' }),
      year: currentDate.getFullYear()
    };
  };

  // Fonction de rendu pour le bulletin MATERNELLE (format exact du modèle)
  const renderMaternelleTable = () => {
    const evaluationPeriod = getEvaluationPeriod();
    const evaluationName = getEvaluationName();

    // Si on est sur la page 2, afficher seulement la page 2
    if (currentBulletinPage === 2) {
      return renderMaternellePage2();
    }

    return (
      <div className="mb-8 space-y-6">
        {/* Header avec logos et informations de l'école */}
        <div className="bg-blue-700 text-white p-6 rounded-xl shadow-xl mb-6 border border-blue-800">
          <div className="flex items-start justify-between gap-6">
            {/* Logo MEMP à gauche */}
            <div className="flex-shrink-0">
              <img 
                src={getMinistryLogo()} 
                alt={getMinistryName()} 
                className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Informations centrales */}
            <div className="flex-1 text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
              <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
              <div className="border-t border-white/30 my-2"></div>
              <h3 className="text-xl font-bold tracking-wide">
                {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || 'Nom de l\'établissement')}
              </h3>
              {schoolSettings.abbreviation && (
                <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
              )}
              {schoolSettings.motto && (
                <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
              )}
              <div className="border-t border-white/30 my-2"></div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                {schoolSettings.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.address}</span>
                    {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                    {schoolSettings.department && <span>, {schoolSettings.department}</span>}
                  </div>
                )}
                {schoolSettings.primaryPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryPhone}</span>
                    {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
                  </div>
                )}
                {schoolSettings.primaryEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryEmail}</span>
                  </div>
                )}
                {schoolSettings.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.website}</span>
                  </div>
                )}
              </div>
              <p className="text-blue-100 text-sm font-semibold mt-2">
                Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
              </p>
              <div className="border-t border-white/30 my-2"></div>
              <h4 className="text-lg font-semibold">{evaluationName}</h4>
              <p className="text-blue-100 text-sm mt-1">
                Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
              </p>
            </div>

            {/* Logo de l'école à droite */}
            <div className="flex-shrink-0">
              {schoolSettings.logo ? (
                <img 
                  src={schoolSettings.logo} 
                  alt="Logo de l'école" 
                  className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Bouton Imprimer en bas */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors shadow-md border border-blue-900"
            >
              <Print className="h-5 w-5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Tableau principal d'évaluation - Structure 4 colonnes */}
        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b-2 border-slate-200">
                <th className="px-4 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wide border-r border-slate-200 w-1/4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span>Domaine</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wide border-r border-slate-200 w-2/5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span>Matières</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-sm font-bold text-slate-800 uppercase tracking-wide border-r border-slate-200" colSpan={3}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Résultats</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-center text-sm font-bold text-slate-800 uppercase tracking-wide w-24 border-l border-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span>Visa</span>
                  </div>
                </th>
              </tr>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-300">
                <th className="px-4 py-3 border-r border-slate-200"></th>
                <th className="px-4 py-3 border-r border-slate-200"></th>
                <th className="px-3 py-3 text-center border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-lg">😊</span>
                    <span className="text-xs font-semibold text-green-700">TS</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-center border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-lg">😐</span>
                    <span className="text-xs font-semibold text-yellow-600">S</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-center border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-lg">😞</span>
                    <span className="text-xs font-semibold text-orange-600">PS</span>
                  </div>
                </th>
                <th className="px-2 py-3 border-l border-slate-300"></th>
              </tr>
            </thead>
            <tbody>
              {maternelleDomaines.map((domaine, domaineIndex) => {
                // Récupérer les matières de la BDD qui correspondent à ce domaine
                const matieresDuDomaine = subjects.filter((subject: any) => {
                  const mapping = mapSubjectToDomain(subject.name);
                  if (mapping && mapping.domaineId === domaine.id) {
                    console.log(`✅ Matière "${subject.name}" mappée au Domaine ${domaine.id}`);
                    return true;
                  }
                  return false;
                });
                
                console.log(`📊 Domaine ${domaine.id} (${domaine.titre}): ${matieresDuDomaine.length} matière(s) trouvée(s)`, 
                  matieresDuDomaine.map((s: any) => s.name));
                
                // Si aucune matière de la BDD n'est trouvée, utiliser les activités statiques du domaine
                const activitesAffichees = matieresDuDomaine.length > 0 
                  ? matieresDuDomaine.map((subject: any) => ({
                      nom: subject.name,
                      key: mapSubjectToDomain(subject.name)?.activiteKey || '',
                      isFromDB: true
                    }))
                  : domaine.activites.map(activite => ({
                      nom: activite.nom,
                      key: activite.key,
                      isFromDB: false
                    }));
                
                const rowSpan = activitesAffichees.length || 1;
                
                return (
                  <React.Fragment key={domaine.id}>
                    {/* Première ligne du domaine avec la première matière */}
                    {activitesAffichees.length > 0 ? (
                      activitesAffichees.map((activite, activiteIndex) => {
                        const evaluation = activite.isFromDB
                          ? getActiviteEvaluation(activite.key, activite.nom)
                          : getActiviteEvaluation(activite.key);
                        
                        const evaluationCode = selectedLevel === 'maternelle' 
                          ? (evaluation.code || (evaluation.text === 'Non évalué' ? '' : evaluation.text))
                          : evaluation.code;
                        
                        const isTS = evaluationCode === 'TS';
                        const isS = evaluationCode === 'S';
                        const isPS = evaluationCode === 'PS';
                        
                        return (
                          <tr 
                            key={`${domaine.id}-${activite.key}-${activiteIndex}`} 
                            className={`transition-all duration-150 border-b border-slate-100 ${domaineIndex % 2 === 0 ? 'bg-white hover:bg-blue-50/20' : 'bg-slate-50/30 hover:bg-blue-50/30'}`}
                          >
                            {/* Colonne Domaine - seulement sur la première ligne */}
                            {activiteIndex === 0 && (
                              <td className="px-4 py-4 align-top border-r border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30" rowSpan={rowSpan}>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                      {domaine.id}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Domaine</span>
                                  </div>
                                  <div className="text-sm font-semibold text-slate-800 leading-tight mb-2">
                                    {domaine.titre}
                                  </div>
                                  {domaine.sousTitre && (
                                    <div className="text-xs font-medium text-blue-600 italic border-l-2 border-blue-400 pl-2">
                                      {domaine.sousTitre}
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                            
                            {/* Colonne Matières */}
                            <td className="px-4 py-3 border-r border-slate-200">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isTS ? 'bg-green-500' : isS ? 'bg-yellow-500' : isPS ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                <span className="text-sm font-medium text-slate-700">{activite.nom}</span>
                              </div>
                            </td>
                            
                            {/* Colonnes Résultats TS/S/PS */}
                            <td className="px-3 py-3 text-center border-r border-slate-200">
                              <div className={`flex items-center justify-center w-8 h-8 mx-auto rounded-lg transition-all ${
                                isTS ? 'bg-green-100 border-2 border-green-400 shadow-sm' : 'bg-slate-50 border border-slate-200'
                              }`}>
                                <input 
                                  type="checkbox" 
                                  checked={isTS}
                                  readOnly
                                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                />
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-200">
                              <div className={`flex items-center justify-center w-8 h-8 mx-auto rounded-lg transition-all ${
                                isS ? 'bg-yellow-100 border-2 border-yellow-400 shadow-sm' : 'bg-slate-50 border border-slate-200'
                              }`}>
                                <input 
                                  type="checkbox" 
                                  checked={isS}
                                  readOnly
                                  className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
                                />
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-200">
                              <div className={`flex items-center justify-center w-8 h-8 mx-auto rounded-lg transition-all ${
                                isPS ? 'bg-orange-100 border-2 border-orange-400 shadow-sm' : 'bg-slate-50 border border-slate-200'
                              }`}>
                                <input 
                                  type="checkbox" 
                                  checked={isPS}
                                  readOnly
                                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                />
                              </div>
                            </td>
                            
                            {/* Colonne Visa - seulement sur la première ligne */}
                            {activiteIndex === 0 && (
                              <td className="px-2 py-3 align-top border-l border-slate-300" rowSpan={rowSpan}>
                                {domaine.id <= 2 && (
                                  <div className="relative h-full min-h-[200px] flex items-center justify-center">
                                    <div className="absolute transform -rotate-90 whitespace-nowrap text-xs font-semibold text-slate-600 px-2 py-1 bg-blue-50 rounded">
                                      Appréciation de l'enseignant(e)
                                    </div>
                                  </div>
                                )}
                                {domaine.id === 3 && (
                                  <div className="relative h-full min-h-[200px] flex items-center justify-center">
                                    <div className="absolute transform -rotate-90 whitespace-nowrap text-xs font-semibold text-slate-600 px-2 py-1 bg-purple-50 rounded">
                                      Visa du Directeur(trice)
                                    </div>
                                  </div>
                                )}
                                {domaine.id >= 4 && (
                                  <div className="relative h-full min-h-[200px] flex items-center justify-center">
                                    <div className="absolute transform -rotate-90 whitespace-nowrap text-xs font-semibold text-slate-600 px-2 py-1 bg-green-50 rounded">
                                      Impression et visa des parents
                                    </div>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      // Si aucune matière, afficher quand même le domaine
                      <tr className={`${domaineIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-4 border-r border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                {domaine.id}
                              </div>
                              <span className="text-xs font-semibold text-slate-700 uppercase">Domaine</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-800">{domaine.titre}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200 text-sm text-slate-400 italic">Aucune matière</td>
                        <td className="px-3 py-3 border-r border-slate-200"></td>
                        <td className="px-3 py-3 border-r border-slate-200"></td>
                        <td className="px-3 py-3 border-r border-slate-200"></td>
                        <td className="px-2 py-3 border-l border-slate-300"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center gap-8 mt-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-green-200 shadow-sm">
            <span className="text-2xl">😊</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-green-700">TS</span>
              <span className="text-xs text-green-600">Très Satisfaisant</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-yellow-200 shadow-sm">
            <span className="text-2xl">😐</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-yellow-600">S</span>
              <span className="text-xs text-yellow-600">Satisfaisant</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-orange-200 shadow-sm">
            <span className="text-2xl">😞</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-orange-600">PS</span>
              <span className="text-xs text-orange-600">Peu Satisfaisant</span>
            </div>
          </div>
        </div>

        {/* Note importante */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">Note importante</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                L'évaluation est faite sur la base de l'observation permanente de l'enfant. 
                Cet dernier est évalué par rapport à lui-même, pas par rapport à ses camarades de classe.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton pour passer à la page 2 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setCurrentBulletinPage(2)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold"
          >
            <span>Page Suivante</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Fonction de rendu pour la page 2 du bulletin MATERNELLE
  const renderMaternellePage2 = () => {
    const evaluationPeriod = getEvaluationPeriod();
    const evaluationName = getEvaluationName();

    return (
      <div className="mb-8 space-y-6">
        {/* En-tête du bulletin maternelle - Page 2 */}
        <div className="mb-6">
          {/* Header avec logos - même style que page 1 */}
          <div className="bg-blue-700 text-white p-6 rounded-xl mb-4 shadow-xl border border-blue-800">
            <div className="flex items-start justify-between gap-6">
              {/* Logo MEMP à gauche */}
              <div className="flex-shrink-0">
                <img 
                  src={memp} 
                  alt="Ministère de l'Enseignement Primaire et Secondaire" 
                  className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Informations centrales */}
              <div className="flex-1 text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
                <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
                <div className="border-t border-white/30 my-2"></div>
                <h3 className="text-xl font-bold tracking-wide">
                  {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || 'Nom de l\'établissement')}
                </h3>
                {schoolSettings.abbreviation && (
                  <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
                )}
                {schoolSettings.motto && (
                  <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
                )}
                <div className="border-t border-white/30 my-2"></div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                  {schoolSettings.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.address}</span>
                      {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                      {schoolSettings.department && <span>, {schoolSettings.department}</span>}
                    </div>
                  )}
                  {schoolSettings.primaryPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.primaryPhone}</span>
                      {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
                    </div>
                  )}
                  {schoolSettings.primaryEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.primaryEmail}</span>
                    </div>
                  )}
                  {schoolSettings.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.website}</span>
                    </div>
                  )}
                </div>
                <p className="text-blue-100 text-sm font-semibold mt-2">
                  Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
                </p>
                <div className="border-t border-white/30 my-2"></div>
                <p className="text-blue-100 text-sm font-semibold">
                  {evaluationName} - Page 2
                </p>
                <p className="text-blue-100 text-xs italic">
                  Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                </p>
              </div>

              {/* Logo de l'école à droite */}
              <div className="flex-shrink-0">
                {schoolSettings.logo ? (
                  <img 
                    src={schoolSettings.logo} 
                    alt="Logo de l'école" 
                    className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                    <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setCurrentBulletinPage(1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-md"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
              <span>Précédent</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Print className="h-5 w-5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Page 2 - Analyse Pédagogique et Recommandations */}
        <div className="mt-10 pt-8 border-t-4 border-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2 text-center flex items-center justify-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>Analyse Pédagogique Sommaire des Résultats</span>
            </h3>
            <p className="text-sm text-slate-600 text-center">Recommandations de l'enseignant(e) aux parents</p>
          </div>
          
          <div className="space-y-6">
            {/* Recommandations */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 min-h-[200px] shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Recommandations</h4>
              </div>
              <textarea
                value={editableRecommendation}
                onChange={(e) => setEditableRecommendation(e.target.value)}
                className="w-full p-4 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm text-slate-700 leading-relaxed min-h-[200px] resize-y"
                placeholder="Les recommandations seront générées automatiquement à partir des observations et décisions du conseil de classe..."
              />
            </div>

            {/* Symbole mérite */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 text-center flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="uppercase tracking-wide">Symbole Mérite par l'Élève</span>
              </h4>
              <div className="flex justify-center gap-8">
                {(() => {
                  // Utiliser directement moyenneGeneraleQualitative si disponible (maternelle)
                  const meriteCode = bulletinData.moyenneGeneraleQualitative || 
                    (bulletinData.moyenneGenerale >= 16 ? 'TS' : 
                     bulletinData.moyenneGenerale >= 12 ? 'S' : 
                     bulletinData.moyenneGenerale >= 8 ? 'PS' : '');
                  const isTS = meriteCode === 'TS';
                  const isS = meriteCode === 'S';
                  const isPS = meriteCode === 'PS';
                  return (
                    <>
                      <div className="text-center group">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                          isTS ? 'bg-green-100 border-4 border-green-400 shadow-lg scale-110' : 'bg-slate-100 border-2 border-slate-300'
                        }`}>
                          <span className="text-4xl">😊</span>
                        </div>
                        <div className={`w-6 h-6 mx-auto rounded border-2 transition-all ${
                          isTS ? 'bg-green-500 border-green-600' : 'bg-white border-slate-300'
                        }`}>
                          <input 
                            type="checkbox" 
                            checked={isTS}
                            readOnly 
                            className="w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                        <p className={`text-xs font-semibold mt-2 ${isTS ? 'text-green-700' : 'text-slate-400'}`}>TS</p>
                      </div>
                      <div className="text-center group">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                          isS ? 'bg-yellow-100 border-4 border-yellow-400 shadow-lg scale-110' : 'bg-slate-100 border-2 border-slate-300'
                        }`}>
                          <span className="text-4xl">😐</span>
                        </div>
                        <div className={`w-6 h-6 mx-auto rounded border-2 transition-all ${
                          isS ? 'bg-yellow-500 border-yellow-600' : 'bg-white border-slate-300'
                        }`}>
                          <input 
                            type="checkbox" 
                            checked={isS}
                            readOnly 
                            className="w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                        <p className={`text-xs font-semibold mt-2 ${isS ? 'text-yellow-700' : 'text-slate-400'}`}>S</p>
                      </div>
                      <div className="text-center group">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                          isPS ? 'bg-orange-100 border-4 border-orange-400 shadow-lg scale-110' : 'bg-slate-100 border-2 border-slate-300'
                        }`}>
                          <span className="text-4xl">😞</span>
                        </div>
                        <div className={`w-6 h-6 mx-auto rounded border-2 transition-all ${
                          isPS ? 'bg-orange-500 border-orange-600' : 'bg-white border-slate-300'
                        }`}>
                          <input 
                            type="checkbox" 
                            checked={isPS}
                            readOnly 
                            className="w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                        <p className={`text-xs font-semibold mt-2 ${isPS ? 'text-orange-700' : 'text-slate-400'}`}>PS</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-slate-700">Titulaire de la classe</p>
                </div>
                <p className="text-sm font-semibold text-blue-700 mb-2">{enseignantName || 'Non assigné'}</p>
                <div className="border-b-2 border-slate-300 h-12 rounded-sm"></div>
                <p className="text-xs text-slate-500 mt-1 italic">Signature</p>
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-semibold text-slate-700">Le (la) Directeur (trice)</p>
                </div>
                <p className="text-sm font-semibold text-indigo-700 mb-3">{directeurName || 'Non défini'}</p>
                
                {/* Cachet rouge avec signature intégrée */}
                <div className="flex justify-center mt-4">
                  <div className="school-stamp">
                    <svg width="160" height="160" viewBox="0 0 160 160" className="stamp-svg">
                      {/* Définitions des chemins courbes pour le texte */}
                      <defs>
                        {/* Chemin pour l'arc supérieur extérieur (nom de l'école) - sens gauche à droite */}
                        <path id="path-top-outer-bulletin" d="M 25 80 A 55 55 0 0 1 135 80" fill="none"/>
                        
                        {/* Chemin pour l'arc inférieur extérieur (adresse et téléphone) */}
                        <path id="path-bottom-outer-bulletin" d="M 20 80 A 60 60 0 0 0 140 80" fill="none"/>
                      </defs>
                      
                      {/* Cercle extérieur */}
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#dc2626" strokeWidth="4"/>
                      
                      {/* Cercle intérieur */}
                      <circle cx="80" cy="80" r="45" fill="none" stroke="#dc2626" strokeWidth="2"/>
                      
                      {/* Texte courbé - Arc supérieur extérieur (abréviation de l'école) */}
                      <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.2px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <textPath href="#path-top-outer-bulletin" startOffset="0%" textAnchor="start">
                          {schoolSettingsLoading ? 'CHARGEMENT...' : (schoolSettings?.abbreviation || schoolSettings?.name || 'NOM ENTREPRISE').toUpperCase()}
                        </textPath>
                      </text>
                      
                      {/* Texte courbé - Arc inférieur extérieur (adresse et téléphone) */}
                      <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <textPath href="#path-bottom-outer-bulletin" startOffset="8%" textAnchor="start">
                          {schoolSettingsLoading ? 'CHARGEMENT...' : `* ${schoolSettings?.address || 'Adresse'} - Tél: ${schoolSettings?.primaryPhone || '(+000) 00 00 00 00'} *`.toUpperCase()}
                        </textPath>
                      </text>
                      
                      {/* Texte horizontal - niveau */}
                      <text x="80" y="75" textAnchor="middle" className="stamp-text-level" fill="#dc2626" style={{ fontSize: '7.5px', fontWeight: 600, letterSpacing: '0.2px' }}>
                        {(selectedLevel === 'maternelle' || selectedLevel === 'primaire') ? 'Maternelle & Primaire' : 'Secondaire'}
                      </text>
                      
                      {/* Texte central - titre */}
                      <text x="80" y="90" textAnchor="middle" className="stamp-text-center" fill="#dc2626" style={{ fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.3px' }}>
                        DIRECTEUR(TRICE)
                      </text>
                      
                      {/* Signature numérique du directeur intégrée dans le SVG */}
                      <text 
                        x="10" 
                        y="95" 
                        fill="#0000ff"
                        fillOpacity="0.7"
                        fontFamily="Brush Script MT, Lucida Handwriting, cursive"
                        fontSize="45"
                        fontWeight="normal"
                        transform="rotate(-15 10 95)"
                        letterSpacing="1px"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                      >
                        {directeurName ? directeurName.split(' ').slice(-2, -1)[0] || directeurName.split(' ')[directeurName.split(' ').length - 1] : 'Signature'}
                      </text>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 italic text-center">Signature et cachet</p>
              </div>
            </div>

            {/* Réponse des parents */}
            <div className="mt-8 pt-6 border-t-2 border-slate-300">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Send className="h-4 w-4 text-green-600" />
                  <span>Réponse des parents de l'élève</span>
                </h4>
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-5 min-h-[120px] shadow-sm">
                <div className="space-y-2 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b border-dotted border-slate-300 h-5"></div>
                  ))}
                </div>
                {bulletinData.reponseParents && (
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">{bulletinData.reponseParents}</p>
                )}
              </div>
              <div className="mt-4 bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-semibold text-slate-700">Nom, Prénoms et Signature</p>
                </div>
                <div className="border-b-2 border-slate-300 h-12 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction de rendu pour la page 2 du bulletin PRIMAIRE (Symboles mérite et recommandations)
  const renderPrimairePage2 = () => {
    const evaluationPeriod = getEvaluationPeriod();
    const evaluationName = getEvaluationName();
    const isCM2 = bulletinData?.eleve?.classe?.includes('CM2');

    // Calculer le nombre de matières évaluées
    const matieresEvaluees = bulletinData.notes.filter((n: any) => n.moyenne > 0).length;
    
    // Calculer les compétences maximales et minimales (simplifié pour l'instant)
    const competencesMaxMin = bulletinData.notes.reduce((acc: number, note: any) => {
      if (note.moyenne >= 16) return acc + 1; // Compétence maximale
      if (note.moyenne >= 10) return acc + 0.5; // Compétence minimale
      return acc;
    }, 0);

    // Déterminer si le seuil de réussite globale est atteint (10/20 pour le primaire)
    const seuilAtteint = bulletinData.moyenneGenerale >= 10;

    // Fonction pour obtenir le symbole mérite pour une matière
    const getMeriteSymbol = (moyenne: number) => {
      if (moyenne >= 16) return 'TS';
      if (moyenne >= 12) return 'S';
      if (moyenne >= 8) return 'PS';
      return '';
    };

    // Grouper les matières pour l'affichage du tableau des symboles mérite
    const matieresGroupees = [
      bulletinData.notes.filter((n: any) => ['Français', 'Mathématiques'].includes(n.matiere)),
      bulletinData.notes.filter((n: any) => ['ES', 'Anglais'].includes(n.matiere)),
      bulletinData.notes.filter((n: any) => ['EST', 'EA', 'EPS'].includes(n.matiere) || n.matiere.includes('Langue')),
    ];

    return (
      <div className="mb-8 space-y-6">
        {/* Header avec logos et informations de l'école */}
        <div className="bg-blue-700 text-white p-6 rounded-xl shadow-xl mb-6 border border-blue-800">
          <div className="flex items-start justify-between gap-6">
            {/* Logo MEMP à gauche */}
            <div className="flex-shrink-0">
              <img 
                src={getMinistryLogo()} 
                alt={getMinistryName()} 
                className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Informations centrales */}
            <div className="flex-1 text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
              <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
              <div className="border-t border-white/30 my-2"></div>
              <h3 className="text-xl font-bold tracking-wide">
                {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || 'Nom de l\'établissement')}
              </h3>
              {schoolSettings.abbreviation && (
                <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
              )}
              {schoolSettings.motto && (
                <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
              )}
              <div className="border-t border-white/30 my-2"></div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                {schoolSettings.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.address}</span>
                    {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                    {schoolSettings.department && <span>, {schoolSettings.department}</span>}
                  </div>
                )}
                {schoolSettings.primaryPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryPhone}</span>
                    {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
                  </div>
                )}
                {schoolSettings.primaryEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryEmail}</span>
                  </div>
                )}
                {schoolSettings.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.website}</span>
                  </div>
                )}
              </div>
              <p className="text-blue-100 text-sm font-semibold mt-2">
                Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
              </p>
              <div className="border-t border-white/30 my-2"></div>
              <div className="space-y-1 text-blue-100 text-sm font-semibold mt-2">
                <p>Evaluation certificative N°.........</p>
                <p>Mois de {selectedPeriodType === 'evaluation' && evaluationPeriod ? evaluationPeriod.month : '........................'}</p>
              </div>
            </div>

            {/* Logo de l'école à droite */}
            <div className="flex-shrink-0">
              {schoolSettings.logo ? (
                <img 
                  src={schoolSettings.logo} 
                  alt="Logo de l'école" 
                  className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Bouton Imprimer */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors shadow-md border border-blue-900"
            >
              <Print className="h-5 w-5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Section: SYMBOLE MERITE PAR L'ELEVE */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-gray-900 mb-4 text-center uppercase">SYMBOLE MERITE PAR L'ELEVE</h4>
          <table className="w-full border-collapse">
            <tbody>
              {(() => {
                // Calculer la moyenne pour "Français" (Communication orale, Expression écrite, Lecture, Dictée)
                const francaisNotes = bulletinData.notes.filter((note: any) => {
                  const matiere = note.matiere?.toLowerCase() || '';
                  return matiere.includes('communication orale') || 
                         matiere.includes('expression écrite') || 
                         matiere.includes('expression ecrite') ||
                         matiere.includes('lecture') || 
                         matiere.includes('dictée') ||
                         matiere.includes('dictee');
                }).map((note: any) => note.moyenne).filter((m: number) => m > 0);
                const moyenneFrancais = francaisNotes.length > 0 
                  ? francaisNotes.reduce((sum: number, m: number) => sum + m, 0) / francaisNotes.length 
                  : 0;

                // Calculer la moyenne pour "EA" (Education Artistique - toutes les variantes)
                const eaNotes = bulletinData.notes.filter((note: any) => {
                  const matiere = note.matiere?.toLowerCase() || '';
                  return matiere.includes('education artistique') || 
                         matiere.includes('éducation artistique') ||
                         matiere.includes('dessin') ||
                         matiere.includes('couture') ||
                         matiere.includes('poésie') ||
                         matiere.includes('poesie') ||
                         matiere.includes('chant') ||
                         matiere.includes('conte');
                }).map((note: any) => note.moyenne).filter((m: number) => m > 0);
                const moyenneEA = eaNotes.length > 0 
                  ? eaNotes.reduce((sum: number, m: number) => sum + m, 0) / eaNotes.length 
                  : 0;

                // Récupérer les autres matières
                const getMatiereMoyenne = (nomRecherche: string) => {
                  const note = bulletinData.notes.find((n: any) => {
                    const matiere = n.matiere?.toLowerCase() || '';
                    if (nomRecherche === 'Maths' || nomRecherche === 'Mathématiques') {
                      return matiere.includes('mathématique') || matiere === 'maths';
                    } else if (nomRecherche === 'ES' || nomRecherche === 'Education Sociale') {
                      return matiere.includes('education sociale') || matiere.includes('éducation sociale') || matiere === 'es';
                    } else if (nomRecherche === 'EST' || nomRecherche === 'Education Scientifique') {
                      return matiere.includes('education scientifique') || matiere.includes('éducation scientifique') || matiere === 'est';
                    } else if (nomRecherche === 'EPS' || nomRecherche === 'Education Physique') {
                      return matiere.includes('education physique') || matiere.includes('éducation physique') || matiere.includes('eps');
                    } else if (nomRecherche === 'Anglais') {
                      return matiere.includes('anglais');
                    } else if (nomRecherche === 'Langue nationale 2') {
                      return matiere.includes('langue nationale') || matiere.includes('langue 2');
                    }
                    return false;
                  });
                  return note ? note.moyenne : 0;
                };

                // Matières de la colonne gauche (exactement comme dans l'image)
                const colonneGauche = [
                  { nom: 'Français', moyenne: moyenneFrancais },
                  { nom: 'Maths', moyenne: getMatiereMoyenne('Maths') },
                  { nom: 'ES', moyenne: getMatiereMoyenne('ES') },
                  { nom: 'Anglais', moyenne: getMatiereMoyenne('Anglais') }
                ];

                // Matières de la colonne droite (exactement comme dans l'image)
                const colonneDroite = [
                  { nom: 'EST', moyenne: getMatiereMoyenne('EST') },
                  { nom: 'EA', moyenne: moyenneEA },
                  { nom: 'EPS', moyenne: getMatiereMoyenne('EPS') },
                  { nom: 'Langue nationale 2', moyenne: getMatiereMoyenne('Langue nationale 2') }
                ];

                return Array.from({ length: 4 }).map((_, rowIndex) => {
                  const matiereGauche = colonneGauche[rowIndex];
                  const matiereDroite = colonneDroite[rowIndex];
                  const symboleGauche = getMeriteSymbol(matiereGauche.moyenne);
                  const symboleDroite = getMeriteSymbol(matiereDroite.moyenne);
                  
                  // Déterminer si le 4ème emoji (😞) est actif
                  const isEmoji4Gauche = matiereGauche.moyenne < 8 || matiereGauche.moyenne === 0;
                  const isEmoji4Droite = matiereDroite.moyenne < 8 || matiereDroite.moyenne === 0;
                  
                  return (
                    <tr key={rowIndex} className="border-b border-gray-300">
                      {/* Colonne gauche */}
                      <td className="py-2 pr-4 align-middle" style={{ width: '50%' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{matiereGauche.nom}</span>
                          <div className="flex items-center gap-2">
                            {/* Emoji 1: 🌟 (TS - Très Satisfaisant) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              symboleGauche === 'TS' ? 'bg-green-300 border-4 border-green-700 shadow-lg scale-125 ring-2 ring-green-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${symboleGauche === 'TS' ? 'filter-none' : 'grayscale opacity-60'}`}>🌟</span>
                            </div>
                            {/* Emoji 2: 😊 (S - Satisfaisant) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              symboleGauche === 'S' ? 'bg-yellow-300 border-4 border-yellow-700 shadow-lg scale-125 ring-2 ring-yellow-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${symboleGauche === 'S' ? 'filter-none' : 'grayscale opacity-60'}`}>😊</span>
                            </div>
                            {/* Emoji 3: 😐 (PS - Passable Satisfaisant) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              symboleGauche === 'PS' ? 'bg-orange-300 border-4 border-orange-700 shadow-lg scale-125 ring-2 ring-orange-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${symboleGauche === 'PS' ? 'filter-none' : 'grayscale opacity-60'}`}>😐</span>
                            </div>
                            {/* Emoji 4: 😞 (Insuffisant / Non évalué) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isEmoji4Gauche ? 'bg-red-300 border-4 border-red-700 shadow-lg scale-125 ring-2 ring-red-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${isEmoji4Gauche ? 'filter-none' : 'grayscale opacity-60'}`}>😞</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Colonne droite */}
                      <td className="py-2 pl-4 align-middle" style={{ width: '50%' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{matiereDroite.nom}</span>
                          <div className="flex items-center gap-2">
                            {/* Emoji 1: 🌟 (TS - Très Satisfaisant) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              symboleDroite === 'TS' ? 'bg-green-300 border-4 border-green-700 shadow-lg scale-125 ring-2 ring-green-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${symboleDroite === 'TS' ? 'filter-none' : 'grayscale opacity-60'}`}>🌟</span>
                            </div>
                            {/* Emoji 2: 😊 (S - Satisfaisant) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              symboleDroite === 'S' ? 'bg-yellow-300 border-4 border-yellow-700 shadow-lg scale-125 ring-2 ring-yellow-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${symboleDroite === 'S' ? 'filter-none' : 'grayscale opacity-60'}`}>😊</span>
                            </div>
                            {/* Emoji 3: 😐 (PS - Passable Satisfaisant) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              symboleDroite === 'PS' ? 'bg-orange-300 border-4 border-orange-700 shadow-lg scale-125 ring-2 ring-orange-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${symboleDroite === 'PS' ? 'filter-none' : 'grayscale opacity-60'}`}>😐</span>
                            </div>
                            {/* Emoji 4: 😞 (Insuffisant / Non évalué) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isEmoji4Droite ? 'bg-red-300 border-4 border-red-700 shadow-lg scale-125 ring-2 ring-red-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                            }`}>
                              <span className={`text-2xl ${isEmoji4Droite ? 'filter-none' : 'grayscale opacity-60'}`}>😞</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Informations générales */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Nombre de matières évaluées :</span>
            <span className="flex-1 border-b border-dotted border-gray-400 mx-4"></span>
            <span className="text-sm font-bold text-gray-900">{matieresEvaluees}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Nombre de compétences maximales + minimales atteintes :</span>
            <span className="flex-1 border-b border-dotted border-gray-400 mx-4"></span>
            <span className="text-sm font-bold text-gray-900">{competencesMaxMin.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Seuil de réussite globale atteint</span>
            <span className="flex-1 border-b border-dotted border-gray-400 mx-4"></span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={seuilAtteint} readOnly className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">OUI</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!seuilAtteint} readOnly className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">NON</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section II - ATTITUDES */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h4 className="text-base font-bold text-gray-900 mb-4">II- ATTITUDES</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Assiduité :</span>
              <input
                type="text"
                value={editableAssiduite}
                onChange={(e) => setEditableAssiduite(e.target.value)}
                className="flex-1 border-b border-dotted border-gray-400 mx-4 px-2 py-1 bg-transparent focus:outline-none focus:border-gray-600"
                placeholder=""
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Discipline :</span>
              <input
                type="text"
                value={editableDiscipline}
                onChange={(e) => setEditableDiscipline(e.target.value)}
                className="flex-1 border-b border-dotted border-gray-400 mx-4 px-2 py-1 bg-transparent focus:outline-none focus:border-gray-600"
                placeholder=""
              />
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-700 pt-2">Défauts majeurs identifiés chez l'élève :</span>
              <div className="flex-1 mx-4">
                <textarea
                  value={editableDefautsMajeurs}
                  onChange={(e) => setEditableDefautsMajeurs(e.target.value)}
                  rows={2}
                  className="w-full border-0 border-b-2 border-dotted border-gray-400 px-2 py-1 bg-transparent focus:outline-none focus:border-gray-600 resize-none"
                  placeholder=""
                />
                <div className="h-2 border-b border-dotted border-gray-400"></div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-700 pt-2">Qualités remarquables :</span>
              <div className="flex-1 mx-4">
                <textarea
                  value={editableQualitesRemarquables}
                  onChange={(e) => setEditableQualitesRemarquables(e.target.value)}
                  rows={2}
                  className="w-full border-0 border-b-2 border-dotted border-gray-400 px-2 py-1 bg-transparent focus:outline-none focus:border-gray-600 resize-none"
                  placeholder=""
                />
                <div className="h-2 border-b border-dotted border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYSE DES RESULTATS ET RECOMMANDATIONS */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-gray-900 mb-4 text-center uppercase">ANALYSE DES RESULTATS ET RECOMMANDATIONS</h4>
          <div className="grid grid-cols-2 gap-8 mt-6">
            {/* Enseignant */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Enseignant(e)</p>
              <p className="text-xs text-gray-600 mb-3">Signature du titulaire de la classe</p>
              <div className="border-b-2 border-gray-400 h-12"></div>
            </div>
            {/* Parent */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Parent</p>
              <p className="text-xs text-gray-600 mb-3">Signature et nom du parent</p>
              <div className="border-b-2 border-gray-400 h-12"></div>
            </div>
          </div>
          
          {/* VISA du directeur */}
          <div className="mt-8 pt-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 mb-2">VISA du/de la Directeur/trice</p>
              <p className="text-sm font-semibold text-indigo-700 mb-3">{directeurName || 'Non défini'}</p>
              
              {/* Cachet rouge avec signature intégrée */}
              <div className="flex justify-center mt-4 mb-3">
                <div className="school-stamp">
                  <svg width="160" height="160" viewBox="0 0 160 160" className="stamp-svg">
                    {/* Définitions des chemins courbes pour le texte */}
                    <defs>
                      {/* Chemin pour l'arc supérieur extérieur */}
                      <path id="path-top-outer-primaire-page2" d="M 25 80 A 55 55 0 0 1 135 80" fill="none"/>
                      
                      {/* Chemin pour l'arc inférieur extérieur */}
                      <path id="path-bottom-outer-primaire-page2" d="M 20 80 A 60 60 0 0 0 140 80" fill="none"/>
                    </defs>
                    
                    {/* Cercle extérieur */}
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#dc2626" strokeWidth="4"/>
                    
                    {/* Cercle intérieur */}
                    <circle cx="80" cy="80" r="45" fill="none" stroke="#dc2626" strokeWidth="2"/>
                    
                    {/* Texte courbé - Arc supérieur extérieur */}
                    <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.2px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      <textPath href="#path-top-outer-primaire-page2" startOffset="0%" textAnchor="start">
                        {schoolSettingsLoading ? 'CHARGEMENT...' : (schoolSettings?.abbreviation || schoolSettings?.name || 'NOM ENTREPRISE').toUpperCase()}
                      </textPath>
                    </text>
                    
                    {/* Texte courbé - Arc inférieur extérieur */}
                    <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      <textPath href="#path-bottom-outer-primaire-page2" startOffset="8%" textAnchor="start">
                        {schoolSettingsLoading ? 'CHARGEMENT...' : `* ${schoolSettings?.address || 'Adresse'} - Tél: ${schoolSettings?.primaryPhone || '(+000) 00 00 00 00'} *`.toUpperCase()}
                      </textPath>
                    </text>
                    
                    {/* Texte horizontal - niveau */}
                    <text x="80" y="75" textAnchor="middle" className="stamp-text-level" fill="#dc2626" style={{ fontSize: '7.5px', fontWeight: 600, letterSpacing: '0.2px' }}>
                      {(selectedLevel === 'maternelle' || selectedLevel === 'primaire') ? 'Maternelle & Primaire' : 'Secondaire'}
                    </text>
                    
                    {/* Texte central - titre */}
                    <text x="80" y="90" textAnchor="middle" className="stamp-text-center" fill="#dc2626" style={{ fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.3px' }}>
                      DIRECTEUR(TRICE)
                    </text>
                    
                    {/* Signature numérique du directeur intégrée dans le SVG */}
                    <text 
                      x="10" 
                      y="95" 
                      fill="#0000ff"
                      fillOpacity="0.7"
                      fontFamily="Brush Script MT, Lucida Handwriting, cursive"
                      fontSize="45"
                      fontWeight="normal"
                      transform="rotate(-15 10 95)"
                      letterSpacing="1px"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                    >
                      {directeurName ? directeurName.split(' ').slice(-2, -1)[0] || directeurName.split(' ')[directeurName.split(' ').length - 1] : 'Signature'}
                    </text>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">Signature et cachet</p>
            </div>
          </div>
        </div>

        {/* Bouton pour passer à la page 1 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setCurrentBulletinPage(1)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold"
          >
            <span>Page Précédente</span>
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>
    );
  };

  // Fonction de rendu pour la page 1 du bulletin PRIMAIRE (Tableau détaillé)
    const renderPrimairePage1 = () => {
      const evaluationPeriod = getEvaluationPeriod();
      const evaluationName = getEvaluationName();
      const isCM2 = bulletinData?.eleve?.classe?.includes('CM2');
      
      // Obtenir le nom de l'évaluation pour l'affichage dynamique
      const evaluationDisplayName = selectedPeriodType === 'evaluation' && selectedEvaluation
        ? evaluationName
        : 'Evaluation certificative';
      
      // Obtenir le numéro de l'évaluation si c'est une évaluation spécifique
      const evaluationNumber = selectedPeriodType === 'evaluation' && selectedEvaluation
        ? getEvaluationNumberText()
        : '';
    
    // Fonction pour extraire les notes CM et CP d'une matière
    const getSubjectCMCP = (subjectName: string) => {
      const subjectGrade = grades.find((g: any) => 
        g.studentId === bulletinData?.eleve?.id && 
        subjects.find((s: any) => s.id === g.subjectId && s.name === subjectName)
      );
      
      if (!subjectGrade || !subjectGrade.notes) return null;
      
      let noteData: any = {};
      if (typeof subjectGrade.notes === 'string') {
        try {
          noteData = JSON.parse(subjectGrade.notes);
        } catch {
          noteData = {};
        }
      } else {
        noteData = subjectGrade.notes;
      }
      
      return {
        em1_cm: parseFloat(noteData['em1_cm'] || '0'),
        em1_cp: parseFloat(noteData['em1_cp'] || '0'),
        em2_cm: parseFloat(noteData['em2_cm'] || '0'),
        em2_cp: parseFloat(noteData['em2_cp'] || '0'),
        ec_cm: parseFloat(noteData['ec_cm'] || '0'),
        ec_cp: parseFloat(noteData['ec_cp'] || '0'),
      };
    };

    // Calculer la note totale (CM + CP) pour chaque évaluation
    const calculateNoteTotal = (cm: number, cp: number) => {
      const total = cm + cp;
      return total > 0 ? total : null;
    };

    // Calculer la moyenne d'une matière (pour l'affichage dans le tableau)
    const calculateMatiereMoyenne = (cmcp: any) => {
      if (!cmcp) return null;
      
      const em1 = calculateNoteTotal(cmcp.em1_cm, cmcp.em1_cp);
      const em2 = calculateNoteTotal(cmcp.em2_cm, cmcp.em2_cp);
      const ec = calculateNoteTotal(cmcp.ec_cm, cmcp.ec_cp);
      
      if (em1 && em2 && ec) {
        const moyenneEM = (em1 + em2) / 2;
        return (moyenneEM + ec) / 2;
      }
      return null;
    };

    // Déterminer si le seuil de réussite est atteint (10/20 pour le primaire)
    const isSeuilAtteint = (moyenne: number | null) => {
      return moyenne !== null && moyenne >= 10;
    };

    // Obtenir l'appréciation
    const getAppreciation = (moyenne: number | null) => {
      if (moyenne === null) return 'Non évalué';
      if (moyenne >= 18) return 'Excellent';
      if (moyenne >= 16) return 'Très Bien';
      if (moyenne >= 14) return 'Bien';
      if (moyenne >= 12) return 'Assez Bien';
      if (moyenne >= 10) return 'Passable';
      return 'Insuffisant';
    };

    // Calculer les statistiques de la classe
    const classAverages = students.map((student: any) => {
      let totalMoyenne = 0;
      let count = 0;
      
      subjects.forEach((subject: any) => {
        const subjectGrade = grades.find((g: any) => 
          g.studentId === student.id && 
          g.subjectId === subject.id &&
          g.academicYearId === selectedAcademicYear &&
          g.quarterId === (selectedQuarter || currentQuarter?.id || '')
        );
        
        if (subjectGrade && subjectGrade.notes) {
          let noteData: any = {};
          if (typeof subjectGrade.notes === 'string') {
            try {
              noteData = JSON.parse(subjectGrade.notes);
            } catch {
              noteData = {};
            }
          } else {
            noteData = subjectGrade.notes;
          }
          
          // Calculer la moyenne selon le mode (évaluation ou trimestre)
          let moyenne: number | null = null;
          
          if (selectedPeriodType === 'evaluation' && selectedEvaluation) {
            // Mode évaluation : utiliser directement les notes de l'évaluation
            let cm = 0;
            let cp = 0;
            
            if (selectedEvaluation === 'em1') {
              cm = parseFloat(noteData['em1_cm'] || '0');
              cp = parseFloat(noteData['em1_cp'] || '0');
            } else if (selectedEvaluation === 'em2') {
              cm = parseFloat(noteData['em2_cm'] || '0');
              cp = parseFloat(noteData['em2_cp'] || '0');
            } else if (selectedEvaluation === 'ec') {
              cm = parseFloat(noteData['ec_cm'] || '0');
              cp = parseFloat(noteData['ec_cp'] || '0');
            }
            
            moyenne = cm + cp;
          } else {
            // Mode trimestre : utiliser la moyenne trimestrielle
            const em1_cm = parseFloat(noteData['em1_cm'] || '0');
            const em1_cp = parseFloat(noteData['em1_cp'] || '0');
            const em2_cm = parseFloat(noteData['em2_cm'] || '0');
            const em2_cp = parseFloat(noteData['em2_cp'] || '0');
            const ec_cm = parseFloat(noteData['ec_cm'] || '0');
            const ec_cp = parseFloat(noteData['ec_cp'] || '0');
            
            const em1_note = em1_cm + em1_cp;
            const em2_note = em2_cm + em2_cp;
            const ec_note = ec_cm + ec_cp;
            
            if (em1_note > 0 && em2_note > 0 && ec_note > 0) {
              const moyenneEM = (em1_note + em2_note) / 2;
              moyenne = (moyenneEM + ec_note) / 2;
            } else {
              const availableNotes = [em1_note, em2_note, ec_note].filter(note => note > 0);
              if (availableNotes.length > 0) {
                moyenne = availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length;
              }
            }
          }
          
          if (moyenne !== null && moyenne > 0) {
            totalMoyenne += moyenne;
            count++;
          }
        }
      });
      
      return count > 0 ? totalMoyenne / count : null;
    }).filter((avg: any) => avg !== null);

    const plusForteMoyenne = classAverages.length > 0 ? Math.max(...classAverages) : 0;
    const plusFaibleMoyenne = classAverages.length > 0 ? Math.min(...classAverages) : 0;
    const seuilGlobal = 10; // Seuil fixé à 10/20 pour le primaire

    // Fonction pour mapper les noms de matières aux noms d'affichage
    const getSubjectDisplayName = (subjectName: string) => {
      const mapping: { [key: string]: string } = {
        'Communication orale': 'Communication orale',
        'Expression écrite': 'Expression écrite',
        'ES': 'Education Sociale',
        'EST': 'Education Scientifique et Technologique',
        'EA': 'Education Artistique',
      };
      return mapping[subjectName] || subjectName;
    };

    // Fonction pour obtenir les notes CM et CP d'une matière
    // Gère deux modes : "Évaluation" (em1, em2, ec) et "Trimestre" (moyenne trimestrielle)
    const getSubjectNotes = (subjectId: string) => {
      const subjectGrade = grades.find((g: any) => 
        g.studentId === bulletinData?.eleve?.id && 
        g.subjectId === subjectId &&
        g.academicYearId === selectedAcademicYear &&
        g.quarterId === (selectedQuarter || currentQuarter?.id || '')
      );
      
      if (!subjectGrade || !subjectGrade.notes) return null;
      
      let noteData: any = {};
      if (typeof subjectGrade.notes === 'string') {
        try {
          noteData = JSON.parse(subjectGrade.notes);
        } catch {
          noteData = {};
        }
      } else {
        noteData = subjectGrade.notes;
      }
      
      // Pour le primaire, récupérer directement les notes CM et CP comme dans BordereauNotes
      const em1_cm = parseFloat(noteData['em1_cm'] || '0');
      const em1_cp = parseFloat(noteData['em1_cp'] || '0');
      const em2_cm = parseFloat(noteData['em2_cm'] || '0');
      const em2_cp = parseFloat(noteData['em2_cp'] || '0');
      const ec_cm = parseFloat(noteData['ec_cm'] || '0');
      const ec_cp = parseFloat(noteData['ec_cp'] || '0');
      
      // Mode "Évaluation" : afficher directement les notes de l'évaluation sélectionnée
      if (selectedPeriodType === 'evaluation' && selectedEvaluation) {
        let cm = 0;
        let cp = 0;
        let total = 0;
        
        if (selectedEvaluation === 'em1') {
          cm = em1_cm;
          cp = em1_cp;
          total = em1_cm + em1_cp;
        } else if (selectedEvaluation === 'em2') {
          cm = em2_cm;
          cp = em2_cp;
          total = em2_cm + em2_cp;
        } else if (selectedEvaluation === 'ec') {
          cm = ec_cm;
          cp = ec_cp;
          total = ec_cm + ec_cp;
        }
        
        // Si aucune note pour cette évaluation
        if (total <= 0) {
          return null;
        }
        
        return { cm, cp, total };
      }
      
      // Mode "Trimestre" : la moyenne trimestrielle est considérée comme la note CM
      // Moyenne totale : (((EM1+EM2)/2)+EC)/2
      const em1_note = em1_cm + em1_cp;
      const em2_note = em2_cm + em2_cp;
      const ec_note = ec_cm + ec_cp;
      
      let total = 0;
      if (em1_note > 0 && em2_note > 0 && ec_note > 0) {
        // Formule spécifique pour le primaire: (((EM1+EM2)/2)+EC)/2
        const moyenneEM = (em1_note + em2_note) / 2;
        total = (moyenneEM + ec_note) / 2;
      } else {
        // Si toutes les notes ne sont pas disponibles, calculer avec celles disponibles
        const availableNotes = [em1_note, em2_note, ec_note].filter(note => note > 0);
        if (availableNotes.length > 0) {
          total = availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length;
        } else {
          return null;
        }
      }
      
      // Pour le trimestre : CM = moyenne trimestrielle (sur 20, mais affichée comme CM/18), CP = 0
      // La moyenne trimestrielle est directement la note CM
      const cm = total;
      const cp = 0;
      
      // Vérifier qu'on a au moins une note pour retourner quelque chose
      if (total <= 0) {
        return null;
      }
      
      return { cm, cp, total };
    };

    // Filtrer les matières pour ne garder que celles du primaire
    const primaireSubjects = subjects.filter((s: any) => 
      s.level === 'primaire' || s.level === 'PRIMAIRE' || selectedLevel === 'primaire'
    );


    return (
      <div className="mb-8 space-y-6">
        {/* En-tête du bulletin primaire - Page 1 */}
        <div className="mb-6">
          <div className="bg-blue-700 text-white p-6 rounded-xl mb-4 shadow-xl border border-blue-800">
            <div className="flex items-start justify-between gap-6">
              {/* Logo MEMP à gauche */}
              <div className="flex-shrink-0">
                <img 
                  src={getMinistryLogo()} 
                  alt={getMinistryName()} 
                  className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Informations centrales */}
              <div className="flex-1 text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
                <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
                <div className="border-t border-white/30 my-2"></div>
                <h3 className="text-xl font-bold tracking-wide">
                  {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || 'Nom de l\'établissement')}
                </h3>
                {schoolSettings.abbreviation && (
                  <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
                )}
                {schoolSettings.motto && (
                  <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
                )}
                <div className="border-t border-white/30 my-2"></div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                  {schoolSettings.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.address}</span>
                      {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                      {schoolSettings.department && <span>, {schoolSettings.department}</span>}
                    </div>
                  )}
                  {schoolSettings.primaryPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.primaryPhone}</span>
                      {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
                    </div>
                  )}
                  {schoolSettings.primaryEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.primaryEmail}</span>
                    </div>
                  )}
                  {schoolSettings.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-200" />
                      <span>{schoolSettings.website}</span>
                    </div>
                  )}
                </div>
                <p className="text-blue-100 text-sm font-semibold mt-2">
                  Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
                </p>
                <div className="border-t border-white/30 my-2"></div>
                <div className="space-y-1 text-blue-100 text-sm font-semibold mt-2">
                  {selectedPeriodType === 'evaluation' && selectedEvaluation ? (
                    <>
                      <p className="text-center">{evaluationDisplayName}</p>
                      <p className="text-center">
                        Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                      </p>
                    </>
                  ) : selectedPeriodType === 'trimestre' ? (
                    <>
                      <p className="text-center">Evaluation Sommative Mensuelle</p>
                      <p className="text-center">
                        Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-center">Evaluation certificative N°.........</p>
                      <p className="text-center">Mois de ........................</p>
                    </>
                  )}
                </div>
              </div>

              {/* Logo de l'école à droite */}
              <div className="flex-shrink-0">
                {schoolSettings.logo ? (
                  <img 
                    src={schoolSettings.logo} 
                    alt="Logo de l'école" 
                    className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                    <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Print className="h-5 w-5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Tableau principal I- CONNAISSANCE ET HABILETES */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm overflow-x-auto">
          <h4 className="text-base font-bold text-gray-900 mb-4 text-center uppercase">I- CONNAISSANCE ET HABILETES</h4>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Champs de formation</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Note min.</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">CM/18</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={2}>Maîtrise minimale</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">CP/02</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Total/20</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={2}>Seuil réussite</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Appréciation</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300"></th>
                <th className="border border-gray-300"></th>
                <th className="border border-gray-300"></th>
                <th className="border border-gray-300 text-center">Oui</th>
                <th className="border border-gray-300 text-center">Non</th>
                <th className="border border-gray-300"></th>
                <th className="border border-gray-300"></th>
                <th className="border border-gray-300 text-center">Oui</th>
                <th className="border border-gray-300 text-center">Non</th>
                <th className="border border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {/* Toutes les matières - récupérées dynamiquement */}
              {primaireSubjects
                .map((subject: any, index: number) => {
                  const notes = getSubjectNotes(subject.id);
                  const cm = notes?.cm || 0;
                  const cp = notes?.cp || 0;
                  const total = notes?.total || 0;
                  
                  // Ne cocher les checkboxes et afficher l'appréciation que si des notes existent
                  const hasNotes = notes !== null && total > 0;
                  const maitriseMin = hasNotes && total >= 10;
                  const seuilAtteint = hasNotes && total >= 10;
                  
                  // Mapper les noms de matières
                  let displayName = getSubjectDisplayName(subject.name);
                  
                  // Gestion spéciale pour les matières avec abréviations
                  if (subject.name === 'ES' || subject.name.toLowerCase().includes('education sociale')) {
                    displayName = 'Education Sociale';
                  } else if (subject.name === 'EST' || subject.name.toLowerCase().includes('education scientifique')) {
                    displayName = 'Education Scientifique et Technologique';
                  } else if (subject.name.toLowerCase().includes('education artistique')) {
                    // Vérifier si c'est Dessin/Couture ou Poésie/Chant/Conte
                    if (subject.name.toLowerCase().includes('dessin') || subject.name.toLowerCase().includes('couture')) {
                      displayName = 'EA (Dessin/Couture)';
                    } else if (subject.name.toLowerCase().includes('poésie') || subject.name.toLowerCase().includes('chant') || subject.name.toLowerCase().includes('conte')) {
                      displayName = 'EA (Poésie/Chant/Conte)';
                    } else {
                      displayName = 'Education Artistique';
                    }
                  }
                  
                  return (
                    <tr 
                      key={subject.id} 
                      className={`${hasNotes ? 'bg-blue-50/30' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}`}
                    >
                      <td className="border border-gray-300 px-2 py-1 font-semibold">{displayName}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">10</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {cm > 0 ? cm.toFixed(2) : '-'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={maitriseMin} readOnly className="w-4 h-4" />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={hasNotes && !maitriseMin} readOnly className="w-4 h-4" />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {cp > 0 ? cp.toFixed(2) : '-'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {total > 0 ? total.toFixed(2) : '-'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={seuilAtteint} readOnly className="w-4 h-4" />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={hasNotes && !seuilAtteint} readOnly className="w-4 h-4" />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-xs">
                        {hasNotes ? getAppreciation(total) : '-'}
                      </td>
                    </tr>
                  );
                })}

              {/* Cas spécial pour CM2: PROMU(E) A L'ENTREE EN CLASSE DE 6è */}
              {isCM2 && (
                <tr className="bg-blue-50 font-semibold">
                  <td className="border border-gray-300 px-2 py-1" colSpan={2}>
                    (cas du CM2 seul) PROMU(E) A L'ENTREE EN CLASSE DE 6è
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">Oui [+]</td>
                  <td className="border border-gray-300 px-2 py-1 text-center">Non [-]</td>
                  <td className="border border-gray-300 px-2 py-1" colSpan={6}>
                    <div className="flex items-center justify-center gap-4">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Oui</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Non</span>
                      </label>
                    </div>
                  </td>
                </tr>
              )}

              {/* TOTAL GENERAL */}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-2 py-2" colSpan={6}>TOTAL GENERAL</td>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {bulletinData.moyenneGenerale > 0 ? bulletinData.moyenneGenerale.toFixed(2) : '-'}
                </td>
                <td className="border border-gray-300 px-2 py-2" colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Résumé des notes */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-dotted pb-2">
            <span className="text-sm font-medium text-gray-700">Moyenne obtenue par l'élève :</span>
            <span className="text-sm font-bold text-gray-900">{bulletinData.moyenneGenerale > 0 ? bulletinData.moyenneGenerale.toFixed(2) : '0.00'}/20</span>
          </div>
          <div className="flex items-center justify-between border-b border-dotted pb-2">
            <span className="text-sm font-medium text-gray-700">Plus forte moyenne de la classe :</span>
            <span className="text-sm font-bold text-gray-900">{plusForteMoyenne.toFixed(2)}/20</span>
          </div>
          <div className="flex items-center justify-between border-b border-dotted pb-2">
            <span className="text-sm font-medium text-gray-700">Plus faible moyenne de la classe :</span>
            <span className="text-sm font-bold text-gray-900">{plusFaibleMoyenne.toFixed(2)}/20</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Seuil de réussite globale fixé à :</span>
            <span className="text-sm font-bold text-gray-900">{seuilGlobal}</span>
          </div>
        </div>

        {/* Symbole d'appréciation générale mérité par l'élève */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Symbole d'appréciation générale mérité par l'élève</span>
            <div className="flex items-center gap-2">
              {(() => {
                const moyenneGenerale = bulletinData.moyenneGenerale || 0;
                
                // Déterminer quel symbole est actif (les 3 premiers pour TS, S, PS)
                const isTS = moyenneGenerale >= 16;
                const isS = moyenneGenerale >= 12 && moyenneGenerale < 16;
                const isPS = moyenneGenerale >= 8 && moyenneGenerale < 12;
                const isEmoji4 = moyenneGenerale < 8 || moyenneGenerale === 0;
                
                return (
                  <>
                    {/* Emoji 1: 🌟 (TS - Très Satisfaisant) */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isTS ? 'bg-green-300 border-4 border-green-700 shadow-lg scale-125 ring-2 ring-green-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                    }`}>
                      <span className={`text-2xl ${isTS ? 'filter-none' : 'grayscale opacity-60'}`}>🌟</span>
                    </div>
                    {/* Emoji 2: 😊 (S - Satisfaisant) */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isS ? 'bg-yellow-300 border-4 border-yellow-700 shadow-lg scale-125 ring-2 ring-yellow-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                    }`}>
                      <span className={`text-2xl ${isS ? 'filter-none' : 'grayscale opacity-60'}`}>😊</span>
                    </div>
                    {/* Emoji 3: 😐 (PS - Passable Satisfaisant) */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isPS ? 'bg-orange-300 border-4 border-orange-700 shadow-lg scale-125 ring-2 ring-orange-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                    }`}>
                      <span className={`text-2xl ${isPS ? 'filter-none' : 'grayscale opacity-60'}`}>😐</span>
                    </div>
                    {/* Emoji 4: 😞 (Insuffisant / Non évalué) */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isEmoji4 ? 'bg-red-300 border-4 border-red-700 shadow-lg scale-125 ring-2 ring-red-400' : 'bg-gray-200 border-2 border-gray-500 opacity-40'
                    }`}>
                      <span className={`text-2xl ${isEmoji4 ? 'filter-none' : 'grayscale opacity-60'}`}>😞</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bouton pour passer à la page 2 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setCurrentBulletinPage(2)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold"
          >
            <span>Page Suivante</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Fonction de rendu pour le tableau PRIMAIRE (gère la pagination)
  const renderPrimaireTable = () => {
    // Si on est sur la page 2, afficher la page 2 (symboles mérite et recommandations)
    if (currentBulletinPage === 2) {
      return renderPrimairePage2();
    }

    // Sinon, afficher la page 1 (tableau détaillé avec CM/CP)
    return renderPrimairePage1();
  };

  // Fonction de rendu complète pour le 1ER CYCLE (même structure que primaire: 2 cartes bleues avec carte élève entre)
  const renderPremierCycleComplete = () => {
    const evaluationPeriod = getEvaluationPeriod();
    const evaluationName = getEvaluationName();
    
    // Obtenir le nom de l'évaluation pour l'affichage dynamique
    const evaluationDisplayName = selectedPeriodType === 'evaluation' && selectedEvaluation
      ? evaluationName
      : 'Evaluation certificative';
    
    // Obtenir l'abréviation de l'évaluation
    let evaluationAbbr = '';
    if (selectedPeriodType === 'evaluation' && selectedEvaluation) {
      evaluationAbbr = selectedEvaluation.toUpperCase();
    }

    return (
      <div className="mb-8 space-y-6">
        {/* Carte d'informations de l'élève - AU-DESSUS de la première carte bleue */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Informations de l'élève</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* N° Educmaster */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IdCard className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">N° Educmaster</span>
                </div>
                <p className="text-gray-900 font-medium text-sm leading-tight font-mono">{bulletinData.eleve.numeroEducmaster}</p>
              </div>

              {/* Nom et Prénoms */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Nom et Prénoms</span>
                </div>
                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.nom} {bulletinData.eleve.prenom}</p>
              </div>
              
              {/* Classe */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Classe</span>
                </div>
                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.classe}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header bleu avec logos et informations de l'école - Première carte bleue */}
        <div className="bg-blue-700 text-white p-6 rounded-xl mb-4 shadow-xl border border-blue-800">
          <div className="flex items-start justify-between gap-6">
            {/* Logo MESTFP à gauche */}
            <div className="flex-shrink-0">
              <img 
                src={getMinistryLogo()} 
                alt={getMinistryName()} 
                className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Informations centrales */}
            <div className="flex-1 text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
              <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
              <div className="border-t border-white/30 my-2"></div>
              <h3 className="text-xl font-bold tracking-wide">
                {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || 'Nom de l\'établissement')}
              </h3>
              {schoolSettings.abbreviation && (
                <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
              )}
              {schoolSettings.motto && (
                <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
              )}
              <div className="border-t border-white/30 my-2"></div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                {schoolSettings.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.address}</span>
                    {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                    {schoolSettings.department && <span>, {schoolSettings.department}</span>}
                  </div>
                )}
                {schoolSettings.primaryPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryPhone}</span>
                    {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
                  </div>
                )}
                {schoolSettings.primaryEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryEmail}</span>
                  </div>
                )}
                {schoolSettings.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.website}</span>
                  </div>
                )}
              </div>
              <p className="text-blue-100 text-sm font-semibold mt-2">
                Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
              </p>
            </div>

            {/* Logo de l'école à droite */}
            <div className="flex-shrink-0">
              {schoolSettings.logo ? (
                <img 
                  src={schoolSettings.logo} 
                  alt="Logo de l'école" 
                  className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deuxième carte bleue avec informations d'évaluation et bouton Imprimer ENSEMBLE */}
        <div className="mb-6">
          <div className="bg-blue-700 text-white p-6 rounded-xl shadow-xl border border-blue-800">
            <div className="flex items-center justify-between">
              {/* Informations d'évaluation au centre */}
              <div className="flex-1 text-center">
                {selectedPeriodType === 'evaluation' && selectedEvaluation ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1">{evaluationDisplayName}</h3>
                    <p className="text-blue-100 text-sm">
                      Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                    </p>
                  </>
                ) : selectedPeriodType === 'trimestre' ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1">BULLETIN DE NOTES - {bulletinData.trimestre || 'Trimestre'}</h3>
                    <p className="text-blue-100 text-sm">
                      Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-1">BULLETIN D'ÉVALUATION</h3>
                    <p className="text-blue-100 text-sm">
                      Mois de ........................
                    </p>
                  </>
                )}
              </div>
              
              {/* Bouton Imprimer à droite */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors shadow-md border border-blue-900"
                >
                  <Print className="h-5 w-5" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des notes */}
        {renderPremierCycleTable(false)}
      </div>
    );
  };

  // Fonction de rendu pour le tableau 1ER CYCLE (format classique avec EM1, EM2, EC)
  const renderPremierCycleTable = (showHeader: boolean = true) => {
    return (
      <div className="mb-8">
        {showHeader && (
          <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Détail des Notes par Matière
          </h4>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Matières
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  EM1
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  EM2
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  EC
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  Moyenne
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  Appréciation
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Observations
                </th>
              </tr>
            </thead>
            <tbody>
              {bulletinData.notes.map((note: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                    {note.matiere}
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center text-sm text-gray-700">
                    {note.EM1 > 0 ? note.EM1.toFixed(2) : '-'}
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center text-sm text-gray-700">
                    {note.EM2 > 0 ? note.EM2.toFixed(2) : '-'}
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center text-sm text-gray-700">
                    {note.EC > 0 ? note.EC.toFixed(2) : '-'}
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getAppreciationColor(note.moyenne)}`}>
                      {note.moyenne > 0 ? note.moyenne.toFixed(2) : 'Non évalué'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center text-sm">
                    <span className="flex items-center justify-center space-x-1">
                      <span className="text-lg">{getAppreciationEmoji(note.moyenne)}</span>
                      <span className="font-medium">{note.appreciation}</span>
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    {note.observations}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <td colSpan={4} className="border border-gray-200 px-4 py-4 text-right text-sm font-bold text-gray-900">
                  MOYENNE GÉNÉRALE:
                </td>
                <td className="border border-gray-200 px-3 py-4 text-center">
                  <span className={`px-4 py-2 rounded-lg text-lg font-bold ${getAppreciationColor(bulletinData.moyenneGenerale)}`}>
                    {bulletinData.moyenneGenerale > 0 ? bulletinData.moyenneGenerale.toFixed(2) + '/20' : 'Non évalué'}
                  </span>
                </td>
                <td className="border border-gray-200 px-3 py-4 text-center">
                  <span className="flex items-center justify-center space-x-2 text-lg">
                    <span>{getAppreciationEmoji(bulletinData.moyenneGenerale)}</span>
                    <span className="font-semibold">{bulletinData.appreciation}</span>
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-4 text-sm font-medium text-gray-900">
                  Rang: {formatRang(bulletinData.eleve.rang, bulletinData.eleve.sexe)}/{bulletinData.eleve.effectif}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Fonction de rendu complète pour le 2ND CYCLE (même structure: carte élève au-dessus, 2 cartes bleues)
  const renderSecondCycleComplete = () => {
    const evaluationPeriod = getEvaluationPeriod();
    const evaluationName = getEvaluationName();
    
    // Obtenir le nom de l'évaluation pour l'affichage dynamique
    const evaluationDisplayName = selectedPeriodType === 'evaluation' && selectedEvaluation
      ? evaluationName
      : 'Evaluation certificative';
    
    // Obtenir l'abréviation de l'évaluation
    let evaluationAbbr = '';
    if (selectedPeriodType === 'evaluation' && selectedEvaluation) {
      evaluationAbbr = selectedEvaluation.toUpperCase();
    }

    return (
      <div className="mb-8 space-y-6">
        {/* Carte d'informations de l'élève - AU-DESSUS de la première carte bleue */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Informations de l'élève</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* N° Educmaster */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IdCard className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">N° Educmaster</span>
                </div>
                <p className="text-gray-900 font-medium text-sm leading-tight font-mono">{bulletinData.eleve.numeroEducmaster}</p>
              </div>

              {/* Nom et Prénoms */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Nom et Prénoms</span>
                </div>
                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.nom} {bulletinData.eleve.prenom}</p>
              </div>
              
              {/* Classe */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Classe</span>
                </div>
                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.classe}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header bleu avec logos et informations de l'école - Première carte bleue */}
        <div className="bg-blue-700 text-white p-6 rounded-xl mb-4 shadow-xl border border-blue-800">
          <div className="flex items-start justify-between gap-6">
            {/* Logo MESTFP à gauche */}
            <div className="flex-shrink-0">
              <img 
                src={getMinistryLogo()} 
                alt={getMinistryName()} 
                className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Informations centrales */}
            <div className="flex-1 text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
              <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
              <div className="border-t border-white/30 my-2"></div>
              <h3 className="text-xl font-bold tracking-wide">
                {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || 'Nom de l\'établissement')}
              </h3>
              {schoolSettings.abbreviation && (
                <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
              )}
              {schoolSettings.motto && (
                <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
              )}
              <div className="border-t border-white/30 my-2"></div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                {schoolSettings.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.address}</span>
                    {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                    {schoolSettings.department && <span>, {schoolSettings.department}</span>}
                  </div>
                )}
                {schoolSettings.primaryPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryPhone}</span>
                    {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
                  </div>
                )}
                {schoolSettings.primaryEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.primaryEmail}</span>
                  </div>
                )}
                {schoolSettings.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-200" />
                    <span>{schoolSettings.website}</span>
                  </div>
                )}
              </div>
              <p className="text-blue-100 text-sm font-semibold mt-2">
                Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
              </p>
            </div>

            {/* Logo de l'école à droite */}
            <div className="flex-shrink-0">
              {schoolSettings.logo ? (
                <img 
                  src={schoolSettings.logo} 
                  alt="Logo de l'école" 
                  className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deuxième carte bleue avec informations d'évaluation et bouton Imprimer ENSEMBLE */}
        <div className="mb-6">
          <div className="bg-blue-700 text-white p-6 rounded-xl shadow-xl border border-blue-800">
            <div className="flex items-center justify-between">
              {/* Informations d'évaluation au centre */}
              <div className="flex-1 text-center">
                {selectedPeriodType === 'evaluation' && selectedEvaluation ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1">{evaluationDisplayName}</h3>
                    <p className="text-blue-100 text-sm">
                      Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                    </p>
                  </>
                ) : selectedPeriodType === 'trimestre' ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1">BULLETIN DE NOTES - {bulletinData.trimestre || 'Trimestre'}</h3>
                    <p className="text-blue-100 text-sm">
                      Mois de <strong>{evaluationPeriod.month}</strong> <strong>{evaluationPeriod.year}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-1">BULLETIN D'ÉVALUATION</h3>
                    <p className="text-blue-100 text-sm">
                      Mois de ........................
                    </p>
                  </>
                )}
              </div>
              
              {/* Bouton Imprimer à droite */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors shadow-md border border-blue-900"
                >
                  <Print className="h-5 w-5" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des notes */}
        {renderSecondCycleTable(false)}
      </div>
    );
  };

  // Fonction de rendu pour le tableau 2ND CYCLE (format avec coefficients et mentions)
  const renderSecondCycleTable = (showHeader: boolean = true) => {
    // Calculer la moyenne pondérée avec coefficients
    const calculateWeightedAverage = () => {
      let totalPoints = 0;
      let totalCoeff = 0;
      bulletinData.notes.forEach((note: any) => {
        const coeff = subjects.find((s: any) => s.name === note.matiere)?.coefficient || 1;
        if (note.moyenne > 0) {
          totalPoints += note.moyenne * coeff;
          totalCoeff += coeff;
        }
      });
      return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
    };
    const moyennePonderee = calculateWeightedAverage();
    const mention = getMention(moyennePonderee);

    return (
      <div className="mb-8">
        {showHeader && (
          <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Détail des Notes par Matière (avec Coefficients)
          </h4>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Matières
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  Coeff.
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  EM1
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  EM2
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  EC
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  Moyenne
                </th>
                <th className="border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                  Appréciation
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Observations
                </th>
              </tr>
            </thead>
            <tbody>
              {bulletinData.notes.map((note: any, index: number) => {
                const coeff = subjects.find((s: any) => s.name === note.matiere)?.coefficient || 1;
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                      {note.matiere}
                    </td>
                    <td className="border border-gray-200 px-3 py-3 text-center text-sm font-bold text-gray-700">
                      {coeff}
                    </td>
                    <td className="border border-gray-200 px-3 py-3 text-center text-sm text-gray-700">
                      {note.EM1 > 0 ? note.EM1.toFixed(2) : '-'}
                    </td>
                    <td className="border border-gray-200 px-3 py-3 text-center text-sm text-gray-700">
                      {note.EM2 > 0 ? note.EM2.toFixed(2) : '-'}
                    </td>
                    <td className="border border-gray-200 px-3 py-3 text-center text-sm text-gray-700">
                      {note.EC > 0 ? note.EC.toFixed(2) : '-'}
                    </td>
                    <td className="border border-gray-200 px-3 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getAppreciationColor(note.moyenne)}`}>
                        {note.moyenne > 0 ? note.moyenne.toFixed(2) : 'Non évalué'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-3 py-3 text-center text-sm">
                      <span className="flex items-center justify-center space-x-1">
                        <span className="text-lg">{getAppreciationEmoji(note.moyenne)}</span>
                        <span className="font-medium">{note.appreciation}</span>
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      {note.observations}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <td colSpan={5} className="border border-gray-200 px-4 py-4 text-right text-sm font-bold text-gray-900">
                  MOYENNE GÉNÉRALE PONDÉRÉE:
                </td>
                <td className="border border-gray-200 px-3 py-4 text-center">
                  <span className={`px-4 py-2 rounded-lg text-lg font-bold ${getAppreciationColor(moyennePonderee)}`}>
                    {moyennePonderee > 0 ? moyennePonderee.toFixed(2) + '/20' : 'Non évalué'}
                  </span>
                </td>
                <td colSpan={2} className="border border-gray-200 px-4 py-4 text-center text-sm font-bold text-gray-900">
                  MENTION: <span className={`${getAppreciationColor(moyennePonderee)} px-3 py-1 rounded-lg`}>{mention}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="border border-gray-200 px-4 py-4 text-right text-sm font-bold text-gray-900">
                  RANG:
                </td>
                <td colSpan={3} className="border border-gray-200 px-4 py-4 text-center text-sm font-medium text-gray-900">
                  {formatRang(bulletinData.eleve.rang, bulletinData.eleve.sexe)}/{bulletinData.eleve.effectif}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header moderne avec glassmorphism */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Génération des Bulletins
                </h1>
                <p className="text-gray-600 mt-1">Gestion moderne et professionnelle des bulletins de notes</p>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white/70 hover:bg-white/90 text-gray-700 rounded-lg border border-gray-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {showFilters ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
              </button>
              
            <button 
              onClick={handlePreview}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </button>
              
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
                {isGenerating ? 'Génération...' : 'PDF'}
            </button>
          </div>
        </div>
                    </div>
                  </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-600" />
                  Filtres de sélection
                </h3>
                <div className="flex items-center space-x-2">
                <button
                    onClick={() => {
                      setSelectedLevel('');
                      setSelectedClass('');
                      setSelectedClassName('');
                      setSelectedStudent('');
                      setSelectedPeriodType('');
                      setSelectedEvaluation('');
                      setSelectedQuarter('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Réinitialiser
                </button>
              </div>
            </div>

              {/* Grille de filtres moderne */}
              <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedPeriodType === 'evaluation' ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-4`}>
                {/* Année Scolaire */}
                <div>
                  <AcademicYearSelector
                    moduleName="bulletins"
                    className="w-full"
                    onChange={(yearId) => {
                      setSelectedAcademicYear(yearId);
                      console.log('Année scolaire sélectionnée:', yearId);
                    }}
                  />
                </div>

                {/* Trimestre */}
                <div>
                  <QuarterSelector
                    moduleName="bulletins"
                    className="w-full"
                    academicYearId={selectedAcademicYear}
                    onChange={(quarterId) => {
                      setSelectedQuarter(quarterId);
                      console.log('Trimestre sélectionné:', quarterId);
                    }}
                  />
                </div>

                {/* Niveau */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Niveau scolaire
                  </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            >
                    <option value="">Sélectionner un niveau</option>
              <option value="maternelle">Maternelle</option>
              <option value="primaire">Primaire</option>
              <option value="1er_cycle">1er Cycle Secondaire</option>
              <option value="2nd_cycle">2nd Cycle Secondaire</option>
            </select>
          </div>

                {/* Classe */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Classe
                  </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const classId = e.target.value;
                const className = classes.find(c => c.id === classId)?.name || '';
                setSelectedClass(classId);
                setSelectedClassName(className);
                setSelectedStudent(''); // Réinitialiser la sélection d'étudiant
              }}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              disabled={!selectedLevel}
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

                {/* Élève */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Élève
                  </label>
            <select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                console.log('Élève sélectionné:', e.target.value);
              }}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              disabled={!selectedClass || students.length === 0}
            >
              <option value="">Sélectionner un élève</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.lastName} {student.firstName} {student.registrationNumber ? `(${student.registrationNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

                {/* Type de période */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Type de période
                  </label>
            <select
              value={selectedPeriodType}
              onChange={(e) => {
                setSelectedPeriodType(e.target.value);
                if (e.target.value !== 'evaluation') {
                  setSelectedEvaluation(''); // Réinitialiser l'évaluation si on change de type
                }
              }}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            >
                    <option value="">Sélectionner un type</option>
              <option value="evaluation">Évaluation</option>
              <option value="trimestre">Trimestre</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>

                {/* Évaluation (si type de période est "Évaluation") */}
                {selectedPeriodType === 'evaluation' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                      Évaluation
            </label>
              <select
                value={selectedEvaluation}
                onChange={(e) => setSelectedEvaluation(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                      disabled={!selectedLevel}
                    >
                      {getEvaluationOptions().map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
              </select>
                  </div>
                )}
            </div>

              {/* Bouton de génération */}
              <div className="mt-6 flex justify-end">
            <button 
              onClick={handleGenerateAll}
              disabled={isGenerating || !selectedClass || !selectedQuarter}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {isGenerating ? 'Génération en cours...' : 'Générer les bulletins'}
            </button>
          </div>
        </div>
      </div>
        )}

        {/* Contenu principal */}
        <div className="space-y-6">
            {/* Information sur le nombre d'élèves */}
            {selectedClass && students.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Classe sélectionnée:</span> {selectedClassName} 
                  <span className="ml-4 font-semibold">Nombre d'élèves:</span> {students.length} 
                  <span className="ml-4 text-blue-600 font-medium">({students.length} {students.length === 1 ? 'bulletin à générer' : 'bulletins à générer'})</span>
                </p>
                  </div>
            )}

            {/* Zone d'aperçu du bulletin */}
      {bulletinData ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 overflow-hidden">
                {/* En-tête du bulletin moderne */}
                <div className="bg-blue-700 text-white p-6 rounded-xl shadow-xl border border-blue-800">
                  <div className="flex items-start justify-between gap-6">
                    {/* Logo MEMP à gauche */}
                    <div className="flex-shrink-0">
                      <img 
                        src={memp} 
                        alt="Ministère de l'Enseignement Primaire et Secondaire" 
                        className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
            </div>

                    {/* Informations centrales */}
                    <div className="flex-1 text-center space-y-2">
                      <h2 className="text-2xl font-bold tracking-wide uppercase">RÉPUBLIQUE DU BÉNIN</h2>
                      <p className="text-blue-100 text-sm font-medium">{getMinistryName()}</p>
                      <div className="border-t border-white/30 my-2"></div>
                      <h3 className="text-xl font-bold tracking-wide">
                        {schoolSettingsLoading ? 'Chargement...' : (schoolSettings.name || bulletinData.etablissement || 'Nom de l\'établissement')}
                      </h3>
                      {schoolSettings.abbreviation && (
                        <p className="text-blue-100 text-sm font-semibold">({schoolSettings.abbreviation})</p>
                      )}
                      {schoolSettings.motto && (
                        <p className="text-blue-100 text-xs italic mt-1">{schoolSettings.motto}</p>
                      )}
                      <div className="border-t border-white/30 my-2"></div>
                      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-blue-100">
                        {schoolSettings.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-blue-200" />
                            <span>{schoolSettings.address}</span>
                            {schoolSettings.commune && <span>- {schoolSettings.commune}</span>}
                            {schoolSettings.department && <span>, {schoolSettings.department}</span>}
          </div>
                        )}
                        {schoolSettings.primaryPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-blue-200" />
                            <span>{schoolSettings.primaryPhone}</span>
                            {schoolSettings.secondaryPhone && <span> / {schoolSettings.secondaryPhone}</span>}
        </div>
                        )}
                        {schoolSettings.primaryEmail && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-blue-200" />
                            <span>{schoolSettings.primaryEmail}</span>
                  </div>
                        )}
                        {schoolSettings.website && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-blue-200" />
                            <span>{schoolSettings.website}</span>
            </div>
                        )}
          </div>
                      <p className="text-blue-100 text-sm font-semibold mt-2">
                        Année Scolaire: {getAcademicYearLabel(displayAcademicYear) || (academicYearLoading ? 'Chargement...' : 'Non définie')}
                      </p>
        </div>

                    {/* Logo de l'école à droite */}
                    <div className="flex-shrink-0">
                      {schoolSettings.logo ? (
                        <img 
                          src={schoolSettings.logo} 
                          alt="Logo de l'école" 
                          className="h-24 w-24 object-contain bg-white rounded-lg p-2 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                          <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                      )}
            </div>
        </div>
      </div>

        {/* Titre du bulletin - masqué pour maternelle, primaire, 1er cycle et 2nd cycle car déjà dans leurs sections respectives */}
        {!['maternelle', 'primaire', '1er_cycle', '2nd_cycle'].includes(selectedLevel) && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-center text-gray-900">
                              {selectedPeriodType === 'evaluation' && selectedEvaluation ? (
                                `BULLETIN D'ÉVALUATION - ${getEvaluationOptions().find(opt => opt.id === selectedEvaluation)?.label || selectedEvaluation.toUpperCase()}`
                              ) : (
                                `BULLETIN DE NOTES - ${bulletinData.trimestre}`
                              )}
          </h3>
        </div>
        )}

                <div className="p-8">
          {/* Informations élève - format moderne pour maternelle, primaire (déjà dans leurs renderXTable), masqué pour 1er cycle et 2nd cycle car dans renderXCycleComplete */}
                  {!['1er_cycle', '2nd_cycle'].includes(selectedLevel) && (
                    <>
                      {selectedLevel === 'maternelle' ? (
                        <div className="mb-6">
                          {/* Carte unique avec toutes les informations */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-5 w-5 text-blue-600" />
                  </div>
                              <span className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Informations de l'élève</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* N° Educmaster - En premier */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <IdCard className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">N° Educmaster</span>
                                </div>
                                <p className="text-gray-900 font-medium text-sm leading-tight font-mono">{bulletinData.eleve.numeroEducmaster}</p>
                </div>

                              {/* Nom et Prénoms */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Nom et Prénoms</span>
                  </div>
                                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.nom} {bulletinData.eleve.prenom}</p>
                </div>
                              
                              {/* Classe */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Classe</span>
                                </div>
                                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.classe}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          {/* Carte unique avec toutes les informations - même style que maternelle */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <span className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Informations de l'élève</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* N° Educmaster - En premier */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <IdCard className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">N° Educmaster</span>
                                </div>
                                <p className="text-gray-900 font-medium text-sm leading-tight font-mono">{bulletinData.eleve.numeroEducmaster}</p>
              </div>

                              {/* Nom et Prénoms */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Nom et Prénoms</span>
            </div>
                                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.nom} {bulletinData.eleve.prenom}</p>
          </div>

                              {/* Classe */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Classe</span>
                                </div>
                                <p className="text-gray-900 font-medium text-sm leading-tight">{bulletinData.eleve.classe}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tableau des notes - Format adapté selon le niveau */}
                  {selectedLevel === 'maternelle' && renderMaternelleTable()}
                  {selectedLevel === 'primaire' && renderPrimaireTable()}
                  {selectedLevel === '1er_cycle' && renderPremierCycleComplete()}
                  {selectedLevel === '2nd_cycle' && renderSecondCycleComplete()}
                  {!['maternelle', 'primaire', '1er_cycle', '2nd_cycle'].includes(selectedLevel) && renderPremierCycleTable()}

          {/* Assiduité et observations - Masqué pour maternelle et primaire */}
                  {selectedLevel !== 'maternelle' && selectedLevel !== 'primaire' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Assiduité
              </h4>
                      <div className="space-y-3 text-sm">
                        <p><span className="font-medium text-yellow-800">Jours de classe:</span> 
                          <span className="ml-2 text-gray-900">{bulletinData.assiduité.joursClasse}</span>
                        </p>
                        <p><span className="font-medium text-yellow-800">Jours de présence:</span> 
                          <span className="ml-2 text-gray-900">{bulletinData.assiduité.joursPresence}</span>
                        </p>
                        <p><span className="font-medium text-yellow-800">Absences:</span> 
                          <span className="ml-2 text-gray-900">{bulletinData.assiduité.absences}</span>
                        </p>
                        <p><span className="font-medium text-yellow-800">Retards:</span> 
                          <span className="ml-2 text-gray-900">{bulletinData.assiduité.retards}</span>
                        </p>
                        <p><span className="font-medium text-yellow-800">Taux de présence:</span> 
                  <span className="ml-2 font-bold text-yellow-700">
                    {((bulletinData.assiduité.joursPresence / bulletinData.assiduité.joursClasse) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-4">Observations et Recommandations</h4>
                      <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-purple-800">Observations:</span>
                          <p className="mt-2 text-gray-700 bg-white/50 p-3 rounded-lg">{bulletinData.observations}</p>
                </div>
                <div>
                  <span className="font-medium text-purple-800">Recommandations:</span>
                          <p className="mt-2 text-gray-700 bg-white/50 p-3 rounded-lg">{bulletinData.recommandations}</p>
                </div>
              </div>
            </div>
          </div>
                  )}

          {/* Signatures - Masquées pour maternelle et primaire car déjà dans renderMaternelleTable et renderPrimairePage2 */}
          {selectedLevel !== 'maternelle' && selectedLevel !== 'primaire' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            <div className="text-center">
                      <div className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-sm">
                        <h6 className="text-sm font-bold text-gray-900 mb-2">ANALYSE DES RÉSULTATS</h6>
                <div className="text-left space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">Enseignant(e)</p>
                    <div className="border-b border-gray-300 h-8 flex items-end">
                              <p className="text-xs text-gray-600">Signature du titulaire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
                      <div className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-sm">
                <div className="text-left space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">Parent</p>
                    <div className="border-b border-gray-300 h-8 flex items-end">
                      <p className="text-xs text-gray-600">Signature et nom du parent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-2">VISA du/de la Directeur/trice</p>
                <p className="text-sm font-semibold text-indigo-700 mb-3">{directeurName || 'Non défini'}</p>
                
                {/* Cachet rouge avec signature intégrée */}
                <div className="flex justify-center mt-4 mb-3">
                  <div className="school-stamp">
                    <svg width="160" height="160" viewBox="0 0 160 160" className="stamp-svg">
                      {/* Définitions des chemins courbes pour le texte */}
                      <defs>
                        {/* Chemin pour l'arc supérieur extérieur */}
                        <path id="path-top-outer-bulletin-2" d="M 25 80 A 55 55 0 0 1 135 80" fill="none"/>
                        
                        {/* Chemin pour l'arc inférieur extérieur */}
                        <path id="path-bottom-outer-bulletin-2" d="M 20 80 A 60 60 0 0 0 140 80" fill="none"/>
                      </defs>
                      
                      {/* Cercle extérieur */}
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#dc2626" strokeWidth="4"/>
                      
                      {/* Cercle intérieur */}
                      <circle cx="80" cy="80" r="45" fill="none" stroke="#dc2626" strokeWidth="2"/>
                      
                      {/* Texte courbé - Arc supérieur extérieur */}
                      <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.2px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <textPath href="#path-top-outer-bulletin-2" startOffset="0%" textAnchor="start">
                          {schoolSettingsLoading ? 'CHARGEMENT...' : (schoolSettings?.abbreviation || schoolSettings?.name || 'NOM ENTREPRISE').toUpperCase()}
                        </textPath>
                      </text>
                      
                      {/* Texte courbé - Arc inférieur extérieur */}
                      <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <textPath href="#path-bottom-outer-bulletin-2" startOffset="8%" textAnchor="start">
                          {schoolSettingsLoading ? 'CHARGEMENT...' : `* ${schoolSettings?.address || 'Adresse'} - Tél: ${schoolSettings?.primaryPhone || '(+000) 00 00 00 00'} *`.toUpperCase()}
                        </textPath>
                      </text>
                      
                      {/* Texte horizontal - niveau */}
                      <text x="80" y="75" textAnchor="middle" className="stamp-text-level" fill="#dc2626" style={{ fontSize: '7.5px', fontWeight: 600, letterSpacing: '0.2px' }}>
                        {(selectedLevel === 'maternelle' || selectedLevel === 'primaire') ? 'Maternelle & Primaire' : 'Secondaire'}
                      </text>
                      
                      {/* Texte central - titre */}
                      <text x="80" y="90" textAnchor="middle" className="stamp-text-center" fill="#dc2626" style={{ fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.3px' }}>
                        DIRECTEUR(TRICE)
                      </text>
                      
                      {/* Signature numérique du directeur intégrée dans le SVG */}
                      <text 
                        x="10" 
                        y="95" 
                        fill="#0000ff"
                        fillOpacity="0.7"
                        fontFamily="Brush Script MT, Lucida Handwriting, cursive"
                        fontSize="45"
                        fontWeight="normal"
                        transform="rotate(-15 10 95)"
                        letterSpacing="1px"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                      >
                        {directeurName ? directeurName.split(' ').slice(-2, -1)[0] || directeurName.split(' ')[directeurName.split(' ').length - 1] : 'Signature'}
                      </text>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Signature et cachet</p>
              </div>
            </div>
          </div>
          )}

                  <div className="text-center mt-8 text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
            Bulletin généré le {new Date().toLocaleDateString('fr-FR')} - Academia Hub Module Examens
                  </div>
          </div>
        </div>
      ) : (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-12">
          <div className="text-center">
                  {!isInitialized ? (
                    <>
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Initialisation du composant...</h3>
                      <p className="text-gray-600">Préparation de l'interface utilisateur</p>
                    </>
                  ) : isLoadingData ? (
                    <>
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Chargement des données...</h3>
                      <p className="text-gray-600">Récupération des données depuis la base de données...</p>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-6">
                        <FileText className="h-8 w-8 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun bulletin à afficher</h3>
                      <p className="text-gray-600 mb-4">
                        Sélectionnez une classe, un type de période et un trimestre pour afficher le bulletin
                      </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                          <div className="flex items-center">
                            <Info className="h-5 w-5 text-blue-600 mr-2" />
                          <div className="text-sm text-blue-800">
                            {!selectedLevel && "1. Sélectionnez d'abord un niveau d'enseignement. "}
                            {!selectedClass && selectedLevel && "2. Sélectionnez une classe. "}
                            {!selectedQuarter && selectedClass && "3. Sélectionnez un trimestre. "}
                            {selectedClass && selectedQuarter && isLoadingData && "Chargement des données en cours..."}
                            {selectedClass && selectedQuarter && !isLoadingData && students.length === 0 && "⚠️ Aucun étudiant trouvé pour cette classe."}
                            {selectedClass && selectedQuarter && !isLoadingData && students.length > 0 && subjects.length === 0 && "⚠️ Aucune matière trouvée pour cette classe."}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Modal de notification aux parents */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Send className="h-6 w-6 mr-3 text-purple-600" />
                  Notifications aux Parents d'Élèves
                </h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Envoi des bulletins par email et notifications SMS/WhatsApp
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Liste des parents */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Contacts Parents ({students.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {students.map((student: any) => (
                      <div key={student.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.lastName} {student.firstName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Parent: {student.parent.nom}
                            </p>
                            <p className="text-xs text-gray-500">
                              📧 {student.parent.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              📱 {student.parent.whatsapp}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aperçu du message */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Aperçu du Message SMS/WhatsApp
                  </h4>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm">
                      <p className="font-semibold text-green-800 mb-2">📚 Academia Hub - Bulletin T1</p>
                      <p className="text-green-700">
                        Cher(e) Parent, voici les résultats de {bulletinData?.eleve.nom} {bulletinData?.eleve.prenom}:
                      </p>
                      <p className="text-green-700 mt-1">
                        • Moyenne: {bulletinData?.moyenneGenerale.toFixed(2)}/20 ({bulletinData?.appreciation})
                      </p>
                      <p className="text-green-700">
                        • Rang: {formatRang(bulletinData?.eleve.rang, bulletinData?.eleve.sexe)}/{bulletinData?.eleve.effectif}
                      </p>
                      <p className="text-green-700">
                        • Observation: {bulletinData?.observations}
                      </p>
                      <p className="text-green-700 mt-2">
                        Bulletin complet envoyé par email. 📧
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-3">Options d'envoi</h5>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2 rounded" />
                        <span className="text-blue-800">Email avec bulletin PDF</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2 rounded" />
                        <span className="text-blue-800">SMS de notification</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2 rounded" />
                        <span className="text-blue-800">Message WhatsApp</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 border-t border-gray-200/50 bg-gray-50/50">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSendNotifications}
                disabled={isSendingNotifications}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
              >
                {isSendingNotifications ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                    Envoi en cours...
                  </>
                ) : (
                  `Envoyer à ${students.length} parents`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-blue-600" />
                  Aperçu du Bulletin - {bulletinData?.eleve.nom} {bulletinData?.eleve.prenom}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Print className="h-4 w-4 mr-1" />
                    Imprimer
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Contenu du bulletin en aperçu - version simplifiée */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-6 mb-4 p-4 bg-blue-700 text-white rounded-lg shadow-lg border border-blue-800">
                  {/* Logo MEMP à gauche */}
                  <div className="flex-shrink-0">
                    <img 
                      src={getMinistryLogo()} 
                      alt={getMinistryName()} 
                      className="h-16 w-16 object-contain bg-white rounded-lg p-1 shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Informations centrales */}
                  <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold uppercase tracking-wide">RÉPUBLIQUE DU BÉNIN</h2>
                    <p className="text-blue-100 text-sm">{getMinistryName()}</p>
                    <div className="border-t border-white/30 my-2"></div>
                    <h3 className="text-lg font-bold mt-2">{schoolSettings.name || bulletinData?.etablissement}</h3>
                    {schoolSettings.abbreviation && (
                      <p className="text-blue-100 text-sm">({schoolSettings.abbreviation})</p>
                    )}
                    <p className="text-blue-100 text-sm mt-1">Année Scolaire: {currentAcademicYear?.label || (academicYearLoading ? 'Chargement...' : 'Non définie')}</p>
                  </div>
                  
                  {/* Logo de l'école à droite */}
                  <div className="flex-shrink-0">
                    {schoolSettings.logo ? (
                      <img 
                        src={schoolSettings.logo} 
                        alt="Logo de l'école" 
                        className="h-16 w-16 object-contain bg-white rounded-lg p-1 shadow-md"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="text-lg font-bold mt-4">
                  BULLETIN DE NOTES - {bulletinData?.trimestre}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p><strong>Nom et Prénoms:</strong> {bulletinData?.eleve.nom} {bulletinData?.eleve.prenom}</p>
                  <p><strong>N° Educmaster:</strong> {bulletinData?.eleve.numeroEducmaster}</p>
                  <p><strong>Classe:</strong> {bulletinData?.eleve.classe}</p>
                </div>
                <div>
                  <p><strong>Effectif:</strong> {bulletinData?.eleve.effectif} élèves</p>
                  <p><strong>Rang:</strong> {formatRang(bulletinData?.eleve.rang, bulletinData?.eleve.sexe)}</p>
                  <p><strong>Moyenne générale:</strong> {bulletinData?.moyenneGenerale.toFixed(2)}/20</p>
                </div>
              </div>

              {/* Tableau simplifié */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 text-left">Matières</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">EM1</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">EM2</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">EC</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">Moyenne</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">Appréciation</th>
                        </tr>
                      </thead>
                      <tbody>
                    {bulletinData?.notes.map((note: any, index: number) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-2 py-2">{note.matiere}</td>
                            <td className="border border-gray-300 px-2 py-2 text-center">{note.EM1.toFixed(2)}</td>
                            <td className="border border-gray-300 px-2 py-2 text-center">{note.EM2.toFixed(2)}</td>
                            <td className="border border-gray-300 px-2 py-2 text-center">{note.EC.toFixed(2)}</td>
                            <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{note.moyenne.toFixed(2)}</td>
                            <td className="border border-gray-300 px-2 py-2 text-center">{note.appreciation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

              <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p>Bulletin généré le {new Date().toLocaleDateString('fr-FR')}</p>
                <p>Academia Hub - Module Examens</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de notifications */}
      {showNotifications && (
        <NotificationPanel
          onClose={() => {
            setShowNotifications(false);
            setSelectedBulletin(null);
          }}
          context={{
            type: 'bulletin',
            data: selectedBulletin
          }}
        />
      )}
    </div>
  );
}