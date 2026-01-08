/**
 * Service centralisé pour la gestion des trimestres scolaires
 * Gère automatiquement les trimestres basés sur l'année scolaire active
 * Intégré avec la base de données pour la persistance
 */

import dataService, { getCurrentSchoolId } from './dataService';

export interface Quarter {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  quarterNumber: number;
  isActive: boolean;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuarterOption {
  value: string;
  label: string;
  isCurrent?: boolean;
  quarterNumber: number;
}

export class QuarterService {
  private static instance: QuarterService;
  private quarters: Quarter[] = [];
  private currentQuarter: Quarter | null = null;
  private loading = false;

  private constructor() {
    console.log('🏗️ QuarterService: Constructeur appelé');
    this.initializeQuarters();
  }

  public static getInstance(): QuarterService {
    console.log('🔍 QuarterService.getInstance() appelé');
    if (!QuarterService.instance) {
      console.log('🏗️ QuarterService: Création de la nouvelle instance');
      QuarterService.instance = new QuarterService();
    } else {
      console.log('♻️ QuarterService: Utilisation de l\'instance existante');
    }
    return QuarterService.instance;
  }

  /**
   * Initialise les trimestres depuis la base de données
   */
  private async initializeQuarters(): Promise<void> {
    console.log('🔄 QuarterService: Initialisation des trimestres...');
    this.loading = true;
    try {
      // Charger depuis la base de données
      const schoolId = getCurrentSchoolId();
      console.log('🏫 QuarterService: SchoolId utilisé:', schoolId);
      
      const dbQuarters = await dataService.getQuarters(schoolId);
      console.log('📊 QuarterService: Trimestres récupérés de la BDD:', dbQuarters.length);
      
      if (dbQuarters.length > 0) {
        this.quarters = dbQuarters;
        this.currentQuarter = dbQuarters.find(quarter => quarter.isActive) || null;
        console.log('✅ QuarterService: Trimestres chargés depuis la BDD');
      } else {
        console.log('⚠️ QuarterService: Aucun trimestre en base, création des trimestres par défaut');
        // Si aucun trimestre en base, créer les trimestres par défaut
        await this.createDefaultQuarters();
      }
    } catch (error) {
      console.error('❌ QuarterService: Erreur lors du chargement des trimestres:', error);
      // En mode développement, créer des trimestres simulés
      this.createSimulatedQuarters();
    } finally {
      this.loading = false;
      console.log('🏁 QuarterService: Initialisation terminée');
    }
  }

  /**
   * Crée les trimestres par défaut pour toutes les années scolaires existantes
   */
  private async createDefaultQuarters(): Promise<void> {
    console.log('🔄 Création automatique des trimestres pour toutes les années scolaires...');
    
    try {
      // Récupérer toutes les années scolaires existantes
      const academicYears = await dataService.getAllAcademicYears();
      
      if (academicYears.length === 0) {
        console.log('⚠️ Aucune année scolaire trouvée, création des trimestres pour l\'année actuelle uniquement');
        await this.createQuartersForCurrentYear();
        return;
      }
      
      console.log(`📊 ${academicYears.length} années scolaires trouvées, création des trimestres...`);
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      
      // Créer les trimestres pour chaque année scolaire
      for (const academicYear of academicYears) {
        console.log(`📅 Création des trimestres pour l'année: ${academicYear.name}`);
        
        // Extraire les années de l'ID ou du nom
        const yearMatch = academicYear.id.match(/academic-year-(\d{4})-(\d{4})/) || 
                        academicYear.name.match(/(\d{4})-(\d{4})/);
        
        if (yearMatch) {
          const startYear = parseInt(yearMatch[1]);
          const endYear = parseInt(yearMatch[2]);
          
          await this.createQuartersForAcademicYear(academicYear.id, startYear, endYear, currentMonth);
        } else {
          console.warn(`⚠️ Impossible de parser l'année scolaire: ${academicYear.name}`);
        }
      }
      
      // Recharger les trimestres depuis la base de données
      const dbQuarters = await dataService.getQuarters(getCurrentSchoolId());
      this.quarters = dbQuarters;
      this.currentQuarter = dbQuarters.find(quarter => quarter.isActive) || null;
      
      console.log(`✅ ${this.quarters.length} trimestres créés au total`);
      console.log('📊 Trimestres récupérés:', this.quarters.map(q => ({ id: q.id, name: q.name, academicYearId: q.academicYearId, isActive: q.isActive })));
      
    } catch (error) {
      console.error('❌ Erreur lors de la création des trimestres:', error);
      // Fallback: créer seulement pour l'année actuelle
      await this.createQuartersForCurrentYear();
    }
  }

