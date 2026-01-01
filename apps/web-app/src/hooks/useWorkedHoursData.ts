import { useState, useEffect, useCallback } from 'react';
import { planningService } from '../services/planningService';
import { 
  WorkedHoursEntry, 
  WorkedHoursSummary, 
  PayrollReport, 
  WorkedHoursAlert, 
  WorkedHoursConfig 
} from '../types/planning';

interface UseWorkedHoursDataReturn {
  // Données
  workedHours: WorkedHoursEntry[];
  summaries: WorkedHoursSummary[];
  payrollReports: PayrollReport[];
  alerts: WorkedHoursAlert[];
  config: WorkedHoursConfig | null;
  
  // États
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchWorkedHours: (filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => Promise<void>;
  fetchSummaries: (filters: {
    employeeId?: string;
    period: string;
    periodType: 'daily' | 'weekly' | 'monthly';
  }) => Promise<void>;
  fetchPayrollReports: (filters?: {
    employeeId?: string;
    period?: string;
    status?: string;
  }) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  
  // CRUD Operations
  createWorkedHoursEntry: (entryData: Omit<WorkedHoursEntry, 'id' | 'validatedAt'>) => Promise<void>;
  updateWorkedHoursEntry: (id: string, updates: Partial<WorkedHoursEntry>) => Promise<void>;
  deleteWorkedHoursEntry: (id: string) => Promise<void>;
  validateHoursFromSchedule: (scheduleEntryId: string, validatedBy: string) => Promise<void>;
  
  // Reports & Alerts
  generatePayrollReport: (employeeId: string, period: string) => Promise<void>;
  sendReportToPayroll: (reportId: string) => Promise<void>;
  resolveAlert: (alertId: string, resolvedBy: string) => Promise<void>;
  
  // Config
  saveConfig: (config: WorkedHoursConfig) => Promise<void>;
  
  // Export
  exportData: (filters: {
    employeeId?: string;
    startDate: string;
    endDate: string;
    format: 'csv' | 'excel' | 'pdf';
  }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

export const useWorkedHoursData = (): UseWorkedHoursDataReturn => {
  // États des données
  const [workedHours, setWorkedHours] = useState<WorkedHoursEntry[]>([]);
  const [summaries, setSummaries] = useState<WorkedHoursSummary[]>([]);
  const [payrollReports, setPayrollReports] = useState<PayrollReport[]>([]);
  const [alerts, setAlerts] = useState<WorkedHoursAlert[]>([]);
  const [config, setConfig] = useState<WorkedHoursConfig | null>(null);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour gérer les erreurs
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Erreur lors de ${operation}:`, error);
    setError(`Erreur lors de ${operation}: ${error.message || 'Erreur inconnue'}`);
  }, []);

  // Récupérer les entrées d'heures travaillées
  const fetchWorkedHours = useCallback(async (filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    try {
      console.log('🔍 fetchWorkedHours - Début avec filtres:', filters);
      setLoading(true);
      setError(null);
      const data = await planningService.getWorkedHoursEntries(filters);
      console.log('🔍 fetchWorkedHours - Données récupérées:', data);
      setWorkedHours(data);
      console.log('🔍 fetchWorkedHours - État mis à jour avec', data.length, 'entrées');
    } catch (error) {
      console.error('🔍 fetchWorkedHours - Erreur:', error);
      handleError(error, 'la récupération des heures travaillées');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Récupérer les résumés
  const fetchSummaries = useCallback(async (filters: {
    employeeId?: string;
    period: string;
    periodType: 'daily' | 'weekly' | 'monthly';
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await planningService.getWorkedHoursSummary(filters);
      setSummaries(data);
    } catch (error) {
      handleError(error, 'la récupération des résumés');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Récupérer les rapports de paie
  const fetchPayrollReports = useCallback(async (filters?: {
    employeeId?: string;
    period?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await planningService.getPayrollReports(filters);
      setPayrollReports(data);
    } catch (error) {
      handleError(error, 'la récupération des rapports de paie');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Récupérer les alertes
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planningService.getWorkedHoursAlerts();
      setAlerts(data);
    } catch (error) {
      handleError(error, 'la récupération des alertes');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Récupérer la configuration
  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const data = await planningService.getWorkedHoursConfig();
      setConfig(data);
    } catch (error) {
      handleError(error, 'la récupération de la configuration');
    }
  }, [handleError]);

  // Créer une entrée d'heures travaillées
  const createWorkedHoursEntry = useCallback(async (entryData: Omit<WorkedHoursEntry, 'id' | 'validatedAt'>) => {
    try {
      setError(null);
      const newEntry = await planningService.createWorkedHoursEntry(entryData);
      setWorkedHours(prev => [...prev, newEntry]);
    } catch (error) {
      handleError(error, 'la création de l\'entrée');
      throw error;
    }
  }, [handleError]);

  // Mettre à jour une entrée d'heures travaillées
  const updateWorkedHoursEntry = useCallback(async (id: string, updates: Partial<WorkedHoursEntry>) => {
    try {
      setError(null);
      const updatedEntry = await planningService.updateWorkedHoursEntry(id, updates);
      setWorkedHours(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
    } catch (error) {
      handleError(error, 'la mise à jour de l\'entrée');
      throw error;
    }
  }, [handleError]);

  // Supprimer une entrée d'heures travaillées
  const deleteWorkedHoursEntry = useCallback(async (id: string) => {
    try {
      setError(null);
      await planningService.deleteWorkedHoursEntry(id);
      setWorkedHours(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      handleError(error, 'la suppression de l\'entrée');
      throw error;
    }
  }, [handleError]);

  // Valider les heures depuis le planning
  const validateHoursFromSchedule = useCallback(async (scheduleEntryId: string, validatedBy: string) => {
    try {
      setError(null);
      const newEntry = await planningService.validateHoursFromSchedule(scheduleEntryId, validatedBy);
      setWorkedHours(prev => [...prev, newEntry]);
    } catch (error) {
      handleError(error, 'la validation des heures depuis le planning');
      throw error;
    }
  }, [handleError]);

  // Générer un rapport de paie
  const generatePayrollReport = useCallback(async (employeeId: string, period: string) => {
    try {
      setError(null);
      const report = await planningService.generatePayrollReport(employeeId, period);
      setPayrollReports(prev => [...prev, report]);
    } catch (error) {
      handleError(error, 'la génération du rapport de paie');
      throw error;
    }
  }, [handleError]);

  // Envoyer un rapport à la paie
  const sendReportToPayroll = useCallback(async (reportId: string) => {
    try {
      setError(null);
      await planningService.sendReportToPayroll(reportId);
      setPayrollReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'sent_to_payroll' as const }
          : report
      ));
    } catch (error) {
      handleError(error, 'l\'envoi du rapport à la paie');
      throw error;
    }
  }, [handleError]);

  // Résoudre une alerte
  const resolveAlert = useCallback(async (alertId: string, resolvedBy: string) => {
    try {
      setError(null);
      await planningService.resolveWorkedHoursAlert(alertId, resolvedBy);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              isResolved: true, 
              resolvedAt: new Date().toISOString(),
              resolvedBy 
            }
          : alert
      ));
    } catch (error) {
      handleError(error, 'la résolution de l\'alerte');
      throw error;
    }
  }, [handleError]);

  // Sauvegarder la configuration
  const saveConfig = useCallback(async (newConfig: WorkedHoursConfig) => {
    try {
      setError(null);
      await planningService.saveWorkedHoursConfig(newConfig);
      setConfig(newConfig);
    } catch (error) {
      handleError(error, 'la sauvegarde de la configuration');
      throw error;
    }
  }, [handleError]);

  // Exporter les données
  const exportData = useCallback(async (filters: {
    employeeId?: string;
    startDate: string;
    endDate: string;
    format: 'csv' | 'excel' | 'pdf';
  }) => {
    try {
      setError(null);
      return await planningService.exportWorkedHoursData(filters);
    } catch (error) {
      handleError(error, 'l\'export des données');
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }, [handleError]);

  // Chargement initial des données
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    // Données
    workedHours,
    summaries,
    payrollReports,
    alerts,
    config,
    
    // États
    loading,
    error,
    
    // Actions de récupération
    fetchWorkedHours,
    fetchSummaries,
    fetchPayrollReports,
    fetchAlerts,
    fetchConfig,
    
    // CRUD Operations
    createWorkedHoursEntry,
    updateWorkedHoursEntry,
    deleteWorkedHoursEntry,
    validateHoursFromSchedule,
    
    // Reports & Alerts
    generatePayrollReport,
    sendReportToPayroll,
    resolveAlert,
    
    // Config
    saveConfig,
    
    // Export
    exportData
  };
};
