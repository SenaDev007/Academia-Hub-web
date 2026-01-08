import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { useAcademicYear } from './useAcademicYear';
import { useUser } from '../contexts/UserContext';

export interface TuitionStatus {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  level: string;
  className: string;
  expectedTuition: number;
  paidTuition: number;
  remainingTuition: number;
  status: 'not_started' | 'partial' | 'completed';
  lastPaymentDate?: string;
  nextDueDate?: string;
  phoneNumber?: string;
  email?: string;
}

export interface TuitionLevel {
  id: string;
  name: string;
  isExpanded: boolean;
  classes: TuitionClass[];
  totalStudents: number;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
}

export interface TuitionClass {
  id: string;
  name: string;
  levelId: string;
  isExpanded: boolean;
  students: TuitionStatus[];
  totalStudents: number;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
}

export interface TuitionControlStats {
  totalStudents: number;
  completedPayments: number;
  partialPayments: number;
  notStartedPayments: number;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  completionRate: number;
}

export const useTuitionControl = () => {
  const [tuitionLevels, setTuitionLevels] = useState<TuitionLevel[]>([]);
  const [tuitionStats, setTuitionStats] = useState<TuitionControlStats>({
    totalStudents: 0,
    completedPayments: 0,
    partialPayments: 0,
    notStartedPayments: 0,
    totalExpected: 0,
    totalPaid: 0,
    totalRemaining: 0,
    completionRate: 0
  });
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [tuitionError, setTuitionError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  const { currentAcademicYear } = useAcademicYear();
  const { user } = useUser();

  const loadTuitionData = useCallback(async () => {
    if (!user?.schoolId || !currentAcademicYear?.id) return;

    setTuitionLoading(true);
    setTuitionError(null);

    try {
      const [dataResult, statsResult] = await Promise.all([
        api.finance.getTuitionControlData(user.schoolId, currentAcademicYear.id),
        api.finance.getTuitionControlStats(user.schoolId, currentAcademicYear.id)
      ]);

      if (dataResult.success) {
        setTuitionLevels(dataResult.data);
      } else {
        throw new Error(dataResult.error || 'Erreur lors du chargement des données de scolarité');
      }

      if (statsResult.success) {
        setTuitionStats(statsResult.data);
      } else {
        throw new Error(statsResult.error || 'Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de scolarité:', error);
      setTuitionError(error instanceof Error ? error.message : 'Erreur inconnue');
      showError('Erreur', 'Erreur lors du chargement des données de scolarité');
    } finally {
      setTuitionLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id, showError]);

  const sendTuitionReminder = useCallback(async (studentId: string, type: 'call' | 'sms' | 'whatsapp', message?: string) => {
    if (!user?.schoolId) return;

    try {
      const result = await api.finance.sendTuitionReminder(studentId, type, message);
      
      if (result.success) {
        const typeLabels = {
          call: 'appel téléphonique',
          sms: 'SMS',
          whatsapp: 'WhatsApp'
        };
        showSuccess('Succès', `Rappel ${typeLabels[type]} envoyé avec succès`);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi du rappel');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
      showError('Erreur', 'Erreur lors de l\'envoi du rappel');
    }
  }, [user?.schoolId, showError]);

  const generateTuitionSchedule = useCallback(async (studentId: string) => {
    if (!user?.schoolId || !currentAcademicYear?.id) return;

    try {
      const result = await api.finance.generateTuitionSchedule(studentId, currentAcademicYear.id);
      
      if (result.success) {
        showSuccess('Succès', 'Échéancier de scolarité généré avec succès');
      } else {
        throw new Error(result.error || 'Erreur lors de la génération de l\'échéancier');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de l\'échéancier:', error);
      showError('Erreur', 'Erreur lors de la génération de l\'échéancier');
    }
  }, [user?.schoolId, currentAcademicYear?.id, showError]);

  return {
    tuitionLevels,
    tuitionStats,
    tuitionLoading,
    tuitionError,
    loadTuitionData,
    sendTuitionReminder,
    generateTuitionSchedule
  };
};