  /**
   * Crée les trimestres pour l'année scolaire actuelle uniquement (fallback)
   */
  private async createQuartersForCurrentYear(): Promise<void> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // Détermine l'année scolaire actuelle
    let academicYearStart: number;
    if (currentMonth >= 9) {
      academicYearStart = currentYear;
    } else {
      academicYearStart = currentYear - 1;
    }

    const academicYearEnd = academicYearStart + 1;
    const academicYearId = `academic-year-${academicYearStart}-${academicYearEnd}`;

    await this.createQuartersForAcademicYear(academicYearId, academicYearStart, academicYearEnd, currentMonth);
    
    // Recharger les trimestres après création
    try {
      const dbQuarters = await dataService.getQuarters(getCurrentSchoolId());
      this.quarters = dbQuarters;
      this.currentQuarter = dbQuarters.find(quarter => quarter.isActive) || null;
      console.log(`📊 Trimestres rechargés (fallback): ${this.quarters.length} trouvés`);
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des trimestres (fallback):', error);
    }
  }

  /**
   * Crée les trimestres pour une année scolaire spécifique
   */
  private async createQuartersForAcademicYear(academicYearId: string, startYear: number, endYear: number, currentMonth: number): Promise<void> {
    // Vérifier si les trimestres existent déjà pour cette année
    const existingQuarters = await dataService.getQuarters(getCurrentSchoolId());
    const quartersForThisYear = existingQuarters.filter(q => q.academicYearId === academicYearId);
    
    if (quartersForThisYear.length > 0) {
      console.log(`✅ Trimestres déjà existants pour ${academicYearId}`);
      return;
    }

    // Créer les trimestres pour cette année scolaire
    const quartersToCreate = [
      {
        name: '1er Trimestre',
        quarterNumber: 1,
        startDate: new Date(startYear, 8, 1).toISOString().split('T')[0], // 1er septembre
        endDate: new Date(startYear, 11, 31).toISOString().split('T')[0], // 31 décembre
        isActive: this.isCurrentQuarter(1, currentMonth) && this.isCurrentAcademicYear(startYear, currentMonth)
      },
      {
        name: '2ème Trimestre',
        quarterNumber: 2,
        startDate: new Date(endYear, 0, 1).toISOString().split('T')[0], // 1er janvier
        endDate: new Date(endYear, 3, 30).toISOString().split('T')[0], // 30 avril
        isActive: this.isCurrentQuarter(2, currentMonth) && this.isCurrentAcademicYear(startYear, currentMonth)
      },
      {
        name: '3ème Trimestre',
        quarterNumber: 3,
        startDate: new Date(endYear, 3, 1).toISOString().split('T')[0], // 1er avril
        endDate: new Date(endYear, 5, 30).toISOString().split('T')[0], // 30 juin
        isActive: this.isCurrentQuarter(3, currentMonth) && this.isCurrentAcademicYear(startYear, currentMonth)
      }
    ];

    // Créer les trimestres en base de données
    for (const quarterData of quartersToCreate) {
      try {
        const quarterId = await dataService.createQuarter({
          ...quarterData,
          academicYearId,
          schoolId: getCurrentSchoolId()
        });
        
        console.log(`✅ Trimestre créé: ${quarterData.name} pour ${academicYearId}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la création du trimestre ${quarterData.name}:`, error);
      }
    }
    
    // Recharger les trimestres depuis la base de données après création
    try {
      console.log('🔄 Rechargement des trimestres depuis la base de données...');
      const schoolId = getCurrentSchoolId();
      console.log('🏫 SchoolId utilisé:', schoolId);
      
      const dbQuarters = await dataService.getQuarters(schoolId);
      console.log('📊 Résultat de dataService.getQuarters:', dbQuarters);
      console.log('📊 Type de résultat:', typeof dbQuarters, 'Longueur:', Array.isArray(dbQuarters) ? dbQuarters.length : 'N/A');
      
      this.quarters = dbQuarters;
      this.currentQuarter = dbQuarters.find(quarter => quarter.isActive) || null;
      console.log(`📊 Trimestres rechargés: ${this.quarters.length} trouvés`);
      console.log('📊 Trimestre actuel:', this.currentQuarter);
      } catch (error) {
      console.error('❌ Erreur lors du rechargement des trimestres:', error);
    }
  }

