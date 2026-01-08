import dataService from '../dataService';

export interface ClassTransfer {
  id: string;
  studentId: string;
  studentName?: string;
  fromClassId: string;
  fromClassName?: string;
  toClassId: string;
  toClassName?: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransferData {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  reason: string;
  date: string;
  notes?: string;
}

export interface UpdateTransferData extends Partial<CreateTransferData> {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
}

export interface TransferFilters {
  studentId?: string;
  fromClassId?: string;
  toClassId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const transfersService = {
  // Récupérer tous les transferts
  async getTransfers(filters?: TransferFilters) {
    try {
      // Méthode temporaire - retourne un tableau vide
      const transfers: ClassTransfer[] = [];
      return {
        data: transfers,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer un transfert par ID
  async getTransferById(id: string) {
    try {
      const transfer = await dataService.getClassTransferById(id);
      if (!transfer) {
        return {
          data: null,
          success: false,
          error: 'Transfert non trouvé'
        };
      }
      return {
        data: transfer,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Créer un nouveau transfert
  async createTransfer(data: CreateTransferData) {
    try {
      const transfer = await dataService.createClassTransfer(data);
      return {
        data: transfer,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création du transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Mettre à jour un transfert
  async updateTransfer(id: string, data: UpdateTransferData) {
    try {
      const transfer = await dataService.updateClassTransfer(id, data);
      return {
        data: transfer,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer un transfert
  async deleteTransfer(id: string) {
    try {
      const success = await dataService.deleteClassTransfer(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du transfert:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les transferts d'un étudiant
  async getTransfersByStudent(studentId: string) {
    try {
      const transfers = await dataService.getClassTransfersByStudent(studentId);
      return {
        data: transfers,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts de l\'étudiant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les transferts d'une classe
  async getTransfersByClass(classId: string) {
    try {
      const transfers = await dataService.getClassTransfersByClass(classId);
      return {
        data: transfers,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts de la classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Approuver un transfert
  async approveTransfer(id: string, approvedBy: string) {
    try {
      const transfer = await dataService.updateClassTransfer(id, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date().toISOString()
      });
      return {
        data: transfer,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'approbation du transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Rejeter un transfert
  async rejectTransfer(id: string, approvedBy: string, notes?: string) {
    try {
      const transfer = await dataService.updateClassTransfer(id, {
        status: 'rejected',
        approvedBy,
        approvedAt: new Date().toISOString(),
        notes
      });
      return {
        data: transfer,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du rejet du transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Finaliser un transfert (changer la classe de l'étudiant)
  async completeTransfer(id: string) {
    try {
      const transfer = await dataService.updateClassTransfer(id, {
        status: 'completed'
      });
      return {
        data: transfer,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la finalisation du transfert:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les statistiques de transferts
  async getTransferStats(schoolId: string) {
    try {
      const stats = await dataService.getClassTransferStats(schoolId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de transferts:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
