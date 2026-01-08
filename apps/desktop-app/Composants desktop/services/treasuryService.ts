// Service de trésorerie - Utilise l'API HTTP

export interface TreasuryAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'mobile' | 'check';
  balance: number;
  color: string;
  is_active: boolean;
  description?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TreasuryOperation {
  id: string;
  type: 'revenue' | 'expense' | 'transfer' | 'advance' | 'adjustment';
  account_id: string;
  target_account_id?: string;
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: 'revenue' | 'expense';
  created_by: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TreasuryHeritage {
  id: string;
  name: string;
  type: 'immobilisation' | 'capital' | 'reserve';
  value: number;
  description?: string;
  acquisition_date?: string;
  depreciation_rate: number;
  current_value?: number;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TreasuryForecast {
  id: string;
  name: string;
  type: 'revenue' | 'expense';
  amount: number;
  expected_date: string;
  description?: string;
  status: 'pending' | 'realized' | 'cancelled';
  created_by: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TreasuryReport {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  period_start: string;
  period_end: string;
  total_revenues: number;
  total_expenses: number;
  net_balance: number;
  working_capital: number;
  cash_flow: number;
  report_data?: string;
  generated_by: string;
  school_id: string;
  generated_at: string;
}

export interface TreasuryStats {
  totalRevenues: number;
  totalExpenses: number;
  netBalance: number;
  tuitionPercentage: number;
  salaryPercentage: number;
  monthlyRevenues: any[];
  monthlyExpenses: any[];
}

export interface WorkingCapital {
  fondRoulement: number;
  besoinFondsRoulement: number;
  tresorerieNette: number;
  totalImmobilisations: number;
  totalCapitauxPermanents: number;
  creances: number;
  dettes: number;
}

class TreasuryService {
  // ==================== GESTION DES COMPTES DE TRÉSORERIE ====================

  async getTreasuryAccounts(schoolId: string): Promise<TreasuryAccount[]> {
    // Utiliser le wrapper de compatibilité qui gère Web/Desktop
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.treasury?.getTreasuryAccounts) {
      return electronAPI.treasury.getTreasuryAccounts(schoolId);
    }
    // Fallback HTTP pour Web
    try {
      const { apiClient } = await import('../lib/api/client');
      const response = await apiClient.get(`/treasury/accounts?schoolId=${schoolId}`);
      return response.data || [];
    } catch {
      return [];
    }
  }

  async createTreasuryAccount(accountData: Omit<TreasuryAccount, 'id' | 'created_at' | 'updated_at'>): Promise<TreasuryAccount> {
    return (window as any).electronAPI?.treasury?.createTreasuryAccount(accountData);
  }

  async updateTreasuryAccount(accountId: string, accountData: Partial<TreasuryAccount>): Promise<TreasuryAccount> {
    return (window as any).electronAPI?.treasury?.updateTreasuryAccount(accountId, accountData);
  }

  async deleteTreasuryAccount(accountId: string): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.deleteTreasuryAccount(accountId);
  }

  // ==================== GESTION DES OPÉRATIONS DE TRÉSORERIE ====================

  async getTreasuryOperations(schoolId: string, filters?: any): Promise<TreasuryOperation[]> {
    return (window as any).electronAPI?.treasury?.getTreasuryOperations(schoolId, filters) || [];
  }

  async createTreasuryOperation(operationData: Omit<TreasuryOperation, 'id' | 'created_at' | 'updated_at'>): Promise<TreasuryOperation> {
    return (window as any).electronAPI?.treasury?.createTreasuryOperation(operationData);
  }

  async updateTreasuryOperation(operationId: string, operationData: Partial<TreasuryOperation>): Promise<TreasuryOperation> {
    return (window as any).electronAPI?.treasury?.updateTreasuryOperation(operationId, operationData);
  }

  async deleteTreasuryOperation(operationId: string): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.deleteTreasuryOperation(operationId);
  }

  // ==================== GESTION DU PATRIMOINE ====================

  async getTreasuryHeritage(schoolId: string): Promise<TreasuryHeritage[]> {
    return (window as any).electronAPI?.treasury?.getTreasuryHeritage(schoolId) || [];
  }

  async createTreasuryHeritage(heritageData: Omit<TreasuryHeritage, 'id' | 'created_at' | 'updated_at'>): Promise<TreasuryHeritage> {
    return (window as any).electronAPI?.treasury?.createTreasuryHeritage(heritageData);
  }

  async updateTreasuryHeritage(heritageId: string, heritageData: Partial<TreasuryHeritage>): Promise<TreasuryHeritage> {
    return (window as any).electronAPI?.treasury?.updateTreasuryHeritage(heritageId, heritageData);
  }

  async deleteTreasuryHeritage(heritageId: string): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.deleteTreasuryHeritage(heritageId);
  }

  // ==================== GESTION DES PRÉVISIONS ====================

  async getTreasuryForecasts(schoolId: string, filters?: any): Promise<TreasuryForecast[]> {
    return (window as any).electronAPI?.treasury?.getTreasuryForecasts(schoolId, filters) || [];
  }

  async createTreasuryForecast(forecastData: Omit<TreasuryForecast, 'id' | 'created_at' | 'updated_at'>): Promise<TreasuryForecast> {
    return (window as any).electronAPI?.treasury?.createTreasuryForecast(forecastData);
  }

  async updateTreasuryForecast(forecastId: string, forecastData: Partial<TreasuryForecast>): Promise<TreasuryForecast> {
    return (window as any).electronAPI?.treasury?.updateTreasuryForecast(forecastId, forecastData);
  }

  async deleteTreasuryForecast(forecastId: string): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.deleteTreasuryForecast(forecastId);
  }

  // ==================== GESTION DES RAPPORTS ====================

  async getTreasuryReports(schoolId: string, filters?: any): Promise<TreasuryReport[]> {
    return (window as any).electronAPI?.treasury?.getTreasuryReports(schoolId, filters) || [];
  }

  async createTreasuryReport(reportData: Omit<TreasuryReport, 'id' | 'generated_at'>): Promise<TreasuryReport> {
    return (window as any).electronAPI?.treasury?.createTreasuryReport(reportData);
  }

  // ==================== STATISTIQUES ET CALCULS ====================

  async getTreasuryStats(schoolId: string, period?: string): Promise<TreasuryStats> {
    return (window as any).electronAPI?.treasury?.getTreasuryStats(schoolId, period);
  }

  async getWorkingCapital(schoolId: string): Promise<WorkingCapital> {
    return (window as any).electronAPI?.treasury?.getWorkingCapital(schoolId);
  }

  async syncRevenuesWithTreasury(schoolId: string, revenueId: string, accountId: string): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.syncRevenuesWithTreasury(schoolId, revenueId, accountId);
  }

  async syncExpensesWithTreasury(schoolId: string, expenseId: string, accountId: string): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.syncExpensesWithTreasury(schoolId, expenseId, accountId);
  }

  // ==================== TRANSFERTS ENTRE COMPTES ====================

  async transferBetweenAccounts(
    schoolId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.transferBetweenAccounts(
      schoolId,
      fromAccountId,
      toAccountId,
      amount,
      description,
      createdBy
    );
  }

  // ==================== AVANCES ET RÉGULARISATIONS ====================

  async createAdvance(
    schoolId: string,
    accountId: string,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.createAdvance(
      schoolId,
      accountId,
      amount,
      description,
      createdBy
    );
  }

  async adjustAccountBalance(
    schoolId: string,
    accountId: string,
    newBalance: number,
    reason: string,
    createdBy: string
  ): Promise<{ success: boolean; message: string }> {
    return (window as any).electronAPI?.treasury?.adjustAccountBalance(
      schoolId,
      accountId,
      newBalance,
      reason,
      createdBy
    );
  }
}

export const treasuryService = new TreasuryService();
