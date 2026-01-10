/**
 * ============================================================================
 * ACADEMIC YEAR CALCULATOR SERVICE
 * ============================================================================
 * 
 * Service pour calculer automatiquement les dates d'année scolaire
 * selon les règles nationales :
 * - Prérentrée : Lundi de la 2ème semaine de septembre
 * - Rentrée officielle : Lundi suivant la prérentrée
 * - Fin d'année : Fin juin ou 1ère semaine de juillet
 * 
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';

export interface AcademicYearDates {
  preEntryDate: Date;  // Date de prérentrée (lundi 2ème semaine septembre)
  startDate: Date;     // Date de rentrée officielle (lundi suivant prérentrée)
  endDate: Date;       // Date de fin d'année (fin juin ou 1ère semaine juillet)
  label: string;       // Ex: "2024-2025"
  name: string;        // Ex: "Année scolaire 2024-2025"
}

@Injectable()
export class AcademicYearCalculatorService {
  /**
   * Calcule les dates d'une année scolaire pour une année donnée
   * @param year L'année de début (ex: 2024 pour l'année 2024-2025)
   */
  calculateAcademicYearDates(year: number): AcademicYearDates {
    // 1. Calculer la date de prérentrée : Lundi de la 2ème semaine de septembre
    const preEntryDate = this.calculatePreEntryDate(year);
    
    // 2. Calculer la date de rentrée officielle : Lundi suivant la prérentrée
    const startDate = this.calculateStartDate(preEntryDate);
    
    // 3. Calculer la date de fin : Fin juin ou 1ère semaine de juillet de l'année suivante
    const endDate = this.calculateEndDate(year + 1);
    
    // 4. Générer le label et le nom
    const label = `${year}-${year + 1}`;
    const name = `Année scolaire ${year}-${year + 1}`;
    
    return {
      preEntryDate,
      startDate,
      endDate,
      label,
      name,
    };
  }

  /**
   * Calcule la date de prérentrée : Lundi de la 2ème semaine de septembre
   */
  private calculatePreEntryDate(year: number): Date {
    // 1er septembre de l'année
    const september1 = new Date(year, 8, 1); // Mois 8 = septembre (0-indexed)
    
    // Trouver le premier lundi de septembre
    const firstMonday = this.findNextMonday(september1);
    
    // Ajouter 7 jours pour obtenir le lundi de la 2ème semaine
    const secondWeekMonday = new Date(firstMonday);
    secondWeekMonday.setDate(firstMonday.getDate() + 7);
    
    return secondWeekMonday;
  }

  /**
   * Calcule la date de rentrée officielle : Lundi suivant la prérentrée
   */
  private calculateStartDate(preEntryDate: Date): Date {
    const startDate = new Date(preEntryDate);
    startDate.setDate(preEntryDate.getDate() + 7); // Lundi suivant
    return startDate;
  }

  /**
   * Calcule la date de fin : Fin juin ou 1ère semaine de juillet
   * On choisit le dernier vendredi de juin ou le premier vendredi de juillet
   */
  private calculateEndDate(year: number): Date {
    // Dernier jour de juin
    const june30 = new Date(year, 5, 30); // Mois 5 = juin
    
    // Trouver le dernier vendredi de juin
    const lastFridayJune = this.findLastFridayOfMonth(year, 5);
    
    // Si le dernier vendredi est après le 25 juin, on le prend
    // Sinon, on prend le premier vendredi de juillet
    if (lastFridayJune.getDate() >= 25) {
      return lastFridayJune;
    } else {
      // Premier vendredi de juillet
      const july1 = new Date(year, 6, 1); // Mois 6 = juillet
      return this.findNextFriday(july1);
    }
  }

  /**
   * Trouve le prochain lundi à partir d'une date donnée
   */
  private findNextMonday(date: Date): Date {
    const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + daysUntilMonday);
    return monday;
  }

  /**
   * Trouve le prochain vendredi à partir d'une date donnée
   */
  private findNextFriday(date: Date): Date {
    const dayOfWeek = date.getDay();
    const daysUntilFriday = dayOfWeek <= 5 ? (5 - dayOfWeek) : (12 - dayOfWeek);
    
    const friday = new Date(date);
    friday.setDate(date.getDate() + daysUntilFriday);
    return friday;
  }

  /**
   * Trouve le dernier vendredi d'un mois donné
   */
  private findLastFridayOfMonth(year: number, month: number): Date {
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Remonter jusqu'au dernier vendredi
    let currentDate = new Date(lastDay);
    while (currentDate.getDay() !== 5) { // 5 = vendredi
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return currentDate;
  }

  /**
   * Calcule l'année scolaire courante basée sur la date actuelle
   */
  getCurrentAcademicYear(): number {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Si on est entre janvier et août, l'année scolaire en cours a commencé l'année précédente
    // Si on est entre septembre et décembre, l'année scolaire en cours a commencé cette année
    if (currentMonth < 8) { // Avant septembre
      return currentYear - 1;
    } else {
      return currentYear;
    }
  }

  /**
   * Vérifie si une année scolaire est terminée
   */
  isAcademicYearEnded(endDate: Date): boolean {
    const now = new Date();
    return now > endDate;
  }
}

