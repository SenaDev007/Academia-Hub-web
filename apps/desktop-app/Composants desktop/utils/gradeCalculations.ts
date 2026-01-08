/**
 * Utilitaires pour les calculs de notes selon le système éducatif béninois
 */

// Types d'éducation
export type EducationLevel = 'preschool' | 'primary' | 'secondary';

// Interface pour les appréciations
export interface GradeAppreciation {
  mention: string;
  emoji?: string;
  observation?: string;
  recommendation?: string;
}

// Interface pour les échelles de notation
export interface GradeScale {
  min?: number;
  max?: number;
  code?: string;
  label?: string;
  description?: string;
  mention: string;
  emoji?: string;
  observation?: string;
  recommendation?: string;
}

// Échelles d'appréciation par niveau
export const gradingScales: Record<EducationLevel, GradeScale[]> = {
  preschool: [
    { code: 'TB', label: 'Très Bien', description: 'Compétence maîtrisée', mention: 'Très Bien' },
    { code: 'B', label: 'Bien', description: 'Compétence en cours d\'acquisition', mention: 'Bien' },
    { code: 'AB', label: 'Assez Bien', description: 'Compétence partiellement acquise', mention: 'Assez Bien' },
    { code: 'I', label: 'Insuffisant', description: 'Compétence non acquise', mention: 'Insuffisant' }
  ],
  primary: [
    { min: 18, max: 20, mention: 'Excellent', emoji: '🌟', observation: 'Travail exceptionnel, continue ainsi !', recommendation: 'Maintiens ce niveau d\'excellence.' },
    { min: 16, max: 17.99, mention: 'Très Bien', emoji: '😊', observation: 'Très bon travail, résultats satisfaisants.', recommendation: 'Persévère pour atteindre l\'excellence.' },
    { min: 14, max: 15.99, mention: 'Bien', emoji: '👍', observation: 'Bon travail, efforts appréciables.', recommendation: 'Continue tes efforts pour progresser.' },
    { min: 12, max: 13.99, mention: 'Assez Bien', emoji: '😐', observation: 'Travail correct mais peut mieux faire.', recommendation: 'Redouble d\'efforts dans tes révisions.' },
    { min: 10, max: 11.99, mention: 'Passable', emoji: '⚠️', observation: 'Résultats justes, des lacunes à combler.', recommendation: 'Travaille davantage et demande de l\'aide.' },
    { min: 8, max: 9.99, mention: 'Insuffisant', emoji: '❌', observation: 'Résultats faibles, difficultés observées.', recommendation: 'Besoin de soutien et de travail personnel.' },
    { min: 0, max: 7.99, mention: 'Très Insuffisant', emoji: '🚫', observation: 'Grandes difficultés, besoins d\'accompagnement.', recommendation: 'Suivi individualisé nécessaire, soutien parental requis.' }
  ],
  secondary: [
    { min: 18, max: 20, mention: 'Excellent' },
    { min: 16, max: 17.99, mention: 'Très Bien' },
    { min: 14, max: 15.99, mention: 'Bien' },
    { min: 12, max: 13.99, mention: 'Assez Bien' },
    { min: 10, max: 11.99, mention: 'Passable' },
    { min: 8, max: 9.99, mention: 'Faible' },
    { min: 0, max: 7.99, mention: 'Très Faible' }
  ]
};

// Coefficients par matière (secondaire uniquement)
export const subjectCoefficients: Record<string, number> = {
  'Mathématiques': 7,
  'Sciences Physiques': 6,
  'Sciences Naturelles': 3,
  'Français': 3,
  'Philosophie': 2,
  'Histoire-Géographie': 2,
  'Anglais': 2,
  'Allemand/Espagnol': 2,
  'EPS': 1,
  'Arts Plastiques': 1
};

/**
 * Calcule la moyenne d'une matière au primaire pour un trimestre
 * @param em1 Évaluation mensuelle 1
 * @param em2 Évaluation mensuelle 2
 * @param ec Évaluation certificative
 * @returns La moyenne calculée ou null si des valeurs sont manquantes
 */
export const calculatePrimaryAverage = (em1: number, em2: number, ec: number): number | null => {
  if (isNaN(em1) || isNaN(em2) || isNaN(ec)) {
    return null;
  }
  
  const emAverage = (em1 + em2) / 2;
  const average = (emAverage + ec) / 2;
  return parseFloat(average.toFixed(2));
};

/**
 * Calcule la moyenne d'une matière au secondaire pour un trimestre
 * @param ie1 Interrogation écrite 1
 * @param ie2 Interrogation écrite 2
 * @param ds1 Devoir surveillé 1
 * @param ds2 Devoir surveillé 2
 * @returns La moyenne calculée ou null si toutes les valeurs sont manquantes
 */
