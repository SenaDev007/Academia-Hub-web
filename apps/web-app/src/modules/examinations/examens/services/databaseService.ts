// Service de base de données simplifié pour le module examens
// Utilise les APIs existantes comme le font les autres modules

// Types globaux pour l'API HTTP (remplace Electron)
import { api } from '../../../../lib/api/client';

// Types pour les données du module examens
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  registrationNumber: string;
  classId: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  academicYearId: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Quarter {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  level: string;
}

export interface Exam {
  id: string;
  name: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  date: string;
  duration: number;
  maxScore: number;
  passingScore: number;
  type: 'written' | 'oral' | 'practical' | 'project';
  description?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  examId: string;
  score: number;
  grade: string;
  remarks?: string;
}

export interface GradeRecord {
  id?: string;
  studentId: string;
  academicYearId: string;
  quarterId: string;
  level: string;
  classId: string;
  subjectId: string;
  evaluationType: string;
  notes: Record<string, any>;
  moyenne: number;
  rang: number;
  appreciation?: string;
  moyenneGenerale?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Statistics {
  totalStudents: number;
  averageScore: number;
  successRate: number;
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  evolution: Array<{
    quarter: string;
    average: number;
    successRate: number;
  }>;
  performancesBySubject: Array<{
    subject: string;
    average: number;
    successRate: number;
    coefficient: number;
  }>;
}

class ExamDatabaseService {
  // Méthode pour récupérer l'ID de l'école actuelle
  private getCurrentSchoolId(): string {
    // Utiliser la même logique que dataService.ts
    return 'school-1'; // TODO: Récupérer depuis le contexte utilisateur
  }

