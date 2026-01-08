import { useState, useEffect, useCallback } from 'react';
import { financeService, TreasuryAccount, TreasuryTransaction, TreasuryStats, TreasuryProjection } from '../services/financeService';
import { useUser } from '../contexts/UserContext';

export const useTreasury = () => {
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([]);
  const [treasuryTransactions, setTreasuryTransactions] = useState<TreasuryTransaction[]>([]);
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | null>(null);
  const [treasuryProjections, setTreasuryProjections] = useState<TreasuryProjection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();

  // Charger les comptes de trésorerie
  const fetchTreasuryAccounts = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching treasury accounts');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des comptes de trésorerie...', { schoolId: user.schoolId });
      
      const accounts = await financeService.getTreasuryAccounts(user.schoolId);
      
      console.log('✅ Comptes de trésorerie chargés:', accounts);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(accounts)) {
        setTreasuryAccounts(accounts);
      } else if (accounts && typeof accounts === 'object' && 'data' in accounts) {
        setTreasuryAccounts(accounts.data || []);
      } else {
        setTreasuryAccounts([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des comptes:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  // Charger les transactions de trésorerie
  const fetchTreasuryTransactions = useCallback(async (filters?: any) => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching treasury transactions');
      return;
    }

    try {
      console.log('🔍 Chargement des transactions de trésorerie...', { schoolId: user.schoolId, filters });
      
      const transactions = await financeService.getTreasuryTransactions(user.schoolId, filters);
      
      console.log('✅ Transactions de trésorerie chargées:', transactions);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(transactions)) {
        setTreasuryTransactions(transactions);
      } else if (transactions && typeof transactions === 'object' && 'data' in transactions) {
        setTreasuryTransactions(transactions.data || []);
      } else {
        setTreasuryTransactions([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des transactions:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des transactions');
    }
  }, [user?.schoolId]);

  // Charger les statistiques de trésorerie
  const fetchTreasuryStats = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching treasury stats');
      return;
    }

    try {
      console.log('🔍 Chargement des statistiques de trésorerie...', { schoolId: user.schoolId });
      
      const stats = await financeService.getTreasuryStats(user.schoolId);
      
      console.log('✅ Statistiques de trésorerie chargées:', stats);
      setTreasuryStats(stats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    }
  }, [user?.schoolId]);

  // Charger les projections de trésorerie
  const fetchTreasuryProjections = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching treasury projections');
      return;
    }

    try {
      console.log('🔍 Chargement des projections de trésorerie...', { schoolId: user.schoolId });
      
      const projections = await financeService.getTreasuryProjections(user.schoolId);
      
      console.log('✅ Projections de trésorerie chargées:', projections);
      setTreasuryProjections(projections || []);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des projections:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projections');
    }
  }, [user?.schoolId]);

  // Créer un compte de trésorerie
  const createTreasuryAccount = useCallback(async (accountData: Omit<TreasuryAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Création d\'un compte de trésorerie...', accountData);
      
      const newAccount = await financeService.createTreasuryAccount({
        ...accountData,
        schoolId: user.schoolId
      });
      
      console.log('✅ Compte de trésorerie créé:', newAccount);
      
      // Ajouter le nouveau compte à la liste
      setTreasuryAccounts(prev => [newAccount, ...prev]);
      
      return newAccount;
    } catch (err) {
      console.error('❌ Erreur lors de la création du compte:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Modifier un compte de trésorerie
  const updateTreasuryAccount = useCallback(async (id: string, accountData: Partial<TreasuryAccount>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Modification d\'un compte de trésorerie...', { id, accountData });
      
      const updatedAccount = await financeService.updateTreasuryAccount(id, accountData);
      
      console.log('✅ Compte de trésorerie modifié:', updatedAccount);
      
      // Mettre à jour le compte dans la liste
      setTreasuryAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
      
      return updatedAccount;
    } catch (err) {
      console.error('❌ Erreur lors de la modification du compte:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Supprimer un compte de trésorerie
  const deleteTreasuryAccount = useCallback(async (id: string) => {
    try {
      console.log('🔍 Suppression d\'un compte de trésorerie...', id);
      
      await financeService.deleteTreasuryAccount(id);
      
      console.log('✅ Compte de trésorerie supprimé:', id);
      
      // Supprimer le compte de la liste
      setTreasuryAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      console.error('❌ Erreur lors de la suppression du compte:', err);
      throw err;
    }
  }, []);

  // Créer une transaction de trésorerie
  const createTreasuryTransaction = useCallback(async (transactionData: Omit<TreasuryTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Création d\'une transaction de trésorerie...', transactionData);
      
      const newTransaction = await financeService.createTreasuryTransaction(transactionData);
      
      console.log('✅ Transaction de trésorerie créée:', newTransaction);
      
      // Ajouter la nouvelle transaction à la liste
      setTreasuryTransactions(prev => [newTransaction, ...prev]);
      
      // Recharger les statistiques
      await fetchTreasuryStats();
      
      return newTransaction;
    } catch (err) {
      console.error('❌ Erreur lors de la création de la transaction:', err);
      throw err;
    }
  }, [user?.schoolId, fetchTreasuryStats]);

  // Modifier une transaction de trésorerie
  const updateTreasuryTransaction = useCallback(async (id: string, transactionData: Partial<TreasuryTransaction>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Modification d\'une transaction de trésorerie...', { id, transactionData });
      
      const updatedTransaction = await financeService.updateTreasuryTransaction(id, transactionData);
      
      console.log('✅ Transaction de trésorerie modifiée:', updatedTransaction);
      
      // Mettre à jour la transaction dans la liste
      setTreasuryTransactions(prev => prev.map(transaction => 
        transaction.id === id ? updatedTransaction : transaction
      ));
      
      // Recharger les statistiques
      await fetchTreasuryStats();
      
      return updatedTransaction;
    } catch (err) {
      console.error('❌ Erreur lors de la modification de la transaction:', err);
      throw err;
    }
  }, [user?.schoolId, fetchTreasuryStats]);

  // Supprimer une transaction de trésorerie
  const deleteTreasuryTransaction = useCallback(async (id: string) => {
    try {
      console.log('🔍 Suppression d\'une transaction de trésorerie...', id);
      
      await financeService.deleteTreasuryTransaction(id);
      
      console.log('✅ Transaction de trésorerie supprimée:', id);
      
      // Supprimer la transaction de la liste
      setTreasuryTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      // Recharger les statistiques
      await fetchTreasuryStats();
    } catch (err) {
      console.error('❌ Erreur lors de la suppression de la transaction:', err);
      throw err;
    }
  }, [fetchTreasuryStats]);

  // Actualiser toutes les données
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchTreasuryAccounts(),
      fetchTreasuryTransactions(),
      fetchTreasuryStats(),
      fetchTreasuryProjections()
    ]);
  }, [fetchTreasuryAccounts, fetchTreasuryTransactions, fetchTreasuryStats, fetchTreasuryProjections]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user?.schoolId) {
      refreshData();
    }
  }, [user?.schoolId, refreshData]);

  return {
    treasuryAccounts,
    treasuryTransactions,
    treasuryStats,
    treasuryProjections,
    loading,
    error,
    fetchTreasuryAccounts,
    fetchTreasuryTransactions,
    fetchTreasuryStats,
    fetchTreasuryProjections,
    createTreasuryAccount,
    updateTreasuryAccount,
    deleteTreasuryAccount,
    createTreasuryTransaction,
    updateTreasuryTransaction,
    deleteTreasuryTransaction,
    refreshData
  };
};
