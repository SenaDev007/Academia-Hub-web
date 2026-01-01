import { useState, useEffect, useCallback } from 'react';
import {
  PlanningClass,
  PlanningRoom,
  PlanningSubject,
  PlanningTeacher,
  PlanningSchedule,
  PlanningBreak,
  WorkHoursConfig,
  PlanningStats
} from '../types/planning';
import { planningService } from '../services/planningService';
import { studentService } from '../services/studentService';
import { useUser } from '../contexts/UserContext';

interface UsePlanningDataReturn {
  // Data states
  classes: PlanningClass[];
  rooms: PlanningRoom[];
  subjects: PlanningSubject[];
  teachers: PlanningTeacher[];
  schedule: PlanningSchedule[];
  breaks: PlanningBreak[];
  workHours: WorkHoursConfig | null;
  stats: PlanningStats;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  refreshData: () => Promise<void>;
  createClass: (classData: Partial<PlanningClass>) => Promise<void>;
  updateClass: (id: string, classData: Partial<PlanningClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  createRoom: (roomData: Partial<PlanningRoom>) => Promise<void>;
  updateRoom: (id: string, roomData: Partial<PlanningRoom>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  createSubject: (subjectData: Partial<PlanningSubject>) => Promise<void>;
  createMultipleSubjects: (subjectsData: Partial<PlanningSubject>[]) => Promise<void>;
  updateSubject: (id: string, subjectData: Partial<PlanningSubject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubjectsByLevel: (level: string) => Promise<PlanningSubject[]>;
  createScheduleEntry: (scheduleData: Partial<PlanningSchedule>) => Promise<void>;
  saveBreaks: (breaks: PlanningBreak[]) => Promise<void>;
  saveWorkHours: (config: WorkHoursConfig) => Promise<void>;
}

// Fonction utilitaire pour vérifier si l'API Electron est disponible (désactivée - utilisation API HTTP uniquement)
const isElectronAPIAvailable = () => {
  return false; // Désactivé - utilisation API HTTP uniquement
};

// Données de test pour le mode développement
const getMockData = () => {
  return {
    classes: [
      { id: '1', name: '6ème A', level: '6ème', students: 28, mainTeacher: 'M. Dupont', room: 'Salle 101', teacherId: '1', roomId: '1' },
      { id: '2', name: '5ème B', level: '5ème', students: 30, mainTeacher: 'Mme Martin', room: 'Salle 102', teacherId: '2', roomId: '2' }
    ],
    rooms: [
      { id: '1', name: 'Salle 101', type: 'Salle de classe', capacity: 30, equipment: ['Tableau', 'Projecteur'], status: 'available' as const },
      { id: '2', name: 'Salle 102', type: 'Salle de classe', capacity: 30, equipment: ['Tableau', 'Ordinateur'], status: 'available' as const },
      { id: '3', name: 'Laboratoire SVT', type: 'Laboratoire', capacity: 25, equipment: ['Microscopes', 'Lunettes'], status: 'maintenance' as const }
    ],
    subjects: [
      { id: '1', name: 'Mathématiques', code: 'MATH', level: 'Tous niveaux', coefficient: 4 },
      { id: '2', name: 'Français', code: 'FR', level: 'Tous niveaux', coefficient: 4 },
      { id: '3', name: 'SVT', code: 'SVT', level: 'Tous niveaux', coefficient: 2 }
    ],
    teachers: [
      { id: '1', name: 'M. Dupont', subject: 'Mathématiques', classes: ['6ème A'], hoursPerWeek: 18 },
      { id: '2', name: 'Mme Martin', subject: 'Français', classes: ['5ème B'], hoursPerWeek: 16 }
    ],
    schedule: [],
    breaks: [],
    workHours: null,
    stats: { title: 'Classes actives', value: '2', change: '+2', icon: 'Users', color: 'from-blue-600 to-blue-700' }
  };
};

export function usePlanningData(academicYearId?: string): UsePlanningDataReturn {
  const { user } = useUser();
  const [classes, setClasses] = useState<PlanningClass[]>([]);
  const [rooms, setRooms] = useState<PlanningRoom[]>([]);
  const [subjects, setSubjects] = useState<PlanningSubject[]>([]);
  const [teachers, setTeachers] = useState<PlanningTeacher[]>([]);
  const [schedule, setSchedule] = useState<PlanningSchedule[]>([]);
  const [breaks, setBreaks] = useState<PlanningBreak[]>([]);
  const [workHours, setWorkHours] = useState<WorkHoursConfig | null>(null);
  const [stats, setStats] = useState<PlanningStats>({
    title: 'Classes actives',
    value: '0',
    change: '+0',
    icon: 'Users',
    color: 'from-blue-600 to-blue-700'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Attendre que l'API Electron soit disponible
    let attempts = 0;
    const maxAttempts = 50; // 5 secondes max
    
    while (!isElectronAPIAvailable() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!isElectronAPIAvailable()) {
      console.warn('Electron API not available after 5 seconds, using mock data');
    }
    
    // Vérifier si l'API Electron est disponible
    if (!isElectronAPIAvailable()) {
      console.warn('API Electron non disponible');
      setError('Mode développement : API Electron non disponible. Veuillez lancer l\'application Electron pour accéder aux données.');
      setLoading(false);
      return;
    }

    if (!user?.schoolId) {
      setError('Aucun établissement sélectionné');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Récupération des classes...');
      const allClassesData = await planningService.getClasses(user.schoolId);
      console.log('Classes récupérées:', allClassesData);
      console.log('Nombre de classes récupérées:', allClassesData?.length || 0);
      
      // Filtrer les classes qui ont des élèves pour l'année académique si spécifiée
      let classesData = allClassesData || [];
      if (academicYearId) {
        console.log('🎓 Filtrage des classes pour l\'année:', academicYearId);
        // Récupérer les classes qui ont des élèves pour cette année
        try {
          const studentsInYear = await studentService.getAllStudents({ academicYearId });
          const classIdsWithStudents = [...new Set(studentsInYear.map(student => student.classId))];
          classesData = classesData.filter(cls => classIdsWithStudents.includes(cls.id));
          console.log('🎯 Classes avec des élèves pour l\'année:', classesData.length, 'classes');
        } catch (error) {
          console.error('Erreur lors du filtrage des classes par année:', error);
          // En cas d'erreur, garder toutes les classes
        }
      }
      
      // Forcer la mise à jour de l'état
      setClasses(classesData);
      const roomsData = await planningService.getRooms(user.schoolId);
      setRooms(roomsData);

      const subjectsData = await planningService.getSubjects(user.schoolId);
      setSubjects(subjectsData);

      // Utiliser l'API HR pour récupérer tous les enseignants
      let teachersData = [];
      try {
        // Utiliser l'API HTTP au lieu d'Electron
        try {
          const { api } = await import('../lib/api/client');
          console.log('🔍 usePlanningData - Utilisation de l\'API HR pour récupérer les enseignants...');
          const hrResult = await api.hr.getPersonnel(user.schoolId);
          console.log('🔍 usePlanningData - Résultat HR brut:', hrResult);
          const hrData = hrResult.data?.data || hrResult.data || [];
          if (hrData && Array.isArray(hrData) && hrData.length > 0) {
            console.log('🔍 usePlanningData - Données HR brutes:', hrData.length, 'personnes');
            // Afficher tous les noms pour debug
            hrData.forEach((person: any, index: number) => {
              console.log(`🔍 Personne ${index}:`, person.firstName, person.lastName, '| Role:', person.role, '| Position:', person.position, '| JobTitle:', person.jobTitle);
            });
            
            // Filtrer seulement les enseignants
            teachersData = hrData.filter((person: any) => 
              person.role === 'teacher' || 
              person.position === 'teacher' || 
              person.jobTitle?.toLowerCase().includes('enseignant') ||
              person.jobTitle?.toLowerCase().includes('professeur')
            );
            console.log('🔍 usePlanningData - Enseignants récupérés via HR:', teachersData.length);
            teachersData.forEach((teacher: any, index: number) => {
              console.log(`🔍 Enseignant ${index}:`, {
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                name: teacher.name,
                fullName: teacher.fullName,
                allKeys: Object.keys(teacher)
              });
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des enseignants via HR:', error);
      }
      
      // Fallback vers planningService si HR échoue
      if (teachersData.length === 0) {
        console.log('🔍 usePlanningData - Fallback vers planningService...');
        teachersData = await planningService.getTeachers(user.schoolId);
        console.log('🔍 usePlanningData - Enseignants récupérés via planningService:', teachersData.length);
        teachersData.forEach((teacher: any, index: number) => {
          console.log(`🔍 Enseignant planningService ${index}:`, {
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            name: teacher.name,
            fullName: teacher.fullName,
            allKeys: Object.keys(teacher)
          });
        });
      }
      
      // Normaliser les données des enseignants pour s'assurer que firstName et lastName sont définis
      const normalizedTeachers = teachersData.map((teacher: any) => {
        // Si firstName et lastName ne sont pas définis, essayer de les extraire du nom complet
        let firstName = teacher.firstName;
        let lastName = teacher.lastName;
        
        if (!firstName || !lastName) {
          // Essayer différentes propriétés possibles
          const fullName = teacher.name || teacher.fullName || teacher.displayName || '';
          const nameParts = fullName.trim().split(' ');
          
          if (nameParts.length >= 2) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          } else if (nameParts.length === 1) {
            firstName = nameParts[0];
            lastName = '';
          } else {
            firstName = 'Nom';
            lastName = 'Inconnu';
          }
        }
        
        return {
          ...teacher,
          firstName,
          lastName
        };
      });
      
      console.log('🔍 usePlanningData - Enseignants normalisés:', normalizedTeachers.map(t => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        name: t.name
      })));
      
      setTeachers(normalizedTeachers);

      // Récupérer les affectations des enseignants
      console.log('🔍 usePlanningData - Début récupération des affectations...');
      const assignmentsData = await planningService.getTeacherAssignments(user.schoolId);
      console.log('🔍 usePlanningData - Assignments récupérées:', assignmentsData);
      console.log('🔍 usePlanningData - Nombre d\'assignments:', assignmentsData?.length || 0);
      
      // Enrichir les données des enseignants avec leurs affectations
      const enrichedTeachers = normalizedTeachers.map((teacher: any) => {
        const teacherAssignments = assignmentsData.filter(assignment => assignment.teacher_id === teacher.id);
        const assignedClasses = teacherAssignments.map(a => {
          const assignedClass = classesData.find(c => c.id === a.class_id);
          return assignedClass?.name || 'Classe inconnue';
        }).filter(Boolean);
        const totalHours = teacherAssignments.reduce((sum, a) => sum + (a.hours_per_week || 0), 0);
        
        // Récupérer les matières selon le mode - CORRIGÉ pour prendre en compte subjectId de la table teachers
        let subjects: string[] = [];
        let teacherMode = 'non_defini'; // Mode par défaut pour les enseignants sans affectation
        
        // D'abord, vérifier le subjectId directement dans la table teachers
        if (teacher.subjectId) {
          const teacherSubject = subjectsData.find(s => s.id === teacher.subjectId);
          if (teacherSubject) {
            subjects = [teacherSubject.name];
            // Déterminer le mode selon le nom de la matière
            if (teacherSubject.name.includes('primaire')) {
              teacherMode = 'primaire';
            } else if (teacherSubject.name.includes('maternelle')) {
              teacherMode = 'maternelle';
            } else if (teacherSubject.name.includes('secondaire')) {
              teacherMode = 'secondaire';
            }
            console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - SubjectId direct: ${teacherSubject.name}, Mode: ${teacherMode}`);
          }
        }
        
        // Si pas de subjectId ou pas trouvé, vérifier les affectations
        if (subjects.length === 0 && teacherAssignments.length > 0) {
          const assignment = teacherAssignments[0];
          teacherMode = assignment.mode || 'non_defini';
          
          console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Mode: ${teacherMode}, Subject_id: ${assignment.subject_id}`);
          
          if (teacherMode === 'secondaire') {
            // Pour secondaire : une matière spécifique si subject_id existe
            if (assignment.subject_id) {
              const subject = subjectsData.find(s => s.id === assignment.subject_id);
              if (subject) {
                subjects = [subject.name];
                console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Matière spécifique: ${subject.name}`);
              } else {
                subjects = ['Toutes les matières'];
                console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Subject_id non trouvé, utilisation de "Toutes les matières"`);
              }
            } else {
              subjects = ['Toutes les matières'];
              console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Pas de subject_id, utilisation de "Toutes les matières"`);
            }
          } else {
            // Pour maternelle/primaire : "Toutes les matières" du niveau
            subjects = ['Toutes les matières'];
            console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Mode ${teacherMode}, utilisation de "Toutes les matières"`);
          }
        } else if (subjects.length === 0) {
          // Pas de subjectId et pas d'affectations
          subjects = ['Toutes les matières'];
          teacherMode = 'non_defini';
          console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Aucune affectation ni subjectId, mode: ${teacherMode}`);
        }
        
        // Créer le libellé de la matière avec le niveau scolaire
        const subjectLabel = subjects.length > 0 ? subjects[0] : 'Toutes les matières';
        const levelLabel = teacherMode === 'maternelle' ? 'Maternelle' : 
                          teacherMode === 'primaire' ? 'Primaire' : 
                          teacherMode === 'secondaire' ? 'Secondaire' : 
                          teacherMode === 'non_defini' ? 'Non défini' : 'Non défini';
        
        const enrichedTeacher = {
          ...teacher,
          name: `${teacher.firstName} ${teacher.lastName}`, // Concaténer firstName et lastName
          classes: assignedClasses,
          hoursPerWeek: totalHours,
          subject: `${subjectLabel} (${levelLabel})`, // Matière avec niveau scolaire
          subjects: subjects, // Ajouter la liste complète des matières
          mode: teacherMode // Ajouter le mode de l'enseignant
        };
        
        console.log(`🔍 ${teacher.firstName} ${teacher.lastName} - Résultat final:`, {
          name: enrichedTeacher.name,
          subject: enrichedTeacher.subject,
          mode: enrichedTeacher.mode
        });
        
        return enrichedTeacher;
      });
      
      console.log('🔍 usePlanningData - Teachers enrichis:', enrichedTeachers);
      
      // Vérifier spécifiquement Elodie
      const elodie = enrichedTeachers.find((t: any) => t.name?.includes('Elodie'));
      if (elodie) {
        console.log('🔍 Elodie enrichie:', elodie);
        console.log('🔍 Elodie - subjects:', elodie.subjects);
        console.log('🔍 Elodie - subject (singulier):', elodie.subject);
        console.log('🔍 Elodie - classes:', elodie.classes);
        console.log('🔍 Elodie - hoursPerWeek:', elodie.hoursPerWeek);
      }
      
      // Vérifier spécifiquement Stevens
      const stevens = enrichedTeachers.find((t: any) => t.name?.includes('Stevens') || t.firstName?.includes('Stevens'));
      if (stevens) {
        console.log('🔍 Stevens enrichi:', stevens);
        console.log('🔍 Stevens - subjects:', stevens.subjects);
        console.log('🔍 Stevens - subject (singulier):', stevens.subject);
        console.log('🔍 Stevens - classes:', stevens.classes);
        console.log('🔍 Stevens - hoursPerWeek:', stevens.hoursPerWeek);
        console.log('🔍 Stevens - mode:', stevens.mode);
      } else {
        console.log('⚠️ Stevens AKPOVI non trouvé dans les enseignants enrichis');
        console.log('🔍 Liste des enseignants disponibles:', enrichedTeachers.map((t: any) => t.name));
      }
      
      setTeachers(enrichedTeachers);

      console.log('🔍 usePlanningData - Récupération du planning...');
      const scheduleData = await planningService.getSchedule();
      console.log('🔍 usePlanningData - Planning récupéré:', scheduleData);
      console.log('🔍 usePlanningData - Nombre d\'entrées:', scheduleData?.length || 0);
      if (scheduleData && scheduleData.length > 0) {
        console.log('🔍 usePlanningData - Première entrée:', scheduleData[0]);
        console.log('🔍 usePlanningData - classId:', scheduleData[0].classId);
        console.log('🔍 usePlanningData - dayOfWeek:', scheduleData[0].dayOfWeek);
        console.log('🔍 usePlanningData - startTime:', scheduleData[0].startTime);
        console.log('🔍 usePlanningData - endTime:', scheduleData[0].endTime);
      }

      // Enrichir les données du planning avec les noms des classes, matières, enseignants et salles
      const enrichedSchedule = scheduleData?.map(entry => {
        // Trouver la classe
        const classInfo = classesData?.find(c => c.id === entry.classId);
        const className = classInfo?.name || 'Classe inconnue';
        
        // Trouver la matière
        const subjectInfo = subjectsData?.find(s => s.id === entry.subjectId);
        const subjectName = subjectInfo?.name || 'Matière inconnue';
        
        // Trouver l'enseignant
        const teacherInfo = teachersData?.find(t => t.id === entry.teacherId);
        const teacherName = teacherInfo?.name || 'Enseignant inconnu';
        
        // Trouver la salle
        const roomInfo = roomsData?.find(r => r.id === entry.roomId);
        const roomName = roomInfo?.name || 'Salle inconnue';
        
        // Calculer la durée
        const startTime = entry.startTime;
        const endTime = entry.endTime;
        let duration = '1h';
        let durationMinutes = 60;
        
        if (startTime && endTime) {
          const start = new Date(`2000-01-01T${startTime}:00`);
          const end = new Date(`2000-01-01T${endTime}:00`);
          const diffMs = end.getTime() - start.getTime();
          durationMinutes = Math.round(diffMs / (1000 * 60));
          
          if (durationMinutes < 60) {
            duration = `${durationMinutes}min`;
          } else if (durationMinutes === 60) {
            duration = '1h';
          } else {
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            duration = minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
          }
        }
        
        // Déterminer le jour
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayName = days[entry.dayOfWeek] || 'Jour inconnu';
        
        return {
          ...entry,
          class: className,
          subject: subjectName,
          teacher: teacherName,
          room: roomName,
          day: dayName,
          time: `${startTime}-${endTime}`,
          duration,
          durationMinutes
        };
      }) || [];
      
      console.log('🔍 usePlanningData - Planning enrichi:', enrichedSchedule);
      setSchedule(enrichedSchedule);

      const breaksData = await planningService.getBreaks(user.schoolId);
      setBreaks(breaksData);

      const workHoursData = await planningService.getWorkHoursConfig(user.schoolId);
      setWorkHours(workHoursData);
      
      const statsData = await planningService.getPlanningStats(user.schoolId);
      
      // Calculer les vraies statistiques basées sur les données récupérées
      const realStats = {
          title: 'Classes actives',
        value: Array.isArray(classesData) ? classesData.length.toString() : '0',
        change: `+${Array.isArray(classesData) ? classesData.length : 0}`,
          icon: 'Users',
          color: 'from-blue-600 to-blue-700'
      };
      
      setStats(realStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Error fetching planning data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  // CRUD operations
  const createClass = async (classData: Partial<PlanningClass>) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    if (!user?.schoolId) {
      throw new Error('Aucun établissement sélectionné');
    }

    try {
      console.log('=== DEBUG createClass dans usePlanningData ===');
      console.log('Données à envoyer:', { ...classData, schoolId: user.schoolId });
      
      const result = await planningService.createClass({ ...classData, schoolId: user.schoolId });
      console.log('✅ Classe créée avec succès:', result);
      
      console.log('🔄 Rafraîchissement des données...');
      await fetchData();
      console.log('✅ Données rafraîchies');
      
      // Vérification supplémentaire après un court délai
      setTimeout(async () => {
        console.log('🔍 Vérification supplémentaire des données...');
        const verificationData = await planningService.getClasses(user.schoolId);
        console.log('Données de vérification:', verificationData?.length || 0, 'classes');
        setClasses(verificationData || []);
      }, 500);
    } catch (err) {
      console.error('❌ Erreur lors de la création de la classe:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la classe');
      throw err;
    }
  };

  const updateClass = async (id: string, classData: Partial<PlanningClass>) => {
    console.log('=== DEBUG updateClass dans usePlanningData ===');
    console.log('id:', id);
    console.log('classData reçu:', classData);
    console.log('isElectronAPIAvailable():', isElectronAPIAvailable());
    
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      console.log('Appel de planningService.updateClass avec:', id, classData);
      const result = await planningService.updateClass(id, classData);
      console.log('planningService.updateClass réussi, résultat:', result);
      console.log('Appel de fetchData...');
      await fetchData();
      console.log('fetchData terminé');
    } catch (err) {
      console.error('Erreur dans updateClass:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la classe');
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.deleteClass(id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe');
      throw err;
    }
  };

  const createRoom = async (roomData: Partial<PlanningRoom>) => {
    console.log('=== DEBUG createRoom dans usePlanningData ===');
    console.log('roomData reçu:', roomData);
    console.log('isElectronAPIAvailable():', isElectronAPIAvailable());
    console.log('user?.schoolId:', user?.schoolId);
    
    if (!isElectronAPIAvailable()) {
      console.error('API Electron non disponible');
      throw new Error('Mode développement : API Electron non disponible');
    }

    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }

    try {
      console.log('Appel de planningService.createRoom avec:', { ...roomData, schoolId: user.schoolId });
      await planningService.createRoom({ ...roomData, schoolId: user.schoolId });
      console.log('planningService.createRoom réussi, appel de fetchData');
      await fetchData();
      console.log('fetchData terminé');
    } catch (err) {
      console.error('Erreur dans createRoom:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la salle');
      throw err;
    }
  };

  const updateRoom = async (id: string, roomData: Partial<PlanningRoom>) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.updateRoom(id, roomData);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la salle');
      throw err;
    }
  };

  const deleteRoom = async (id: string) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.deleteRoom(id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la salle');
      throw err;
    }
  };

  const createSubject = async (subjectData: Partial<PlanningSubject>) => {
    console.log('🔍 usePlanningData.createSubject appelé avec:', subjectData);
    console.log('🔍 subjectData.classId:', subjectData.classId);
    console.log('🔍 subjectData.level:', subjectData.level);
    console.log('🔍 subjectData.coefficient:', subjectData.coefficient);
    
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    if (!user?.schoolId) {
      throw new Error('Aucun établissement sélectionné');
    }

    const finalSubjectData = { ...subjectData, schoolId: user.schoolId };
    console.log('🔍 Données finales envoyées au service:', finalSubjectData);

    try {
      await planningService.createSubject(finalSubjectData);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la matière');
      throw err;
    }
  };

  const createMultipleSubjects = async (subjectsData: Partial<PlanningSubject>[]) => {
    console.log('🔍 usePlanningData.createMultipleSubjects appelé avec:', subjectsData);
    console.log('🔍 Nombre de matières:', subjectsData.length);
    subjectsData.forEach((subject, index) => {
      console.log(`🔍 Matière ${index + 1}:`, {
        name: subject.name,
        classId: subject.classId,
        level: subject.level,
        coefficient: subject.coefficient
      });
    });
    
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    if (!user?.schoolId) {
      throw new Error('Aucun établissement sélectionné');
    }

    try {
      // Créer toutes les matières en parallèle
      const promises = subjectsData.map(subjectData => {
        const finalSubjectData = { ...subjectData, schoolId: user.schoolId };
        console.log('🔍 Données finales pour createSubject:', finalSubjectData);
        return planningService.createSubject(finalSubjectData);
      });
      
      await Promise.all(promises);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création des matières');
      throw err;
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<PlanningSubject>) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.updateSubject(id, subjectData);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la matière');
      throw err;
    }
  };

  const deleteSubject = async (id: string) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.deleteSubject(id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la matière');
      throw err;
    }
  };

  const getSubjectsByLevel = async (level: string): Promise<PlanningSubject[]> => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    if (!user?.schoolId) {
      throw new Error('Aucun établissement sélectionné');
    }

    try {
      const subjectsData = await planningService.getSubjectsByLevel(user.schoolId, level);
      return subjectsData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des matières par niveau');
      throw err;
    }
  };

  const createScheduleEntry = async (scheduleData: Partial<PlanningSchedule>) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.createScheduleEntry(scheduleData);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du cours');
      throw err;
    }
  };

  const saveBreaks = async (breaksData: PlanningBreak[]) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.saveBreaks(breaksData);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des pauses');
      throw err;
    }
  };

  const saveWorkHours = async (config: WorkHoursConfig) => {
    if (!isElectronAPIAvailable()) {
      throw new Error('Mode développement : API Electron non disponible');
    }

    try {
      await planningService.saveWorkHoursConfig(config);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des heures de travail');
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recharger les données quand l'année académique change
  useEffect(() => {
    if (academicYearId) {
      console.log('🔄 Rechargement des données pour l\'année:', academicYearId);
      fetchData();
    }
  }, [academicYearId, fetchData]);

  return {
    // Data states
    classes,
    rooms,
    subjects,
    teachers,
    schedule,
    breaks,
    workHours,
    stats,
    
    // Loading states
    loading,
    error,
    
    // CRUD operations
    refreshData: fetchData,
    createClass,
    updateClass,
    deleteClass,
    createRoom,
    updateRoom,
    deleteRoom,
    createSubject,
    createMultipleSubjects,
    updateSubject,
    deleteSubject,
    getSubjectsByLevel,
    createScheduleEntry,
    saveBreaks,
    saveWorkHours
  };
}
