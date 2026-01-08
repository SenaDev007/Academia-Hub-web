import { useState, useEffect } from 'react';
import { studentsService } from '../services/api/students';
import { classService } from '../services/api/classes';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  classId?: string;
  className?: string;
  enrollmentDate?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  photo?: string;
  medicalInfo?: string;
  registrationNumber?: string;
  studentNumber?: string;
  notes?: string;
  // Nouveaux champs pour les frais scolaires
  seniority?: 'new' | 'old';
  inscriptionFee?: number;
  reinscriptionFee?: number;
  tuitionFee?: number;
  totalSchoolFees?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Absence {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  period: 'Matin' | 'Après-midi' | 'Journée';
  reason: string;
  justified: boolean;
  parentNotified: boolean;
}

interface DisciplinaryIncident {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  incident: string;
  severity: 'minor' | 'major' | 'severe';
  action: string;
  teacher: string;
}

interface EnrollmentStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  newThisWeek: number;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [disciplinaryIncidents, setDisciplinaryIncidents] = useState<DisciplinaryIncident[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    newThisWeek: 0
  });
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentsData();
  }, []);

  const loadStudentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les élèves
      const studentsData = await studentsService.getAll();
      setStudents(studentsData);

      // Charger les absences
      const absencesData = await studentsService.getAbsences();
      setAbsences(absencesData);

      // Charger les incidents disciplinaires
      const incidentsData = await studentsService.getDisciplinaryIncidents();
      setDisciplinaryIncidents(incidentsData);

      // Charger les classes
      const classesData = await classService.getAll();
      setClasses(['all', ...classesData.map((c: any) => c.name)]);

      // Calculer les statistiques
      const stats = await studentsService.getEnrollmentStats();
      setEnrollmentStats(stats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadStudentsData();
  };

  return {
    students,
    absences,
    disciplinaryIncidents,
    enrollmentStats,
    classes,
    loading,
    error,
    refreshData
  };
};
