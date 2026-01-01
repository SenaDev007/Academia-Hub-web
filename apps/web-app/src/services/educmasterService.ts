// Service pour la gestion des numéros Educmaster
// Gère les numéros séquentiels dans l'ordre d'enregistrement en base de données

export interface EducmasterSequence {
  department: string;
  academicYear: string;
  cycle: string;
  lastSequence: number;
}

/**
 * Récupère le prochain numéro séquentiel pour un département, année et cycle donnés
 */
export async function getNextSequentialNumber(
  department: string, 
  academicYear: string, 
  cycle: string
): Promise<number> {
  try {
    // Utiliser l'API Electron pour récupérer le prochain numéro séquentiel
    // Utiliser l'API HTTP
    try {
      const result = await api.students.getNextEducmasterSequence({
        department,
        academicYear,
        cycle
      });
      
      if (result.success) {
        return result.sequenceNumber;
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération du numéro séquentiel');
      }
    } else {
      // Fallback : utiliser un numéro aléatoire temporaire (à remplacer par la vraie logique)
      console.warn('API Electron non disponible, utilisation d\'un numéro temporaire');
      return Math.floor(Math.random() * 999999) + 1;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du numéro séquentiel:', error);
    throw error;
  }
}

/**
 * Valide qu'un numéro Educmaster n'existe pas déjà
 */
export async function validateEducmasterUniqueness(educmasterNumber: string): Promise<boolean> {
  try {
    // Utiliser l'API HTTP
    try {
      const result = await api.students.checkEducmasterExists(educmasterNumber);
      return !result.exists; // Retourne true si le numéro n'existe pas (unique)
    }
    
    // Fallback : considérer comme unique
    return true;
  } catch (error) {
    console.error('Erreur lors de la validation d\'unicité:', error);
    return true; // En cas d'erreur, permettre la création
  }
}

/**
 * Sauvegarde un numéro Educmaster dans la base de données
 */
export async function saveEducmasterNumber(
  educmasterNumber: string, 
  studentId: string
): Promise<boolean> {
  try {
    // Utiliser l'API HTTP
    try {
      const result = await api.students.saveEducmasterNumber({
        educmasterNumber,
        studentId
      });
      
      return result.success;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du numéro Educmaster:', error);
    return false;
  }
}

/**
 * Récupère les statistiques des numéros Educmaster
 */
export async function getEducmasterStats(): Promise<{
  totalStudents: number;
  byDepartment: { [key: string]: number };
  byCycle: { [key: string]: number };
  byYear: { [key: string]: number };
}> {
  try {
    // Utiliser l'API HTTP
    try {
      const result = await api.students.getEducmasterStats();
      return result.stats || {
        totalStudents: 0,
        byDepartment: {},
        byCycle: {},
        byYear: {}
      };
    }
    
    return {
      totalStudents: 0,
      byDepartment: {},
      byCycle: {},
      byYear: {}
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      totalStudents: 0,
      byDepartment: {},
      byCycle: {},
      byYear: {}
    };
  }
}
