import { useState, useEffect, useCallback } from 'react';
import { financeService, Expense, ExpenseCategory } from '../services/financeService';
import { useUser } from '../contexts/UserContext';
import { useAcademicYear } from './useAcademicYear';
import { getCurrentSchoolId } from '../services/dataService';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();
  const { currentAcademicYear } = useAcademicYear();

  // Charger les dépenses
  const fetchExpenses = useCallback(async (filters?: any) => {
    const schoolId = user?.schoolId || getCurrentSchoolId();
    if (!schoolId) {
      console.warn('School ID not available for fetching expenses');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des dépenses...', { schoolId, filters });
      
      const expensesData = await financeService.getExpenses(schoolId, {
        ...filters,
        academicYearId: filters?.academicYearId || currentAcademicYear?.id
      });
      
      console.log('✅ Dépenses chargées:', expensesData);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(expensesData)) {
        setExpenses(expensesData);
      } else if (expensesData && typeof expensesData === 'object' && 'data' in expensesData) {
        setExpenses(expensesData.data || []);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des dépenses:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dépenses');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  // Charger les catégories de dépenses
  const fetchExpenseCategories = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching expense categories');
      return;
    }

    try {
      console.log('🔍 Chargement des catégories de dépenses...', { schoolId: user.schoolId });
      
      const categoriesData = await financeService.getExpenseCategories(user.schoolId);
      
      console.log('✅ Catégories de dépenses chargées:', categoriesData);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(categoriesData)) {
        setExpenseCategories(categoriesData);
      } else if (categoriesData && typeof categoriesData === 'object' && 'data' in categoriesData) {
        setExpenseCategories(categoriesData.data || []);
      } else {
        setExpenseCategories([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des catégories:', err);
      // Ne pas définir d'erreur pour les catégories car elles ne sont pas critiques
    }
  }, [user?.schoolId]);

  // Créer une dépense
  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Création d\'une dépense...', expenseData);
      
      const newExpense = await financeService.createExpense({
        ...expenseData,
        schoolId: user.schoolId,
        academicYearId: currentAcademicYear?.id
      });
      
      console.log('✅ Dépense créée:', newExpense);
      
      // Ajouter la nouvelle dépense à la liste
      setExpenses(prev => [newExpense, ...prev]);
      
      return newExpense;
    } catch (err) {
      console.error('❌ Erreur lors de la création de la dépense:', err);
      throw err;
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  // Modifier une dépense
  const updateExpense = useCallback(async (id: string, expenseData: Partial<Expense>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Modification d\'une dépense...', { id, expenseData });
      
      const updatedExpense = await financeService.updateExpense(id, expenseData);
      
      console.log('✅ Dépense modifiée:', updatedExpense);
      
      // Mettre à jour la dépense dans la liste
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
      
      return updatedExpense;
    } catch (err) {
      console.error('❌ Erreur lors de la modification de la dépense:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Supprimer une dépense
  const deleteExpense = useCallback(async (id: string) => {
    try {
      console.log('🔍 Suppression d\'une dépense...', { id });
      
      await financeService.deleteExpense(id);
      
      console.log('✅ Dépense supprimée');
      
      // Retirer la dépense de la liste
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err) {
      console.error('❌ Erreur lors de la suppression de la dépense:', err);
      throw err;
    }
  }, []);

  // Créer une catégorie de dépense
  const createExpenseCategory = useCallback(async (categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Création d\'une catégorie de dépense...', categoryData);
      
      const newCategory = await financeService.createExpenseCategory({
        ...categoryData,
        schoolId: user.schoolId
      });
      
      console.log('✅ Catégorie de dépense créée:', newCategory);
      
      // Ajouter la nouvelle catégorie à la liste
      setExpenseCategories(prev => [...prev, newCategory]);
      
      return newCategory;
    } catch (err) {
      console.error('❌ Erreur lors de la création de la catégorie:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Approuver une dépense
  const approveExpense = useCallback(async (expenseId: string, approvedBy: string) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Approbation d\'une dépense...', { expenseId, approvedBy });
      
      const updatedExpense = await financeService.updateExpense(expenseId, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date().toISOString()
      });
      
      console.log('✅ Dépense approuvée:', updatedExpense);
      
      // Mettre à jour la dépense dans la liste
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? { ...expense, ...updatedExpense } : expense
      ));
      
      return updatedExpense;
    } catch (err) {
      console.error('❌ Erreur lors de l\'approbation:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Rejeter une dépense
  const rejectExpense = useCallback(async (expenseId: string, rejectedBy: string, reason?: string) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Rejet d\'une dépense...', { expenseId, rejectedBy, reason });
      
      const updatedExpense = await financeService.updateExpense(expenseId, {
        status: 'rejected',
        approvedBy: rejectedBy,
        approvedAt: new Date().toISOString(),
        notes: reason ? `Rejeté: ${reason}` : 'Rejeté'
      });
      
      console.log('✅ Dépense rejetée:', updatedExpense);
      
      // Mettre à jour la dépense dans la liste
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? { ...expense, ...updatedExpense } : expense
      ));
      
      return updatedExpense;
    } catch (err) {
      console.error('❌ Erreur lors du rejet:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Actualiser les données
  const refreshData = useCallback(() => {
    fetchExpenses();
    fetchExpenseCategories();
  }, [fetchExpenses, fetchExpenseCategories]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user?.schoolId) {
      fetchExpenses();
      fetchExpenseCategories();
    }
  }, [user?.schoolId, fetchExpenses, fetchExpenseCategories]);

  // Note: Le rechargement par année scolaire est maintenant géré par le composant parent

  return {
    expenses,
    expenseCategories,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    createExpenseCategory,
    approveExpense,
    rejectExpense,
    refreshData
  };
};
