/**
 * Electron Compatibility Layer for Next.js Web
 * 
 * ⚠️ IMPORTANT : Next.js = Web uniquement
 * 
 * Ce wrapper remplace l'API Electron par des appels HTTP pour la version Web.
 * Toutes les méthodes retournent des promesses qui utilisent l'API REST.
 * 
 * En Next.js, on n'utilise JAMAIS Electron directement.
 */

import { api, apiClient } from '../lib/api/client';
import { isWeb, isDesktop, getElectronAPI } from './platform';

/**
 * Wrapper pour l'API Electron compatible Web (Next.js)
 * 
 * ⚠️ En Next.js, on est toujours sur Web, donc on utilise toujours HTTP
 */
export const electronAPI = {
  /**
   * Vérifie si l'API Electron est disponible
   * 
   * En Next.js, retourne toujours false (Web uniquement)
   */
  isAvailable(): boolean {
    // Next.js = Web uniquement, pas d'Electron
    return false;
  },

  /**
   * API Finance (remplacée par HTTP)
   */
  finance: {
    getPayments: async (filters?: any) => {
      // Next.js = toujours HTTP
      const response = await api.finance.getPayments(filters);
      return response.data;
    },
    createPayment: async (paymentData: any) => {
      const response = await api.finance.createPayment(paymentData);
      return response.data;
    },
    updatePayment: async (id: string, paymentData: any) => {
      const response = await api.finance.updatePayment(id, paymentData);
      return response.data;
    },
    deletePayment: async (id: string) => {
      const response = await api.finance.deletePayment(id);
      return response.data;
    },
  },

  /**
   * API Treasury (remplacée par HTTP)
   */
  treasury: {
    getTreasuryAccounts: async (schoolId: string) => {
      try {
        const response = await apiClient.get(`/treasury/accounts?schoolId=${schoolId}`);
        return response.data || [];
      } catch (error) {
        console.warn('Treasury API not available, returning empty array');
        return [];
      }
    },
    createTreasuryAccount: async (accountData: any) => {
      const response = await apiClient.post('/treasury/accounts', accountData);
      return response.data;
    },
    updateTreasuryAccount: async (accountId: string, accountData: any) => {
      const response = await apiClient.patch(`/treasury/accounts/${accountId}`, accountData);
      return response.data;
    },
    deleteTreasuryAccount: async (accountId: string) => {
      const response = await apiClient.delete(`/treasury/accounts/${accountId}`);
      return response.data;
    },
    getTreasuryOperations: async (schoolId: string, filters?: any) => {
      try {
        const response = await apiClient.get(`/treasury/operations?schoolId=${schoolId}`, { params: filters });
        return response.data || [];
      } catch (error) {
        console.warn('Treasury operations API not available, returning empty array');
        return [];
      }
    },
    createTreasuryOperation: async (operationData: any) => {
      const response = await apiClient.post('/treasury/operations', operationData);
      return response.data;
    },
    updateTreasuryOperation: async (operationId: string, operationData: any) => {
      const response = await apiClient.patch(`/treasury/operations/${operationId}`, operationData);
      return response.data;
    },
    deleteTreasuryOperation: async (operationId: string) => {
      const response = await apiClient.delete(`/treasury/operations/${operationId}`);
      return response.data;
    },
    // Autres méthodes treasury avec fallback HTTP
    getTreasuryHeritage: async (schoolId: string) => {
      try {
        const response = await apiClient.get(`/treasury/heritage?schoolId=${schoolId}`);
        return response.data || [];
      } catch {
        return [];
      }
    },
    createTreasuryHeritage: async (heritageData: any) => {
      const response = await apiClient.post('/treasury/heritage', heritageData);
      return response.data;
    },
    updateTreasuryHeritage: async (heritageId: string, heritageData: any) => {
      const response = await apiClient.patch(`/treasury/heritage/${heritageId}`, heritageData);
      return response.data;
    },
    deleteTreasuryHeritage: async (heritageId: string) => {
      const response = await apiClient.delete(`/treasury/heritage/${heritageId}`);
      return response.data;
    },
    getTreasuryForecasts: async (schoolId: string, filters?: any) => {
      try {
        const response = await apiClient.get(`/treasury/forecasts?schoolId=${schoolId}`, { params: filters });
        return response.data || [];
      } catch {
        return [];
      }
    },
    createTreasuryForecast: async (forecastData: any) => {
      const response = await apiClient.post('/treasury/forecasts', forecastData);
      return response.data;
    },
    updateTreasuryForecast: async (forecastId: string, forecastData: any) => {
      const response = await apiClient.patch(`/treasury/forecasts/${forecastId}`, forecastData);
      return response.data;
    },
    deleteTreasuryForecast: async (forecastId: string) => {
      const response = await apiClient.delete(`/treasury/forecasts/${forecastId}`);
      return response.data;
    },
    getTreasuryReports: async (schoolId: string, filters?: any) => {
      try {
        const response = await apiClient.get(`/treasury/reports?schoolId=${schoolId}`, { params: filters });
        return response.data || [];
      } catch {
        return [];
      }
    },
    createTreasuryReport: async (reportData: any) => {
      const response = await apiClient.post('/treasury/reports', reportData);
      return response.data;
    },
    getTreasuryStats: async (schoolId: string, period?: string) => {
      try {
        const response = await apiClient.get(`/treasury/stats?schoolId=${schoolId}`, { params: { period } });
        return response.data || {};
      } catch {
        return {};
      }
    },
    getWorkingCapital: async (schoolId: string) => {
      try {
        const response = await apiClient.get(`/treasury/working-capital?schoolId=${schoolId}`);
        return response.data || 0;
      } catch {
        return 0;
      }
    },
    syncRevenuesWithTreasury: async (schoolId: string, revenueId: string, accountId: string) => {
      const response = await apiClient.post(`/treasury/sync/revenues`, { schoolId, revenueId, accountId });
      return response.data;
    },
    syncExpensesWithTreasury: async (schoolId: string, expenseId: string, accountId: string) => {
      const response = await apiClient.post(`/treasury/sync/expenses`, { schoolId, expenseId, accountId });
      return response.data;
    },
    transferBetweenAccounts: async (transferData: any) => {
      const response = await apiClient.post('/treasury/transfers', transferData);
      return response.data;
    },
    createAdvance: async (advanceData: any) => {
      const response = await apiClient.post('/treasury/advances', advanceData);
      return response.data;
    },
    adjustAccountBalance: async (adjustmentData: any) => {
      const response = await apiClient.post('/treasury/adjustments', adjustmentData);
      return response.data;
    },
  },
};

/**
 * Expose electronAPI sur window pour compatibilité (uniquement côté client)
 * 
 * ⚠️ En Next.js, on est toujours sur Web, donc cette API utilise toujours HTTP
 * 
 * Cette initialisation se fait automatiquement via le script dans layout.tsx
 */
if (typeof window !== 'undefined') {
  (window as any).electronAPI = electronAPI;
  
  // Déclarer le type global pour TypeScript
  declare global {
    interface Window {
      electronAPI: typeof electronAPI;
    }
  }
}

export default electronAPI;

