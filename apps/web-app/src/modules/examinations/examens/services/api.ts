import { examDatabaseService } from './databaseService';

// Types pour les données
export interface Note {
  id?: string;
  eleveId: string;
  matiereId: string;
  evaluationId: string;
  note: number;
  coefficient?: number;
  commentaire?: string;
  date?: string;
}

export interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classeId: string;
  dateNaissance?: string;
  email?: string;
  telephone?: string;
}

export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  anneeScolaireId: string;
  professeurPrincipal?: string;
}

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  classeId: string;
  professeurId?: string;
}

export interface Evaluation {
  id: string;
  nom: string;
  type: string;
  date: string;
  coefficient: number;
  matiereId: string;
  classeId: string;
  maxPoints: number;
}

export interface Bulletin {
  id: string;
  eleveId: string;
  classeId: string;
  trimestreId: string;
  moyenneGenerale: number;
  rang: number;
  totalCoefficients: number;
  totalPoints: number;
  mention: string;
  observations?: string;
  dateGeneration: string;
}

export interface ConseilClasse {
  id: string;
  classeId: string;
  trimestreId: string;
  date: string;
  decisions: Array<{
    eleveId: string;
    decision: string;
    commentaire?: string;
  }>;
}

// Service API complet utilisant la base de données locale
// Fonction pour traiter les données du bordereau
const processBordereauData = (students: any[], grades: any[], subjects: any[], level: string) => {
  console.log('🔄 Traitement des données du bordereau:', { students: students.length, grades: grades.length, subjects: subjects.length, level });

  // Grouper les notes par étudiant et matière
  const gradesByStudent = grades.reduce((acc: any, grade: any) => {
    if (!acc[grade.studentId]) {
      acc[grade.studentId] = {};
    }
    if (!acc[grade.studentId][grade.subjectId]) {
      acc[grade.studentId][grade.subjectId] = {};
    }
    
    // Parser les notes
    const notes = typeof grade.notes === 'string' ? JSON.parse(grade.notes) : grade.notes;
    acc[grade.studentId][grade.subjectId] = {
      ...acc[grade.studentId][grade.subjectId],
      ...notes,
      moyenne: grade.moyenne,
      rang: grade.rang,
      appreciation: grade.appreciation
    };
    
    return acc;
  }, {});

  // Créer le bordereau pour chaque étudiant (même structure que Saisie des Notes)
  const bordereauData = students.map((student: any) => {
    const studentGrades = gradesByStudent[student.id] || {};
    
    // Calculer la moyenne générale
    const subjectAverages = Object.values(studentGrades).map((subjectData: any) => subjectData.moyenne || 0);
    const moyenneGenerale = subjectAverages.length > 0 
      ? subjectAverages.reduce((sum: number, avg: number) => sum + avg, 0) / subjectAverages.length 
      : 0;

    return {
      id: student.id,
      nom: student.lastName || student.nom,
      prenom: student.firstName || student.prenom,
      numeroEducmaster: student.registrationNumber || student.numeroEducmaster || `E${student.id.slice(-4)}`,
      sexe: student.gender || student.sexe || 'M',
      notes: studentGrades,
      moyenneGenerale: parseFloat(moyenneGenerale.toFixed(2)),
      rang: 0 // Sera calculé après
    };
  });

  // Calculer les rangs
  bordereauData.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
  bordereauData.forEach((student, index) => {
    student.rang = index + 1;
  });

  console.log('✅ Bordereau traité:', bordereauData.length, 'étudiants');
  return bordereauData;
};

