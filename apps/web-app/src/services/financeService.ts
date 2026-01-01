// Service de gestion des finances avec communication sécurisée vers Electron
// Aligné sur le pattern de planningService et studentService

export interface FeeConfiguration {
  id: string;
  academicYearId: string;
  level: string;
  classId?: string | null;
  className?: string | null;
  classLevel?: string | null;
  inscriptionFee: number;
  reinscriptionFee: number;
  tuitionFees: number[];
  effectiveDate: string;
  schoolId: string;
  schoolName?: string;
  status?: 'active' | 'draft' | 'inactive';
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeConfigurationCreateData {
  academicYearId: string;
  effectiveDate: string;
  configurations: Array<{
    level: string;
    classId: string;
    inscriptionFee: number;
    reinscriptionFee: number;
    tuitionFees: number[];
    effectiveDate: string;
    schoolId: string;
  }>;
  schoolId: string;
}

export interface Revenue {
  id: string;
  studentId?: string | null;
  studentName?: string | null;
  classId?: string | null;
  className?: string | null;
  academicYearId?: string | null;
  amount: number;
  type: string;
  description?: string | null;
  paymentMethod?: string | null;
  method: 'mobile_money' | 'card' | 'cash';
  reference?: string | null;
  receiptNumber?: string | null;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  time?: string | null;
  schoolId?: string | null;
  isManualRevenue: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  educmasterNumber?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  classId: string;
  className?: string;
  classLevel?: string;
  academicYearId: string;
  // Frais scolaires
  inscriptionFee?: number;
  reinscriptionFee?: number;
  tuitionFee?: number;
  totalSchoolFees?: number;
  seniority?: 'new' | 'old';
  // Bilan scolarité
  totalExpected?: number;
  totalPaid?: number;
  totalRemaining?: number;
  // Récapitulatif paiement
  amount: number;
  reduction?: number;
  method: 'mobile_money' | 'card' | 'cash';
  paymentMethod?: string; // Champ d'affichage pour la méthode de paiement
  reference?: string;
  receiptNumber: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  time?: string;
  // Informations de paiement spécifiques
  senderPhone?: string;
  receiverPhone?: string;
  phoneNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  amountGiven?: number;
  change?: number;
  // Informations de contact de l'école
  schoolPhone?: string;
  schoolEmail?: string;
  schoolWhatsApp?: string;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
  // Champ pour distinguer les recettes manuelles des encaissements
  isManualRevenue?: boolean;
  // Champs pour les recettes manuelles
  type?: string;
  description?: string;
}

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

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  vendor: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  receiptNumber: string;
  approvedBy?: string;
  approvedAt?: string;
  schoolId: string;
  academicYearId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyClosure {
  id: string;
  date: string;
  schoolId: string;
  academicYearId?: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  cashOnHand: number;
  bankDeposits: number;
  pendingPayments: number;
  pendingExpenses: number;
  notes: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  details?: DailyClosureDetail[];
}

export interface DailyClosureDetail {
  id: string;
  closureId: string;
  type: 'payment' | 'expense';
  itemId: string;
  amount: number;
  description?: string;
  itemDescription?: string;
  createdAt: string;
}

export interface DailyClosureStats {
  date: string;
  payments: {
    count: number;
    totalAmount: number;
    completedAmount: number;
    pendingAmount: number;
  };
  expenses: {
    count: number;
    totalAmount: number;
    approvedAmount: number;
    pendingAmount: number;
  };
  netBalance: number;
}

export interface TreasuryAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'investment' | 'savings';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreasuryTransaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number;
  description: string;
  reference?: string;
  category?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  accountName?: string;
  accountType?: string;
  createdByName?: string;
}

export interface TreasuryStats {
  totalCash: number;
  totalBank: number;
  totalInvestment: number;
  totalSavings: number;
  totalAssets: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  liquidityRatio: number;
  growthRate: number;
}

