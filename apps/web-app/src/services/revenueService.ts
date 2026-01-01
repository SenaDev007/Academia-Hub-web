// Service dédié pour la gestion des recettes
// Gère les recettes manuelles ET la synchronisation des frais de scolarité

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
  schoolId: string;
  isManualRevenue: boolean;
  sourceType: 'manual' | 'tuition_fee' | 'inscription_fee' | 'reinscription_fee';
  originalPaymentId?: string; // ID du paiement original pour les frais de scolarité
  createdAt?: string;
  updatedAt?: string;
}

export interface RevenueCreateData {
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  academicYearId: string;
  amount: number;
  type: string;
  description?: string;
  paymentMethod?: string;
  method: 'mobile_money' | 'card' | 'cash';
  reference?: string;
  receiptNumber?: string;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  time?: string;
  schoolId: string;
  isManualRevenue: boolean;
  sourceType: 'manual' | 'tuition_fee' | 'inscription_fee' | 'reinscription_fee';
  originalPaymentId?: string;
}

export interface RevenueStats {
  total: number;
  completed: number;
  pending: number;
  count: number;
  completedCount: number;
  pendingCount: number;
  monthly: number;
  byType: { [key: string]: number };
  bySource: { [key: string]: number };
}

class RevenueService {
  private async invokeIpc(method: string, ...args: any[]): Promise<any> {
    try {
      console.log(`🔍 RevenueService.invokeIpc appelé avec method: ${method}, args:`, args);
      
      // Vérifier si on est dans un environnement Electron
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        console.log('✅ API finance disponible, appel IPC...');
        const response = await api.finance[method](...args);
        console.log('📊 Réponse reçue:', response);
        if (response.success) {
          return response.data;
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
    // Utiliser localStorage pour persister les données en mode développement
    const storageKey = 'academia-hub-revenues';
    
    switch (method) {
      case 'getRevenues':
        try {
          const stored = localStorage.getItem(storageKey);
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      
      case 'createRevenue':
        try {
          const stored = localStorage.getItem(storageKey);
          const revenues = stored ? JSON.parse(stored) : [];
          const newRevenue = {
            id: 'revenue-' + Date.now(),
            ...args[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          revenues.push(newRevenue);
          localStorage.setItem(storageKey, JSON.stringify(revenues));
          return newRevenue;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde en localStorage:', error);
          return null;
        }
      
      case 'updateRevenue':
        try {
          const stored = localStorage.getItem(storageKey);
          const revenues = stored ? JSON.parse(stored) : [];
          const index = revenues.findIndex((r: any) => r.id === args[0]);
          if (index !== -1) {
            revenues[index] = { ...revenues[index], ...args[1], updatedAt: new Date().toISOString() };
            localStorage.setItem(storageKey, JSON.stringify(revenues));
          }
          return { success: true };
        } catch (error) {
          console.error('Erreur lors de la mise à jour en localStorage:', error);
          return { success: false };
        }
      
      case 'deleteRevenue':
        try {
          const stored = localStorage.getItem(storageKey);
          const revenues = stored ? JSON.parse(stored) : [];
          const filtered = revenues.filter((r: any) => r.id !== args[0]);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
          return { success: true };
        } catch (error) {
          console.error('Erreur lors de la suppression en localStorage:', error);
          return { success: false };
        }
      
      case 'getRevenueStats':
        try {
          const stored = localStorage.getItem(storageKey);
          const revenues = stored ? JSON.parse(stored) : [];
          
          const total = revenues.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
          const completed = revenues.filter((r: any) => r.status === 'completed').reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
          const pending = revenues.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
          const count = revenues.length;
          const completedCount = revenues.filter((r: any) => r.status === 'completed').length;
          const pendingCount = revenues.filter((r: any) => r.status === 'pending').length;
          
          // Calculer le montant mensuel
          const thisMonth = new Date().toISOString().substring(0, 7);
          const monthly = revenues
            .filter((r: any) => r.date?.startsWith(thisMonth))
            .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
          
          // Statistiques par type
          const byType: { [key: string]: number } = {};
          revenues.forEach((r: any) => {
            byType[r.type] = (byType[r.type] || 0) + (r.amount || 0);
          });
          
          // Statistiques par source
          const bySource: { [key: string]: number } = {};
          revenues.forEach((r: any) => {
            bySource[r.sourceType] = (bySource[r.sourceType] || 0) + (r.amount || 0);
          });
          
          return {
            total,
            completed,
            pending,
            count,
            completedCount,
            pendingCount,
            monthly,
            byType,
            bySource
          };
        } catch (error) {
          console.error('Erreur lors du calcul des statistiques:', error);
          return {
            total: 0,
            completed: 0,
            pending: 0,
            count: 0,
            completedCount: 0,
            pendingCount: 0,
            monthly: 0,
            byType: {},
            bySource: {}
          };
        }
      
      case 'syncTuitionPayments':
        return { success: true, synced: 0 };
      
      default:
        return null;
    }
  }

  // ==================== GESTION DES RECETTES ====================

  async getRevenues(schoolId: string, filters?: any): Promise<Revenue[]> {
    return this.invokeIpc('getRevenues', schoolId, filters);
  }

  async getRevenueById(id: string, schoolId: string): Promise<Revenue | null> {
    return this.invokeIpc('getRevenueById', id, schoolId);
  }

  async createRevenue(data: RevenueCreateData): Promise<Revenue> {
    console.log('🔍 RevenueService.createRevenue appelé avec:', data);
    return this.invokeIpc('createRevenue', data);
  }

  async updateRevenue(id: string, data: Partial<Revenue>): Promise<Revenue> {
    return this.invokeIpc('updateRevenue', id, data);
  }

  async deleteRevenue(id: string): Promise<void> {
    return this.invokeIpc('deleteRevenue', id);
  }

  async getRevenueStats(schoolId: string, filters?: any): Promise<RevenueStats> {
    return this.invokeIpc('getRevenueStats', schoolId, filters);
  }

  // ==================== SYNCHRONISATION DES FRAIS DE SCOLARITÉ ====================

  /**
   * Synchronise les frais de scolarité encaissés vers la table des recettes
   * Cette fonction doit être appelée après chaque encaissement de frais de scolarité
   */
  async syncTuitionPayments(schoolId: string, academicYearId?: string): Promise<{ success: boolean; synced: number; errors: string[] }> {
    try {
      console.log('🔄 Synchronisation des frais de scolarité vers les recettes...');
      
      // Récupérer tous les paiements de frais de scolarité (non manuels)
      const payments = await this.invokeIpc('getTuitionPayments', schoolId, { academicYearId });
      
      if (!payments || payments.length === 0) {
        console.log('Aucun paiement de frais de scolarité à synchroniser');
        return { success: true, synced: 0, errors: [] };
      }

      let syncedCount = 0;
      const errors: string[] = [];

      for (const payment of payments) {
        try {
          // Vérifier si cette recette existe déjà
          const existingRevenue = await this.invokeIpc('getRevenueByOriginalPaymentId', payment.id);
          
          if (existingRevenue) {
            console.log(`Recette déjà synchronisée pour le paiement ${payment.id}`);
            continue;
          }

          // Créer les recettes pour chaque type de frais
          const revenuesToCreate = [];

          // Frais d'inscription
          if (payment.inscriptionFee && payment.inscriptionFee > 0) {
            revenuesToCreate.push({
              studentId: payment.studentId,
              studentName: payment.studentName,
              classId: payment.classId,
              className: payment.className,
              academicYearId: payment.academicYearId,
              amount: payment.inscriptionFee,
              type: 'inscription',
              description: `Frais d'inscription - ${payment.studentName}`,
              paymentMethod: payment.paymentMethod,
              method: payment.method,
              reference: payment.reference,
              receiptNumber: payment.receiptNumber,
              status: payment.status,
              date: payment.date,
              time: payment.time,
              schoolId: payment.schoolId,
              isManualRevenue: false,
              sourceType: 'inscription_fee' as const,
              originalPaymentId: payment.id
            });
          }

          // Frais de réinscription
          if (payment.reinscriptionFee && payment.reinscriptionFee > 0) {
            revenuesToCreate.push({
              studentId: payment.studentId,
              studentName: payment.studentName,
              classId: payment.classId,
              className: payment.className,
              academicYearId: payment.academicYearId,
              amount: payment.reinscriptionFee,
              type: 'reinscription',
              description: `Frais de réinscription - ${payment.studentName}`,
              paymentMethod: payment.paymentMethod,
              method: payment.method,
              reference: payment.reference,
              receiptNumber: payment.receiptNumber,
              status: payment.status,
              date: payment.date,
              time: payment.time,
              schoolId: payment.schoolId,
              isManualRevenue: false,
              sourceType: 'reinscription_fee' as const,
              originalPaymentId: payment.id
            });
          }

          // Frais de scolarité
          if (payment.tuitionFee && payment.tuitionFee > 0) {
            revenuesToCreate.push({
              studentId: payment.studentId,
              studentName: payment.studentName,
              classId: payment.classId,
              className: payment.className,
              academicYearId: payment.academicYearId,
              amount: payment.tuitionFee,
              type: 'tuition',
              description: `Frais de scolarité - ${payment.studentName}`,
              paymentMethod: payment.paymentMethod,
              method: payment.method,
              reference: payment.reference,
              receiptNumber: payment.receiptNumber,
              status: payment.status,
              date: payment.date,
              time: payment.time,
              schoolId: payment.schoolId,
              isManualRevenue: false,
              sourceType: 'tuition_fee' as const,
              originalPaymentId: payment.id
            });
          }

          // Créer toutes les recettes
          for (const revenueData of revenuesToCreate) {
            await this.createRevenue(revenueData);
            syncedCount++;
          }

        } catch (error) {
          console.error(`Erreur lors de la synchronisation du paiement ${payment.id}:`, error);
          errors.push(`Paiement ${payment.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      console.log(`✅ Synchronisation terminée: ${syncedCount} recettes créées`);
      return { success: true, synced: syncedCount, errors };
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des frais de scolarité:', error);
      return { success: false, synced: 0, errors: [error instanceof Error ? error.message : 'Erreur inconnue'] };
    }
  }

  /**
   * Synchronise un paiement spécifique vers les recettes
   */
  async syncSinglePayment(payment: any): Promise<{ success: boolean; synced: number; errors: string[] }> {
    try {
      console.log('🔄 Synchronisation d\'un paiement spécifique:', payment.id);
      
      const revenuesToCreate = [];
      const errors: string[] = [];

      // Frais d'inscription
      if (payment.inscriptionFee && payment.inscriptionFee > 0) {
        revenuesToCreate.push({
          studentId: payment.studentId,
          studentName: payment.studentName,
          classId: payment.classId,
          className: payment.className,
          academicYearId: payment.academicYearId,
          amount: payment.inscriptionFee,
          type: 'inscription',
          description: `Frais d'inscription - ${payment.studentName}`,
          paymentMethod: payment.paymentMethod,
          method: payment.method,
          reference: payment.reference,
          receiptNumber: payment.receiptNumber,
          status: payment.status,
          date: payment.date,
          time: payment.time,
          schoolId: payment.schoolId,
          isManualRevenue: false,
          sourceType: 'inscription_fee' as const,
          originalPaymentId: payment.id
        });
      }

      // Frais de réinscription
      if (payment.reinscriptionFee && payment.reinscriptionFee > 0) {
        revenuesToCreate.push({
          studentId: payment.studentId,
          studentName: payment.studentName,
          classId: payment.classId,
          className: payment.className,
          academicYearId: payment.academicYearId,
          amount: payment.reinscriptionFee,
          type: 'reinscription',
          description: `Frais de réinscription - ${payment.studentName}`,
          paymentMethod: payment.paymentMethod,
          method: payment.method,
          reference: payment.reference,
          receiptNumber: payment.receiptNumber,
          status: payment.status,
          date: payment.date,
          time: payment.time,
          schoolId: payment.schoolId,
          isManualRevenue: false,
          sourceType: 'reinscription_fee' as const,
          originalPaymentId: payment.id
        });
      }

      // Frais de scolarité
      if (payment.tuitionFee && payment.tuitionFee > 0) {
        revenuesToCreate.push({
          studentId: payment.studentId,
          studentName: payment.studentName,
          classId: payment.classId,
          className: payment.className,
          academicYearId: payment.academicYearId,
          amount: payment.tuitionFee,
          type: 'tuition',
          description: `Frais de scolarité - ${payment.studentName}`,
          paymentMethod: payment.paymentMethod,
          method: payment.method,
          reference: payment.reference,
          receiptNumber: payment.receiptNumber,
          status: payment.status,
          date: payment.date,
          time: payment.time,
          schoolId: payment.schoolId,
          isManualRevenue: false,
          sourceType: 'tuition_fee' as const,
          originalPaymentId: payment.id
        });
      }

      let syncedCount = 0;
      for (const revenueData of revenuesToCreate) {
        try {
          await this.createRevenue(revenueData);
          syncedCount++;
        } catch (error) {
          console.error(`Erreur lors de la création de la recette:`, error);
          errors.push(`Recette ${revenueData.type}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      return { success: true, synced: syncedCount, errors };
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation du paiement:', error);
      return { success: false, synced: 0, errors: [error instanceof Error ? error.message : 'Erreur inconnue'] };
    }
  }

  /**
   * Supprime les recettes liées à un paiement (lors de la suppression d'un paiement)
   */
  async deleteRevenuesByPaymentId(paymentId: string): Promise<{ success: boolean; deleted: number }> {
    try {
      console.log('🗑️ Suppression des recettes liées au paiement:', paymentId);
      
      const deletedCount = await this.invokeIpc('deleteRevenuesByPaymentId', paymentId);
      
      console.log(`✅ ${deletedCount} recettes supprimées`);
      return { success: true, deleted: deletedCount };
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des recettes:', error);
      return { success: false, deleted: 0 };
    }
  }
}

export const revenueService = new RevenueService();