export const apiService = {
  // Années scolaires
  getAnneesScolaires: async () => {
    const data = await examDatabaseService.getAcademicYears();
    return { data };
  },
  getTrimestres: async (anneeId: string) => {
    const data = await examDatabaseService.getQuarters(anneeId);
    return { data };
  },

  // Classes
  getClasses: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getClasses({
      academicYearId: params?.academicYearId,
      level: params?.level
    });
    return { data };
  },
  createClasse: async (data: Partial<Classe>) => {
    // Implementation pour créer une classe
    return { data: { id: crypto.randomUUID(), ...data } };
  },

  // Élèves
  getEleves: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getStudents({
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      status: params?.status
    });
    return { data };
  },
  createEleve: async (data: Partial<Eleve>) => {
    // Implementation pour créer un élève
    return { data: { id: crypto.randomUUID(), ...data } };
  },

  // Matières
  getMatieres: async (params?: Record<string, string>) => {
    // Remplace l’ancienne logique par la nouvelle
    const data = await examDatabaseService.getSubjectsForClassAndLevel({
      classId: params?.classId,
      level: params?.level
    });
    return { data };
  },

  // Évaluations
  getEvaluations: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getExams({
      classId: params?.classId,
      subjectId: params?.subjectId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data };
  },
  createEvaluation: async (data: Partial<Evaluation>) => {
    const id = await examDatabaseService.createExam({
      name: data.nom || '',
      subjectId: data.matiereId || '',
      classId: data.classeId || '',
      teacherId: data.professeurId || '',
      date: data.date || new Date().toISOString(),
      duration: data.duree || 60,
      maxScore: data.maxPoints || 20,
      passingScore: data.seuilReussite || 10,
      type: 'written',
      description: data.instructions || ''
    });
    return { data: { id, ...data } };
  },

  // Notes
  getNotes: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getGrades({
      studentId: params?.studentId,
      examId: params?.examId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data };
  },
  getNotesByClasseAndMatiere: async (classeId: string, matiereId: string) => {
    const data = await examDatabaseService.getGrades({
      classId: classeId,
      subjectId: matiereId
    });
    return { data };
  },
  saveNote: async (data: Record<string, unknown>) => {
    const success = await examDatabaseService.saveGrades(data.notes as Array<{
      studentId: string;
      examId: string;
      score: number;
      grade: string;
      remarks?: string;
    }>);
    return { success, data: { nb_notes: data.notes?.length || 0 } };
  },
  updateNote: async (id: string, data: Record<string, unknown>) => {
    const success = await examDatabaseService.updateGrade(id, {
      score: data.score as number,
      grade: data.grade as string,
      remarks: data.remarks as string
    });
    return { success, data: { id } };
  },
  deleteNote: async (id: string) => {
    // Implementation pour supprimer une note
    return { success: true, data: { id } };
  },
  validerNotes: async (noteIds: string[]) => {
    // Implementation pour valider les notes
    return { success: true, data: { nb_notes: noteIds.length } };
  },

  // Classes et matières
  getClassesByLevel: async (level: string) => {
    try {
      console.log('🔍 API Service - Récupération des classes pour le niveau:', level);
      const classes = await examDatabaseService.getClassesByLevel(level);
      return {
        success: true,
        data: classes
      };
    } catch (error) {
      console.error('❌ Erreur API Service - Récupération des classes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  getSubjectsByClass: async (classId: string) => {
    try {
      console.log('🔍 API Service - Récupération des matières pour la classe:', classId);
      const subjects = await examDatabaseService.getSubjectsByClass(classId);
      return {
        success: true,
        data: subjects
      };
    } catch (error) {
      console.error('❌ Erreur API Service - Récupération des matières:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Bordereaux
  getBordereau: async (params: {
    academicYearId: string;
    quarterId: string;
    level: string;
    classId: string;
    subjectId?: string;
  }) => {
    try {
      console.log('🔍 API Service - Récupération du bordereau:', params);
      
      // Récupérer les notes depuis la base de données
      const grades = await examDatabaseService.getExistingGrades({
        academicYearId: params.academicYearId,
        quarterId: params.quarterId,
        level: params.level,
        classId: params.classId,
        subjectId: params.subjectId || '',
        evaluationType: params.evaluationType || '' // Utiliser le paramètre evaluationType
      });

      console.log('📊 Notes récupérées pour le bordereau:', grades);

      // Récupérer les informations des étudiants (même approche que Saisie des Notes)
      const studentsResult = await examDatabaseService.getStudents({
        classId: params.classId,
        academicYearId: params.academicYearId,
        status: 'active'
      });
      console.log('👥 Étudiants récupérés:', studentsResult);

      // Récupérer les matières
      const subjects = await examDatabaseService.getSubjectsByClass(params.classId);
      console.log('📚 Matières récupérées:', subjects);

      // Traiter les données pour créer le bordereau
      const bordereauData = processBordereauData(studentsResult, grades, subjects, params.level);
      
      return {
        success: true,
        data: bordereauData
      };
    } catch (error) {
      console.error('❌ Erreur API Service - Récupération du bordereau:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Moyennes
  getMoyennes: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getBulletins({
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data };
  },
  genererMoyennes: async (data: Record<string, unknown>) => {
    const success = await examDatabaseService.generateBulletins(
      data.classeId as string,
      data.trimestreId as string,
      data.anneeId as string
    );
    return { success, data: { nb_bulletins: success ? 1 : 0 } };
  },

  // Conseils de classe
  getConseils: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getConseilsClasse({
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data };
  },
  getConseil: async (id: string) => {
    const data = await examDatabaseService.getConseilsClasse();
    const conseil = data.find(c => c.id === id);
    return { data: conseil };
  },
  createConseil: async (data: Partial<ConseilClasse>) => {
    const id = await examDatabaseService.createConseilClasse({
      classId: data.classId || '',
      quarterId: data.quarterId || '',
      academicYearId: data.academicYearId || '',
      date: data.date || new Date().toISOString(),
      decisions: data.decisions || '[]',
      isCompleted: data.isCompleted || false
    });
    return { data: { id, ...data } };
  },
  saveDecisions: async (conseilId: string, decisions: Array<{ eleveId: string; decision: string; commentaire?: string }>) => {
    // Implementation pour sauvegarder les décisions
    return { success: true, data: { conseilId, decisions } };
  },
  genererPV: async (conseilId: string) => {
    // Implementation pour générer le PV
    return { success: true, data: { conseilId, pv: 'PDF généré' } };
  },

  // Bulletins
  getBulletins: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getBulletins({
      studentId: params?.studentId,
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data };
  },
  getBulletin: async (eleveId: string, params?: Record<string, string>) => {
    const data = await examDatabaseService.getBulletins({
      studentId: eleveId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data: data[0] };
  },
  genererBulletins: async (data: Record<string, unknown>) => {
    const success = await examDatabaseService.generateBulletins(
      data.classe_id as string,
      data.trimestre_id as string,
      data.annee_id as string
    );
    return { success, data: { nb_bulletins: success ? 1 : 0 } };
  },
  marquerImprime: async (bulletinId: string) => {
    // Implementation pour marquer comme imprimé
    return { success: true, data: { bulletinId } };
  },

  // Statistiques
  getStatistiques: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getStatistics({
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId,
      subjectId: params?.subjectId
    });
    return { data };
  },
  genererStatistiques: async (data: Record<string, unknown>) => {
    // Implementation pour générer les statistiques
    return { success: true, data: { nb_statistiques: 1 } };
  },

  // Tableau d'honneur
  getTableauHonneur: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getBulletins({
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    // Filtrer les meilleurs élèves (top 10)
    const topStudents = data
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);
    return { data: topStudents };
  },

  // Statistiques globales
  getStatistiquesGlobales: async (params?: Record<string, string>) => {
    const data = await examDatabaseService.getStatistics({
      classId: params?.classId,
      academicYearId: params?.academicYearId,
      quarterId: params?.quarterId
    });
    return { data };
  },

  // Notifications
  sendSMSToParents: async (data: { eleves: string[]; message: string }) => {
    // Implementation pour envoyer SMS
    return { success: true, data: { nb_sms: data.eleves.length } };
  },
  sendBulletinByEmail: async (data: { eleves: string[]; subject?: string }) => {
    // Implementation pour envoyer par email
    return { success: true, data: { nb_emails: data.eleves.length } };
  },
  sendBulletinByWhatsApp: async (data: { eleves: string[]; message?: string }) => {
    // Implementation pour envoyer par WhatsApp
    return { success: true, data: { nb_whatsapp: data.eleves.length } };
  },
  sendTableauHonneur: async (data: { classeId: string; trimestreId: string }) => {
    // Implementation pour envoyer tableau d'honneur
    return { success: true, data: { classeId: data.classeId } };
  },

  // Test de connexion
  healthCheck: async () => {
    return { success: true, data: { status: 'OK' } };
  },

  // Sauvegarder les notes
  saveGrades: async (gradeData: {
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
  }) => {
    try {
      console.log('💾 API Service - Sauvegarde des notes:', gradeData);
      const result = await examDatabaseService.saveGrades(gradeData);
      return result;
    } catch (error) {
      console.error('❌ Erreur API Service - Sauvegarde des notes:', error);
      return {
        success: false,
        message: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  },

  // Récupérer les notes existantes
  getExistingGrades: async (filters: {
    academicYearId: string;
    quarterId: string;
    level: string;
    classId: string;
    subjectId: string;
    evaluationType: string;
  }) => {
    try {
      console.log('🔍 API Service - Récupération des notes existantes:', filters);
      const result = await examDatabaseService.getExistingGrades(filters);
      console.log('🔍 API Service - Résultat de getExistingGrades:', result);
      // Retourner directement le tableau de notes comme attendu par le composant
      return result;
    } catch (error) {
      console.error('❌ Erreur API Service - Récupération des notes existantes:', error);
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  },

  // Mettre à jour les notes
  updateGrades: async (gradeData: {
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
  }) => {
    try {
      console.log('🔄 API Service - Mise à jour des notes:', gradeData);
      const result = await examDatabaseService.updateGrades(gradeData);
      return result;
    } catch (error) {
      console.error('❌ Erreur API Service - Mise à jour des notes:', error);
      return {
        success: false,
        message: `Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  },

  // Sauvegarder les moyennes calculées
  saveAverages: async (averagesData: {
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
  }) => {
    try {
      console.log('💾 API Service - Sauvegarde des moyennes:', averagesData);
      const result = await examDatabaseService.saveAverages(averagesData);
      return result;
    } catch (error) {
      console.error('❌ Erreur API Service - Sauvegarde des moyennes:', error);
      return {
        success: false,
        message: `Erreur lors de la sauvegarde des moyennes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  },
};

export default apiService;