export interface TreasuryProjection {
  id: string;
  schoolId: string;
  period: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  confidence: 'high' | 'medium' | 'low';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialReport {
  id: string;
  title: string;
  type: 'income' | 'expense' | 'balance' | 'treasury' | 'payroll' | 'custom';
  period: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  data: any;
  status: 'draft' | 'generated' | 'archived';
  schoolId: string;
  generatedByName?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  isActive: boolean;
  parameters: any;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportStats {
  totalReports: number;
  generatedReports: number;
  draftReports: number;
  archivedReports: number;
  incomeReports: number;
  expenseReports: number;
  balanceReports: number;
  treasuryReports: number;
}

class FinanceService {
  private async invokeIpc(method: string, ...args: any[]): Promise<any> {
    try {
      console.log(`🔍 invokeIpc appelé avec method: ${method}, args:`, args);
      
      // Vérifier si on est dans un environnement Electron
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        console.log('✅ API finance disponible, appel IPC...');
        // En production Electron - utiliser l'API finance
        const response = await api.finance[method](...args);
        console.log('📊 Réponse reçue:', response);
        if (response.success) {
          return response.data; // Retourner directement les données
        } else {
          throw new Error(response.error || 'Erreur lors de l\'opération');
        }
      } else {
        // En développement web - utiliser des données mockées
        console.warn('Mode développement : API Electron non disponible');
        return this.getMockData(method, ...args);
      }
    } catch (error) {
      console.error(`Error in ${method}:`, error);
      throw error;
    }
  }

  private getMockData(method: string, ...args: any[]): any {
    // Données mockées pour le développement
    switch (method) {
      case 'getFeeConfigurations':
        return [];
      
      case 'createFeeConfiguration':
        return {
          id: 'fee-config-' + Date.now(),
          ...args[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      
      case 'updateFeeConfiguration':
        return { success: true };
      
      case 'deleteFeeConfiguration':
        return { success: true };
      
      default:
        return null;
    }
  }

  // Fee Configurations
  async getFeeConfigurations(schoolId: string, filters?: { academicYearId?: string; level?: string; classId?: string }): Promise<FeeConfiguration[]> {
    return this.invokeIpc('getFeeConfigurations', schoolId, filters);
  }

  async getFeeConfigurationById(id: string, schoolId: string): Promise<FeeConfiguration | null> {
    return this.invokeIpc('getFeeConfigurationById', id, schoolId);
  }

  async createFeeConfiguration(data: FeeConfigurationCreateData): Promise<FeeConfiguration | FeeConfiguration[]> {
    console.log('🔍 financeService.createFeeConfiguration appelé avec:', data);
    console.log('🔍 data.configurations:', data.configurations);
    console.log('🔍 data.configurations length:', data.configurations?.length);
    if (data.configurations && data.configurations.length > 0) {
      console.log('🔍 Première configuration:', data.configurations[0]);
      console.log('🔍 Première configuration level:', data.configurations[0].level);
    }
    return this.invokeIpc('createFeeConfiguration', data);
  }

  async updateFeeConfiguration(id: string, data: Partial<FeeConfiguration>): Promise<FeeConfiguration> {
    return this.invokeIpc('updateFeeConfiguration', id, data);
  }

  async deleteFeeConfiguration(id: string): Promise<void> {
    return this.invokeIpc('deleteFeeConfiguration', id);
  }

  // Payments
  async getPayments(schoolId: string, filters?: any): Promise<Payment[]> {
    return this.invokeIpc('getPayments', schoolId, filters);
  }

  async getPaymentById(id: string, schoolId: string): Promise<Payment | null> {
    return this.invokeIpc('getPaymentById', id, schoolId);
  }

  async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return this.invokeIpc('createPayment', data);
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    return this.invokeIpc('updatePayment', id, data);
  }

  async deletePayment(id: string): Promise<void> {
    return this.invokeIpc('deletePayment', id);
  }

  // Revenues
  async getRevenues(schoolId: string, filters?: any): Promise<Revenue[]> {
    return this.invokeIpc('getRevenues', schoolId, filters);
  }

  async createRevenue(data: Omit<Revenue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Revenue> {
    return this.invokeIpc('createRevenue', data);
  }

  async updateRevenue(id: string, data: Partial<Revenue>): Promise<Revenue> {
    return this.invokeIpc('updateRevenue', id, data);
  }

  async deleteRevenue(id: string): Promise<void> {
    return this.invokeIpc('deleteRevenue', id);
  }

  async getRevenueStats(schoolId: string, filters?: any): Promise<any> {
    return this.invokeIpc('getRevenueStats', schoolId, filters);
  }

  async getTuitionPayments(schoolId: string, filters?: any): Promise<Payment[]> {
    return this.invokeIpc('getTuitionPayments', schoolId, filters);
  }

  async getRevenueByOriginalPaymentId(paymentId: string): Promise<Revenue | null> {
    return this.invokeIpc('getRevenueByOriginalPaymentId', paymentId);
  }

  async deleteRevenuesByPaymentId(paymentId: string): Promise<number> {
    return this.invokeIpc('deleteRevenuesByPaymentId', paymentId);
  }

  // Expenses
  async getExpenses(schoolId: string, filters?: any): Promise<Expense[]> {
    return this.invokeIpc('getExpenses', schoolId, filters);
  }

  async getExpenseById(id: string, schoolId: string): Promise<Expense | null> {
    return this.invokeIpc('getExpenseById', id, schoolId);
  }

  async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    return this.invokeIpc('createExpense', data);
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    return this.invokeIpc('updateExpense', id, data);
  }

  async deleteExpense(id: string): Promise<void> {
    return this.invokeIpc('deleteExpense', id);
  }

  // Expense Categories
  async getExpenseCategories(schoolId: string): Promise<ExpenseCategory[]> {
    return this.invokeIpc('getExpenseCategories', schoolId);
  }

  async createExpenseCategory(data: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseCategory> {
    return this.invokeIpc('createExpenseCategory', data);
  }

  async updateExpenseCategory(id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    return this.invokeIpc('updateExpenseCategory', id, data);
  }

  async deleteExpenseCategory(id: string): Promise<void> {
    return this.invokeIpc('deleteExpenseCategory', id);
  }

  // Daily Closures
  async getDailyClosures(schoolId: string, filters?: any): Promise<DailyClosure[]> {
    return this.invokeIpc('getDailyClosures', schoolId, filters);
  }

  async getDailyClosureById(id: string, schoolId: string): Promise<DailyClosure | null> {
    return this.invokeIpc('getDailyClosureById', id, schoolId);
  }

  async createDailyClosure(data: Omit<DailyClosure, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyClosure> {
    return this.invokeIpc('createDailyClosure', data);
  }

  async updateDailyClosure(id: string, data: Partial<DailyClosure>): Promise<DailyClosure> {
    return this.invokeIpc('updateDailyClosure', id, data);
  }

  async deleteDailyClosure(id: string): Promise<void> {
    return this.invokeIpc('deleteDailyClosure', id);
  }

  async approveDailyClosure(id: string, approvedBy: string): Promise<void> {
    return this.invokeIpc('approveDailyClosure', id, approvedBy);
  }

  async getDailyClosureStats(schoolId: string, date: string): Promise<DailyClosureStats> {
    return this.invokeIpc('getDailyClosureStats', schoolId, date);
  }

  // Treasury
  async getTreasuryAccounts(schoolId: string): Promise<TreasuryAccount[]> {
    return this.invokeIpc('getTreasuryAccounts', schoolId);
  }

  async getTreasuryAccountById(id: string, schoolId: string): Promise<TreasuryAccount | null> {
    return this.invokeIpc('getTreasuryAccountById', id, schoolId);
  }

  async createTreasuryAccount(data: Omit<TreasuryAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreasuryAccount> {
    return this.invokeIpc('createTreasuryAccount', data);
  }

  async updateTreasuryAccount(id: string, data: Partial<TreasuryAccount>): Promise<TreasuryAccount> {
    return this.invokeIpc('updateTreasuryAccount', id, data);
  }

  async deleteTreasuryAccount(id: string): Promise<void> {
    return this.invokeIpc('deleteTreasuryAccount', id);
  }

  async getTreasuryTransactions(schoolId: string, filters?: any): Promise<TreasuryTransaction[]> {
    return this.invokeIpc('getTreasuryTransactions', schoolId, filters);
  }

  async getTreasuryTransactionById(id: string, schoolId: string): Promise<TreasuryTransaction | null> {
    return this.invokeIpc('getTreasuryTransactionById', id, schoolId);
  }

  async createTreasuryTransaction(data: Omit<TreasuryTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreasuryTransaction> {
    return this.invokeIpc('createTreasuryTransaction', data);
  }

  async updateTreasuryTransaction(id: string, data: Partial<TreasuryTransaction>): Promise<TreasuryTransaction> {
    return this.invokeIpc('updateTreasuryTransaction', id, data);
  }

  async deleteTreasuryTransaction(id: string): Promise<void> {
    return this.invokeIpc('deleteTreasuryTransaction', id);
  }

  async getTreasuryStats(schoolId: string): Promise<TreasuryStats> {
    return this.invokeIpc('getTreasuryStats', schoolId);
  }

  async getTreasuryProjections(schoolId: string): Promise<TreasuryProjection[]> {
    return this.invokeIpc('getTreasuryProjections', schoolId);
  }

  // Reports
  async getReportTemplates(schoolId: string): Promise<ReportTemplate[]> {
    return this.invokeIpc('getReportTemplates', schoolId);
  }

  async getReportTemplateById(id: string, schoolId: string): Promise<ReportTemplate | null> {
    return this.invokeIpc('getReportTemplateById', id, schoolId);
  }

  async createReportTemplate(data: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    return this.invokeIpc('createReportTemplate', data);
  }

  async updateReportTemplate(id: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return this.invokeIpc('updateReportTemplate', id, data);
  }

  async deleteReportTemplate(id: string): Promise<void> {
    return this.invokeIpc('deleteReportTemplate', id);
  }

  async getFinancialReports(schoolId: string, filters?: any): Promise<FinancialReport[]> {
    return this.invokeIpc('getFinancialReports', schoolId, filters);
  }

  async getFinancialReportById(id: string, schoolId: string): Promise<FinancialReport | null> {
    return this.invokeIpc('getFinancialReportById', id, schoolId);
  }

  async generateFinancialReport(templateId: string, filters: any, generatedBy: string): Promise<FinancialReport> {
    return this.invokeIpc('generateFinancialReport', templateId, filters, generatedBy);
  }

  async deleteFinancialReport(id: string): Promise<void> {
    return this.invokeIpc('deleteFinancialReport', id);
  }

  async getReportStats(schoolId: string): Promise<ReportStats> {
    return this.invokeIpc('getReportStats', schoolId);
  }

  // Payroll
  async getPayroll(schoolId: string, filters?: any): Promise<any[]> {
    return this.invokeIpc('getPayroll', schoolId, filters);
  }

  async createPayroll(data: any): Promise<any> {
    return this.invokeIpc('createPayroll', data);
  }

  async updatePayroll(id: string, data: any): Promise<any> {
    return this.invokeIpc('updatePayroll', id, data);
  }

  async deletePayroll(id: string): Promise<void> {
    return this.invokeIpc('deletePayroll', id);
  }

}

export const financeService = new FinanceService();