export const calculateSecondaryAverage = (ie1: number, ie2: number, ds1: number, ds2: number): number | null => {
  // Filtrer les valeurs valides
  const values = [ie1, ie2, ds1, ds2].filter(v => !isNaN(v));
  
  if (values.length === 0) {
    return null;
  }
  
  // Si toutes les valeurs sont disponibles, utiliser la formule complète
  if (values.length === 4) {
    const ieAverage = (ie1 + ie2) / 2;
    const dsAverage = (ds1 + ds2) / 2;
    const average = (ieAverage + 2 * dsAverage) / 3;
    return parseFloat(average.toFixed(2));
  }
  
  // Sinon, calculer la moyenne des valeurs disponibles
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  return parseFloat(average.toFixed(2));
};

/**
 * Calcule la moyenne générale pondérée (avec coefficients) pour le secondaire
 * @param subjectAverages Tableau d'objets contenant les moyennes par matière et leurs coefficients
 * @returns La moyenne générale pondérée ou null si aucune donnée
 */
export const calculateWeightedAverage = (
  subjectAverages: Array<{ subject: string, average: number, coefficient: number }>
): number | null => {
  if (subjectAverages.length === 0) {
    return null;
  }
  
  const totalPoints = subjectAverages.reduce((sum, item) => sum + (item.average * item.coefficient), 0);
  const totalCoefficients = subjectAverages.reduce((sum, item) => sum + item.coefficient, 0);
  
  return parseFloat((totalPoints / totalCoefficients).toFixed(2));
};

/**
 * Calcule la moyenne générale non pondérée (sans coefficients) pour le primaire
 * @param subjectAverages Tableau des moyennes par matière
 * @returns La moyenne générale ou null si aucune donnée
 */
export const calculateSimpleAverage = (subjectAverages: number[]): number | null => {
  if (subjectAverages.length === 0) {
    return null;
  }
  
  const validAverages = subjectAverages.filter(avg => !isNaN(avg));
  
  if (validAverages.length === 0) {
    return null;
  }
  
  const average = validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length;
  return parseFloat(average.toFixed(2));
};

/**
 * Calcule la moyenne annuelle à partir des moyennes trimestrielles
 * @param trimester1 Moyenne du 1er trimestre
 * @param trimester2 Moyenne du 2ème trimestre
 * @param trimester3 Moyenne du 3ème trimestre
 * @returns La moyenne annuelle ou null si des valeurs sont manquantes
 */
export const calculateAnnualAverage = (
  trimester1: number, 
  trimester2: number, 
  trimester3: number
): number | null => {
  if (isNaN(trimester1) || isNaN(trimester2) || isNaN(trimester3)) {
    return null;
  }
  
  const average = (trimester1 + trimester2 + trimester3) / 3;
  return parseFloat(average.toFixed(2));
};

/**
 * Détermine si un élève peut passer en classe supérieure
 * @param average Moyenne annuelle
 * @param level Niveau d'éducation
 * @returns Un objet contenant la décision et une explication
 */
export const determinePromotion = (
  average: number, 
  level: EducationLevel
): { decision: 'pass' | 'council' | 'repeat', explanation: string } => {
  if (level === 'preschool') {
    return { decision: 'pass', explanation: 'Passage automatique en classe supérieure' };
  }
  
  if (level === 'primary') {
    if (average >= 10) {
      return { decision: 'pass', explanation: 'Passage en classe supérieure' };
    }
    return { decision: 'repeat', explanation: 'Redoublement recommandé' };
  }
  
  // Secondaire
  if (average >= 10) {
    return { decision: 'pass', explanation: 'Passage direct en classe supérieure' };
  }
  
  if (average >= 8 && average < 10) {
    return { decision: 'council', explanation: 'Passage soumis à la décision du conseil de classe' };
  }
  
  return { decision: 'repeat', explanation: 'Redoublement obligatoire' };
};

/**
 * Obtient l'appréciation correspondant à une note
 * @param grade La note
 * @param level Le niveau d'éducation
 * @returns L'appréciation correspondante ou null si la note est invalide
 */
export const getGradeAppreciation = (
  grade: number, 
  level: EducationLevel = 'secondary'
): GradeAppreciation | null => {
  if (isNaN(grade)) {
    return null;
  }
  
  const scales = gradingScales[level];
  
  for (const scale of scales) {
    if ('min' in scale && 'max' in scale && grade >= scale.min! && grade <= scale.max!) {
      return {
        mention: scale.mention,
        emoji: scale.emoji,
        observation: scale.observation,
        recommendation: scale.recommendation
      };
    }
  }
  
  return null;
};

/**
 * Obtient la mention du baccalauréat
 * @param average Moyenne générale
 * @returns La mention obtenue
 */
export const getBacMention = (average: number): string => {
  if (average >= 16) return 'Très Bien';
  if (average >= 14) return 'Bien';
  if (average >= 12) return 'Assez Bien';
  if (average >= 10) return 'Passable';
  return 'Échec';
};