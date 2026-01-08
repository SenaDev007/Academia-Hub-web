import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useAcademicYear } from './useAcademicYear';
import { financeService } from '../services/financeService';
import { getCurrentSchoolId } from '../services/dataService';

// Types pour les recettes
export interface Revenue {
  id: string;
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  academicYearId?: string;
  amount: number;
  type: string;
  description?: string;
  paymentMethod?: string;
  method: 'cash' | 'card' | 'mobile_money';
  reference?: string;
  receiptNumber?: string;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  time?: string;
  schoolId: string;
  isManualRevenue: boolean;
  sourceType: 'manual' | 'inscription_fee' | 'reinscription_fee' | 'tuition_fee';
  originalPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueCreateData extends Omit<Revenue, 'id' | 'createdAt' | 'updatedAt'> {
  sourceType: 'manual' | 'inscription_fee' | 'reinscription_fee' | 'tuition_fee';
  originalPaymentId?: string;
}

export interface RevenueStats {
  total: number;
  completed: number;
  pending: number;
  count: number;
  completedCount: number;
  pendingCount: number;
  monthly: number;
  tuitionRevenue: number;
  otherRevenue: number;
  byType: { [key: string]: number };
  bySource: { [key: string]: number };
}

export interface UseRevenuesReturn {
  revenues: Revenue[];
  revenueStats: RevenueStats | null;
  loading: boolean;
  error: string | null;
  createRevenue: (data: RevenueCreateData) => Promise<void>;
  updateRevenue: (id: string, data: Partial<Revenue>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  fetchRevenues: (academicYearId?: string) => Promise<void>;
  syncTuitionPayments: () => Promise<{ success: boolean; synced: number; errors: string[] }>;
  refreshData: () => Promise<void>;
}

export const useRevenues = (): UseRevenuesReturn => {
  const { user } = useUser();
  const { currentAcademicYear, loading: academicYearLoading } = useAcademicYear();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenues = useCallback(async (academicYearId?: string) => {
    console.log('🚀 === fetchRevenues appelé ===');
    console.log('academicYearId:', academicYearId);
    console.log('user?.schoolId:', user?.schoolId);
    console.log('currentAcademicYear?.id:', currentAcademicYear?.id);
    
    const schoolId = user?.schoolId || getCurrentSchoolId();
    if (!schoolId) {
      console.error('Aucun établissement sélectionné');
      return;
    }

    // Utiliser l'année académique fournie ou l'année actuelle
    const yearId = academicYearId || currentAcademicYear?.id;
    if (!yearId) {
      console.log('Aucune année académique disponible');
      return;
    }

    // Vérifier si l'API Electron est disponible
    // Utiliser l'API HTTP
    try {
      // L'API est toujours disponible via HTTP
    
    console.log('✅ Toutes les vérifications passées, début du chargement...');

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Récupération des recettes...');
      console.log('schoolId:', user.schoolId);
      console.log('academicYearId:', yearId);
      
      const result = await financeService.getRevenues(schoolId, { academicYearId: yearId });
      console.log('✅ Recettes récupérées:', result);
      
      if (result && result.success && Array.isArray(result.data)) {
        setRevenues(result.data);
        console.log(`✅ ${result.data.length} recette(s) chargée(s)`);
      } else if (result && Array.isArray(result)) {
        // Fallback pour l'ancien format
        setRevenues(result);
        console.log(`✅ ${result.length} recette(s) chargée(s) (format ancien)`);
      } else {
        console.log('Aucune recette trouvée ou format de données incorrect');
        setRevenues([]);
      }

      // Récupérer les statistiques
      const statsResult = await financeService.getRevenueStats(user.schoolId, { academicYearId: yearId });
      console.log('📊 Résultat getRevenueStats:', statsResult);
      if (statsResult && statsResult.success && statsResult.data) {
        setRevenueStats(statsResult.data);
        console.log('✅ Statistiques chargées:', statsResult.data);
      } else {
        console.log('Aucune statistique disponible');
        setRevenueStats(null);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des recettes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  const createRevenue = useCallback(async (data: RevenueCreateData) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createRevenue dans useRevenues ===');
      console.log('data reçu:', data);
      
      const result = await financeService.createRevenue({ ...data, schoolId: user.schoolId });
      console.log('Résultat createRevenue:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchRevenues(data.academicYearId);
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création de la recette:', err);
      throw err;
    }
  }, [user?.schoolId, fetchRevenues]);

  const updateRevenue = useCallback(async (id: string, data: Partial<Revenue>) => {
    try {
      console.log('=== DEBUG updateRevenue ===');
      console.log('id:', id, 'data:', data);
      
      const result = await financeService.updateRevenue(id, data);
      console.log('Résultat updateRevenue:', result);
      
      await fetchRevenues(data.academicYearId);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la recette:', err);
      throw err;
    }
  }, [fetchRevenues]);

  const deleteRevenue = useCallback(async (id: string) => {
    try {
      console.log('=== DEBUG deleteRevenue ===');
      console.log('id:', id);
      
      await financeService.deleteRevenue(id);
      console.log('Recette supprimée avec succès');
      
      // Rafraîchir la liste
      setRevenues(prev => prev.filter(revenue => revenue.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de la recette:', err);
      throw err;
    }
  }, []);

  const syncTuitionPayments = useCallback(async () => {
    if (!user?.schoolId || !currentAcademicYear?.id) {
      throw new Error('Aucun établissement ou année académique sélectionné');
    }

    try {
      console.log('🔄 Synchronisation des paiements de scolarité...');
      
      // Récupérer les paiements de scolarité
      const payments = await financeService.getTuitionPayments(user.schoolId, { 
        academicYearId: currentAcademicYear.id 
      });
      
      console.log('📊 Paiements récupérés:', payments);
      
      if (!payments || !Array.isArray(payments)) {
        console.error('❌ Erreur dans la réponse:', payments);
        throw new Error('Erreur lors de la récupération des paiements');
      }
      let synced = 0;
      const errors: string[] = [];

      for (const payment of payments) {
        try {
          // Vérifier si la recette existe déjà
          console.log(`🔍 Vérification de l'existence de la recette pour le paiement ${payment.id}...`);
          const existingRevenue = await financeService.getRevenueByOriginalPaymentId(payment.id);
          console.log(`📊 Résultat de la vérification:`, existingRevenue);
          
          if (existingRevenue) {
            console.log(`✅ Recette déjà existante pour le paiement ${payment.id}, ignorée`);
            continue;
          }
          
          console.log(`🆕 Nouvelle recette à créer pour le paiement ${payment.id}`);

          // Créer la recette
          console.log('📊 Paiement à synchroniser:', {
            id: payment.id,
            studentName: payment.studentName,
            className: payment.className,
            classId: payment.classId,
            reference: payment.reference,
            receiptNumber: payment.receiptNumber
          });
          
          const revenueData: RevenueCreateData = {
            studentId: payment.studentId,
            studentName: payment.studentName,
            classId: payment.classId,
            className: payment.className,
            academicYearId: payment.academicYearId,
            amount: payment.amount,
            type: payment.type === 'inscription' ? 'inscription_fee' : 
                  payment.type === 'reinscription' ? 'reinscription_fee' : 'tuition_fee',
            description: payment.type === 'inscription' || payment.type === 'reinscription' || payment.type === 'tuition'
              ? `Paiement frais scolaires`
              : `Paiement de ${payment.type || 'inconnu'} - ${payment.studentName}`,
            paymentMethod: payment.paymentMethod || 'Espèces',
            method: payment.method || 'cash',
            reference: payment.receiptNumber || payment.reference,
            receiptNumber: payment.receiptNumber,
            status: payment.status || 'completed',
            date: payment.date,
            time: payment.time,
            schoolId: user.schoolId,
            isManualRevenue: false,
            sourceType: payment.type === 'inscription' ? 'inscription_fee' : 
                       payment.type === 'reinscription' ? 'reinscription_fee' : 'tuition_fee',
            originalPaymentId: payment.id
          };
          
          console.log('📊 Données de recette créées:', revenueData);

          await financeService.createRevenue(revenueData);
          synced++;
        } catch (error) {
          console.error(`Erreur lors de la synchronisation du paiement ${payment.id}:`, error);
          errors.push(`Paiement ${payment.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      // Rafraîchir les données
      await fetchRevenues();

      return { success: true, synced, errors };
    } catch (err) {
      console.error('Erreur lors de la synchronisation:', err);
      throw err;
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchRevenues]);

  // Charger les recettes au montage et quand schoolId ou currentAcademicYear change
  useEffect(() => {
    if (user?.schoolId && currentAcademicYear?.id) {
      fetchRevenues();
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchRevenues]);

  // Fonction refreshData pour s'aligner sur Planning/Students
  const refreshData = useCallback(async () => {
    await fetchRevenues();
  }, [fetchRevenues]);

  return {
    revenues,
    revenueStats,
    loading,
    error,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    fetchRevenues,
    syncTuitionPayments,
    refreshData
  };
};
