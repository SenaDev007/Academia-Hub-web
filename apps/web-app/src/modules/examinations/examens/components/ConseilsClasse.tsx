import { useState, useEffect, useCallback, useRef } from 'react';
import { useSchoolSettings } from '../../../hooks/useSchoolSettings';
import { apiService } from '../services/api';
import { examDatabaseService, Student, Class, GradeRecord } from '../services/databaseService';
import ConseilPVModal from './ConseilPVModal';
import { 
  Users, 
  FileText, 
  CheckCircle,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  Download,
  Eye,
  RefreshCw,
  Printer as Print,
  Edit3,
  Save,
  X,
  ThumbsUp,
  UserCheck,
  GraduationCap,
  Users2,
  User,
  BarChart3,
  TrendingUp,
  Star,
  Shield,
  Calendar
} from 'lucide-react';
import AcademicYearSelector from '../../../components/common/AcademicYearSelector';
import QuarterSelector from '../../../components/common/QuarterSelector';
import { useAcademicYearState } from '../../../hooks/useAcademicYearState';
import { useQuarterState } from '../../../hooks/useQuarterState';

export function ConseilsClasse() {
  // Hooks pour la gestion des années scolaires et trimestres
  const {
    selectedAcademicYear,
    setSelectedAcademicYear
  } = useAcademicYearState('conseils-classe');

  const {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter
  } = useQuarterState('conseils-classe');

  // Hook pour les paramètres d'école
  const { settings: schoolSettings, loadSettings, loading: schoolSettingsLoading } = useSchoolSettings();

  // États pour les sélecteurs
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState('');
  
  // États pour les modals
  const [showPVModal, setShowPVModal] = useState(false);
  const [isGeneratingPV, setIsGeneratingPV] = useState(false);
  
  // États pour les données réelles
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [subjects, setSubjects] = useState<{id: string; name: string; coefficient?: number}[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{
    decision: string;
    observations: string;
    recommandations: string;
    assiduite: string;
    comportement: string;
  }>({
    decision: '',
    observations: '',
    recommandations: '',
    assiduite: '',
    comportement: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // États pour l'édition par évaluation
  const [editingEvaluationStudentId, setEditingEvaluationStudentId] = useState<string | null>(null);
  const [editingEvaluationData, setEditingEvaluationData] = useState<{
    decision: string;
    assiduité: string;
    comportement: string;
  }>({
    decision: '',
    assiduite: '',
    comportement: ''
  });
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);

  // États pour la section conseil
  const [councilData, setCouncilData] = useState({
    directeur: '',
    enseignantTitulaire: '',
    representantParents: '',
    delegueEleves: '',
    dateConseil: new Date().toISOString().split('T')[0]
  });

  // Nettoyer le localStorage au montage du composant
  useEffect(() => {
    // Nettoyer les données de conseil en cache
    localStorage.removeItem('councilData');
    localStorage.removeItem('representantParents');
    localStorage.removeItem('delegueEleves');
    console.log('🧹 Données de conseil en cache nettoyées');
  }, []);

  // Cleanup du timeout au démontage du composant
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Timer pour debounce de la sauvegarde
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isEditingCouncil, setIsEditingCouncil] = useState(false);
  
  // États pour le modal de succès
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    title: '',
    message: '',
    count: 0,
    type: 'save' // 'save', 'export', 'print'
  });
  
  // Service de base de données
  const dbService = examDatabaseService;

  const niveauxScolaires = [
    { id: 'maternelle', label: 'Maternelle' },
    { id: 'primaire', label: 'Primaire' },
    { id: '1er_cycle', label: '1er Cycle Secondaire' },
    { id: '2nd_cycle', label: '2nd Cycle Secondaire' }
  ];
  

  // Fonction pour charger les enseignants avec leurs affectations (même approche que le module Planning)
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
      
      // 3. Enrichir les enseignants avec leurs affectations (exactement comme dans usePlanningData)
      console.log('🔍 Étape 3: Enrichissement des enseignants...');
      const enrichedTeachers = teachersData.map((teacher: any) => {
        const teacherAssignments = assignmentsData.filter(assignment => assignment.teacher_id === teacher.id);
        const assignedClasses = teacherAssignments.map(a => a.class_name).filter(Boolean);
        const totalHours = teacherAssignments.reduce((sum, a) => sum + (a.hours_per_week || 0), 0);
        
        return {
          ...teacher,
          classes: assignedClasses, // Propriété 'classes' avec les noms des classes assignées
          hoursPerWeek: totalHours,
          mode: teacherAssignments.length > 0 ? teacherAssignments[0].mode : 'maternelle'
        };
      });
      
      console.log('✅ Enseignants enrichis:', enrichedTeachers.length);
      enrichedTeachers.forEach((teacher: any, index: number) => {
        console.log(`   ${index + 1}. ${teacher.firstName} ${teacher.lastName} - Classes: [${teacher.classes.join(', ')}]`);
      });
      
      setTeachers(enrichedTeachers);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des enseignants:', error);
      setTeachers([]);
    }
  }, []);

  // Fonction pour récupérer l'enseignant titulaire d'une classe (exactement comme dans le module Planning)
  const getClassTeacherName = useCallback((classId: string): string => {
    console.log('🔍 === DÉBUT getClassTeacherName ===');
    console.log('🔍 classId reçu:', classId);
    console.log('🔍 teachers disponibles:', teachers?.length || 0);
    console.log('🔍 classes disponibles:', classes?.length || 0);
    
    if (!teachers || !classes) {
      console.log('❌ getClassTeacherName: teachers ou classes manquants');
      return 'Non assigné';
    }
    
    // Trouver la classe pour vérifier son niveau
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) {
      console.log('❌ getClassTeacherName: classe non trouvée pour classId:', classId);
      return 'Non assigné';
    }
    
    console.log('🔍 Classe trouvée:', classObj.name, 'Niveau:', classObj.level);
    const level = classObj.level?.toLowerCase() || '';
    
    // Seulement pour maternelle et primaire (un seul enseignant par classe)
    if (!level.includes('maternelle') && !level.includes('primaire')) {
      console.log('❌ getClassTeacherName: niveau secondaire, pas d\'enseignant titulaire automatique');
      return 'Non assigné'; // Pour le secondaire, l'utilisateur doit définir le titulaire manuellement
    }
    
    console.log('🔍 Recherche de l\'enseignant pour la classe:', classObj.name);
    
    // Chercher dans les enseignants enrichis avec leurs affectations
    // Les enseignants ont une propriété 'classes' qui contient les classes assignées
    const assignedTeacher = teachers.find(teacher => {
      // Vérifier si l'enseignant a cette classe dans ses affectations
      const hasClass = teacher.classes && teacher.classes.includes(classObj.name);
      console.log(`🔍 Enseignant ${teacher.firstName} ${teacher.lastName} - Classes: [${teacher.classes?.join(', ')}] - Match: ${hasClass}`);
      return hasClass;
    });
    
    if (assignedTeacher) {
      const teacherName = `${assignedTeacher.firstName || ''} ${assignedTeacher.lastName || ''}`.trim() || assignedTeacher.name || 'Enseignant inconnu';
      console.log('✅ Enseignant titulaire trouvé:', teacherName);
      return teacherName;
    }
    
    console.log('⚠️ getClassTeacherName: Aucun enseignant trouvé pour la classe');
    return 'Non assigné';
  }, [teachers, classes]);

  // Fonction pour charger les classes selon le niveau et l'année académique
  const loadClasses = useCallback(async () => {
    if (!selectedAcademicYear || !selectedLevel) return;
    
    setIsLoading(true);
    try {
      const classesData = await dbService.getClasses({
        academicYearId: selectedAcademicYear,
        level: selectedLevel
      });
      setClasses(classesData);
      
      // Ne pas sélectionner automatiquement de classe
      // L'utilisateur doit choisir manuellement
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear, selectedLevel, dbService]);

  // Fonction pour charger les étudiants de la classe sélectionnée
  const loadStudents = useCallback(async () => {
    if (!selectedClassId || !selectedAcademicYear) return;
    
    setIsLoading(true);
    try {
      console.log('👥 Chargement des étudiants pour les conseils de classe...');
      
      // Utiliser la même approche que BordereauNotes : charger les étudiants via apiService
      const studentsResponse = await apiService.getEleves({
        classId: selectedClassId,
        academicYearId: selectedAcademicYear,
        status: 'active'
      });

      console.log('👥 Étudiants récupérés pour les conseils de classe:', studentsResponse);

      if (studentsResponse.data && studentsResponse.data.length > 0) {
        // Convertir les données en format Student
        const convertedStudents: Student[] = studentsResponse.data.map((student: any) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          registrationNumber: student.registrationNumber,
          gender: student.gender || 'M', // Valeur par défaut
          classId: student.classId,
          academicYearId: student.academicYearId,
          status: student.status || 'active',
          createdAt: student.createdAt || new Date().toISOString(),
          updatedAt: student.updatedAt || new Date().toISOString()
        }));
        
        setStudents(convertedStudents);
        console.log('👥 Étudiants convertis pour les conseils de classe:', convertedStudents);
      } else {
        setStudents([]);
        console.log('👥 Aucun étudiant trouvé pour les conseils de classe');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedAcademicYear]);

  // Fonction pour charger les matières
  const loadSubjects = useCallback(async () => {
    if (!selectedClassId || !selectedLevel) {
      setSubjects([]);
      return;
    }

    try {
      const response = await apiService.getMatieres({
        classId: selectedClassId,
        level: selectedLevel
      });
      
      if (response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des matières:', error);
      setSubjects([]);
    }
  }, [selectedClassId, selectedLevel]);

  // Fonction pour sauvegarder les données du conseil en BDD
  const saveCouncilData = useCallback(async (data: { parents?: string; delegate?: string; councilDate?: string }) => {
    if (!selectedLevel || !currentQuarter || !selectedAcademicYear) {
      console.log('❌ saveCouncilData: Données manquantes pour la sauvegarde');
      return;
    }

    try {
      console.log('💾 Sauvegarde des données du conseil:', data);
      
      // ID basé sur le niveau, l'année académique et le trimestre (pas la classe)
      const councilId = `council-${selectedLevel}-${selectedAcademicYear}-${currentQuarter.id}`;
      
      // Vérifier si un enregistrement existe déjà
      const existingData = await api.database.executeQuery(
        'SELECT * FROM council_data WHERE id = ?',
        [councilId]
      );

      if (existingData && existingData.length > 0) {
        // Mettre à jour l'enregistrement existant
        await api.database.executeQuery(
          `UPDATE council_data 
           SET parents = ?, delegate = ?, councilDate = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [data.parents || null, data.delegate || null, data.councilDate || null, councilId]
        );
        console.log('✅ Données du conseil mises à jour pour le niveau:', selectedLevel);
      } else {
        // Créer un nouvel enregistrement
        await api.database.executeQuery(
          `INSERT INTO council_data 
           (id, schoolId, level, academicYearId, quarterId, parents, delegate, councilDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            councilId,
            'school-1', // ID de l'école par défaut
            selectedLevel,
            selectedAcademicYear,
            currentQuarter.id,
            data.parents || null,
            data.delegate || null,
            data.councilDate || null
          ]
        );
        console.log('✅ Nouvelles données du conseil créées pour le niveau:', selectedLevel);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des données du conseil:', error);
    }
  }, [selectedLevel, currentQuarter, selectedAcademicYear]);

  // Fonction pour charger les données du conseil depuis la BDD
  const loadCouncilDataFromDB = useCallback(async () => {
    if (!selectedLevel || !currentQuarter || !selectedAcademicYear) {
      console.log('❌ loadCouncilDataFromDB: Données manquantes pour le chargement');
      return null;
    }

    try {
      console.log('📖 Chargement des données du conseil depuis la BDD pour le niveau:', selectedLevel);
      
      const councilId = `council-${selectedLevel}-${selectedAcademicYear}-${currentQuarter.id}`;
      
      const result = await api.database.executeQuery(
        'SELECT * FROM council_data WHERE id = ?',
        [councilId]
      );

      if (result && result.length > 0) {
        const councilData = result[0];
        console.log('✅ Données du conseil trouvées pour le niveau:', selectedLevel, councilData);
        return {
          parents: councilData.parents || '',
          delegate: councilData.delegate || '',
          councilDate: councilData.councilDate || ''
        };
      } else {
        console.log('ℹ️ Aucune donnée du conseil trouvée pour le niveau:', selectedLevel, 'utilisation des valeurs par défaut');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données du conseil:', error);
      return null;
    }
  }, [selectedLevel, currentQuarter, selectedAcademicYear]);

  // Fonction pour charger les données du conseil selon le niveau scolaire
  const loadCouncilData = useCallback(async () => {
    console.log('🔍 loadCouncilData appelé avec:', { selectedClassId, selectedLevel });
    if (!selectedClassId || !selectedLevel) {
      console.log('⚠️ loadCouncilData: selectedClassId ou selectedLevel manquant');
      return;
    }
    
    try {
      // Garantir que la liste des enseignants est chargée avant de poursuivre (nécessaire pour le cachet)
      if (!teachers || teachers.length === 0) {
        console.log('⌛ Aucun enseignant en mémoire, chargement en cours avant construction du cachet...');
        await loadTeachers();
        console.log('✅ Enseignants chargés:', teachers?.length || 0);
      }

      let directeur = '';
      let enseignantTitulaire = '';

      // Récupérer le directeur selon le niveau depuis les enseignants déjà chargés
      try {
        if (selectedLevel === 'maternelle' || selectedLevel === 'primaire') {
          // Directeur M&P depuis les enseignants chargés
          console.log('🔍 Recherche du Directeur M&P (POS-004) dans les enseignants chargés...');
          console.log('🔍 Nombre d\'enseignants disponibles:', teachers?.length || 0);
          
          const directeurMp = teachers?.find(teacher => teacher.positionId === 'POS-004');
          
          if (directeurMp) {
            directeur = `${directeurMp.gender || ''} ${directeurMp.firstName || ''} ${directeurMp.lastName || ''}`.trim();
            console.log('✅ Directeur M&P trouvé:', directeur);
          } else {
            console.log('❌ Aucun Directeur M&P trouvé dans les enseignants chargés');
            console.log('🔍 Positions disponibles:', teachers?.map(t => `${t.firstName} ${t.lastName} - ${t.positionId}`) || []);
          }
        } else if (selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle') {
          // Directeur secondaire depuis les enseignants chargés
          console.log('🔍 Recherche du Directeur Secondaire (POS-008) dans les enseignants chargés...');
          console.log('🔍 Nombre d\'enseignants disponibles:', teachers?.length || 0);
          
          const directeurSecondaire = teachers?.find(teacher => teacher.positionId === 'POS-008');
          
          if (directeurSecondaire) {
            directeur = `${directeurSecondaire.gender || ''} ${directeurSecondaire.firstName || ''} ${directeurSecondaire.lastName || ''}`.trim();
            console.log('✅ Directeur Secondaire trouvé:', directeur);
          } else {
            console.log('❌ Aucun Directeur Secondaire trouvé dans les enseignants chargés');
            console.log('🔍 Positions disponibles:', teachers?.map(t => `${t.firstName} ${t.lastName} - ${t.positionId}`) || []);
          }
        }
      } catch (hrError) {
        console.error('Erreur lors de la récupération du directeur:', hrError);
        // Valeur par défaut en cas d'erreur
        directeur = 'Non défini';
      }

      // Récupérer l'enseignant titulaire depuis les données chargées
      try {
        if (selectedLevel === 'maternelle' || selectedLevel === 'primaire') {
          // Utiliser la fonction getClassTeacherName pour récupérer l'enseignant titulaire
          enseignantTitulaire = getClassTeacherName(selectedClassId);
          console.log('👨‍🏫 Enseignant titulaire trouvé:', enseignantTitulaire);
        } else {
          // Pour le secondaire, l'utilisateur doit définir le titulaire manuellement
          enseignantTitulaire = 'Non assigné';
        }
      } catch (planningError) {
        console.error('Erreur lors de la récupération de l\'enseignant titulaire:', planningError);
        enseignantTitulaire = 'Non défini';
      }

      // Charger les données sauvegardées depuis la BDD
      const savedData = await loadCouncilDataFromDB();
      
      setCouncilData(prev => ({
        ...prev,
        directeur,
        enseignantTitulaire,
        representantParents: savedData?.parents || '',
        delegueEleves: savedData?.delegate || '',
        dateConseil: savedData?.councilDate || new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des données du conseil:', error);
    }
  }, [selectedClassId, selectedLevel, selectedAcademicYear, getClassTeacherName, teachers, loadTeachers, loadCouncilDataFromDB]);

  // Fonction pour charger les notes des étudiants
  const loadGrades = useCallback(async () => {
    if (!selectedClassId || !selectedAcademicYear || !selectedQuarter) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 Chargement des notes pour les conseils de classe...');
      console.log('🔍 Paramètres envoyés:', {
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClassId
      });

      // Utiliser la même approche que BordereauNotes et SaisieNotes : charger les notes directement
      const gradesResponse = await apiService.getExistingGrades({
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter,
        level: selectedLevel,
        classId: selectedClassId,
        subjectId: '', // Toutes les matières
        evaluationType: 'all' // Toutes les évaluations (inclut les moyennes sauvegardées)
      });

      console.log('📚 Notes récupérées pour les conseils de classe:', gradesResponse);
      console.log('📚 Nombre de notes récupérées:', Array.isArray(gradesResponse) ? gradesResponse.length : 'Non-array');

      // Convertir les données en format attendu par le composant
      if (Array.isArray(gradesResponse) && gradesResponse.length > 0) {
        // Convertir les données en format GradeRecord
        const convertedGrades = gradesResponse.map((grade: any) => ({
          id: grade.id || `${grade.studentId}-${grade.subjectId}`,
          studentId: grade.studentId,
          subjectId: grade.subjectId,
          academicYearId: selectedAcademicYear,
          quarterId: selectedQuarter,
          level: selectedLevel,
          classId: selectedClassId,
          evaluationType: grade.evaluationType || 'all',
          notes: grade.notes || {},
          moyenne: grade.moyenne || 0,
          rang: grade.rang || 0,
          appreciation: grade.appreciation || '',
          moyenneGenerale: grade.moyenneGenerale || null,
          createdAt: grade.createdAt || new Date().toISOString(),
          updatedAt: grade.updatedAt || new Date().toISOString()
        })) as GradeRecord[];
        
        setGrades(convertedGrades);
        console.log('📊 Notes converties pour les conseils de classe:', convertedGrades);
      } else {
        setGrades([]);
        console.log('📊 Aucune note trouvée pour les conseils de classe');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedAcademicYear, selectedQuarter, selectedLevel]);


  // Fonction pour générer automatiquement les observations et recommandations
  const generateObservationsAndRecommendations = (moyenneGenerale: number | string | null, moyennesMatières: Record<string, number | string | null>): { observations: string; recommandations: string } => {
    let observations = '';
    let recommandations = '';

    if (selectedLevel === 'maternelle') {
      const avg = moyenneGenerale as string;
      if (avg === 'TS') {
        observations = 'Excellent travail ! L\'élève montre une très bonne maîtrise des compétences attendues.';
        recommandations = 'Continuer à encourager et maintenir ce niveau d\'excellence.';
      } else if (avg === 'S') {
        observations = 'Bon travail dans l\'ensemble. Quelques efforts supplémentaires seraient bénéfiques.';
        recommandations = 'Encourager l\'élève à persévérer et à approfondir ses connaissances.';
      } else if (avg === 'PS') {
        observations = 'Des difficultés sont observées dans plusieurs domaines. Un accompagnement renforcé est nécessaire.';
        recommandations = 'Mettre en place un suivi personnalisé et des activités de remédiation.';
      } else {
        observations = 'Évaluation en cours. Les résultats seront disponibles prochainement.';
        recommandations = 'Continuer à suivre les progrès de l\'élève.';
      }
    } else {
      const numAvg = typeof moyenneGenerale === 'number' ? moyenneGenerale : 0;
      if (numAvg >= 16) {
        observations = 'Excellent niveau académique. L\'élève démontre une maîtrise exceptionnelle des matières.';
        recommandations = 'Encourager la participation à des activités d\'enrichissement et de défi.';
      } else if (numAvg >= 12) {
        observations = 'Bon niveau général avec des résultats satisfaisants dans la plupart des matières.';
        recommandations = 'Continuer les efforts et viser l\'excellence dans les matières où l\'élève excelle.';
      } else if (numAvg >= 10) {
        observations = 'Niveau acceptable mais des efforts sont nécessaires pour améliorer les résultats.';
        recommandations = 'Renforcer le travail personnel et solliciter l\'aide des enseignants si nécessaire.';
      } else if (numAvg > 0) {
        observations = 'Difficultés importantes observées. Un accompagnement pédagogique renforcé est indispensable.';
        recommandations = 'Mettre en place un plan de remédiation et un suivi régulier avec l\'équipe pédagogique.';
      } else {
        observations = 'Évaluation en cours. Les résultats seront disponibles prochainement.';
        recommandations = 'Continuer à suivre les progrès de l\'élève.';
      }
    }

    // Ajouter des observations spécifiques aux matières faibles
    const weakSubjects = Object.entries(moyennesMatières).filter(([, moyenne]) => {
      if (selectedLevel === 'maternelle') {
        return moyenne === 'PS';
      } else {
        return typeof moyenne === 'number' && moyenne !== null && moyenne < 10;
      }
    });

    if (weakSubjects.length > 0) {
      observations += ` Difficultés particulières observées en ${weakSubjects.map(([matiere]) => matiere).join(', ')}.`;
      recommandations += ` Accorder une attention particulière à ces matières.`;
    }

    return { observations, recommandations };
  };


  // Calculer les données du conseil à partir des vraies données avec adaptation par niveau
  const calculateConseilData = () => {
    if (students.length === 0) {
      return {
        classe: selectedClass || 'N/A',
        trimestre: currentQuarter?.name || 'N/A',
        date: new Date().toISOString().split('T')[0],
        effectif: 0,
        presents: 0,
        absents: 0,
        moyenneClasse: 0,
        tauxReussite: 0,
    decisions: {
          admis: 0,
          avertissement: 0,
          redoublement: 0,
      exclusion: 0
    },
        eleves: []
      };
    }

    // Calculer les moyennes générales pour chaque étudiant selon le niveau
    const studentsWithAverages = students.map(student => {
      const studentGrades = grades.filter(grade => grade.studentId === student.id);
      
      let moyenneGenerale: number | string | null = null;
      let moyennesMatières: Record<string, number | string | null> = {};

      // Calculer les moyennes par matière (même approche que Bordereau de notes)
      subjects.forEach(subject => {
        const subjectGrade = studentGrades.find(grade => grade.subjectId === subject.id);
        if (subjectGrade && subjectGrade.notes) {
          // Utiliser exactement la même approche que Bordereau de notes
          const noteData = subjectGrade.notes;
          const moyenne = calculateSubjectAverage(noteData, selectedLevel);
          
          if (selectedLevel === 'maternelle') {
            // Pour la maternelle, convertir en annotation qualitative (même logique que Bordereau de notes)
            if (moyenne !== null && moyenne >= 2.5) {
              moyennesMatières[subject.name] = 'TS';
            } else if (moyenne !== null && moyenne >= 1.5) {
              moyennesMatières[subject.name] = 'S';
            } else if (moyenne !== null && moyenne > 0) {
              moyennesMatières[subject.name] = 'PS';
            } else {
              moyennesMatières[subject.name] = null;
            }
          } else {
            // Pour les autres niveaux, utiliser la valeur numérique
            moyennesMatières[subject.name] = moyenne;
          }
        } else {
          moyennesMatières[subject.name] = null;
        }
      });

      // Calculer la moyenne générale (même approche que Bordereau de notes)
      if (selectedLevel === 'maternelle') {
        // Pour la maternelle, calculer l'annotation générale basée sur les moyennes de toutes les matières
        const subjectAverages = Object.values(moyennesMatières).filter(moyenne => 
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
          
          if (numericAverage >= 2.5) moyenneGenerale = 'TS';
          else if (numericAverage >= 1.5) moyenneGenerale = 'S';
          else moyenneGenerale = 'PS';
        } else {
          moyenneGenerale = null;
        }
      } else {
        // Pour les autres niveaux, calculer la moyenne numérique
        const numericAverages = Object.values(moyennesMatières).filter(moyenne => 
          typeof moyenne === 'number' && moyenne !== null && moyenne > 0
        ) as number[];
        
        if (numericAverages.length > 0) {
          moyenneGenerale = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
        } else {
          moyenneGenerale = null;
        }
      }

      // Calculer la décision selon le niveau et la moyenne
      let decision = 'Encouragements';
      if (selectedLevel === 'maternelle') {
        if (moyenneGenerale === 'TS') decision = 'Félicitations';
        else if (moyenneGenerale === 'S') decision = 'Encouragements';
        else if (moyenneGenerale === 'PS') decision = 'Avertissement';
        else decision = 'Encouragements'; // Pour les valeurs null
      } else {
        const numAvg = typeof moyenneGenerale === 'number' ? moyenneGenerale : 0;
        if (numAvg >= 16) decision = 'Félicitations';
        else if (numAvg >= 12) decision = 'Encouragements';
        else if (numAvg >= 10) decision = 'Avertissement';
        else if (numAvg > 0) decision = 'Blâme';
        else decision = 'Encouragements'; // Pour les valeurs null
      }

      // Récupérer le rang sauvegardé si disponible
      const savedRang = studentGrades.find(grade => grade.rang !== undefined)?.rang || 0;

      // Générer automatiquement les observations et recommandations
      const { observations, recommandations } = generateObservationsAndRecommendations(moyenneGenerale, moyennesMatières);

      return {
        id: student.id,
        nom: `${student.lastName} ${student.firstName}`,
        numeroEducmaster: student.registrationNumber,
        moyenneGenerale: moyenneGenerale,
        moyennesMatières: moyennesMatières,
        rang: savedRang,
        assiduité: 'Bon', // À récupérer depuis la base de données
        comportement: 'Correct', // À récupérer depuis la base de données
        decision: decision,
        observations: observations,
        recommandations: recommandations
      };
    });

    // Calculer les statistiques selon le niveau
    let moyenneClasse: number | string | null = null;
    let tauxReussite = 0;

    if (selectedLevel === 'maternelle') {
      // Pour la maternelle, calculer la moyenne qualitative de classe
      const studentAverages = studentsWithAverages
        .filter(s => s.moyenneGenerale !== null)
        .map(s => {
          if (s.moyenneGenerale === 'TS') return 3;
          if (s.moyenneGenerale === 'S') return 2;
          if (s.moyenneGenerale === 'PS') return 1;
          return 0;
        });

      if (studentAverages.length > 0) {
        const numericAverage = studentAverages.reduce((sum: number, val: number) => sum + val, 0) / studentAverages.length;
        if (numericAverage >= 2.5) moyenneClasse = 'TS';
        else if (numericAverage >= 1.5) moyenneClasse = 'S';
        else moyenneClasse = 'PS';

        // Taux de réussite = élèves avec TS ou S
        const studentsWithValidAverages = studentsWithAverages.filter(s => s.moyenneGenerale !== null);
        tauxReussite = studentsWithValidAverages.length > 0
          ? (studentsWithValidAverages.filter(s => s.moyenneGenerale === 'TS' || s.moyenneGenerale === 'S').length / studentsWithValidAverages.length) * 100
          : 0;
      }
    } else {
      // Pour les autres niveaux, calculer la moyenne numérique
      const numericAverages = studentsWithAverages
        .filter(s => typeof s.moyenneGenerale === 'number' && s.moyenneGenerale !== null)
        .map(s => s.moyenneGenerale as number);
      
      moyenneClasse = numericAverages.length > 0 
        ? numericAverages.reduce((sum: number, avg: number) => sum + avg, 0) / numericAverages.length
        : null;

      // Taux de réussite = élèves avec moyenne >= 10
      tauxReussite = numericAverages.length > 0
        ? (numericAverages.filter(avg => avg >= 10).length / numericAverages.length) * 100
        : 0;
    }

    // Calculer les décisions selon le niveau
    let decisions = {
      admis: 0,
      encouragements: 0,
      avertissement: 0,
      redoublement: 0,
      exclusion: 0
    };

    if (selectedLevel === 'maternelle') {
      // Pour la maternelle : TS = Excellent, S = Satisfaisant, PS = En difficulté
      decisions.admis = studentsWithAverages.filter(s => s.moyenneGenerale === 'TS').length; // Excellents
      decisions.encouragements = studentsWithAverages.filter(s => s.moyenneGenerale === 'S').length; // Satisfaisants
      decisions.avertissement = 0; // Pas d'avertissement pour la maternelle
      decisions.redoublement = studentsWithAverages.filter(s => s.moyenneGenerale === 'PS').length; // En difficulté
    } else {
      const numericAverages = studentsWithAverages
        .filter(s => typeof s.moyenneGenerale === 'number' && s.moyenneGenerale !== null)
        .map(s => s.moyenneGenerale as number);
      decisions.admis = numericAverages.filter(avg => avg >= 16).length; // Excellents
      decisions.encouragements = numericAverages.filter(avg => avg >= 12 && avg < 16).length; // Encouragements
      decisions.avertissement = numericAverages.filter(avg => avg >= 10 && avg < 12).length; // Moyens
      decisions.redoublement = numericAverages.filter(avg => avg < 10).length; // En difficulté
    }

    // Calculer les rangs pour cette évaluation (même logique que calculateEvaluationConseilData)
    if (selectedLevel === 'maternelle') {
      // Pour la maternelle, trier par valeur qualitative
      const sortedStudents = studentsWithAverages
        .filter(s => s.moyenneGenerale !== null)
        .sort((a, b) => {
          const getNumericValue = (moyenne: string | null) => {
            switch (moyenne) {
              case 'TS': return 3;
              case 'S': return 2;
              case 'PS': return 1;
              default: return 0;
            }
          };
          return getNumericValue(b.moyenneGenerale as string) - getNumericValue(a.moyenneGenerale as string);
        });

      sortedStudents.forEach((student, index) => {
        student.rang = index + 1;
      });
    } else {
      // Pour les autres niveaux, trier par moyenne numérique
      const sortedStudents = studentsWithAverages
        .filter(s => typeof s.moyenneGenerale === 'number' && s.moyenneGenerale !== null)
        .sort((a, b) => (b.moyenneGenerale as number) - (a.moyenneGenerale as number));

      sortedStudents.forEach((student, index) => {
        student.rang = index + 1;
      });
    }

    return {
      classe: selectedClass || 'N/A',
      trimestre: currentQuarter?.name || 'N/A',
      date: new Date().toISOString().split('T')[0],
      effectif: students.length,
      presents: studentsWithAverages.length,
      absents: 0, // À calculer selon les absences
      moyenneClasse: moyenneClasse,
      tauxReussite: tauxReussite,
      decisions: decisions,
      eleves: studentsWithAverages
    };
  };

  // Fonction pour calculer la moyenne qualitative (TS/S/PS) - même approche que BordereauNotes
  const calculateQualitativeAverage = (em1: string, em2: string, ec: string): string => {
    const values = [em1, em2, ec].filter(note => note && note !== '-');
    if (values.length === 0) return '-';
    
    // Convertir TS=3, S=2, PS=1 (même logique que BordereauNotes)
    const numericValues = values.map(note => {
      switch (note) {
        case 'TS': return 3;
        case 'S': return 2;
        case 'PS': return 1;
        default: return 0;
      }
    });
    
    const average = numericValues.reduce((sum: number, val: number) => sum + val, 0) / numericValues.length;
    
    // Convertir la moyenne numérique en annotation qualitative
    if (average >= 2.5) return 'TS';
    if (average >= 1.5) return 'S';
    return 'PS';
  };

  // Fonction pour calculer la moyenne selon le niveau (identique à BordereauNotes)
  const calculateSubjectAverage = (subjectNotes: any, level: string): number | null => {
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
        // Calculer les notes EM1, EM2, EC à partir de CM + CP
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
  };

  // Fonction pour générer automatiquement les observations selon les notes et la moyenne
  const generateEvaluationObservations = (
    moyenneGenerale: number | string | null,
    moyennesMatières: Record<string, number | string | null>,
    selectedLevel: string
  ): string => {
    if (!moyenneGenerale || moyenneGenerale === null) {
      return 'Aucune note disponible pour cette évaluation.';
    }

    if (selectedLevel === 'maternelle') {
      // Observations pour la maternelle (qualitatif)
      const moyenneStr = moyenneGenerale as string;
      
      if (moyenneStr === 'TS') {
        return 'Excellent travail ! L\'élève démontre une très bonne maîtrise des compétences attendues. Félicitations pour ce travail remarquable !';
      } else if (moyenneStr === 'S') {
        return 'Bon travail. L\'élève maîtrise bien les compétences de base. Continuer sur cette bonne lancée.';
      } else if (moyenneStr === 'PS') {
        return 'Travail en cours d\'acquisition. L\'élève a besoin d\'encouragement et de soutien. Accompagnement personnalisé recommandé.';
      }
    } else {
      // Observations pour les autres niveaux (numérique)
      const moyenneNum = typeof moyenneGenerale === 'number' ? moyenneGenerale : 0;
      
      if (moyenneNum >= 16) {
        return 'Excellent niveau ! L\'élève fait preuve d\'une très bonne maîtrise des connaissances. Félicitations pour ces excellents résultats !';
      } else if (moyenneNum >= 14) {
        return 'Très bon travail. L\'élève démontre une solide compréhension des matières. Continuer les efforts pour maintenir ce bon niveau.';
      } else if (moyenneNum >= 12) {
        return 'Bon niveau général. L\'élève maîtrise correctement les notions enseignées. Continuer les efforts pour maintenir ce bon niveau.';
      } else if (moyenneNum >= 10) {
        return 'Niveau satisfaisant. Quelques efforts supplémentaires seraient bénéfiques. Redoubler d\'efforts pour améliorer les résultats.';
      } else if (moyenneNum >= 8) {
        return 'Niveau fragile. Un accompagnement renforcé est nécessaire. Soutien pédagogique et accompagnement personnalisé indispensables.';
      } else if (moyenneNum > 0) {
        return 'Difficultés importantes observées. Un soutien pédagogique urgent est requis. Accompagnement personnalisé indispensable.';
      } else {
        return 'Aucune note valide pour cette évaluation.';
      }
    }

    return 'Aucune note disponible pour cette évaluation.';
  };

  const conseilData = calculateConseilData();
  
  // Log pour vérifier le contenu de conseilData
  console.log('🔍 conseilData pour modal:', {
    effectif: conseilData.effectif,
    presents: conseilData.presents,
    elevesCount: conseilData.eleves.length,
    eleves: conseilData.eleves.map(e => ({ id: e.id, nom: e.nom, rang: e.rang, moyenneGenerale: e.moyenneGenerale }))
  });

  // Fonction pour calculer les données du conseil par évaluation
  const calculateEvaluationConseilData = () => {
    console.log('🔍 calculateEvaluationConseilData appelé avec:', {
      studentsLength: students.length,
      selectedEvaluation,
      subjectsLength: subjects.length,
      students: students.map(s => ({ id: s.id, firstName: s.firstName, lastName: s.lastName })),
      subjects: subjects.map(s => ({ id: s.id, name: s.name }))
    });
    
    // Éviter les calculs inutiles si les données de base ne sont pas prêtes
    if (students.length === 0 || !selectedEvaluation || subjects.length === 0) {
      console.log('⚠️ calculateEvaluationConseilData: Données insuffisantes, retour de données vides');
      return {
        evaluation: selectedEvaluation || 'N/A',
        effectif: 0,
        presents: 0,
        moyenneClasse: null,
        tauxReussite: 0,
        decisions: {
          admis: 0,
          encouragements: 0,
          avertissement: 0,
          redoublement: 0,
          exclusion: 0
        },
        eleves: []
      };
    }

    // Calculer les moyennes par évaluation pour chaque étudiant
    const studentsWithEvaluationAverages = students.map(student => {
      const studentGrades = grades.filter(grade => grade.studentId === student.id);
      
      console.log(`🔍 Étudiant ${student.firstName} ${student.lastName} - Notes trouvées:`, studentGrades);
      
      let evaluationMoyenne: number | string | null = null;
      let moyennesMatières: Record<string, number | string | null> = {};

      // Récupérer les notes pour l'évaluation sélectionnée - même approche que BordereauNotes
      subjects.forEach(subject => {
        const subjectGrade = studentGrades.find(grade => grade.subjectId === subject.id);
        if (subjectGrade && subjectGrade.notes) {
          const noteData = subjectGrade.notes;
          console.log(`📚 Matière ${subject.name} - Données de notes:`, noteData);
          
          // Utiliser la même logique que BordereauNotes pour calculer la moyenne par matière
          if (selectedLevel === 'maternelle') {
            // Pour la maternelle, calculer la moyenne qualitative
            const em1 = noteData['em1'] || noteData['EM1'] || '-';
            const em2 = noteData['em2'] || noteData['EM2'] || '-';
            const ec = noteData['ec'] || noteData['EC'] || '-';
            
            if (em1 !== '-' && em2 !== '-' && ec !== '-') {
              const result = calculateQualitativeAverage(em1, em2, ec);
              moyennesMatières[subject.name] = result;
              console.log(`📝 Moyenne qualitative pour ${subject.name}: ${result}`);
            } else {
              moyennesMatières[subject.name] = null;
            }
          } else {
            // Pour les autres niveaux, récupérer la note spécifique de l'évaluation sélectionnée
            let noteValue: number | null = null;
            
            if (selectedLevel === 'primaire') {
              if (selectedEvaluation === 'em1') {
                const em1_cm = parseFloat(noteData['em1_cm'] || '0');
                const em1_cp = parseFloat(noteData['em1_cp'] || '0');
                noteValue = em1_cm + em1_cp;
              } else if (selectedEvaluation === 'em2') {
                const em2_cm = parseFloat(noteData['em2_cm'] || '0');
                const em2_cp = parseFloat(noteData['em2_cp'] || '0');
                noteValue = em2_cm + em2_cp;
              } else if (selectedEvaluation === 'ec') {
                const ec_cm = parseFloat(noteData['ec_cm'] || '0');
                const ec_cp = parseFloat(noteData['ec_cp'] || '0');
                noteValue = ec_cm + ec_cp;
              }
            } else if (selectedLevel === '1er_cycle' || selectedLevel === '2nd_cycle') {
              if (selectedEvaluation === 'ie1') {
                noteValue = parseFloat(noteData['ie1'] || noteData['IE1'] || '0');
              } else if (selectedEvaluation === 'ie2') {
                noteValue = parseFloat(noteData['ie2'] || noteData['IE2'] || '0');
              } else if (selectedEvaluation === 'ds1') {
                noteValue = parseFloat(noteData['ds1'] || noteData['DS1'] || '0');
              } else if (selectedEvaluation === 'ds2') {
                noteValue = parseFloat(noteData['ds2'] || noteData['DS2'] || '0');
              }
            }
            
            moyennesMatières[subject.name] = noteValue && noteValue > 0 ? noteValue : null;
            console.log(`📝 Note spécifique pour ${subject.name} (${selectedEvaluation}): ${noteValue}`);
          }
        } else {
          moyennesMatières[subject.name] = null;
        }
      });

      // Calculer la moyenne générale pour cette évaluation - même approche que BordereauNotes
      if (selectedLevel === 'maternelle') {
        // Pour la maternelle, calculer l'annotation générale basée sur les moyennes de toutes les matières
        const subjectAverages = Object.values(moyennesMatières).filter(moyenne => 
          typeof moyenne === 'string' && moyenne !== null
        ) as string[];

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
          const numericAverage = numericAverages.reduce((sum: number, val: number) => sum + val, 0) / numericAverages.length;
          
          // Convertir la moyenne numérique en annotation qualitative
          if (numericAverage >= 2.5) evaluationMoyenne = 'TS';
          else if (numericAverage >= 1.5) evaluationMoyenne = 'S';
          else evaluationMoyenne = 'PS';
        } else {
          evaluationMoyenne = null;
        }
      } else {
        // Pour les autres niveaux, calculer la moyenne numérique en utilisant la même logique que BordereauNotes
        const subjectAverages = Object.values(moyennesMatières).filter(moyenne => 
          typeof moyenne === 'number' && moyenne !== null && moyenne > 0
        ) as number[];
        
        if (subjectAverages.length > 0) {
          evaluationMoyenne = subjectAverages.reduce((sum, val) => sum + val, 0) / subjectAverages.length;
        } else {
          evaluationMoyenne = null;
        }
      }

      // Calculer la décision selon le niveau et la moyenne
      let decision = 'Encouragements';
      if (selectedLevel === 'maternelle') {
        if (evaluationMoyenne === 'TS') decision = 'Félicitations';
        else if (evaluationMoyenne === 'S') decision = 'Encouragements';
        else if (evaluationMoyenne === 'PS') decision = 'Avertissement';
        else decision = 'Encouragements';
      } else {
        const numAvg = typeof evaluationMoyenne === 'number' ? evaluationMoyenne : 0;
        if (numAvg >= 16) decision = 'Félicitations';
        else if (numAvg >= 12) decision = 'Encouragements';
        else if (numAvg >= 10) decision = 'Avertissement';
        else if (numAvg > 0) decision = 'Blâme';
        else decision = 'Encouragements';
      }

      // Générer automatiquement les observations
      const observations = generateEvaluationObservations(
        evaluationMoyenne,
        moyennesMatières,
        selectedLevel
      );

      return {
        id: student.id,
        nom: `${student.lastName} ${student.firstName}`,
        numeroEducmaster: student.registrationNumber,
        moyenneGenerale: evaluationMoyenne,
        moyennesMatières: moyennesMatières,
        rang: 0, // Sera calculé après
        assiduité: 'Bon',
        comportement: 'Correct',
        decision: decision,
        observations: observations,
        recommandations: ''
      };
    });

    // Calculer les rangs pour cette évaluation
    if (selectedLevel === 'maternelle') {
      // Pour la maternelle, trier par valeur qualitative
      const sortedStudents = studentsWithEvaluationAverages
        .filter(s => s.moyenneGenerale !== null)
        .sort((a, b) => {
          const getNumericValue = (moyenne: string | null) => {
            switch (moyenne) {
              case 'TS': return 3;
              case 'S': return 2;
              case 'PS': return 1;
              default: return 0;
            }
          };
          return getNumericValue(b.moyenneGenerale as string) - getNumericValue(a.moyenneGenerale as string);
        });

      sortedStudents.forEach((student, index) => {
        student.rang = index + 1;
      });
    } else {
      // Pour les autres niveaux, trier par moyenne numérique
      const sortedStudents = studentsWithEvaluationAverages
        .filter(s => typeof s.moyenneGenerale === 'number' && s.moyenneGenerale !== null)
        .sort((a, b) => (b.moyenneGenerale as number) - (a.moyenneGenerale as number));

      sortedStudents.forEach((student, index) => {
        student.rang = index + 1;
      });
    }

    // Calculer les statistiques selon le niveau
    let moyenneClasse: number | string | null = null;
    let tauxReussite = 0;

    if (selectedLevel === 'maternelle') {
      const studentAverages = studentsWithEvaluationAverages
        .filter(s => s.moyenneGenerale !== null)
        .map(s => {
          if (s.moyenneGenerale === 'TS') return 3;
          if (s.moyenneGenerale === 'S') return 2;
          if (s.moyenneGenerale === 'PS') return 1;
          return 0;
        });

      if (studentAverages.length > 0) {
        const numericAverage = studentAverages.reduce((sum: number, val: number) => sum + val, 0) / studentAverages.length;
        if (numericAverage >= 2.5) moyenneClasse = 'TS';
        else if (numericAverage >= 1.5) moyenneClasse = 'S';
        else moyenneClasse = 'PS';

        const studentsWithValidAverages = studentsWithEvaluationAverages.filter(s => s.moyenneGenerale !== null);
        tauxReussite = studentsWithValidAverages.length > 0
          ? (studentsWithValidAverages.filter(s => s.moyenneGenerale === 'TS' || s.moyenneGenerale === 'S').length / studentsWithValidAverages.length) * 100
          : 0;
      }
    } else {
      const numericAverages = studentsWithEvaluationAverages
        .filter(s => typeof s.moyenneGenerale === 'number' && s.moyenneGenerale !== null)
        .map(s => s.moyenneGenerale as number);
      
      moyenneClasse = numericAverages.length > 0 
        ? numericAverages.reduce((sum: number, avg: number) => sum + avg, 0) / numericAverages.length
        : null;

      tauxReussite = numericAverages.length > 0
        ? (numericAverages.filter(avg => avg >= 10).length / numericAverages.length) * 100
        : 0;
    }

    // Calculer les décisions selon le niveau
    let decisions = {
      admis: 0,
      encouragements: 0,
      avertissement: 0,
      redoublement: 0,
      exclusion: 0
    };

    if (selectedLevel === 'maternelle') {
      // Pour la maternelle : TS = Excellent, S = Satisfaisant, PS = En difficulté
      decisions.admis = studentsWithEvaluationAverages.filter(s => s.moyenneGenerale === 'TS').length; // Excellents
      decisions.encouragements = studentsWithEvaluationAverages.filter(s => s.moyenneGenerale === 'S').length; // Satisfaisants
      decisions.avertissement = 0; // Pas d'avertissement pour la maternelle
      decisions.redoublement = studentsWithEvaluationAverages.filter(s => s.moyenneGenerale === 'PS').length; // En difficulté
    } else {
      const numericAverages = studentsWithEvaluationAverages
        .filter(s => typeof s.moyenneGenerale === 'number' && s.moyenneGenerale !== null)
        .map(s => s.moyenneGenerale as number);
      decisions.admis = numericAverages.filter(avg => avg >= 16).length; // Excellents
      decisions.encouragements = numericAverages.filter(avg => avg >= 12 && avg < 16).length; // Encouragements
      decisions.avertissement = numericAverages.filter(avg => avg >= 10 && avg < 12).length; // Moyens
      decisions.redoublement = numericAverages.filter(avg => avg < 10).length; // En difficulté
    }

    const result = {
      evaluation: selectedEvaluation,
      effectif: students.length,
      presents: studentsWithEvaluationAverages.length,
      moyenneClasse: moyenneClasse,
      tauxReussite: tauxReussite,
      decisions: decisions,
      eleves: studentsWithEvaluationAverages
    };
    
    console.log('✅ calculateEvaluationConseilData retourne:', {
      effectif: result.effectif,
      presents: result.presents,
      elevesCount: result.eleves.length,
      eleves: result.eleves.map(e => ({ id: e.id, nom: e.nom, rang: e.rang, moyenneGenerale: e.moyenneGenerale }))
    });
    
    return result;
  };

  const evaluationConseilData = calculateEvaluationConseilData();

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Félicitations':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Encouragements':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Avertissement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Blâme':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Exclusion':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppreciationColor = (moyenne: number | string) => {
    if (selectedLevel === 'maternelle') {
      // Pour la maternelle, gérer les annotations qualitatives
      switch (moyenne) {
        case 'TS': return 'text-green-600';
        case 'S': return 'text-blue-600';
        case 'PS': return 'text-yellow-600';
        default: return 'text-gray-600';
      }
    } else {
      // Pour les autres niveaux, gérer les moyennes numériques
      const numMoyenne = typeof moyenne === 'number' ? moyenne : 0;
      if (numMoyenne >= 16) return 'text-green-600';
      if (numMoyenne >= 14) return 'text-blue-600';
      if (numMoyenne >= 12) return 'text-yellow-600';
      if (numMoyenne >= 10) return 'text-orange-600';
    return 'text-red-600';
    }
  };

  const handleViewPV = () => {
    setShowPVModal(true);
  };

  const handleDownloadPV = async () => {
    setIsGeneratingPV(true);
    // Simulation de génération
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Création d'un contenu de PV simulé
    const pvContent = `PROCÈS-VERBAL DU CONSEIL DE CLASSE

Classe: ${selectedClass}
Trimestre: ${currentQuarter?.name || 'Trimestre'}
Date: ${new Date().toLocaleDateString('fr-FR')}

STATISTIQUES:
- Effectif: ${conseilData.effectif}
- Moyenne classe: ${conseilData.moyenneClasse}
- Taux de réussite: ${conseilData.tauxReussite}%

DÉCISIONS:
${conseilData.eleves.map(eleve => 
  `${eleve.nom}: ${selectedLevel === 'maternelle' ? 
    eleve.moyenneGenerale : 
    typeof eleve.moyenneGenerale === 'number' ? 
      eleve.moyenneGenerale.toFixed(2) : 
      eleve.moyenneGenerale
  }${selectedLevel === 'maternelle' ? '' : '/20'} - ${eleve.decision}`
).join('\n')}

Le Directeur: M. AKPOVI Jean`;
    
    const blob = new Blob([pvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PV_Conseil_${selectedClass}_${currentQuarter?.name || 'Trimestre'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsGeneratingPV(false);
    showSuccessModalHandler('export', 0, `Le procès-verbal de la classe ${selectedClass} a été téléchargé avec succès !`);
  };


  // useEffect pour réinitialiser la sélection de classe quand le niveau change
  useEffect(() => {
    setSelectedClassId('');
    setSelectedClass('');
  }, [selectedLevel]);

  // Log des paramètres d'école quand ils changent
  // Note: Les paramètres sont déjà chargés automatiquement par le hook useSchoolSettings au montage
  useEffect(() => {
    console.log('🏫 Paramètres d\'école chargés:', schoolSettings);
    console.log('🏫 Nom de l\'école:', schoolSettings.name);
    console.log('🏫 Adresse:', schoolSettings.address);
    console.log('🏫 Téléphone:', schoolSettings.primaryPhone);
  }, [schoolSettings]);

  // Charger les enseignants avec leurs affectations au montage du composant
  useEffect(() => {
    console.log('🔄 useEffect loadTeachers déclenché');
    loadTeachers();
  }, [loadTeachers]);

  // useEffect pour charger les classes quand le niveau ou l'année académique change
  useEffect(() => {
    loadClasses();
  }, [selectedLevel, selectedAcademicYear, loadClasses]);

  // useEffect pour charger les étudiants quand la classe change
  useEffect(() => {
    loadStudents();
  }, [selectedClassId, selectedAcademicYear, loadStudents]);

  // useEffect pour charger les matières quand la classe ou le niveau change
  useEffect(() => {
    loadSubjects();
  }, [selectedClassId, selectedLevel, loadSubjects]);

  // useEffect pour charger les notes quand les étudiants ou le trimestre change
  useEffect(() => {
    if (students.length > 0) {
      loadGrades();
    }
  }, [students, selectedQuarter, loadGrades]);

  // useEffect pour recharger les notes quand l'évaluation change
  useEffect(() => {
    if (students.length > 0 && selectedEvaluation) {
      loadGrades();
    }
  }, [selectedEvaluation, students, loadGrades]);


  // useEffect pour charger les données du conseil
  useEffect(() => {
    console.log('🔄 useEffect loadCouncilData déclenché:', { selectedClassId, selectedLevel });
    if (selectedClassId && selectedLevel) {
      console.log('✅ Conditions remplies, appel de loadCouncilData');
      loadCouncilData();
    } else {
      console.log('❌ Conditions non remplies pour loadCouncilData');
    }
  }, [selectedClassId, selectedLevel, loadCouncilData]);

  // Fonction pour obtenir les classes disponibles (maintenant dynamique)
  const getAvailableClasses = () => {
    return classes;
  };

  // Fonction pour obtenir les évaluations disponibles selon le niveau
  const getAvailableEvaluations = () => {
    switch (selectedLevel) {
      case 'maternelle':
      case 'primaire':
        return [
          { value: 'em1', label: 'EM1 (Évaluation Mensuelle 1)' },
          { value: 'em2', label: 'EM2 (Évaluation Mensuelle 2)' },
          { value: 'ec', label: 'EC (Évaluation Certificative)' }
        ];
      case '1er_cycle':
      case '2nd_cycle':
        return [
          { value: 'ie1', label: 'IE1 (Interrogation Écrite 1)' },
          { value: 'ie2', label: 'IE2 (Interrogation Écrite 2)' },
          { value: 'ds1', label: 'DS1 (Devoir Surveillé 1)' },
          { value: 'ds2', label: 'DS2 (Devoir Surveillé 2)' }
        ];
      default:
        return [];
    }
  };

  // Fonctions pour l'édition
  const handleEditStudent = (studentId: string, currentData: {
    decision: string;
    observations: string;
    recommandations: string;
    assiduité: string;
    comportement: string;
  }) => {
    setEditingStudentId(studentId);
    setEditingData({
      decision: currentData.decision || 'Encouragements',
      observations: currentData.observations || '',
      recommandations: currentData.recommandations || '',
      assiduite: currentData.assiduité || 'Bon',
      comportement: currentData.comportement || 'Correct'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingStudentId) return;
    
    setIsSaving(true);
    try {
      // Ici, vous pouvez ajouter l'appel API pour sauvegarder les modifications
      // await apiService.saveConseilDecision({
      //   studentId: editingStudentId,
      //   classId: selectedClassId,
      //   quarterId: selectedQuarter,
      //   academicYearId: selectedAcademicYear,
      //   ...editingData
      // });
      
      console.log('Sauvegarde des modifications pour l\'étudiant:', editingStudentId, editingData);
      
      // Pour l'instant, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditingStudentId(null);
      setEditingData({
        decision: '',
        observations: '',
        recommandations: '',
        assiduite: '',
        comportement: ''
      });
      
      // Recharger les données
      await loadGrades();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditingData({
      decision: '',
      observations: '',
      recommandations: '',
      assiduite: '',
      comportement: ''
    });
  };

  // Fonctions pour l'édition par évaluation
  const handleEditEvaluationStudent = (studentId: string, currentData: {
    decision: string;
    assiduité: string;
    comportement: string;
  }) => {
    setEditingEvaluationStudentId(studentId);
    setEditingEvaluationData({
      decision: currentData.decision || 'Encouragements',
      assiduite: currentData.assiduité || 'Bon',
      comportement: currentData.comportement || 'Correct'
    });
  };

  const handleEvaluationInputChange = (field: string, value: string) => {
    setEditingEvaluationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEvaluationEdit = async () => {
    if (!editingEvaluationStudentId) return;
    
    setIsSavingEvaluation(true);
    try {
      // Ici, vous pouvez ajouter l'appel API pour sauvegarder les modifications d'évaluation
      console.log('Sauvegarde des données d\'évaluation pour l\'étudiant:', editingEvaluationStudentId, editingEvaluationData);
      
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditingEvaluationStudentId(null);
      setEditingEvaluationData({
        decision: '',
        assiduite: '',
        comportement: ''
      });
      
      alert('Données d\'évaluation sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications d\'évaluation');
    } finally {
      setIsSavingEvaluation(false);
    }
  };

  const handleCancelEvaluationEdit = () => {
    setEditingEvaluationStudentId(null);
    setEditingEvaluationData({
      decision: '',
      assiduite: '',
      comportement: ''
    });
  };

  // Fonctions pour gérer l'édition des données du conseil
  const handleEditCouncil = () => {
    setIsEditingCouncil(true);
  };

  const handleCouncilInputChange = (field: string, value: string) => {
    setCouncilData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Debounce de la sauvegarde (attendre 1 seconde après le dernier changement)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const dataToSave: { parents?: string; delegate?: string; councilDate?: string } = {};
      
      if (field === 'representantParents') {
        dataToSave.parents = value;
      } else if (field === 'delegueEleves') {
        dataToSave.delegate = value;
      } else if (field === 'dateConseil') {
        dataToSave.councilDate = value;
      }
      
      if (Object.keys(dataToSave).length > 0) {
        saveCouncilData(dataToSave);
      }
    }, 1000); // Attendre 1 seconde avant de sauvegarder
  };

  const handleSaveCouncil = async () => {
    try {
      // Ici, on pourrait sauvegarder les données du conseil en base
      console.log('Sauvegarde des données du conseil:', councilData);
      setIsEditingCouncil(false);
      showSuccessModalHandler('save', 0, 'Les informations du conseil ont été sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des données du conseil');
    }
  };

  const handleCancelCouncilEdit = () => {
    setIsEditingCouncil(false);
    // Recharger les données originales si nécessaire
    loadCouncilData();
  };

  // Fonction pour afficher le modal de succès
  const showSuccessModalHandler = (type: 'save' | 'export' | 'print', count: number = 0, customMessage?: string) => {
    let title = '';
    let message = '';
    
    switch (type) {
      case 'save':
        title = 'Sauvegarde Réussie !';
        message = customMessage || `Les données du conseil ont été sauvegardées avec succès.`;
        break;
      case 'export':
        title = 'Export Réussi !';
        message = customMessage || `Le procès-verbal a été exporté avec succès.`;
        break;
      case 'print':
        title = 'Impression Lancée !';
        message = customMessage || `Le document est en cours d'impression.`;
        break;
    }
    
    setSuccessData({
      title,
      message,
      count,
      type
    });
    setShowSuccessModal(true);
  };


  const handleInputChange = (field: string, value: string) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-7 w-7 mr-3 text-blue-600" />
            Conseils de Classe
          </h2>
          <div className="flex space-x-3">
            <button 
              onClick={handleViewPV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              PV Conseil
            </button>
            <button 
              onClick={handleDownloadPV}
              disabled={isGeneratingPV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isGeneratingPV ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPV ? 'Génération...' : 'Télécharger PV'}
            </button>
          </div>
        </div>

        {/* Modal PV Conseil moderne */}
        <ConseilPVModal
          isOpen={showPVModal}
          onClose={() => setShowPVModal(false)}
          onDownload={handleDownloadPV}
          onPrint={() => window.print()}
          students={conseilData.eleves.map(eleve => {
            // Trouver l'élève dans la liste des étudiants pour récupérer le genre
            const studentData = students.find(s => s.id === eleve.id);
            console.log('🔍 Élève pour modal (conseilData):', {
              nom: eleve.nom,
              rang: eleve.rang,
              moyenneGenerale: eleve.moyenneGenerale,
              decision: eleve.decision,
              assiduite: eleve.assiduité,
              comportement: eleve.comportement,
              observations: eleve.observations,
              moyennesMatières: eleve.moyennesMatières
            });
            return {
              id: eleve.id,
              firstName: eleve.nom.split(' ')[0] || '',
              lastName: eleve.nom.split(' ').slice(1).join(' ') || '',
              educmasterNumber: eleve.numeroEducmaster || '',
              className: selectedClass,
              classLevel: selectedLevel,
              // Utiliser exactement la même logique que le tableau principal pour la moyenne générale
              average: selectedLevel === 'maternelle' ? 
                (typeof eleve.moyenneGenerale === 'number' ? eleve.moyenneGenerale : 0) : 
                (typeof eleve.moyenneGenerale === 'number' && eleve.moyenneGenerale !== null ? 
                  eleve.moyenneGenerale : 0),
              rank: eleve.rang || 0,
              decision: eleve.decision,
              observations: eleve.observations,
              assiduite: eleve.assiduité,
              comportement: eleve.comportement,
              gender: studentData?.gender || 'M',
              // Utiliser exactement la même logique que le tableau principal pour les moyennes par matière
              subjects: Object.entries(eleve.moyennesMatières || {}).map(([subjectName, average]) => ({
                subjectName,
                average: selectedLevel === 'maternelle' ? 
                  (typeof average === 'number' ? average : 0) : 
                  (typeof average === 'number' && average !== null ? average : 0),
                evaluation: selectedEvaluation
              }))
            };
          })}
          conseilData={{
            directeur: councilData.directeur,
            enseignantTitulaire: councilData.enseignantTitulaire,
            representantParents: councilData.representantParents,
            delegueEleves: councilData.delegueEleves,
            dateConseil: councilData.dateConseil
          }}
          conseilStats={{
            effectif: conseilData.effectif,
            presents: conseilData.presents,
            moyenneClasse: conseilData.moyenneClasse || 0,
            tauxReussite: conseilData.tauxReussite,
            decisions: {
              admis: conseilData.decisions.admis,
              encouragements: 'encouragements' in conseilData.decisions ? conseilData.decisions.encouragements : 0,
              avertissement: conseilData.decisions.avertissement,
              redoublement: conseilData.decisions.redoublement
            }
          }}
          selectedClass={selectedClass}
          selectedLevel={selectedLevel}
          selectedEvaluation={selectedEvaluation}
          schoolSettings={schoolSettings}
          isLoading={isGeneratingPV}
        />



        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <AcademicYearSelector
              moduleName="conseils-classe"
              className="w-full"
              onChange={(yearId) => {
                setSelectedAcademicYear(yearId);
                console.log('Année scolaire sélectionnée:', yearId);
              }}
            />
              </div>

                      <div>
            <QuarterSelector
              moduleName="conseils-classe"
              className="w-full"
              academicYearId={selectedAcademicYear}
              onChange={(quarterId) => {
                setSelectedQuarter(quarterId);
                console.log('Trimestre sélectionné:', quarterId);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau Scolaire</label>
                        <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                const availableClasses = getAvailableClasses();
                if (availableClasses.length > 0) {
                  setSelectedClassId(availableClasses[0].id);
                  setSelectedClass(availableClasses[0].name);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Sélectionner le niveau scolaire"
            >
              <option value="">Sélectionner un niveau</option>
              {niveauxScolaires.map(niveau => (
                <option key={niveau.id} value={niveau.id}>{niveau.label}</option>
              ))}
                        </select>
                      </div>
                      
                        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const classId = e.target.value;
                const selectedClassData = classes.find(cls => cls.id === classId);
                setSelectedClassId(classId);
                setSelectedClass(selectedClassData?.name || '');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Sélectionner la classe"
              disabled={isLoading}
            >
              <option value="">Sélectionner une classe</option>
              {getAvailableClasses().map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Section Décisions par Évaluation */}
      {selectedLevel && selectedClassId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Décisions du Conseil par Évaluation
            </h2>
          </div>

          {/* Sélecteur d'évaluation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une évaluation
            </label>
                          <select
                            value={selectedEvaluation}
                            onChange={(e) => setSelectedEvaluation(e.target.value)}
              className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Sélectionner une évaluation"
              aria-label="Sélectionner une évaluation"
            >
              <option value="">Sélectionner une évaluation</option>
              {getAvailableEvaluations().map(evaluation => (
                <option key={evaluation.value} value={evaluation.value}>
                  {evaluation.label}
                </option>
              ))}
                          </select>
                        </div>

          {/* Statistiques par évaluation */}
          {selectedEvaluation && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                      <div>
                    <p className="text-blue-800 font-semibold">Effectif</p>
                    <p className="text-2xl font-bold text-blue-700">{evaluationConseilData.effectif}</p>
                      </div>
                  <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-semibold">Présents</p>
                    <p className="text-2xl font-bold text-green-700">{evaluationConseilData.presents}</p>
                    </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  </div>
                  
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                        <div>
                    <p className="text-purple-800 font-semibold">Moyenne Classe</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {evaluationConseilData.moyenneClasse !== null ? 
                        (typeof evaluationConseilData.moyenneClasse === 'number' ? 
                          evaluationConseilData.moyenneClasse.toFixed(2) : 
                          evaluationConseilData.moyenneClasse) : 
                        '-'
                      }
                    </p>
                        </div>
                  <Award className="h-8 w-8 text-purple-600" />
                        </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                        <div>
                    <p className="text-indigo-800 font-semibold">Taux de Réussite</p>
                    <p className="text-2xl font-bold text-indigo-700">{evaluationConseilData.tauxReussite.toFixed(1)}%</p>
                        </div>
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>
                </div>
          )}

          {/* Décisions par évaluation */}
          {selectedEvaluation && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-semibold">Félicitations (≥16)</p>
                    <p className="text-2xl font-bold text-green-700">{evaluationConseilData.decisions.admis}</p>
              </div>
                  <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold">Encouragements (12-16)</p>
                    <p className="text-2xl font-bold text-blue-700">{(evaluationConseilData.decisions as { encouragements: number }).encouragements}</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-blue-600" />
                </div>
                </div>
                
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 font-semibold">Avertissements (10-12)</p>
                    <p className="text-2xl font-bold text-yellow-700">{evaluationConseilData.decisions.avertissement}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-800 font-semibold">À surveiller (&lt;10)</p>
                    <p className="text-2xl font-bold text-orange-700">{evaluationConseilData.decisions.redoublement}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-semibold">Difficultés</p>
                    <p className="text-2xl font-bold text-red-700">{evaluationConseilData.decisions.exclusion}</p>
                </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

          {/* Tableau des décisions par évaluation */}
          {selectedEvaluation && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                  Décisions du Conseil de Classe - {selectedClass} - {getAvailableEvaluations().find(e => e.value === selectedEvaluation)?.label} - {currentQuarter?.name}
              </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Date du conseil : {new Date().toLocaleDateString('fr-FR')}
                </p>
          </div>
          
          <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Élève
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moy. {getAvailableEvaluations().find(e => e.value === selectedEvaluation)?.label}
                      </th>
                      {subjects.map(subject => (
                        <th key={subject.id} className="px-2 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {subject.name}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assiduité
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comportement
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Décision
                      </th>
                      <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                        Observations
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                </tr>
              </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evaluationConseilData.eleves.map((eleve) => (
                      <tr key={eleve.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{eleve.nom}</div>
                            <div className="text-sm text-gray-500">{eleve.numeroEducmaster}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`text-lg font-bold ${getAppreciationColor(eleve.moyenneGenerale || 0)}`}>
                            {selectedLevel === 'maternelle' ? 
                              (eleve.moyenneGenerale || '-') : 
                              typeof eleve.moyenneGenerale === 'number' && eleve.moyenneGenerale !== null ? 
                                eleve.moyenneGenerale.toFixed(2) : 
                                '-'
                            }
                          </div>
                        </td>
                        {subjects.map(subject => (
                          <td key={subject.id} className="px-2 py-4 text-center">
                            <div className={`text-sm font-semibold ${getAppreciationColor(eleve.moyennesMatières[subject.name] || (selectedLevel === 'maternelle' ? 'PS' : 0) || 0)}`}>
                              {selectedLevel === 'maternelle' ? 
                                (eleve.moyennesMatières[subject.name] || '-') : 
                                typeof eleve.moyennesMatières[subject.name] === 'number' && eleve.moyennesMatières[subject.name] !== null ? 
                                  (eleve.moyennesMatières[subject.name] as number).toFixed(2) : 
                                  '-'
                              }
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {eleve.rang > 0 ? `${eleve.rang}${eleve.rang === 1 ? 'er' : 'ème'}` : '-'}
                        </span>
                      </td>
                        <td className="px-6 py-4 text-center">
                          {editingEvaluationStudentId === eleve.id ? (
                            <select
                              value={editingEvaluationData.assiduite}
                              onChange={(e) => handleEvaluationInputChange('assiduite', e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded text-sm"
                              title="Sélectionner l'assiduité"
                              aria-label="Sélectionner l'assiduité"
                            >
                              <option value="Excellent">Excellent</option>
                              <option value="Bon">Bon</option>
                              <option value="Moyen">Moyen</option>
                              <option value="Faible">Faible</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              eleve.assiduité === 'Excellent' ? 'bg-green-100 text-green-800' :
                              eleve.assiduité === 'Bon' ? 'bg-blue-100 text-blue-800' :
                              eleve.assiduité === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {eleve.assiduité}
                            </span>
                          )}
                      </td>
                        <td className="px-6 py-4 text-center">
                          {editingEvaluationStudentId === eleve.id ? (
                            <select
                              value={editingEvaluationData.comportement}
                              onChange={(e) => handleEvaluationInputChange('comportement', e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded text-sm"
                              title="Sélectionner le comportement"
                              aria-label="Sélectionner le comportement"
                            >
                              <option value="Excellent">Excellent</option>
                              <option value="Bon">Bon</option>
                              <option value="Correct">Correct</option>
                              <option value="Difficile">Difficile</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              eleve.comportement === 'Excellent' ? 'bg-green-100 text-green-800' :
                              eleve.comportement === 'Bon' ? 'bg-blue-100 text-blue-800' :
                              eleve.comportement === 'Correct' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {eleve.comportement}
                        </span>
                          )}
                      </td>
                        <td className="px-6 py-4 text-center">
                          {editingEvaluationStudentId === eleve.id ? (
                            <select
                              value={editingEvaluationData.decision}
                              onChange={(e) => handleEvaluationInputChange('decision', e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded text-sm"
                              title="Sélectionner la décision"
                              aria-label="Sélectionner la décision"
                            >
                              <option value="Félicitations">Félicitations</option>
                              <option value="Encouragements">Encouragements</option>
                              <option value="Avertissement">Avertissement</option>
                              <option value="Blâme">Blâme</option>
                              <option value="Exclusion">Exclusion</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDecisionColor(eleve.decision)}`}>
                              {eleve.decision}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 w-80">
                          <div className="h-16 overflow-y-auto">
                            <div className="text-xs text-gray-900 leading-tight">
                              {eleve.observations || '-'}
          </div>
          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {editingEvaluationStudentId === eleve.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEvaluationEdit}
                                disabled={isSavingEvaluation}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                title="Sauvegarder"
                                aria-label="Sauvegarder"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                {isSavingEvaluation ? 'Sauvegarde...' : 'Sauvegarder'}
                              </button>
                              <button
                                onClick={handleCancelEvaluationEdit}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                title="Annuler"
                                aria-label="Annuler"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Annuler
                              </button>
          </div>
                          ) : (
                            <button
                              onClick={() => handleEditEvaluationStudent(eleve.id, eleve)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              title="Modifier"
                              aria-label="Modifier"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Modifier
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
            </div>
          )}
        </div>
      )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-4 w-6 mr-3 animate-spin text-blue-600" />
              <span className="text-gray-600">Chargement des données...</span>
        </div>
      </div>
        )}

      {/* Statistiques du conseil */}
        {!isLoading && selectedClassId && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{conseilData.effectif}</p>
              <p className="text-sm text-gray-600">Effectif Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{conseilData.presents}</p>
              <p className="text-sm text-gray-600">Élèves Évalués</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {selectedLevel === 'maternelle' ? 
                  (conseilData.moyenneClasse || '-') : 
                  typeof conseilData.moyenneClasse === 'number' && conseilData.moyenneClasse !== null ? 
                    conseilData.moyenneClasse.toFixed(2) : 
                    '-'
                }
              </p>
              <p className="text-sm text-gray-600">
                {selectedLevel === 'maternelle' ? 'Moyenne Classe (TS/S/PS)' : 'Moyenne Classe (/20)'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold text-sm">{conseilData.tauxReussite.toFixed(1)}%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{conseilData.tauxReussite.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                {selectedLevel === 'maternelle' ? 'Taux de Réussite (TS+S)' : 'Taux de Réussite (≥10)'}
              </p>
            </div>
          </div>
        </div>
      </div>
        )}

      {/* Répartition des décisions */}
      {!isLoading && (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Répartition des Décisions du Conseil
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {selectedLevel === 'maternelle' ? (
            <>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                    <p className="text-green-800 font-semibold">Très Satisfaisant (TS)</p>
                <p className="text-2xl font-bold text-green-700">{conseilData.decisions.admis}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold">Satisfaisant (S)</p>
                    <p className="text-2xl font-bold text-blue-700">{conseilData.decisions.avertissement}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                    <p className="text-yellow-800 font-semibold">Peu Satisfaisant (PS)</p>
                    <p className="text-2xl font-bold text-yellow-700">{conseilData.decisions.redoublement}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 font-semibold">Non Évalué</p>
                    <p className="text-2xl font-bold text-gray-700">{conseilData.decisions.exclusion}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-semibold">Félicitations (≥16)</p>
                    <p className="text-2xl font-bold text-green-700">{conseilData.decisions.admis}</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold">Encouragements (12-16)</p>
                    <p className="text-2xl font-bold text-blue-700">{(conseilData.decisions as { encouragements: number }).encouragements}</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 font-semibold">Avertissements (10-12)</p>
                <p className="text-2xl font-bold text-yellow-700">{conseilData.decisions.avertissement}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                    <p className="text-orange-800 font-semibold">À surveiller (&lt;10)</p>
                <p className="text-2xl font-bold text-orange-700">{conseilData.decisions.redoublement}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-semibold">Difficultés</p>
                <p className="text-2xl font-bold text-red-700">{conseilData.decisions.exclusion}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* Tableau des élèves et décisions */}
      {!isLoading && selectedClassId && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Décisions du Conseil de Classe - {selectedClass} - {currentQuarter?.name || 'Chargement...'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Date du conseil: {new Date(conseilData.date).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Élève</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Moy. Générale</th>
                {subjects.map(subject => (
                  <th key={subject.id} className="px-2 py-4 text-center text-sm font-semibold text-gray-900">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-600 truncate max-w-16" title={subject.name}>
                        {subject.name.length > 8 ? subject.name.substring(0, 8) + '...' : subject.name}
                      </span>
                      <span className="text-xs font-medium">Moy.</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Assiduité</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Comportement</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Décision</th>
                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 w-80">Observations</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conseilData.eleves.map((eleve: {
                id: string;
                nom: string;
                numeroEducmaster: string;
                moyenneGenerale: number | string | null;
                moyennesMatières: Record<string, number | string | null>;
                rang: number;
                assiduité: string;
                comportement: string;
                decision: string;
                observations: string;
                recommandations: string;
              }, index: number) => (
                <tr key={eleve.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{eleve.nom}</div>
                        <div className="text-xs text-gray-500">{eleve.numeroEducmaster}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`text-lg font-bold ${getAppreciationColor(eleve.moyenneGenerale || 0)}`}>
                      {selectedLevel === 'maternelle' ? 
                        (eleve.moyenneGenerale || '-') : 
                        typeof eleve.moyenneGenerale === 'number' && eleve.moyenneGenerale !== null ? 
                          eleve.moyenneGenerale.toFixed(2) : 
                          '-'
                      }
                    </div>
                  </td>
                  {subjects.map(subject => (
                    <td key={subject.id} className="px-2 py-4 text-center">
                      <div className={`text-sm font-semibold ${getAppreciationColor(eleve.moyennesMatières[subject.name] || (selectedLevel === 'maternelle' ? 'PS' : 0) || 0)}`}>
                        {selectedLevel === 'maternelle' ? 
                          (eleve.moyennesMatières[subject.name] || '-') : 
                          typeof eleve.moyennesMatières[subject.name] === 'number' && eleve.moyennesMatières[subject.name] !== null ? 
                            (eleve.moyennesMatières[subject.name] as number).toFixed(2) : 
                            '-'
                        }
                    </div>
                  </td>
                  ))}
                  <td className="px-4 py-4 text-center">
                    {editingStudentId === eleve.id ? (
                      <select
                        value={editingData.assiduite}
                        onChange={(e) => handleInputChange('assiduite', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        title="Sélectionner l'assiduité"
                        aria-label="Sélectionner l'assiduité"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Bon">Bon</option>
                        <option value="Moyen">Moyen</option>
                        <option value="Faible">Faible</option>
                      </select>
                    ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      eleve.assiduité === 'Excellent' ? 'bg-green-100 text-green-800' :
                      eleve.assiduité === 'Bon' ? 'bg-blue-100 text-blue-800' :
                      eleve.assiduité === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {eleve.assiduité}
                    </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingStudentId === eleve.id ? (
                      <select
                        value={editingData.comportement}
                        onChange={(e) => handleInputChange('comportement', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        title="Sélectionner le comportement"
                        aria-label="Sélectionner le comportement"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Très Bien">Très Bien</option>
                        <option value="Correct">Correct</option>
                        <option value="À surveiller">À surveiller</option>
                      </select>
                    ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      eleve.comportement === 'Excellent' ? 'bg-green-100 text-green-800' :
                      eleve.comportement === 'Très Bien' ? 'bg-blue-100 text-blue-800' :
                      eleve.comportement === 'Correct' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {eleve.comportement}
                    </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingStudentId === eleve.id ? (
                      <select
                        value={editingData.decision}
                        onChange={(e) => handleInputChange('decision', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        title="Sélectionner la décision"
                        aria-label="Sélectionner la décision"
                      >
                        <option value="Félicitations">Félicitations</option>
                        <option value="Encouragements">Encouragements</option>
                        <option value="Avertissement">Avertissement</option>
                        <option value="Blâme">Blâme</option>
                        <option value="Exclusion">Exclusion</option>
                      </select>
                    ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDecisionColor(eleve.decision)}`}>
                      {eleve.decision}
                    </span>
                    )}
                  </td>
                  <td className="px-3 py-4 w-80">
                    {editingStudentId === eleve.id ? (
                    <div className="space-y-1">
                        <textarea
                          value={editingData.observations}
                          onChange={(e) => handleInputChange('observations', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-xs h-16 resize-none"
                          placeholder="Observations..."
                          rows={2}
                        />
                        <textarea
                          value={editingData.recommandations}
                          onChange={(e) => handleInputChange('recommandations', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-xs h-16 resize-none"
                          placeholder="Recommandations..."
                          rows={2}
                        />
                    </div>
                    ) : (
                    <div className="h-16 overflow-y-auto">
                      <div className="text-xs text-gray-900 leading-tight">{eleve.observations}</div>
                      <div className="text-xs text-gray-600 italic leading-tight mt-1">{eleve.recommandations}</div>
                    </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingStudentId === eleve.id ? (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          title="Sauvegarder"
                        >
                          {isSaving ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          title="Annuler"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStudent(eleve.id, eleve)}
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section Conseil avec données dynamiques et édition */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Informations du Conseil</h4>
            {!isEditingCouncil ? (
              <button
                onClick={handleEditCouncil}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCouncil}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancelCouncilEdit}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Présents au Conseil */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h5 className="font-semibold text-gray-900">Présents au Conseil</h5>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-100 rounded-md">
                    <UserCheck className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Directeur(trice)</span>
                    <p className="text-sm font-medium text-gray-900">{councilData.directeur || 'Non défini'}</p>
              </div>
            </div>
            
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded-md">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Enseignant titulaire</span>
                    <p className="text-sm font-medium text-gray-900">{councilData.enseignantTitulaire || 'Non défini'}</p>
              </div>
            </div>

                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-purple-100 rounded-md">
                    <Users2 className="h-4 w-4 text-purple-600" />
                </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Représentant des parents</span>
                    {isEditingCouncil ? (
                      <input
                        type="text"
                        value={councilData.representantParents}
                        onChange={(e) => handleCouncilInputChange('representantParents', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Représentant des parents"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{councilData.representantParents || 'Non défini'}</p>
                    )}
              </div>
            </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-100 rounded-md">
                    <User className="h-4 w-4 text-orange-600" />
          </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Délégué des élèves</span>
                    {isEditingCouncil ? (
                      <input
                        type="text"
                        value={councilData.delegueEleves}
                        onChange={(e) => handleCouncilInputChange('delegueEleves', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Délégué des élèves"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{councilData.delegueEleves || 'Non défini'}</p>
                    )}
        </div>
      </div>
              </div>
            </div>

            {/* Résumé Statistique */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <h5 className="font-semibold text-gray-900">Résumé Statistique</h5>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Moyenne classe</span>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedLevel === 'maternelle' ? 
                        (conseilData.moyenneClasse || '-') : 
                        typeof conseilData.moyenneClasse === 'number' && conseilData.moyenneClasse !== null ? 
                          `${conseilData.moyenneClasse.toFixed(2)}/20` : 
                          '-'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Taux de réussite</span>
                    <p className="text-sm font-semibold text-gray-900">{conseilData.tauxReussite.toFixed(1)}%</p>
                  </div>
                </div>
                
                {/* Élèves excellents (≥16) - Premier */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-yellow-100 rounded-md">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {selectedLevel === 'maternelle' ? 'Élèves excellents (TS)' : 'Élèves excellents (≥16)'}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">{conseilData.decisions.admis}</p>
                  </div>
                </div>
                
                {/* Élèves encouragements (12-16) - Deuxième */}
                {selectedLevel === 'maternelle' ? (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Élèves satisfaisants (S)</span>
                      <p className="text-sm font-semibold text-gray-900">{'encouragements' in conseilData.decisions ? conseilData.decisions.encouragements : 0}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Élèves encouragements (12-16)</span>
                      <p className="text-sm font-semibold text-gray-900">{'encouragements' in conseilData.decisions ? conseilData.decisions.encouragements : 0}</p>
                    </div>
                  </div>
                )}
                
                {/* Élèves moyens (10-12) - Troisième */}
                {selectedLevel !== 'maternelle' && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-orange-100 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Élèves moyens (10-12)</span>
                      <p className="text-sm font-semibold text-gray-900">{conseilData.decisions.avertissement}</p>
                    </div>
                  </div>
                )}
                
                {/* Élèves en difficulté (<10) - Quatrième */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-100 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {selectedLevel === 'maternelle' ? 'Élèves en difficulté (PS)' : 'Élèves en difficulté (<10)'}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedLevel === 'maternelle' ? 
                        conseilData.decisions.redoublement : 
                        conseilData.decisions.redoublement
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h5 className="font-semibold text-gray-900">Validation</h5>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Date du conseil</span>
                    {isEditingCouncil ? (
                      <input
                        type="date"
                        value={councilData.dateConseil}
                        onChange={(e) => handleCouncilInputChange('dateConseil', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Date du conseil de classe"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(councilData.dateConseil).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-red-100 rounded-md">
                      <UserCheck className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Le Directeur(trice)</span>
                  </div>
                  <div className="mt-2 flex flex-col items-center">
                    {/* Cachet rouge avec signature intégrée */}
                    <div className="mt-4">
                      <div className="school-stamp">
                        <svg width="160" height="160" viewBox="0 0 160 160" className="stamp-svg">
                          {/* Définitions des chemins courbes pour le texte */}
                          <defs>
                            {/* Chemin pour l'arc supérieur extérieur (nom de l'école) - sens gauche à droite */}
                            <path id="path-top-outer" d="M 25 80 A 55 55 0 0 1 135 80" fill="none"/>
                            
                            {/* Chemin pour l'arc inférieur extérieur (adresse et téléphone) - mieux centré entre les cercles */}
                            <path id="path-bottom-outer" d="M 20 80 A 60 60 0 0 0 140 80" fill="none"/>
                          </defs>
                          
                          {/* Cercle extérieur */}
                          <circle cx="80" cy="80" r="70" fill="none" stroke="#dc2626" strokeWidth="4"/>
                          
                          {/* Cercle intérieur */}
                          <circle cx="80" cy="80" r="45" fill="none" stroke="#dc2626" strokeWidth="2"/>
                          
                          {/* Texte courbé - Arc supérieur extérieur (abréviation de l'école) */}
                          <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.2px', fontWeight: 700, letterSpacing: '0.5px' }}>
                            <textPath href="#path-top-outer" startOffset="0%" textAnchor="start">
                              {schoolSettingsLoading ? 'CHARGEMENT...' : (schoolSettings?.abbreviation || schoolSettings?.name || 'NOM ENTREPRISE').toUpperCase()}
                            </textPath>
                          </text>
                          
                          {/* Texte courbé - Arc inférieur extérieur (adresse et téléphone) */}
                          <text fill="#dc2626" className="stamp-text-outer" style={{ fontSize: '8.8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                            <textPath href="#path-bottom-outer" startOffset="8%" textAnchor="start">
                              {schoolSettingsLoading ? 'CHARGEMENT...' : `* ${schoolSettings?.address || 'Adresse'} - Tél: ${schoolSettings?.primaryPhone || '(+000) 00 00 00 00'} *`.toUpperCase()}
                            </textPath>
                          </text>
                          
                          {/* Texte horizontal - niveau (juste au-dessus du titre) */}
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
                            {councilData.directeur ? councilData.directeur.split(' ').slice(-2, -1)[0] : 'Signature'}
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                {successData.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {successData.message}
              </p>
              
              {/* Section d'informations supplémentaires selon le type */}
              {successData.type === 'save' && (
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-800">
                      Données sécurisées
                    </span>
                  </div>
                </div>
              )}
              
              {successData.type === 'export' && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Download className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-blue-800">
                      Document téléchargé
                    </span>
                  </div>
                </div>
              )}
              
              {successData.type === 'print' && (
                <div className="bg-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Print className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-purple-800">
                      Impression en cours
                    </span>
                  </div>
                </div>
              )}
              
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
    </div>
  );
}
