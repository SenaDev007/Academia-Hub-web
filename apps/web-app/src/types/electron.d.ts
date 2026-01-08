/**
 * Types pour l'API Electron (Wrapper Web)
 * 
 * ⚠️ En Next.js, cette API utilise toujours HTTP (pas d'Electron réel)
 */

export interface ElectronAPI {
  isAvailable(): boolean;
  finance: {
    getPayments: (filters?: any) => Promise<any[]>;
    createPayment: (paymentData: any) => Promise<any>;
    updatePayment: (id: string, paymentData: any) => Promise<any>;
    deletePayment: (id: string) => Promise<void>;
  };
  treasury: {
    getTreasuryAccounts: (schoolId: string) => Promise<any[]>;
    createTreasuryAccount: (accountData: any) => Promise<any>;
    updateTreasuryAccount: (accountId: string, accountData: any) => Promise<any>;
    deleteTreasuryAccount: (accountId: string) => Promise<void>;
    getTreasuryOperations: (schoolId: string, filters?: any) => Promise<any[]>;
    createTreasuryOperation: (operationData: any) => Promise<any>;
    updateTreasuryOperation: (operationId: string, operationData: any) => Promise<any>;
    deleteTreasuryOperation: (operationId: string) => Promise<void>;
    getTreasuryHeritage: (schoolId: string) => Promise<any[]>;
    createTreasuryHeritage: (heritageData: any) => Promise<any>;
    updateTreasuryHeritage: (heritageId: string, heritageData: any) => Promise<any>;
    deleteTreasuryHeritage: (heritageId: string) => Promise<void>;
    getTreasuryForecasts: (schoolId: string, filters?: any) => Promise<any[]>;
    createTreasuryForecast: (forecastData: any) => Promise<any>;
    updateTreasuryForecast: (forecastId: string, forecastData: any) => Promise<any>;
    deleteTreasuryForecast: (forecastId: string) => Promise<void>;
    getTreasuryReports: (schoolId: string, filters?: any) => Promise<any[]>;
    createTreasuryReport: (reportData: any) => Promise<any>;
    getTreasuryStats: (schoolId: string, period?: string) => Promise<any>;
    getWorkingCapital: (schoolId: string) => Promise<number>;
    syncRevenuesWithTreasury: (schoolId: string, revenueId: string, accountId: string) => Promise<any>;
    syncExpensesWithTreasury: (schoolId: string, expenseId: string, accountId: string) => Promise<any>;
    transferBetweenAccounts: (transferData: any) => Promise<any>;
    createAdvance: (advanceData: any) => Promise<any>;
    adjustAccountBalance: (adjustmentData: any) => Promise<any>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

