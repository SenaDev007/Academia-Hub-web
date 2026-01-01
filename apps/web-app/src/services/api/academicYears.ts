import { dataService } from '../dataService';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'active' | 'completed' | 'upcoming';
  terms: Term[];
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  sequence: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface CreateAcademicYearData {
  name: string;
  startDate: string;
  endDate: string;
  terms: Array<{
    name: string;
    startDate: string;
    endDate: string;
    sequence: number;
  }>;
}

export const academicYearsService = {
  async getAcademicYears() {
    try {
      const academicYears = await dataService.getAllAcademicYears();
      return {
        data: academicYears,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des années académiques:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getAcademicYear(id: string) {
    try {
      const academicYear = await dataService.getAcademicYearById(id);
      if (!academicYear) {
        return {
          data: null,
          success: false,
          error: 'Année académique non trouvée'
        };
      }
      return {
        data: academicYear,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'année académique:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createAcademicYear(data: CreateAcademicYearData) {
    try {
      const academicYear = await dataService.createAcademicYear(data);
      
      // Créer les termes associés
      const terms = [];
      for (const termData of data.terms) {
        const term = await dataService.createTerm({
          ...termData,
          academicYearId: academicYear.id,
          isCurrent: false
        });
        terms.push(term);
      }

      const fullAcademicYear = {
        ...academicYear,
        terms
      };

      return {
        data: fullAcademicYear,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'année académique:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateAcademicYear(id: string, data: Partial<CreateAcademicYearData>) {
    try {
      const academicYear = await dataService.updateAcademicYear(id, data);
      
      // Si les termes sont fournis, les mettre à jour
      if (data.terms && data.terms.length > 0) {
        const existingTerms = await dataService.getTermsByAcademicYear(id);
        
        // Supprimer les termes existants et créer les nouveaux
        for (const term of existingTerms) {
          await dataService.deleteTerm(term.id);
        }
        
        const newTerms = [];
        for (const termData of data.terms) {
          const term = await dataService.createTerm({
            ...termData,
            academicYearId: id,
            isCurrent: false
          });
          newTerms.push(term);
        }
        
        const fullAcademicYear = {
          ...academicYear,
          terms: newTerms
        };

        return {
          data: fullAcademicYear,
          success: true
        };
      }

      return {
        data: academicYear,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'année académique:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteAcademicYear(id: string) {
    try {
      // D'abord supprimer tous les termes associés
      const terms = await dataService.getTermsByAcademicYear(id);
      for (const term of terms) {
        await dataService.deleteTerm(term.id);
      }
      
      // Puis supprimer l'année académique
      const success = await dataService.deleteAcademicYear(id);
      
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'année académique:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async setCurrentAcademicYear(id: string) {
    try {
      // Désactiver l'année académique actuelle
      const currentYears = await dataService.getAllAcademicYears({ isCurrent: true });
      for (const year of currentYears) {
        await dataService.updateAcademicYear(year.id, { isCurrent: false });
      }
      
      // Activer la nouvelle année académique
      const academicYear = await dataService.updateAcademicYear(id, { isCurrent: true });
      
      return {
        data: academicYear,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la définition de l\'année académique courante:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getCurrentAcademicYear() {
    try {
      const academicYears = await dataService.getAllAcademicYears({ isCurrent: true });
      const currentYear = academicYears[0];
      
      if (!currentYear) {
        return {
          data: null,
          success: false,
          error: 'Aucune année académique courante définie'
        };
      }

      // Récupérer les termes associés
      const terms = await dataService.getTermsByAcademicYear(currentYear.id);
      const fullAcademicYear = {
        ...currentYear,
        terms
      };

      return {
        data: fullAcademicYear,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'année académique courante:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getTerms(academicYearId: string) {
    try {
      const terms = await dataService.getTermsByAcademicYear(academicYearId);
      return {
        data: terms,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des termes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async setCurrentTerm(termId: string) {
    try {
      // Désactiver le terme actuel
      const currentTerms = await dataService.getAllTerms({ isCurrent: true });
      for (const term of currentTerms) {
        await dataService.updateTerm(term.id, { isCurrent: false });
      }
      
      // Activer le nouveau terme
      const term = await dataService.updateTerm(termId, { isCurrent: true });
      
      return {
        data: term,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la définition du terme courant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
