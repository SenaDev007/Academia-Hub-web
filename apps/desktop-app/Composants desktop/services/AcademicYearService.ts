/**
 * Service centralisé pour la gestion des années scolaires
 * Gère automatiquement les années scolaires de septembre à juillet
 * Intégré avec la base de données pour la persistance
 */

import dataService from './dataService';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearOption {
  value: string;
  label: string;
  isCurrent?: boolean;
}

export class AcademicYearService {
  private static instance: AcademicYearService;
  private academicYears: AcademicYear[] = [];
  private currentAcademicYear: AcademicYear | null = null;
  private loading = false;
  private initialized = false;

  private constructor() {
    // Initialisation asynchrone en arrière-plan
    this.initializeAcademicYears().catch(error => {
      console.error('Erreur lors de l\'initialisation des années académiques:', error);
    });
  }

  public static getInstance(): AcademicYearService {
    if (!AcademicYearService.instance) {
      AcademicYearService.instance = new AcademicYearService();
    }
    return AcademicYearService.instance;
  }

  /**
   * Initialise les années scolaires depuis la base de données
   */
  private async initializeAcademicYears(): Promise<void> {
    this.loading = true;
    try {
      // Récupérer l'ID de l'école existante
      const schoolId = await this.getExistingSchoolId();
      
      if (!schoolId) {
        console.warn('⚠️ Aucune école trouvée - impossible de charger les années académiques');
        this.loading = false;
        return;
      }

      // Charger depuis la base de données
      const dbYears = await dataService.getAcademicYears(schoolId);
      
      if (dbYears.length > 0) {
        this.academicYears = dbYears;
        this.currentAcademicYear = dbYears.find(year => year.isActive) || null;
        console.log(`✅ ${dbYears.length} années académiques chargées depuis la base de données`);
      } else {
        console.log('📅 Aucune année académique trouvée - création des années par défaut');
        await this.createDefaultAcademicYears(schoolId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années scolaires:', error);
      // Fallback vers les années par défaut
      try {
        const schoolId = await this.getExistingSchoolId();
        if (schoolId) {
          await this.createDefaultAcademicYears(schoolId);
        }
      } catch (fallbackError) {
        console.error('Erreur lors de la création des années par défaut:', fallbackError);
      }
    } finally {
      this.loading = false;
      this.initialized = true;
    }
  }

  /**
   * Vérifie si le service est initialisé
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Récupère l'ID de l'école existante
   */
  private async getExistingSchoolId(): Promise<string | null> {
    try {
      // Utiliser dataService pour récupérer l'école existante
      const schools = await dataService.getSchools();
      if (schools && schools.length > 0) {
        console.log('✅ École trouvée:', schools[0].id);
        return schools[0].id;
      }
      console.warn('⚠️ Aucune école trouvée dans la base de données');
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'école existante:', error);
      return null;
    }
  }

  /**
   * Crée les années scolaires par défaut
   */
  private async createDefaultAcademicYears(schoolId: string): Promise<void> {
    console.log('🔄 Création des années académiques par défaut...');
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // Détermine l'année scolaire actuelle
    // Année scolaire : Septembre (mois 9) à Juin (mois 6) de l'année suivante
    let currentAcademicYearStart: number;
    if (currentMonth >= 9) {
      // Si nous sommes entre septembre et décembre, l'année scolaire a commencé cette année
      currentAcademicYearStart = currentYear;
    } else {
      // Si nous sommes entre janvier et août, l'année scolaire a commencé l'année précédente
      currentAcademicYearStart = currentYear - 1;
    }

    console.log(`📅 Année académique actuelle calculée: ${currentAcademicYearStart}-${currentAcademicYearStart + 1}`);

    // Crée les années scolaires (5 ans en arrière, 2 ans en avant)
    const yearsToCreate = [];
    for (let i = -5; i <= 2; i++) {
      const startYear = currentAcademicYearStart + i;
      const endYear = startYear + 1;
      const isCurrent = i === 0;
      
      const yearData = {
        name: `${startYear}-${endYear}`,
        startDate: new Date(startYear, 8, 1).toISOString().split('T')[0], // 1er septembre
        endDate: new Date(endYear, 5, 30).toISOString().split('T')[0], // 30 juin
        isActive: isCurrent, // Seule l'année actuelle est active
        schoolId: schoolId
      };

      yearsToCreate.push(yearData);
    }

    console.log(`📊 ${yearsToCreate.length} années académiques à créer`);

    // Créer les années en base de données
    for (const yearData of yearsToCreate) {
      try {
        console.log(`💾 Création de l'année académique: ${yearData.name}`);
        const yearId = await dataService.createAcademicYear(yearData);
        
        if (yearId && yearId !== 'local-generated-id') {
          const academicYear: AcademicYear = {
            id: yearId,
            name: yearData.name,
            startDate: yearData.startDate,
            endDate: yearData.endDate,
            isActive: yearData.isActive,
            schoolId: yearData.schoolId
          };
      this.academicYears.push(academicYear);
          console.log(`✅ Année académique créée avec ID: ${yearId}`);
        } else {
          console.warn(`⚠️ Échec de la création de l'année académique: ${yearData.name}`);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la création de l\'année scolaire:', yearData.name, error);
      }
    }

    // Trie par année de début (plus récente en premier)
    this.academicYears.sort((a, b) => {
      const aStartYear = parseInt(a.name.split('-')[0]);
      const bStartYear = parseInt(b.name.split('-')[0]);
      return bStartYear - aStartYear;
    });

    this.currentAcademicYear = this.academicYears.find(year => year.isActive) || null;
    
    console.log(`✅ ${this.academicYears.length} années académiques créées`);
    console.log(`🎯 Année académique actuelle: ${this.currentAcademicYear?.name || 'Aucune'}`);
  }

  /**
   * Retourne toutes les années scolaires
   */
  public getAllAcademicYears(): AcademicYear[] {
    return [...this.academicYears];
  }

  /**
   * Retourne l'année scolaire actuelle
   */
  public getCurrentAcademicYear(): AcademicYear | null {
    return this.currentAcademicYear;
  }

  /**
   * Retourne l'année scolaire par ID
   */
  public getAcademicYearById(id: string): AcademicYear | null {
    return this.academicYears.find(year => year.id === id) || null;
  }

  /**
   * Retourne les années scolaires actives (actuelle + suivante)
   */
  public getActiveAcademicYears(): AcademicYear[] {
    return this.academicYears.filter(year => year.isActive);
  }

  /**
   * Retourne les années scolaires passées
   */
  public getPastAcademicYears(): AcademicYear[] {
    const currentYear = this.getCurrentAcademicYear();
    if (!currentYear) return [];
    
    const currentStartYear = parseInt(currentYear.name.split('-')[0]);
    return this.academicYears.filter(year => {
      const yearStartYear = parseInt(year.name.split('-')[0]);
      return !year.isActive && yearStartYear < currentStartYear;
    });
  }

  /**
   * Retourne les années scolaires futures
   */
  public getFutureAcademicYears(): AcademicYear[] {
    const currentYear = this.getCurrentAcademicYear();
    if (!currentYear) return [];
    
    const currentStartYear = parseInt(currentYear.name.split('-')[0]);
    return this.academicYears.filter(year => {
      const yearStartYear = parseInt(year.name.split('-')[0]);
      return !year.isActive && yearStartYear > currentStartYear;
    });
  }

  /**
   * Vérifie si une date est dans une année scolaire donnée
   */
  public isDateInAcademicYear(date: Date, academicYearId: string): boolean {
    const academicYear = this.getAcademicYearById(academicYearId);
    if (!academicYear) return false;

    const dateStr = date.toISOString().split('T')[0];
    return dateStr >= academicYear.startDate && dateStr <= academicYear.endDate;
  }

  /**
   * Retourne l'année scolaire pour une date donnée
   */
  public getAcademicYearForDate(date: Date): AcademicYear | null {
    const dateStr = date.toISOString().split('T')[0];
    return this.academicYears.find(year => 
      dateStr >= year.startDate && dateStr <= year.endDate
    ) || null;
  }

  /**
   * Met à jour les années scolaires (utile pour les changements d'année)
   */
  public async refreshAcademicYears(): Promise<void> {
    await this.initializeAcademicYears();
  }

  /**
   * Retourne les options pour les sélecteurs d'année scolaire
   */
  public getAcademicYearOptions(): AcademicYearOption[] {
    return this.academicYears.map(year => ({
      value: year.id,
      label: year.name,
      isCurrent: year.isActive
    }));
  }

  /**
   * Retourne l'ID de l'année scolaire actuelle
   */
  public getCurrentAcademicYearId(): string {
    const current = this.getCurrentAcademicYear();
    return current ? current.id : '';
  }

  /**
   * Retourne le label de l'année scolaire actuelle
   */
  public getCurrentAcademicYearLabel(): string {
    const current = this.getCurrentAcademicYear();
    return current ? current.name : '';
  }

  /**
   * Crée une nouvelle année scolaire
   */
  public async createAcademicYear(yearData: Omit<AcademicYear, 'id'>): Promise<string> {
    try {
      const yearId = await dataService.createAcademicYear(yearData);
      const newYear: AcademicYear = {
        id: yearId,
        ...yearData
      };
      this.academicYears.push(newYear);
      this.academicYears.sort((a, b) => {
        const aStartYear = parseInt(a.name.split('-')[0]);
        const bStartYear = parseInt(b.name.split('-')[0]);
        return bStartYear - aStartYear;
      });
      return yearId;
    } catch (error) {
      console.error('Erreur lors de la création de l\'année scolaire:', error);
      throw error;
    }
  }

  /**
   * Met à jour une année scolaire
   */
  public async updateAcademicYear(id: string, yearData: Partial<AcademicYear>): Promise<void> {
    try {
      await dataService.updateAcademicYear(id, yearData);
      const index = this.academicYears.findIndex(year => year.id === id);
      if (index !== -1) {
        this.academicYears[index] = { ...this.academicYears[index], ...yearData };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'année scolaire:', error);
      throw error;
    }
  }

  /**
   * Définit l'année scolaire active
   */
  public async setActiveAcademicYear(yearId: string): Promise<void> {
    try {
      await dataService.setActiveAcademicYear(yearId, 'default-school-id');
      
      // Mettre à jour l'état local
      this.academicYears.forEach(year => {
        year.isActive = year.id === yearId;
      });
      
      this.currentAcademicYear = this.academicYears.find(year => year.id === yearId) || null;
    } catch (error) {
      console.error('Erreur lors de la définition de l\'année scolaire active:', error);
      throw error;
    }
  }

  /**
   * Retourne l'état de chargement
   */
  public isLoading(): boolean {
    return this.loading;
  }

  /**
   * Force la réinitialisation des années académiques
   * Utile pour corriger les problèmes de synchronisation
   */
  public async forceReset(): Promise<void> {
    console.log('🔄 Réinitialisation forcée des années académiques...');
    this.academicYears = [];
    this.currentAcademicYear = null;
    await this.initializeAcademicYears();
  }
}

// Export de l'instance singleton
export const academicYearService = AcademicYearService.getInstance();
