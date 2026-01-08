/**
 * Electron Compatibility Layer for Web
 * 
 * Remplace l'API Electron par des appels HTTP pour la version Web
 * Toutes les méthodes retournent des promesses qui utilisent l'API REST
 */

import { api, apiClient } from '../lib/api/client';
import { isWeb, isDesktop, getElectronAPI } from './platform';

/**
 * Wrapper pour l'API Electron compatible Web
 */
export const electronAPI = {
  /**
   * Vérifie si l'API Electron est disponible
   */
  isAvailable(): boolean {
    if (isWeb()) {
      return false; // En Web, on utilise toujours l'API HTTP
    }
    return !!getElectronAPI();
  },

  /**
   * API Finance (remplacée par HTTP)
   */
  finance: {
    getPayments: async (filters?: any) => {
      if (isDesktop() && getElectronAPI()?.finance) {
        return getElectronAPI().finance.getPayments(filters);
      }
      const response = await api.finance.getPayments(filters);
      return response.data;
    },
    createPayment: async (paymentData: any) => {
      if (isDesktop() && getElectronAPI()?.finance) {
        return getElectronAPI().finance.createPayment(paymentData);
      }
      const response = await api.finance.createPayment(paymentData);
      return response.data;
    },
    updatePayment: async (id: string, paymentData: any) => {
      if (isDesktop() && getElectronAPI()?.finance) {
        return getElectronAPI().finance.updatePayment(id, paymentData);
      }
      const response = await api.finance.updatePayment(id, paymentData);
      return response.data;
    },
    deletePayment: async (id: string) => {
      if (isDesktop() && getElectronAPI()?.finance) {
        return getElectronAPI().finance.deletePayment(id);
      }
      const response = await api.finance.deletePayment(id);
      return response.data;
    },
  },

  /**
   * API Treasury (remplacée par HTTP)
   */
  treasury: {
    getTreasuryAccounts: async (schoolId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getTreasuryAccounts(schoolId);
      }
      try {
        const response = await apiClient.get(`/treasury/accounts?schoolId=${schoolId}`);
        return response.data || [];
      } catch (error) {
        console.warn('Treasury API not available, returning empty array');
        return [];
      }
    },
    createTreasuryAccount: async (accountData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.createTreasuryAccount(accountData);
      }
      const response = await apiClient.post('/treasury/accounts', accountData);
      return response.data;
    },
    updateTreasuryAccount: async (accountId: string, accountData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.updateTreasuryAccount(accountId, accountData);
      }
      const response = await apiClient.patch(`/treasury/accounts/${accountId}`, accountData);
      return response.data;
    },
    deleteTreasuryAccount: async (accountId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.deleteTreasuryAccount(accountId);
      }
      const response = await apiClient.delete(`/treasury/accounts/${accountId}`);
      return response.data;
    },
    getTreasuryOperations: async (schoolId: string, filters?: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getTreasuryOperations(schoolId, filters);
      }
      try {
        const response = await apiClient.get(`/treasury/operations?schoolId=${schoolId}`, { params: filters });
        return response.data || [];
      } catch (error) {
        console.warn('Treasury operations API not available, returning empty array');
        return [];
      }
    },
    createTreasuryOperation: async (operationData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.createTreasuryOperation(operationData);
      }
      const response = await apiClient.post('/treasury/operations', operationData);
      return response.data;
    },
    updateTreasuryOperation: async (operationId: string, operationData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.updateTreasuryOperation(operationId, operationData);
      }
      const response = await apiClient.patch(`/treasury/operations/${operationId}`, operationData);
      return response.data;
    },
    deleteTreasuryOperation: async (operationId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.deleteTreasuryOperation(operationId);
      }
      const response = await apiClient.delete(`/treasury/operations/${operationId}`);
      return response.data;
    },
    // Autres méthodes treasury avec fallback HTTP
    getTreasuryHeritage: async (schoolId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getTreasuryHeritage(schoolId);
      }
      try {
        const response = await apiClient.get(`/treasury/heritage?schoolId=${schoolId}`);
        return response.data || [];
      } catch {
        return [];
      }
    },
    createTreasuryHeritage: async (heritageData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.createTreasuryHeritage(heritageData);
      }
      const response = await apiClient.post('/treasury/heritage', heritageData);
      return response.data;
    },
    updateTreasuryHeritage: async (heritageId: string, heritageData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.updateTreasuryHeritage(heritageId, heritageData);
      }
      const response = await apiClient.patch(`/treasury/heritage/${heritageId}`, heritageData);
      return response.data;
    },
    deleteTreasuryHeritage: async (heritageId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.deleteTreasuryHeritage(heritageId);
      }
      const response = await apiClient.delete(`/treasury/heritage/${heritageId}`);
      return response.data;
    },
    getTreasuryForecasts: async (schoolId: string, filters?: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getTreasuryForecasts(schoolId, filters);
      }
      try {
        const response = await apiClient.get(`/treasury/forecasts?schoolId=${schoolId}`, { params: filters });
        return response.data || [];
      } catch {
        return [];
      }
    },
    createTreasuryForecast: async (forecastData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.createTreasuryForecast(forecastData);
      }
      const response = await apiClient.post('/treasury/forecasts', forecastData);
      return response.data;
    },
    updateTreasuryForecast: async (forecastId: string, forecastData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.updateTreasuryForecast(forecastId, forecastData);
      }
      const response = await apiClient.patch(`/treasury/forecasts/${forecastId}`, forecastData);
      return response.data;
    },
    deleteTreasuryForecast: async (forecastId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.deleteTreasuryForecast(forecastId);
      }
      const response = await apiClient.delete(`/treasury/forecasts/${forecastId}`);
      return response.data;
    },
    getTreasuryReports: async (schoolId: string, filters?: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getTreasuryReports(schoolId, filters);
      }
      try {
        const response = await apiClient.get(`/treasury/reports?schoolId=${schoolId}`, { params: filters });
        return response.data || [];
      } catch {
        return [];
      }
    },
    createTreasuryReport: async (reportData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.createTreasuryReport(reportData);
      }
      const response = await apiClient.post('/treasury/reports', reportData);
      return response.data;
    },
    getTreasuryStats: async (schoolId: string, period?: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getTreasuryStats(schoolId, period);
      }
      try {
        const response = await apiClient.get(`/treasury/stats?schoolId=${schoolId}`, { params: { period } });
        return response.data || {};
      } catch {
        return {};
      }
    },
    getWorkingCapital: async (schoolId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.getWorkingCapital(schoolId);
      }
      try {
        const response = await apiClient.get(`/treasury/working-capital?schoolId=${schoolId}`);
        return response.data || 0;
      } catch {
        return 0;
      }
    },
    syncRevenuesWithTreasury: async (schoolId: string, revenueId: string, accountId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.syncRevenuesWithTreasury(schoolId, revenueId, accountId);
      }
      const response = await apiClient.post(`/treasury/sync/revenues`, { schoolId, revenueId, accountId });
      return response.data;
    },
    syncExpensesWithTreasury: async (schoolId: string, expenseId: string, accountId: string) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.syncExpensesWithTreasury(schoolId, expenseId, accountId);
      }
      const response = await apiClient.post(`/treasury/sync/expenses`, { schoolId, expenseId, accountId });
      return response.data;
    },
    transferBetweenAccounts: async (transferData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.transferBetweenAccounts(transferData);
      }
      const response = await apiClient.post('/treasury/transfers', transferData);
      return response.data;
    },
    createAdvance: async (advanceData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.createAdvance(advanceData);
      }
      const response = await apiClient.post('/treasury/advances', advanceData);
      return response.data;
    },
    adjustAccountBalance: async (adjustmentData: any) => {
      if (isDesktop() && getElectronAPI()?.treasury) {
        return getElectronAPI().treasury.adjustAccountBalance(adjustmentData);
      }
      const response = await apiClient.post('/treasury/adjustments', adjustmentData);
      return response.data;
    },
  },
};

/**
 * Expose electronAPI sur window pour compatibilité
 */
if (typeof window !== 'undefined') {
  (window as any).electronAPI = electronAPI;
}

export default electronAPI;

