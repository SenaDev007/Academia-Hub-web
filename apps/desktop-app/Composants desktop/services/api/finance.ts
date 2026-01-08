import dataService from '../dataService';
import { Payment, Expense, Invoice, FeeStructure } from '../dataService';

export interface CreatePaymentData {
  studentId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile_money';
  reference?: string;
  description?: string;
  date?: string;
  type?: string;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  category: string;
  date?: string;
  paymentMethod: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface CreateFeeStructureData {
  name: string;
  amount: number;
  classId?: string;
  academicYearId?: string;
  termId?: string;
  description?: string;
  dueDate?: string;
  isActive?: boolean;
}

export interface FinanceFilters {
  studentId?: string;
  classId?: string;
  academicYearId?: string;
  schoolId?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  status?: string;
  type?: string;
}

export const financeService = {
  // Dashboard
  async getDashboard() {
    try {
      // Utiliser l'API Electron directement comme dans le module Students
      // Utiliser l'API HTTP
      try {
        const result = await api.finance.getDashboard();
        return result;
      } else {
        // Fallback avec données mockées
        return {
          data: {
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalPayments: 0,
            pendingAmount: 0,
            recentPayments: [],
            paymentMethods: {},
            monthlyStats: []
          },
          success: true
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Payments
  async getPayments(filters?: FinanceFilters) {
    try {
      // Utiliser l'API Electron directement
      // Utiliser l'API HTTP
      try {
        const result = await api.finance.getPayments(filters);
        return result;
      } else {
        // Fallback avec données mockées
        return {
          data: [],
          success: true
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getPayment(id: string) {
    try {
      // Utiliser l'API Electron directement
      // Utiliser l'API HTTP
      try {
        const result = await api.finance.getPaymentById(id);
        return result;
      } else {
        return {
          data: null,
          success: false,
          error: 'API Electron non disponible'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du paiement:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createPayment(data: CreatePaymentData) {
    try {
      // Utiliser l'API Electron directement
      // Utiliser l'API HTTP
      try {
        const result = await api.finance.createPayment(data);
        return result;
      } else {
        return {
          data: null,
          success: false,
          error: 'API Electron non disponible'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updatePayment(id: string, data: Partial<CreatePaymentData>) {
    try {
      const payment = await dataService.updatePayment(id, data);
      return {
        data: payment,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deletePayment(id: string) {
    try {
      const success = await dataService.deletePayment(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du paiement:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Expenses
  async getExpenses(filters?: FinanceFilters) {
    try {
      // Utiliser l'API Electron directement
      // Utiliser l'API HTTP
      try {
        const result = await api.finance.getExpenses(filters);
        return result;
      } else {
        return {
          data: [],
          success: true
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getExpense(id: string) {
    try {
      const expense = await dataService.getExpenseById(id);
      if (!expense) {
        return {
          data: null,
          success: false,
          error: 'Dépense non trouvée'
        };
      }
      return {
        data: expense,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la dépense:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createExpense(data: CreateExpenseData) {
    try {
      const expense = await dataService.createExpense(data);
      return {
        data: expense,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateExpense(id: string, data: Partial<CreateExpenseData>) {
    try {
      const expense = await dataService.updateExpense(id, data);
      return {
        data: expense,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dépense:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteExpense(id: string) {
    try {
      const success = await dataService.deleteExpense(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépense:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Fee Structures
  async getFeeStructures(filters?: {
    classId?: string;
    academicYearId?: string;
    isActive?: boolean;
  }) {
    try {
      // Utiliser l'API Electron directement
      // Utiliser l'API HTTP
      try {
        const result = await api.finance.getFeeStructures(filters);
        return result;
      } else {
        return {
          data: [],
          success: true
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des structures de frais:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getFeeStructure(id: string) {
    try {
      const feeStructure = await dataService.getFeeStructureById(id);
      if (!feeStructure) {
        return {
          data: null,
          success: false,
          error: 'Structure de frais non trouvée'
        };
      }
      return {
        data: feeStructure,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la structure de frais:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createFeeStructure(data: CreateFeeStructureData) {
    try {
      const feeStructure = await dataService.createFeeStructure(data);
      return {
        data: feeStructure,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la structure de frais:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateFeeStructure(id: string, data: Partial<CreateFeeStructureData>) {
    try {
      const feeStructure = await dataService.updateFeeStructure(id, data);
      return {
        data: feeStructure,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la structure de frais:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteFeeStructure(id: string) {
    try {
      const success = await dataService.deleteFeeStructure(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la structure de frais:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Student Balance
  async getStudentBalance(studentId: string) {
    try {
      const balance = await dataService.getStudentBalance(studentId);
      return {
        data: balance,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du solde étudiant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Fee Configurations
  async getFeeConfigurations(schoolId: string, academicYearId?: string) {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        const response = await api.finance.getFeeConfigurations(schoolId, { academicYearId });
        return response.success ? { success: true, data: response.data } : { success: false, data: [] };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations de frais:', error);
      return { success: false, data: [] };
    }
  },

  async getFeeConfigurationById(id: string, schoolId: string) {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        const response = await api.finance.getFeeConfigurationById(id, schoolId);
        return response.success ? response.data : null;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration de frais:', error);
      return null;
    }
  },

  async createFeeConfiguration(data: any) {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        const response = await api.finance.createFeeConfiguration(data);
        return response.success ? response.data : null;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la création de la configuration de frais:', error);
      return null;
    }
  },

  async updateFeeConfiguration(id: string, data: any) {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        const response = await api.finance.updateFeeConfiguration(id, data);
        return response.success ? response.data : null;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration de frais:', error);
      return null;
    }
  },

  async deleteFeeConfiguration(id: string, schoolId: string) {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        const response = await api.finance.deleteFeeConfiguration(id, schoolId);
        return response.success;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration de frais:', error);
      return false;
    }
  },

  // Reports
  async getFinanceReport(filters: {
    startDate: string;
    endDate: string;
    type: 'income' | 'expense' | 'balance';
  }) {
    try {
      const report = await dataService.getFinanceReport(filters);
      return {
        data: report,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
