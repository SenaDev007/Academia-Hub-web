/**
 * Service API pour la gestion de la paie (Module RH)
 */

import axios from 'axios';
import { apiClient } from './config';

// Types pour la paie
export interface PayrollBatch {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalAmount: number;
  currency: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  payrollsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  batchId: string;
  employeeId: string;
  employeeName: string;
  employeeType: 'permanent' | 'vacataire';
  department: string;
  position: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  paymentDate?: string;
  paymentMethod?: string;
  grossSalary: number;
  netSalary: number;
  deductions: {
    cnss: number;
    irpp: number;
    other: number;
  };
  allowances: {
    transport: number;
    housing: number;
    responsibility: number;
    performance: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PayrollSettings {
  id: string;
  currency: string;
  taxRate: number;
  socialSecurityRate: number;
  minimumSalary: number;
  overtimeRate: number;
  paymentDay: number;
  workingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollBatch {
  name: string;
  periodStart: string;
  periodEnd: string;
  employeeIds?: string[];
}

export interface CreatePayroll {
  batchId: string;
  employeeId: string;
  baseSalary: number;
  allowances?: {
    transport?: number;
    housing?: number;
    responsibility?: number;
    performance?: number;
  };
  deductions?: {
    advance?: number;
    loan?: number;
    other?: number;
  };
  overtimeHours?: number;
  absences?: number;
}

export interface PayrollStats {
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalDeductions: number;
  totalEmployerCost: number;
  averageSalary: number;
  pendingBatches: number;
  completedBatches: number;
}

// Service API Payroll
export class PayrollService {
  /**
   * Récupérer tous les lots de paie
   */
  static async getPayrollBatches(params?: {
    status?: string;
    periodStart?: string;
    periodEnd?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: PayrollBatch[];
    pagination: any;
  }> {
    const response = await apiClient.get('/payroll/batches', { params });
    return response.data;
  }

  /**
   * Créer un nouveau lot de paie
   */
  static async createPayrollBatch(data: CreatePayrollBatch): Promise<{
    success: boolean;
    data: PayrollBatch;
  }> {
    const response = await apiClient.post('/payroll/batches', data);
    return response.data;
  }

  /**
   * Récupérer un lot de paie par ID
   */
  static async getPayrollBatch(id: string): Promise<{
    success: boolean;
    data: PayrollBatch;
  }> {
    const response = await apiClient.get(`/payroll/batches/${id}`);
    return response.data;
  }

  /**
   * Mettre à jour un lot de paie
   */
  static async updatePayrollBatch(id: string, data: Partial<CreatePayrollBatch>): Promise<{
    success: boolean;
    data: PayrollBatch;
  }> {
    const response = await apiClient.put(`/payroll/batches/${id}`, data);
    return response.data;
  }

  /**
   * Supprimer un lot de paie
   */
  static async deletePayrollBatch(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(`/payroll/batches/${id}`);
    return response.data;
  }

  /**
   * Récupérer toutes les fiches de paie
   */
  static async getPayrolls(params?: {
    batchId?: string;
    employeeId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Payroll[];
    pagination: any;
  }> {
    const response = await apiClient.get('/payroll', { params });
    return response.data;
  }

  /**
   * Créer une fiche de paie
   */
  static async createPayroll(data: CreatePayroll): Promise<{
    success: boolean;
    data: Payroll;
  }> {
    const response = await apiClient.post('/payroll', data);
    return response.data;
  }

  /**
   * Récupérer une fiche de paie par ID
   */
  static async getPayroll(id: string): Promise<{
    success: boolean;
    data: Payroll;
  }> {
    const response = await apiClient.get(`/payroll/${id}`);
    return response.data;
  }

  /**
   * Mettre à jour une fiche de paie
   */
  static async updatePayroll(id: string, data: Partial<CreatePayroll>): Promise<{
    success: boolean;
    data: Payroll;
  }> {
    const response = await apiClient.put(`/payroll/${id}`, data);
    return response.data;
  }

  /**
   * Supprimer une fiche de paie
   */
  static async deletePayroll(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(`/payroll/${id}`);
    return response.data;
  }

  /**
   * Traiter un lot de paie (calcul automatique)
   */
  static async processPayrollBatch(batchId: string): Promise<{
    success: boolean;
    data: PayrollBatch;
  }> {
    const response = await apiClient.post(`/payroll/batches/${batchId}/process`);
    return response.data;
  }

  /**
   * Approuver un lot de paie
   */
  static async approvePayrollBatch(batchId: string): Promise<{
    success: boolean;
    data: PayrollBatch;
  }> {
    const response = await apiClient.post(`/payroll/batches/${batchId}/approve`);
    return response.data;
  }

  /**
   * Payer un lot de paie
   */
  static async payPayrollBatch(batchId: string): Promise<{
    success: boolean;
    data: PayrollBatch;
  }> {
    const response = await apiClient.post(`/payroll/batches/${batchId}/pay`);
    return response.data;
  }

  /**
   * Récupérer les paramètres de paie
   */
  static async getPayrollSettings(): Promise<{
    success: boolean;
    data: PayrollSettings;
  }> {
    const response = await apiClient.get('/payroll/settings');
    return response.data;
  }

  /**
   * Mettre à jour les paramètres de paie
   */
  static async updatePayrollSettings(data: Partial<PayrollSettings>): Promise<{
    success: boolean;
    data: PayrollSettings;
  }> {
    const response = await apiClient.put('/payroll/settings', data);
    return response.data;
  }

  /**
   * Récupérer les statistiques de paie
   */
  static async getPayrollStats(): Promise<{
    success: boolean;
    data: PayrollStats;
  }> {
    const response = await apiClient.get('/payroll/stats');
    return response.data;
  }

  /**
   * Générer un rapport de paie
   */
  static async generatePayrollReport(params: {
    batchId?: string;
    periodStart?: string;
    periodEnd?: string;
    format?: 'pdf' | 'excel';
  }): Promise<{
    success: boolean;
    data: {
      url: string;
      filename: string;
    };
  }> {
    const response = await apiClient.post('/payroll/reports', params, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Récupérer les fiches de paie par employé
   */
  static async getEmployeePayrolls(employeeId: string): Promise<{
    success: boolean;
    data: Payroll[];
  }> {
    const response = await apiClient.get(`/payroll/employee/${employeeId}`);
    return response.data;
  }

  /**
   * Récupérer les fiches de paie en attente de validation
   */
  static async getPendingPayrolls(): Promise<{
    success: boolean;
    data: Payroll[];
  }> {
    const response = await apiClient.get('/payroll/pending');
    return response.data;
  }

  /**
   * Exporter les données de paie
   */
  static async exportPayrollData(params: {
    format: 'csv' | 'excel';
    batchId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<{
    success: boolean;
    data: {
      url: string;
      filename: string;
    };
  }> {
    const response = await apiClient.post('/payroll/export', params, {
      responseType: 'blob'
    });
    return response.data;
  }
}

// Instance exportée pour utilisation directe
export const payrollService = PayrollService;
