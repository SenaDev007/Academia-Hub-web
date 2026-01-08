// Interfaces pour le module Finance et l'intégration avec les contrats

export interface Payroll {
  id: string;
  contractId: string;
  employeeId: string;
  employeeName: string;
  position: string;
  periodStart: string;
  periodEnd: string;
  year: number;
  month: number;
  
  // Rémunération de base
  baseSalary: number;
  hourlyRate: number;
  totalHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  
  // Avantages
  housingAllowance: number;
  transportAllowance: number;
  fixedBonuses: number;
  performanceBonus: number;
  otherAllowances: number;
  totalAllowances: number;
  
  // Calculs bruts
  grossSalary: number;
  grossOvertime: number;
  totalGrossPay: number;
  
  // Déductions sociales
  cnssEmployee: number;
  cnssEmployer: number;
  irpp: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Calculs nets
  netPay: number;
  
  // Statut et validation
  status: 'draft' | 'calculated' | 'pending_approval' | 'approved' | 'paid' | 'cancelled';
  calculatedAt?: string;
  calculatedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  paidBy?: string;
  paymentMethod?: string;
  bankAccount?: string;
  mobileMoneyAccount?: string;
  
  // Métadonnées
  notes?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  contractId: string;
  employeeId: string;
  itemType: 'earnings' | 'deductions' | 'allowances' | 'bonuses';
  itemCategory: string;
  itemDescription: string;
  quantity: number;
  unitRate: number;
  amount: number;
  isTaxable: boolean;
  isDeductible: boolean;
  orderIndex: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollReport {
  id: string;
  reportType: 'monthly_summary' | 'employee_detail' | 'department_summary' | 'tax_report' | 'cnss_report';
  periodStart: string;
  periodEnd: string;
  year: number;
  month?: number;
  department?: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalCnss: number;
  totalIrpp: number;
  reportData?: string; // JSON data
  generatedAt?: string;
  generatedBy?: string;
  status: 'generated' | 'approved' | 'exported';
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollCalculation {
  contractId: string;
  employeeId: string;
  employeeName: string;
  contractType: 'permanent' | 'vacataire';
  salaryType: 'fixe' | 'horaire';
  
  // Période
  periodStart: string;
  periodEnd: string;
  year: number;
  month: number;
  
  // Heures travaillées
  totalHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  
  // Rémunération
  baseSalary: number;
  hourlyRate: number;
  grossSalary: number;
  overtimePay: number;
  
  // Avantages
  housingAllowance: number;
  transportAllowance: number;
  fixedBonuses: number;
  performanceBonus: number;
  otherAllowances: number;
  totalAllowances: number;
  
  // Totaux bruts
  totalGrossPay: number;
  
  // Déductions
  cnssEmployee: number;
  cnssEmployer: number;
  irpp: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net à payer
  netPay: number;
  
  // Détail des éléments
  payrollItems: PayrollItem[];
}

// Service pour la gestion de la paie
export class PayrollService {
  private static instance: PayrollService;
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  static getInstance(): PayrollService {
    if (!PayrollService.instance) {
      PayrollService.instance = new PayrollService();
    }
    return PayrollService.instance;
  }

  // === GESTION DE LA PAIE ===

  async createPayroll(payrollData: Partial<Payroll>): Promise<{ success: boolean; data?: Payroll; message?: string }> {
    try {
      if (this.electronAPI?.payroll?.createPayroll) {
        const result = await this.electronAPI.payroll.createPayroll(payrollData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création de la paie:', error);
      return { success: false, message: 'Erreur lors de la création de la paie' };
    }
  }

  async getPayroll(filters?: {
    contractId?: string;
    employeeId?: string;
    year?: number;
    month?: number;
    status?: string;
  }): Promise<Payroll[]> {
    try {
      if (this.electronAPI?.payroll?.getPayroll) {
        const result = await this.electronAPI.payroll.getPayroll(filters);
        return result || [];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la paie:', error);
      return [];
    }
  }

  async updatePayroll(id: string, payrollData: Partial<Payroll>): Promise<{ success: boolean; data?: Payroll; message?: string }> {
    try {
      if (this.electronAPI?.payroll?.updatePayroll) {
        const result = await this.electronAPI.payroll.updatePayroll(id, payrollData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la paie:', error);
      return { success: false, message: 'Erreur lors de la mise à jour de la paie' };
    }
  }

  // === CALCULS DE PAIE ===

  async calculatePayroll(contractId: string, year: number, month: number): Promise<{ success: boolean; data?: PayrollCalculation; message?: string }> {
    try {
      if (this.electronAPI?.payroll?.calculatePayroll) {
        const result = await this.electronAPI.payroll.calculatePayroll(contractId, year, month);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors du calcul de la paie:', error);
      return { success: false, message: 'Erreur lors du calcul de la paie' };
    }
  }

  async generatePayrollForAll(year: number, month: number): Promise<{ success: boolean; data?: Payroll[]; message?: string }> {
    try {
      if (this.electronAPI?.payroll?.generatePayrollForAll) {
        const result = await this.electronAPI.payroll.generatePayrollForAll(year, month);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la génération de la paie:', error);
      return { success: false, message: 'Erreur lors de la génération de la paie' };
    }
  }

  // === GESTION DES ÉLÉMENTS DE PAIE ===

  async createPayrollItem(itemData: Partial<PayrollItem>): Promise<{ success: boolean; data?: PayrollItem; message?: string }> {
    try {
      if (this.electronAPI?.payroll?.createPayrollItem) {
        const result = await this.electronAPI.payroll.createPayrollItem(itemData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création de l\'élément de paie:', error);
      return { success: false, message: 'Erreur lors de la création de l\'élément de paie' };
    }
  }

  async getPayrollItems(payrollId: string): Promise<PayrollItem[]> {
    try {
      if (this.electronAPI?.payroll?.getPayrollItems) {
        const result = await this.electronAPI.payroll.getPayrollItems(payrollId);
        return result || [];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des éléments de paie:', error);
      return [];
    }
  }

  // === RAPPORTS DE PAIE ===

  async generatePayrollReport(reportData: {
    reportType: string;
    periodStart: string;
    periodEnd: string;
    year: number;
    month?: number;
    department?: string;
  }): Promise<{ success: boolean; data?: PayrollReport; message?: string }> {
    try {
      if (this.electronAPI?.payroll?.generatePayrollReport) {
        const result = await this.electronAPI.payroll.generatePayrollReport(reportData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return { success: false, message: 'Erreur lors de la génération du rapport' };
    }
  }

  async getPayrollReports(filters?: {
    reportType?: string;
    year?: number;
    month?: number;
    department?: string;
  }): Promise<PayrollReport[]> {
    try {
      if (this.electronAPI?.payroll?.getPayrollReports) {
        const result = await this.electronAPI.payroll.getPayrollReports(filters);
        return result || [];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
      return [];
    }
  }

  // === MÉTHODES UTILITAIRES ===

  calculateCNSS(grossSalary: number, isEmployee: boolean = true): number {
    // Taux CNSS : 5.4% pour l'employé, 8.6% pour l'employeur
    const rate = isEmployee ? 0.054 : 0.086;
    return Math.round(grossSalary * rate);
  }

  calculateIRPP(grossSalary: number): number {
    // Calcul simplifié de l'IRPP (à adapter selon la législation locale)
    if (grossSalary <= 50000) return 0;
    if (grossSalary <= 100000) return (grossSalary - 50000) * 0.1;
    if (grossSalary <= 200000) return 5000 + (grossSalary - 100000) * 0.15;
    if (grossSalary <= 500000) return 20000 + (grossSalary - 200000) * 0.2;
    return 80000 + (grossSalary - 500000) * 0.25;
  }

  calculateOvertimePay(overtimeHours: number, hourlyRate: number, multiplier: number = 1.5): number {
    return Math.round(overtimeHours * hourlyRate * multiplier);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'calculated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'calculated': return 'Calculé';
      case 'pending_approval': return 'En attente d\'approbation';
      case 'approved': return 'Approuvé';
      case 'paid': return 'Payé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }
}

export const payrollService = PayrollService.getInstance();
