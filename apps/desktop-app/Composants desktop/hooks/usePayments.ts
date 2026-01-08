import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useAcademicYear } from './useAcademicYear';
import { financeService, Payment } from '../services/financeService';

export interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  createPayment: (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  fetchPayments: (academicYearId?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const usePayments = (): UsePaymentsReturn => {
  const { user } = useUser();
  const { currentAcademicYear, loading: academicYearLoading } = useAcademicYear();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (academicYearId?: string) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      return;
    }

    // Utiliser l'année académique fournie ou l'année actuelle
    const yearId = academicYearId || currentAcademicYear?.id;
    if (!yearId) {
      console.log('Aucune année académique disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Récupération des paiements...');
      console.log('schoolId:', user.schoolId);
      console.log('academicYearId:', yearId);
      
      const result = await financeService.getPayments(user.schoolId, { academicYearId: yearId });
      console.log('✅ Paiements récupérés:', result);
      
      if (result && result.success && Array.isArray(result.data)) {
        setPayments(result.data);
        console.log(`✅ ${result.data.length} paiement(s) chargé(s)`);
      } else if (result && Array.isArray(result)) {
        // Fallback pour l'ancien format
        setPayments(result);
        console.log(`✅ ${result.length} paiement(s) chargé(s) (format ancien)`);
      } else {
        console.log('Aucun paiement trouvé ou format de données incorrect');
        setPayments([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des paiements:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  const createPayment = useCallback(async (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createPayment dans usePayments ===');
      console.log('data reçu:', data);
      
      const result = await financeService.createPayment({ ...data, schoolId: user.schoolId });
      console.log('Résultat createPayment:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchPayments(data.academicYearId);
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création du paiement:', err);
      throw err;
    }
  }, [user?.schoolId, fetchPayments]);

  const updatePayment = useCallback(async (id: string, data: Partial<Payment>) => {
    try {
      console.log('=== DEBUG updatePayment ===');
      console.log('id:', id, 'data:', data);
      
      const result = await financeService.updatePayment(id, data);
      console.log('Résultat updatePayment:', result);
      
      await fetchPayments(data.academicYearId);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du paiement:', err);
      throw err;
    }
  }, [fetchPayments]);

  const deletePayment = useCallback(async (id: string) => {
    try {
      console.log('=== DEBUG deletePayment ===');
      console.log('id:', id);
      
      await financeService.deletePayment(id);
      console.log('Paiement supprimé avec succès');
      
      // Rafraîchir la liste
      setPayments(prev => prev.filter(payment => payment.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du paiement:', err);
      throw err;
    }
  }, []);

  // Charger les paiements au montage et quand schoolId ou currentAcademicYear change
  useEffect(() => {
    if (user?.schoolId && currentAcademicYear?.id) {
      fetchPayments();
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchPayments]);

  // Fonction refreshData pour s'aligner sur Planning/Students
  const refreshData = useCallback(async () => {
    await fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    fetchPayments,
    refreshData
  };
};