  /**
   * Vérifie si c'est l'année scolaire actuelle
   */
  private isCurrentAcademicYear(startYear: number, currentMonth: number): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    let currentAcademicYearStart: number;
    if (currentMonth >= 9) {
      currentAcademicYearStart = currentYear;
    } else {
      currentAcademicYearStart = currentYear - 1;
    }
    
    return startYear === currentAcademicYearStart;
  }

  /**
   * Crée des trimestres simulés pour le mode développement
   */
  private createSimulatedQuarters(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Détermine l'année scolaire actuelle
    let academicYearStart: number;
    if (currentMonth >= 9) {
      academicYearStart = currentYear;
    } else {
      academicYearStart = currentYear - 1;
    }

    const academicYearEnd = academicYearStart + 1;
    const academicYearId = `academic-year-${academicYearStart}-${academicYearEnd}`;

    // Créer les trimestres simulés
    const quartersToCreate = [
      {
        id: `quarter-1-${academicYearId}`,
        name: '1er Trimestre',
        academicYearId,
        startDate: new Date(academicYearStart, 8, 1).toISOString().split('T')[0],
        endDate: new Date(academicYearStart, 11, 31).toISOString().split('T')[0],
        quarterNumber: 1,
        isActive: this.isCurrentQuarter(1, currentMonth),
        schoolId: 'default'
      },
      {
        id: `quarter-2-${academicYearId}`,
        name: '2ème Trimestre',
        academicYearId,
        startDate: new Date(academicYearEnd, 0, 1).toISOString().split('T')[0],
        endDate: new Date(academicYearEnd, 3, 30).toISOString().split('T')[0],
        quarterNumber: 2,
        isActive: this.isCurrentQuarter(2, currentMonth),
        schoolId: 'default'
      },
      {
        id: `quarter-3-${academicYearId}`,
        name: '3ème Trimestre',
        academicYearId,
        startDate: new Date(academicYearEnd, 3, 1).toISOString().split('T')[0],
        endDate: new Date(academicYearEnd, 5, 30).toISOString().split('T')[0],
        quarterNumber: 3,
        isActive: this.isCurrentQuarter(3, currentMonth),
        schoolId: 'default'
      }
    ];

    this.quarters = quartersToCreate;
    this.currentQuarter = this.quarters.find(quarter => quarter.isActive) || null;
  }

  /**
   * Détermine si un trimestre est actuel basé sur le mois
   */
  private isCurrentQuarter(quarterNumber: number, currentMonth: number): boolean {
    switch (quarterNumber) {
      case 1: // 1er Trimestre (Septembre à Décembre)
        return currentMonth >= 9 && currentMonth <= 12;
      case 2: // 2ème Trimestre (Janvier à Avril)
        return currentMonth >= 1 && currentMonth <= 4;
      case 3: // 3ème Trimestre (Avril à Juin)
        return currentMonth >= 4 && currentMonth <= 6;
      default:
        return false;
    }
  }

  /**
   * Retourne tous les trimestres
   */
  public getAllQuarters(): Quarter[] {
    console.log('🔍 QuarterService.getAllQuarters() appelé');
    console.log('📊 QuarterService: Nombre de trimestres en mémoire:', this.quarters.length);
    console.log('📊 QuarterService: Détails des trimestres:', this.quarters);
    return [...this.quarters];
  }

  /**
   * Retourne le trimestre actuel
   */
  public getCurrentQuarter(): Quarter | null {
    console.log('🔍 QuarterService.getCurrentQuarter() appelé');
    console.log('📊 QuarterService: Trimestre actuel:', this.currentQuarter);
    return this.currentQuarter;
  }

  /**
   * Retourne le trimestre par ID
   */
  public getQuarterById(id: string): Quarter | null {
    return this.quarters.find(quarter => quarter.id === id) || null;
  }

  /**
   * Retourne les trimestres actifs
   */
  public getActiveQuarters(): Quarter[] {
    return this.quarters.filter(quarter => quarter.isActive);
  }

  /**
   * Retourne les trimestres pour une année scolaire donnée
   */
  public getQuartersByAcademicYear(academicYearId: string): Quarter[] {
    return this.quarters.filter(quarter => quarter.academicYearId === academicYearId);
  }

  /**
   * Vérifie si une date est dans un trimestre donné
   */
  public isDateInQuarter(date: Date, quarterId: string): boolean {
    const quarter = this.getQuarterById(quarterId);
    if (!quarter) return false;

    const dateStr = date.toISOString().split('T')[0];
    return dateStr >= quarter.startDate && dateStr <= quarter.endDate;
  }

  /**
   * Retourne le trimestre pour une date donnée
   */
  public getQuarterForDate(date: Date): Quarter | null {
    const dateStr = date.toISOString().split('T')[0];
    return this.quarters.find(quarter => 
      dateStr >= quarter.startDate && dateStr <= quarter.endDate
    ) || null;
  }

  /**
   * Met à jour les trimestres (utile pour les changements d'année)
   */
  public async refreshQuarters(): Promise<void> {
    await this.initializeQuarters();
  }

  /**
   * Retourne les options pour les sélecteurs de trimestre
   */
  public getQuarterOptions(): QuarterOption[] {
    return this.quarters.map(quarter => ({
      value: quarter.id,
      label: quarter.name,
      isCurrent: quarter.isActive,
      quarterNumber: quarter.quarterNumber
    }));
  }

  /**
   * Retourne l'ID du trimestre actuel
   */
  public getCurrentQuarterId(): string {
    const current = this.getCurrentQuarter();
    return current ? current.id : '';
  }

  /**
   * Retourne le label du trimestre actuel
   */
  public getCurrentQuarterLabel(): string {
    const current = this.getCurrentQuarter();
    return current ? current.name : '';
  }

  /**
   * Crée un nouveau trimestre
   */
  public async createQuarter(quarterData: Omit<Quarter, 'id'>): Promise<string> {
    try {
      const quarterId = await dataService.createQuarter(quarterData);
      const newQuarter: Quarter = {
        id: quarterId,
        ...quarterData
      };
      this.quarters.push(newQuarter);
      this.quarters.sort((a, b) => a.quarterNumber - b.quarterNumber);
      return quarterId;
    } catch (error) {
      console.error('Erreur lors de la création du trimestre:', error);
      throw error;
    }
  }

  /**
   * Met à jour un trimestre
   */
  public async updateQuarter(id: string, quarterData: Partial<Quarter>): Promise<void> {
    try {
      await dataService.updateQuarter(id, quarterData);
      const index = this.quarters.findIndex(quarter => quarter.id === id);
      if (index !== -1) {
        this.quarters[index] = { ...this.quarters[index], ...quarterData };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du trimestre:', error);
      throw error;
    }
  }

  /**
   * Définit le trimestre actif
   */
  public async setActiveQuarter(quarterId: string): Promise<void> {
    try {
      await dataService.setActiveQuarter(quarterId, getCurrentSchoolId());
      
      // Mettre à jour l'état local
      this.quarters.forEach(quarter => {
        quarter.isActive = quarter.id === quarterId;
      });
      
      this.currentQuarter = this.quarters.find(quarter => quarter.id === quarterId) || null;
    } catch (error) {
      console.error('Erreur lors de la définition du trimestre actif:', error);
      throw error;
    }
  }

  /**
   * Retourne l'état de chargement
   */
  public isLoading(): boolean {
    return this.loading;
  }
}

// Export de l'instance singleton
export const quarterService = QuarterService.getInstance();