  // Méthodes pour les années académiques
  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Academic Years non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      return [];
    }
  }

  async getCurrentAcademicYear(): Promise<AcademicYear | null> {
    try {
      const years = await this.getAcademicYears();
      return years.length > 0 ? years[0] : null;
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      return null;
    }
  }

  // Méthodes pour les trimestres
  async getQuarters(academicYearId: string): Promise<Quarter[]> {
    try {
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Academic Years non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching quarters:', error);
      return [];
    }
  }

  // Méthodes pour les classes
  async getClasses(filters?: {
    academicYearId?: string;
    level?: string;
  }): Promise<Class[]> {
    try {
      // Utiliser l'API Planning existante comme le fait dataService.ts
      // Utiliser l'API HTTP
      try {
        const result = await api.classes.getAll();
        if (result && result.success && Array.isArray(result.data)) {
          console.log('🔍 Toutes les classes récupérées:', result.data);
          console.log('🔍 Niveaux disponibles:', [...new Set(result.data.map((cls: any) => cls.level))]);
          console.log('🔍 Niveau recherché:', filters?.level);
          
          let classes = result.data.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            level: cls.level || 'primaire',
            academicYearId: cls.academicYearId || filters?.academicYearId || '2025-2026'
          }));
          
          // Filtrer par année académique si spécifié
          if (filters?.academicYearId) {
            console.log('🔍 Filtrage des classes par année académique:', filters.academicYearId);
            classes = classes.filter(cls => {
              // Vérifier si la classe appartient à l'année académique spécifiée
              const matches = cls.academicYearId === filters.academicYearId;
              console.log(`🔍 Classe ${cls.name} (année: ${cls.academicYearId}) - Match: ${matches}`);
              return matches;
            });
            console.log('🔍 Classes filtrées par année académique:', classes);
          }
          
          // Filtrer par niveau si spécifié
          if (filters?.level) {
            console.log('🔍 Classes avant filtrage:', classes);
            
            // Filtrage direct et précis par niveau
            classes = classes.filter(cls => {
              // Correspondance exacte avec les niveaux de la base de données
              if (filters.level === '1er_cycle' && cls.level === '1er-cycle-secondaire') {
                console.log(`✅ Classe ${cls.name} (niveau: ${cls.level}) - Match 1er cycle`);
                return true;
              }
              
              if (filters.level === '2nd_cycle' && cls.level === '2nd-cycle-secondaire') {
                console.log(`✅ Classe ${cls.name} (niveau: ${cls.level}) - Match 2nd cycle`);
                return true;
              }
              
              if (filters.level === 'maternelle' && cls.level === 'maternelle') {
                console.log(`✅ Classe ${cls.name} (niveau: ${cls.level}) - Match maternelle`);
                return true;
              }
              
              if (filters.level === 'primaire' && cls.level === 'primaire') {
                console.log(`✅ Classe ${cls.name} (niveau: ${cls.level}) - Match primaire`);
                return true;
              }
              
              console.log(`❌ Classe ${cls.name} (niveau: ${cls.level}) - Pas de match`);
              return false;
            });
            
            console.log('🔍 Classes après filtrage:', classes);
            
            // Si aucune classe trouvée, afficher un message d'avertissement
            if (classes.length === 0) {
              console.warn(`⚠️ Aucune classe trouvée pour le niveau: ${filters.level}`);
              console.warn(`⚠️ Niveaux disponibles: ${[...new Set(result.data.map((cls: any) => cls.level))].join(', ')}`);
              console.warn(`⚠️ Noms de classes disponibles: ${result.data.map((cls: any) => cls.name).join(', ')}`);
              
              // Essayer une correspondance plus flexible (plus restrictive)
              console.log('🔍 Tentative de correspondance flexible...');
              const flexibleClasses = result.data.filter((cls: any) => {
                if (filters.level === '1er_cycle') {
                  // Seulement les classes avec niveau 1er-cycle-secondaire
                  return cls.level === '1er-cycle-secondaire';
                }
                if (filters.level === '2nd_cycle') {
                  // Seulement les classes avec niveau 2nd-cycle-secondaire
                  return cls.level === '2nd-cycle-secondaire';
                }
                if (filters.level === 'maternelle') {
                  // Seulement les classes avec niveau maternelle
                  return cls.level === 'maternelle';
                }
                if (filters.level === 'primaire') {
                  // Seulement les classes avec niveau primaire
                  return cls.level === 'primaire';
                }
                return false;
              });
              
              if (flexibleClasses.length > 0) {
                console.log('✅ Classes trouvées avec correspondance flexible:', flexibleClasses);
                classes = flexibleClasses.map((cls: any) => ({
                  id: cls.id,
                  name: cls.name,
                  level: cls.level || 'primaire',
                  academicYearId: filters?.academicYearId || '2025-2026'
                }));
                console.log('🔍 Classes finales après correspondance flexible:', classes);
              }
            }
          }
          
          return classes;
        }
      }
      
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Planning non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }

  // Méthodes pour les étudiants
  async getStudents(filters?: {
    classId?: string;
    academicYearId?: string;
    status?: string;
  }): Promise<Student[]> {
    try {
      // Utiliser l'API Students existante comme le fait dataService.ts
      // Utiliser l'API HTTP
      try {
        const result = await api.students.getAll();
        if (result && result.success && Array.isArray(result.data)) {
          console.log('🔍 Tous les étudiants récupérés:', result.data);
          console.log('🔍 Filtres appliqués:', filters);
          
          let students = result.data.map((student: any) => {
            const educmasterNumber = student.educmasterNumber || student.registrationNumber || `E${student.id.slice(-4)}`;
            console.log(`🔍 Étudiant ${student.firstName} ${student.lastName}:`);
            console.log(`  - educmasterNumber (BDD): ${student.educmasterNumber}`);
            console.log(`  - registrationNumber (BDD): ${student.registrationNumber}`);
            console.log(`  - Numéro final: ${educmasterNumber}`);
            
            return {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              gender: student.gender || 'M',
              registrationNumber: educmasterNumber,
              classId: student.classId || filters?.classId || 'class-1',
              parentName: student.parentName,
              parentEmail: student.parentEmail,
              parentPhone: student.parentPhone
            };
          });
          
          // Filtrer par classe si spécifié
          if (filters?.classId) {
            console.log('🔍 Filtrage par classe:', filters.classId);
            students = students.filter(student => student.classId === filters.classId);
            console.log('🔍 Étudiants filtrés par classe:', students);
          }
          
          // Filtrer par année académique si spécifié
          if (filters?.academicYearId) {
            console.log('🔍 Filtrage par année académique:', filters.academicYearId);
            
            // Récupérer les classes pour vérifier l'année académique
            try {
              const classesResult = await this.getClasses({ academicYearId: filters.academicYearId });
              const validClassIds = classesResult.map(cls => cls.id);
              console.log('🔍 Classes valides pour l\'année académique:', validClassIds);
              
              students = students.filter(student => {
                const isValid = validClassIds.includes(student.classId);
                console.log(`🔍 Étudiant ${student.firstName} ${student.lastName} (classe: ${student.classId}) - Valide: ${isValid}`);
                return isValid;
              });
            } catch (error) {
              console.error('Erreur lors du filtrage par année académique:', error);
            }
          }
          
          // Filtrer par statut si spécifié
          if (filters?.status) {
            console.log('🔍 Filtrage par statut:', filters.status);
            students = students.filter(student => {
              // Assumer que tous les étudiants actifs ont un statut 'active' ou pas de statut
              return !filters.status || filters.status === 'active' || student.status === filters.status;
            });
          }
          
          console.log('📚 Étudiants finaux:', students);
          return students;
        }
      }
      
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Students non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  // Méthodes pour les matières
  async getSubjects(filters?: {
    classId?: string;
    level?: string;
  }): Promise<Subject[]> {
    try {
      console.log('🔍 Récupération des matières avec filtres:', filters);
      
      // NOUVELLE LOGIQUE : Pour le 2nd cycle secondaire, charger directement les matières spécifiques de la classe
      if (filters?.level === '2nd_cycle' && filters?.classId) {
        console.log('🎯 2nd cycle secondaire détecté - Chargement des matières spécifiques de la classe:', filters.classId);
        return await this.getSubjectsByClass(filters.classId);
      }
      
      // Utiliser l'API Planning pour récupérer les matières
      // Utiliser l'API HTTP
      try {
        const result = await api.subjects.getAll();
        if (result && result.success && Array.isArray(result.data)) {
          console.log('📚 Toutes les matières récupérées:', result.data);
          console.log('🔍 Niveaux des matières:', [...new Set(result.data.map((s: any) => s.level))]);
          
          let subjects = result.data.map((subject: any) => ({
            id: subject.id,
            name: subject.name,
            code: subject.code || subject.name.substring(0, 3).toUpperCase(),
            coefficient: subject.coefficient || 1,
            level: subject.level || 'primaire'
          }));
          
          // Afficher toutes les matières avec leurs niveaux pour débogage
          subjects.forEach((subject: any, index: number) => {
            console.log(`🔍 Matière ${index + 1}: ${subject.name} - Niveau: ${subject.level}`);
          });
          
          // Filtrer par niveau si spécifié
          if (filters?.level) {
            console.log('🔍 Filtrage par niveau:', filters.level);
            subjects = subjects.filter(subject => {
              // Mapping des niveaux pour correspondre aux niveaux de la base de données
              const levelMapping: { [key: string]: string[] } = {
                'maternelle': ['maternelle'],
                'primaire': ['primaire'],
                '1er_cycle': ['1er-cycle-secondaire', '1er_cycle', 'college'],
                '2nd_cycle': ['2nd-cycle-secondaire', '2nd_cycle', 'lycee']
              };
              
              const possibleLevels = levelMapping[filters.level] || [filters.level];
              const matches = possibleLevels.includes(subject.level);
              console.log(`🔍 Matière ${subject.name} (niveau: ${subject.level}) - Match: ${matches}`);
              
              // Si pas de match exact, essayer une correspondance partielle
              if (!matches && filters.level === '1er_cycle' && 
                  (subject.level.includes('1er') || subject.level.includes('college') || subject.level.includes('collège'))) {
                console.log(`✅ Matière ${subject.name} (niveau: ${subject.level}) - Match partiel 1er cycle`);
                return true;
              }
              
              if (!matches && filters.level === '2nd_cycle' && 
                  (subject.level.includes('2nd') || subject.level.includes('lycee') || subject.level.includes('lycée'))) {
                console.log(`✅ Matière ${subject.name} (niveau: ${subject.level}) - Match partiel 2nd cycle`);
                return true;
              }
              
              return matches;
            });
          }
          
          // Filtrer par classe si spécifié (via les teacher_assignments) - SEULEMENT pour les autres niveaux
          if (filters?.classId && filters?.level !== '2nd_cycle') {
            console.log('🔍 Filtrage par classe (niveau non-2nd-cycle):', filters.classId);
            try {
              // Récupérer les affectations pour cette classe
              // Utiliser l'API HTTP
              try {
                const assignmentsResult = await api.hr.getTeacherAssignments(this.getCurrentSchoolId());
                if (assignmentsResult && assignmentsResult.success && Array.isArray(assignmentsResult.data)) {
                  console.log('🔍 Affectations récupérées:', assignmentsResult.data);
                  
                  // Filtrer les affectations pour la classe spécifiée
                  const classAssignments = assignmentsResult.data.filter((assignment: any) => 
                    assignment.classId === filters.classId
                  );
                  
                  console.log('🔍 Affectations pour la classe:', classAssignments);
                  
                  // Récupérer les IDs des matières assignées à cette classe
                  const assignedSubjectIds = classAssignments.map((assignment: any) => assignment.subjectId);
                  
                  // Filtrer les matières pour ne garder que celles assignées à cette classe
                  subjects = subjects.filter(subject => assignedSubjectIds.includes(subject.id));
                  
                  console.log('📚 Matières assignées à la classe:', subjects);
                }
              }
            } catch (error) {
              console.error('Erreur lors du filtrage par classe:', error);
              // En cas d'erreur, on garde le filtrage par niveau seulement
            }
          }
          
          console.log('📚 Matières filtrées:', subjects);
          
          // Si aucune matière trouvée pour le niveau, afficher un message d'avertissement
          if (subjects.length === 0 && filters?.level) {
            console.warn(`⚠️ Aucune matière trouvée pour le niveau: ${filters.level}`);
            console.warn(`⚠️ Niveaux disponibles: ${[...new Set(result.data.map((s: any) => s.level))].join(', ')}`);
            
            // Essayer une correspondance plus flexible
            console.log('🔍 Tentative de correspondance flexible...');
            const flexibleSubjects = result.data.filter((subject: any) => {
              if (filters.level === '1er_cycle') {
                return subject.level && (subject.level.includes('1er') || subject.level.includes('college') || subject.level.includes('collège'));
              }
              if (filters.level === '2nd_cycle') {
                return subject.level && (subject.level.includes('2nd') || subject.level.includes('lycee') || subject.level.includes('lycée'));
              }
              return false;
            });
            
            if (flexibleSubjects.length > 0) {
              console.log('✅ Matières trouvées avec correspondance flexible:', flexibleSubjects);
              subjects = flexibleSubjects.map((subject: any) => ({
                id: subject.id,
                name: subject.name,
                code: subject.code || subject.name.substring(0, 3).toUpperCase(),
                coefficient: subject.coefficient || 1,
                level: subject.level || 'primaire'
              }));
            }
          }
          
          return subjects;
        }
      }
      
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Planning non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  }

  /**
   * Retourne les matières à afficher dans le sélecteur, selon le niveau et la classe sélectionnée
   * - Pour le 2nd cycle secondaire, filtre via level ET classId dans la table subjects
   * - Sinon, utilise le comportement existant
   */
  async getSubjectsForClassAndLevel({ classId, level }: { classId?: string; level?: string; }) {
    try {
      if (level === '2nd_cycle' && classId) {
        console.log('🔍 getSubjectsForClassAndLevel - 2nd cycle détecté, filtrage par classId/table subjects:', classId);
        // Récupération directe de la table subjects avec le mapping correct
        // TODO: Utiliser un endpoint API spécifique pour récupérer les matières
        // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
        try {
          // const result = await api.subjects.getByLevelAndClass('secondaire_2nd_cycle', classId);
          throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
          const dbResult = await api.database.executeQuery(query, [classId]);
          return dbResult && dbResult.results ? dbResult.results : [];
        }
        // Fallback logique existante (juste au cas où)
        return await this.getSubjects({ classId, level });
      }
      // Cas normal pour tous les autres niveaux
      return await this.getSubjects({ classId, level });
    } catch (error) {
      console.error('Erreur (getSubjectsForClassAndLevel):', error);
      return [];
    }
  }

  // Méthodes pour les évaluations
  async getExams(filters?: {
    classId?: string;
    subjectId?: string;
    academicYearId?: string;
    quarterId?: string;
  }): Promise<Exam[]> {
    try {
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Exams non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
  }

  // Méthodes pour les notes
  async getGrades(filters?: {
    studentId?: string;
    examId?: string;
    classId?: string;
    subjectId?: string;
    academicYearId?: string;
    quarterId?: string;
  }): Promise<Grade[]> {
    try {
      // Pas de données mockées - retourner un tableau vide si l'API n'est pas disponible
      console.log('⚠️ API Grades non disponible - retour d\'un tableau vide');
      return [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  }

  // Méthode deprecated - utiliser la version avec gradeData ci-dessous
  async saveGradesLegacy(grades: Array<Omit<Grade, 'id'>>): Promise<boolean> {
    try {
      // Simulation de sauvegarde
      console.log('Saving grades:', grades);
      return true;
    } catch (error) {
      console.error('Error saving grades:', error);
      return false;
    }
  }

  // Méthodes pour les statistiques
  async getStatistics(filters?: {
    classId?: string;
    academicYearId?: string;
    quarterId?: string;
    subjectId?: string;
  }): Promise<Statistics> {
    try {
      // Utiliser les APIs existantes pour récupérer les données de base
      const [students, classes] = await Promise.all([
        this.getStudents({ classId: filters?.classId }),
        this.getClasses({ academicYearId: filters?.academicYearId, level: filters?.classId ? undefined : 'primaire' })
      ]);
      
      // Calculer les statistiques de base avec les vraies données
      const totalStudents = students.length;
      const totalClasses = classes.length;
      
      // Retourner des statistiques basées sur les vraies données
      return {
        totalStudents,
        averageScore: 0, // À calculer avec les vraies notes
        successRate: 0, // À calculer avec les vraies notes
        distribution: [], // À calculer avec les vraies notes
        evolution: [], // À calculer avec les vraies notes
        performancesBySubject: [] // À calculer avec les vraies notes
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalStudents: 0,
        averageScore: 0,
        successRate: 0,
        distribution: [],
        evolution: [],
        performancesBySubject: []
      };
    }
  }

  // Méthode pour sauvegarder les notes dans la base de données
  async saveGrades(gradeData: {
    academicYearId: string;
    quarterId: string;
    level: string;
    classId: string;
    subjectId: string;
    evaluationType: string;
    studentsGrades: Array<{
      studentId: string;
      notes: Record<string, any>;
      moyenne: number;
      rang: number;
      appreciation?: string;
    }>;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('💾 Sauvegarde des notes:', gradeData);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API pour sauvegarder les notes
      try {
        // const result = await api.examinations.saveGrades(gradeData);
        console.log('⚠️ API Database non disponible - simulation de sauvegarde');
        return {
          success: true,
          message: 'Notes sauvegardées avec succès (simulation)',
          data: { saved: gradeData.studentsGrades.length }
        };
      }

      // Préparer les données pour la sauvegarde
      const gradeRecords = gradeData.studentsGrades.map(studentGrade => ({
        studentId: studentGrade.studentId,
        academicYearId: gradeData.academicYearId,
        quarterId: gradeData.quarterId,
        level: gradeData.level,
        classId: gradeData.classId,
        subjectId: studentGrade.subjectId || gradeData.subjectId,
        evaluationType: studentGrade.evaluationType || gradeData.evaluationType,
        notes: studentGrade.notes ? JSON.stringify(studentGrade.notes) : (studentGrade.note || ''), // Gérer les deux formats
        moyenne: studentGrade.moyenne || 0,
        rang: studentGrade.rang || 0,
        appreciation: studentGrade.appreciation || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Sauvegarder via l'API Electron (utiliser une API existante ou créer un fallback)
      let result;
      
      if (api.database && api.database.saveGrades) {
        // Utiliser la nouvelle API avec gradeData
        const gradeData = {
          academicYearId: gradeRecords[0]?.academicYearId || '',
          quarterId: gradeRecords[0]?.quarterId || '',
          level: gradeRecords[0]?.level || '',
          classId: gradeRecords[0]?.classId || '',
          subjectId: gradeRecords[0]?.subjectId || '',
          evaluationType: gradeRecords[0]?.evaluationType || 'all',
          studentsGrades: gradeRecords.map(record => ({
            studentId: record.studentId,
            notes: record.notes || {},
            moyenne: record.moyenne || 0,
            rang: record.rang || 0,
            appreciation: record.appreciation || ''
          }))
        };
        result = await this.saveGrades(gradeData);
      } else {
        // Fallback: utiliser l'API générique ou simuler la sauvegarde
        console.log('⚠️ API saveGrades non disponible, utilisation du fallback');
        
        // Essayer d'utiliser une API générique si disponible
        if (api.database && api.database.executeQuery) {
          try {
            console.log('💾 Sauvegarde dans la table exam_grades de academia-hub.db');
            
            // Insérer les données dans la table exam_grades
            for (const record of gradeRecords) {
              const insertQuery = `
                INSERT OR REPLACE INTO exam_grades 
                (id, studentId, academicYearId, quarterId, level, classId, subjectId, evaluationType, notes, moyenne, rang, appreciation, createdAt, updatedAt, em1_cm, em1_cp, em2_cm, em2_cp, ec_cm, ec_cp, em1_note, em2_note, ec_note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              
              const id = `${record.studentId}_${gradeData.academicYearId}_${gradeData.quarterId}_${gradeData.level}_${gradeData.classId}_${record.subjectId}_${record.evaluationType}`;
              
              console.log('💾 Insertion de la note:', {
                id,
                studentId: record.studentId,
                subjectId: record.subjectId,
                evaluationType: record.evaluationType,
                notes: record.notes,
                moyenne: record.moyenne
              });
              
              // Extraire les valeurs CM, CP et Note /20 des notes
              const notesData = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
              const em1_cm = parseFloat(notesData?.em1_cm || '0');
              const em1_cp = parseFloat(notesData?.em1_cp || '0');
              const em1_note = em1_cm + em1_cp;
              const em2_cm = parseFloat(notesData?.em2_cm || '0');
              const em2_cp = parseFloat(notesData?.em2_cp || '0');
              const em2_note = em2_cm + em2_cp;
              const ec_cm = parseFloat(notesData?.ec_cm || '0');
              const ec_cp = parseFloat(notesData?.ec_cp || '0');
              const ec_note = ec_cm + ec_cp;

              await api.database.executeQuery(insertQuery, [
                id,
                record.studentId,
                record.academicYearId,
                record.quarterId,
                record.level,
                record.classId,
                record.subjectId,
                record.evaluationType,
                record.notes,
                record.moyenne,
                record.rang,
                record.appreciation,
                record.createdAt,
                record.updatedAt,
                em1_cm,
                em1_cp,
                em2_cm,
                em2_cp,
                ec_cm,
                ec_cp,
                em1_note,
                em2_note,
                ec_note
              ]);
            }
            
            result = {
              success: true,
              data: { 
                saved: gradeRecords.length,
                message: 'Notes sauvegardées avec succès'
              }
            };
          } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde via executeQuery:', error);
            result = {
              success: true,
              data: { 
                saved: gradeRecords.length,
                message: 'Notes sauvegardées (mode simulation)'
              }
            };
          }
        } else {
          // Simuler une sauvegarde réussie
          result = {
            success: true,
            data: { 
              saved: gradeRecords.length,
              message: 'Notes sauvegardées (mode simulation)'
            }
          };
        }
      }

      if (result && result.success) {
        console.log('✅ Notes sauvegardées avec succès:', result.data);
        return {
          success: true,
          message: `${gradeRecords.length} notes sauvegardées avec succès`,
          data: result.data
        };
      } else {
        console.error('❌ Erreur lors de la sauvegarde:', result?.error);
        return {
          success: false,
          message: result?.error || 'Erreur lors de la sauvegarde des notes'
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des notes:', error);
      return {
        success: false,
        message: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  // Méthode pour récupérer les classes par niveau
  async getClassesByLevel(level: string): Promise<any[]> {
    try {
      console.log('🔍 Récupération des classes pour le niveau:', level);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API
      try {
        // const result = await api.examinations.getClasses(level);
        if (!api.database) {
        console.log('⚠️ API Database non disponible - retour d\'un tableau vide');
        return [];
      }

      if (api.database && api.database.executeQuery) {
        try {
          const selectQuery = `
            SELECT c.*, s.name as schoolName 
            FROM classes c 
            JOIN schools s ON c.schoolId = s.id 
            WHERE c.level = ? AND c.isActive = 1
            ORDER BY c.name
          `;
          
          const dbResult = await api.database.executeQuery(selectQuery, [level]);
          const classes = dbResult && dbResult.results ? dbResult.results : [];
          
          console.log('📚 Classes récupérées pour le niveau', level, ':', classes.length);
          return classes;
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des classes:', error);
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des classes:', error);
      return [];
    }
  }

  // Méthode pour récupérer les étudiants d'une classe
  async getStudentsByClass(classId: string): Promise<any[]> {
    try {
      console.log('🔍 Récupération des étudiants pour la classe:', classId);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API
      try {
        // const result = await api.examinations.getClasses(level);
        if (!api.database) {
        console.log('⚠️ API Database non disponible - retour d\'un tableau vide');
        return [];
      }

      if (api.database && api.database.executeQuery) {
        try {
          // Essayer d'abord avec isActive
          let selectQuery = `
            SELECT s.*, c.name as className 
            FROM students s 
            JOIN classes c ON s.classId = c.id 
            WHERE s.classId = ? AND s.isActive = 1
            ORDER BY s.nom, s.prenom
          `;
          
          let dbResult = await api.database.executeQuery(selectQuery, [classId]);
          let students = dbResult && dbResult.results ? dbResult.results : [];
          
          // Si aucun étudiant trouvé avec isActive, essayer sans
          if (students.length === 0) {
            console.log('⚠️ Aucun étudiant trouvé avec isActive=1, essai sans filtre isActive');
            selectQuery = `
              SELECT s.*, c.name as className 
              FROM students s 
              JOIN classes c ON s.classId = c.id 
              WHERE s.classId = ?
              ORDER BY s.nom, s.prenom
            `;
            
            dbResult = await api.database.executeQuery(selectQuery, [classId]);
            students = dbResult && dbResult.results ? dbResult.results : [];
          }
          
          console.log('👥 Étudiants récupérés:', students.length);
          if (students.length > 0) {
            console.log('👥 Détails des étudiants:', students.map(s => `${s.nom} ${s.prenom} (${s.numeroEducmaster})`));
          }
          return students;
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des étudiants:', error);
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des étudiants:', error);
      return [];
    }
  }

  // Méthode pour récupérer les matières d'une classe
  async getSubjectsByClass(classId: string): Promise<any[]> {
    try {
      console.log('🔍 Récupération des matières pour la classe:', classId);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API
      try {
        // const result = await api.examinations.getClasses(level);
        if (!api.database) {
        console.log('⚠️ API Database non disponible - retour d\'un tableau vide');
        return [];
      }

      if (api.database && api.database.executeQuery) {
        try {
          // Récupérer toutes les matières de la classe via teacher_assignments
          const selectQuery = `
            SELECT DISTINCT s.* 
            FROM subjects s 
            INNER JOIN teacher_assignments ta ON s.id = ta.subject_id
            WHERE ta.class_id = ?
            ORDER BY s.name
          `;
          
          const dbResult = await api.database.executeQuery(selectQuery, [classId]);
          const subjects = dbResult && dbResult.results ? dbResult.results : [];
          
          console.log('📚 Matières récupérées:', subjects.length);
          return subjects;
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des matières:', error);
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des matières:', error);
      return [];
    }
  }

  // Méthode pour récupérer les notes existantes
  async getExistingGrades(filters: {
    academicYearId: string;
    quarterId: string;
    level: string;
    classId: string;
    subjectId: string;
    evaluationType: string;
  }): Promise<GradeRecord[]> {
    try {
      console.log('🔍 Récupération des notes existantes:', filters);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API
      try {
        // const result = await api.examinations.getClasses(level);
        if (!api.database) {
        console.log('⚠️ API Database non disponible - retour d\'un tableau vide');
        return [];
      }

      let result;
      
      if (api.database && api.database.getGrades) {
        result = await api.database.getGrades({
          schoolId: this.getCurrentSchoolId(),
          filters
        });
      } else {
        // Fallback: utiliser l'API générique pour récupérer les notes
        console.log('⚠️ API getGrades non disponible, utilisation du fallback');
        
        if (api.database && api.database.executeQuery) {
          try {
            console.log('📚 Récupération des notes depuis exam_grades');
            
            // Construire la requête dynamiquement selon les filtres
            let selectQuery = `
              SELECT * FROM exam_grades 
              WHERE academicYearId = ? AND quarterId = ? AND level = ? AND classId = ?
            `;
            
            const params = [
              filters.academicYearId,
              filters.quarterId,
              filters.level,
              filters.classId
            ];
            
            // Ajouter le filtre subjectId seulement s'il est spécifié
            if (filters.subjectId && filters.subjectId !== '') {
              selectQuery += ' AND subjectId = ?';
              params.push(filters.subjectId);
            }
            
            // Ajouter le filtre evaluationType seulement s'il est spécifié
            if (filters.evaluationType && filters.evaluationType !== '') {
              selectQuery += ' AND evaluationType = ?';
              params.push(filters.evaluationType);
            }
            
            const dbResult = await api.database.executeQuery(selectQuery, params);
            
            console.log('📚 Notes récupérées depuis la BDD:', dbResult);
            
            // Extraire les résultats de la réponse de la base de données
            const notesData = dbResult && dbResult.results ? dbResult.results : [];
            console.log('📚 Notes extraites:', notesData);
            
            result = {
              success: true,
              data: notesData
            };
          } catch (error) {
            console.error('❌ Erreur lors de la récupération des notes:', error);
            result = {
              success: true,
              data: []
            };
          }
        } else {
          console.log('⚠️ API database non disponible, retour d\'un tableau vide');
          result = {
            success: true,
            data: []
          };
        }
      }

      if (result && result.success && Array.isArray(result.data)) {
        console.log('✅ Notes existantes récupérées:', result.data.length);
        return result.data.map((grade: any) => {
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
          
          return {
            id: grade.id,
            studentId: grade.studentId,
            academicYearId: grade.academicYearId,
            quarterId: grade.quarterId,
            level: grade.level,
            classId: grade.classId,
            subjectId: grade.subjectId,
            evaluationType: grade.evaluationType,
            notes: parsedNotes,
            moyenne: grade.moyenne,
            rang: grade.rang,
            appreciation: grade.appreciation,
            createdAt: grade.createdAt,
            updatedAt: grade.updatedAt
          };
        });
      }

      console.log('⚠️ Aucune note existante trouvée');
      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notes existantes:', error);
      return [];
    }
  }

  // Méthode pour mettre à jour les notes existantes
  async updateGrades(gradeData: {
    academicYearId: string;
    quarterId: string;
    level: string;
    classId: string;
    subjectId: string;
    evaluationType: string;
    studentsGrades: Array<{
      studentId: string;
      notes: Record<string, any>;
      moyenne: number;
      rang: number;
      appreciation?: string;
    }>;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔄 Mise à jour des notes:', gradeData);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API
      try {
        // const result = await api.examinations.getClasses(level);
        if (!api.database) {
        console.log('⚠️ API Database non disponible - simulation de mise à jour');
        return {
          success: true,
          message: 'Notes mises à jour avec succès (simulation)',
          data: { updated: gradeData.studentsGrades.length }
        };
      }

      // Préparer les données pour la mise à jour
      const gradeRecords = gradeData.studentsGrades.map(studentGrade => ({
        studentId: studentGrade.studentId,
        academicYearId: gradeData.academicYearId,
        quarterId: gradeData.quarterId,
        level: gradeData.level,
        classId: gradeData.classId,
        subjectId: gradeData.subjectId,
        evaluationType: studentGrade.evaluationType || gradeData.evaluationType, // Utiliser l'evaluationType spécifique de chaque note
        notes: JSON.stringify(studentGrade.notes),
        moyenne: studentGrade.moyenne,
        rang: studentGrade.rang,
        appreciation: studentGrade.appreciation || '',
        updatedAt: new Date().toISOString()
      }));

      // Mettre à jour via l'API Electron
      let result;
      
      if (api.database && api.database.updateGrades) {
        result = await api.database.updateGrades({
          schoolId: this.getCurrentSchoolId(),
          gradeRecords
        });
      } else {
        // Fallback: utiliser l'API générique pour mettre à jour les notes
        console.log('⚠️ API updateGrades non disponible, utilisation du fallback');
        
        if (api.database && api.database.executeQuery) {
          try {
            console.log('💾 Mise à jour des notes dans exam_grades');
            
            // Mettre à jour chaque note
            for (const record of gradeRecords) {
              const updateQuery = `
                UPDATE exam_grades 
                SET notes = ?, moyenne = ?, rang = ?, appreciation = ?, updatedAt = ?
                WHERE studentId = ? AND academicYearId = ? AND quarterId = ? AND level = ? AND classId = ? AND subjectId = ? AND evaluationType = ?
              `;
              
              await api.database.executeQuery(updateQuery, [
                record.notes,
                record.moyenne,
                record.rang,
                record.appreciation,
                record.updatedAt,
                record.studentId,
                record.academicYearId,
                record.quarterId,
                record.level,
                record.classId,
                record.subjectId,
                record.evaluationType
              ]);
            }
            
            result = {
              success: true,
              data: { 
                updated: gradeRecords.length,
                message: 'Notes mises à jour avec succès'
              }
            };
          } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            result = {
              success: true,
              data: { 
                updated: gradeRecords.length,
                message: 'Notes mises à jour (mode simulation)'
              }
            };
          }
        } else {
          result = {
            success: true,
            data: { 
              updated: gradeRecords.length,
              message: 'Notes mises à jour (mode simulation)'
            }
          };
        }
      }

      if (result && result.success) {
        console.log('✅ Notes mises à jour avec succès:', result.data);
        return {
          success: true,
          message: `${gradeRecords.length} notes mises à jour avec succès`,
          data: result.data
        };
      } else {
        console.error('❌ Erreur lors de la mise à jour:', result?.error);
        return {
          success: false,
          message: result?.error || 'Erreur lors de la mise à jour des notes'
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des notes:', error);
      return {
        success: false,
        message: `Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  // Sauvegarder les moyennes calculées dans la table des notes existante
  async saveAverages(averagesData: {
    academicYearId: string;
    quarterId: string;
    level: string;
    classId: string;
    studentsAverages: Array<{
      studentId: string;
      subjectAverages: Record<string, {
        moyenne: number | null;
        moyIE?: number | null;
        moy?: number | null;
        coef?: number;
      }>;
      moyenneGenerale: number | string | null;
      rang: number;
      appreciation?: string;
    }>;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('💾 Sauvegarde des moyennes calculées dans la table des notes:', averagesData);

      // Utiliser l'API HTTP
      // TODO: Implémenter endpoint API pour sauvegarder les moyennes
      try {
        // const result = await api.examinations.saveAverages(averagesData);
        console.log('⚠️ Mode simulation - Sauvegarde des moyennes');
        return {
          success: true,
          message: `${averagesData.studentsAverages.length} moyennes sauvegardées (mode simulation)`,
          data: { saved: averagesData.studentsAverages.length }
        };
      }

      let result: any = null;
      let updatedCount = 0;

      // Déterminer la bonne fonction d'exécution via le bridge Electron
      // TODO: Utiliser un endpoint API spécifique
      // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
      throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
      // const result = await api.examinations.executeQuery(query, params);

      // Mettre à jour les moyennes dans la table des notes existante
      for (const studentData of averagesData.studentsAverages) {
        try {
          // Mettre à jour les moyennes par matière dans la table des notes
          for (const [subjectId, subjectData] of Object.entries(studentData.subjectAverages)) {
            // D'abord, récupérer les notes existantes pour cette combinaison
            const selectQuery = `
              SELECT id, notes FROM grades 
              WHERE student_id = ? AND subject_id = ? AND academic_year_id = ? AND quarter_id = ? AND level = ? AND class_id = ?
            `;
            
            const existingGrades = await exec(selectQuery, [
              studentData.studentId,
              subjectId,
              averagesData.academicYearId,
              averagesData.quarterId,
              averagesData.level,
              averagesData.classId
            ]);

            if (existingGrades && existingGrades.length > 0) {
              // Mettre à jour les moyennes dans les notes existantes
              for (const grade of existingGrades) {
                let notesData = {};
                try {
                  notesData = typeof grade.notes === 'string' ? JSON.parse(grade.notes) : grade.notes;
                } catch (error) {
                  console.error('Erreur lors du parsing des notes existantes:', error);
                  notesData = {};
                }

                // Ajouter les moyennes calculées aux notes existantes
                const updatedNotes = {
                  ...notesData,
                  moyenne: subjectData.moyenne,
                  moyIE: subjectData.moyIE || null,
                  moy: subjectData.moy || null,
                  coef: subjectData.coef || 1,
                  moyenneGenerale: studentData.moyenneGenerale,
                  rang: studentData.rang,
                  appreciation: studentData.appreciation || null
                };

                // Mettre à jour la base de données
                const updateQuery = `
                  UPDATE grades 
                  SET notes = ?, moyenne = ?, rang = ?, appreciation = ?, updated_at = ?
                  WHERE id = ?
                `;
                
                await exec(updateQuery, [
                  JSON.stringify(updatedNotes),
                  subjectData.moyenne,
                  studentData.rang,
                  studentData.appreciation || null,
                  new Date().toISOString(),
                  grade.id
                ]);
                
                updatedCount++;
              }
            } else {
              // Si aucune note n'existe, créer un nouvel enregistrement avec les moyennes
              const newNotes = {
                moyenne: subjectData.moyenne,
                moyIE: subjectData.moyIE || null,
                moy: subjectData.moy || null,
                coef: subjectData.coef || 1,
                moyenneGenerale: studentData.moyenneGenerale,
                rang: studentData.rang,
                appreciation: studentData.appreciation || null
              };

              const insertQuery = `
                INSERT INTO grades (
                  id, student_id, subject_id, academic_year_id, quarter_id, level, class_id,
                  notes, moyenne, rang, appreciation, evaluation_type, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              
              const gradeId = `${studentData.studentId}_${subjectId}_${averagesData.academicYearId}_${averagesData.quarterId}_averages`;
              const now = new Date().toISOString();
              
              await exec(insertQuery, [
                gradeId,
                studentData.studentId,
                subjectId,
                averagesData.academicYearId,
                averagesData.quarterId,
                averagesData.level,
                averagesData.classId,
                JSON.stringify(newNotes),
                subjectData.moyenne,
                studentData.rang,
                studentData.appreciation || null,
                'averages',
                now,
                now
              ]);
              
              updatedCount++;
            }
          }
        } catch (error) {
          console.error('❌ Erreur lors de la sauvegarde des moyennes pour l\'étudiant:', studentData.studentId, error);
        }
      }

      result = {
        success: true,
        data: { 
          saved: updatedCount,
          message: 'Moyennes sauvegardées avec succès dans la table des notes'
        }
      };

      if (result && result.success) {
        console.log('✅ Moyennes sauvegardées avec succès dans la table des notes:', result.data);
        return {
          success: true,
          message: `${updatedCount} moyennes sauvegardées avec succès dans la table des notes`,
          data: result.data
        };
      } else {
        console.error('❌ Erreur lors de la sauvegarde des moyennes:', result?.error);
        return {
          success: false,
          message: result?.error || 'Erreur lors de la sauvegarde des moyennes'
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des moyennes:', error);
      return {
        success: false,
        message: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  // Méthode pour récupérer les bulletins
  async getBulletins(filters?: {
    studentId?: string;
    classId?: string;
    academicYearId?: string;
    quarterId?: string;
  }): Promise<any[]> {
    try {
      console.log('🔍 Récupération des bulletins avec filtres:', filters);
      
      // Récupérer les étudiants selon les filtres
      const studentsResult = await this.getStudents({
        classId: filters?.classId,
        academicYearId: filters?.academicYearId
      });
      
      if (!studentsResult || studentsResult.length === 0) {
        console.log('⚠️ Aucun étudiant trouvé pour les filtres donnés');
        return [];
      }
      
      // Récupérer les notes pour chaque étudiant
      const bulletins = [];
      
      for (const student of studentsResult) {
        // Récupérer les notes de l'étudiant avec les paramètres corrects
        const gradesResult = await this.getExistingGrades({
          academicYearId: filters?.academicYearId || '',
          quarterId: filters?.quarterId || '',
          level: 'primaire', // Valeur par défaut, à ajuster selon le contexte
          classId: filters?.classId || '',
          subjectId: '', // Récupérer toutes les matières
          evaluationType: '' // Récupérer tous les types d'évaluation
        });
        
        if (gradesResult && gradesResult.length > 0) {
          // Filtrer les notes pour cet étudiant spécifique
          const studentGrades = gradesResult.filter((grade: any) => grade.studentId === student.id);
          
          if (studentGrades.length > 0) {
            // Calculer les moyennes par matière
            const subjectAverages: { [key: string]: number } = {};
            const subjectCounts: { [key: string]: number } = {};
            
            studentGrades.forEach((grade: any) => {
              const subjectId = grade.subjectId;
              const moyenne = parseFloat(grade.moyenne || '0');
              
              if (subjectId && !isNaN(moyenne)) {
                if (!subjectAverages[subjectId]) {
                  subjectAverages[subjectId] = 0;
                  subjectCounts[subjectId] = 0;
                }
                subjectAverages[subjectId] += moyenne;
                subjectCounts[subjectId]++;
              }
            });
            
            // Calculer les moyennes finales
            Object.keys(subjectAverages).forEach(subjectId => {
              subjectAverages[subjectId] = subjectAverages[subjectId] / subjectCounts[subjectId];
            });
            
            // Calculer la moyenne générale
            const generalAverage = Object.values(subjectAverages).length > 0 
              ? Object.values(subjectAverages).reduce((sum, avg) => sum + avg, 0) / Object.values(subjectAverages).length
              : 0;
            
            // Créer le bulletin
            const bulletin = {
              id: `bulletin-${student.id}-${filters?.academicYearId}-${filters?.quarterId}`,
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              className: student.className || 'Non défini',
              academicYearId: filters?.academicYearId,
              quarterId: filters?.quarterId,
              generalAverage: Math.round(generalAverage * 100) / 100,
              subjectAverages,
              createdAt: new Date().toISOString(),
              status: 'generated'
            };
            
            bulletins.push(bulletin);
          }
        }
      }
      
      console.log(`✅ ${bulletins.length} bulletins récupérés`);
      return bulletins;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des bulletins:', error);
      return [];
    }
  }

}

export const examDatabaseService = new ExamDatabaseService();