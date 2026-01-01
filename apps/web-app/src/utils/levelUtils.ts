// Utilitaires pour la gestion des niveaux scolaires

export interface LevelInfo {
  id: string;
  displayName: string;
  category: 'Maternelle' | 'Primaire' | '1er Cycle secondaire' | '2nd Cycle secondaire';
  order: number;
}

// Mapping des niveaux avec leur ordre hiérarchique
export const LEVEL_MAPPING: { [key: string]: LevelInfo } = {
  // Maternelle
  'maternelle': { id: 'maternelle', displayName: 'Maternelle', category: 'Maternelle', order: 1 },
  'maternelle-1': { id: 'maternelle-1', displayName: 'Maternelle 1', category: 'Maternelle', order: 1 },
  'maternelle-2': { id: 'maternelle-2', displayName: 'Maternelle 2', category: 'Maternelle', order: 2 },
  'maternelle-3': { id: 'maternelle-3', displayName: 'Maternelle 3', category: 'Maternelle', order: 3 },
  'petite-section': { id: 'petite-section', displayName: 'Maternelle 1', category: 'Maternelle', order: 1 },
  'moyenne-section': { id: 'moyenne-section', displayName: 'Maternelle 2', category: 'Maternelle', order: 2 },
  'grande-section': { id: 'grande-section', displayName: 'Maternelle 3', category: 'Maternelle', order: 3 },

  // Primaire
  'primaire': { id: 'primaire', displayName: 'Primaire', category: 'Primaire', order: 4 },
  'ci': { id: 'ci', displayName: 'CI', category: 'Primaire', order: 4 },
  'cp': { id: 'cp', displayName: 'CP', category: 'Primaire', order: 5 },
  'ce1': { id: 'ce1', displayName: 'CE1', category: 'Primaire', order: 6 },
  'ce2': { id: 'ce2', displayName: 'CE2', category: 'Primaire', order: 7 },
  'cm1': { id: 'cm1', displayName: 'CM1', category: 'Primaire', order: 8 },
  'cm2': { id: 'cm2', displayName: 'CM2', category: 'Primaire', order: 9 },

  // 1er Cycle secondaire (Collège)
  'secondaire': { id: 'secondaire', displayName: '1er Cycle secondaire', category: '1er Cycle secondaire', order: 10 },
  '1er-cycle-secondaire': { id: '1er-cycle-secondaire', displayName: '1er Cycle secondaire', category: '1er Cycle secondaire', order: 10 },
  'secondaire_1er_cycle': { id: 'secondaire_1er_cycle', displayName: '1er Cycle secondaire', category: '1er Cycle secondaire', order: 10 },
  '6eme': { id: '6eme', displayName: '6ème', category: '1er Cycle secondaire', order: 10 },
  '6ème': { id: '6ème', displayName: '6ème', category: '1er Cycle secondaire', order: 10 },
  '5eme': { id: '5eme', displayName: '5ème', category: '1er Cycle secondaire', order: 11 },
  '5ème': { id: '5ème', displayName: '5ème', category: '1er Cycle secondaire', order: 11 },
  '4eme': { id: '4eme', displayName: '4ème', category: '1er Cycle secondaire', order: 12 },
  '4ème': { id: '4ème', displayName: '4ème', category: '1er Cycle secondaire', order: 12 },
  '3eme': { id: '3eme', displayName: '3ème', category: '1er Cycle secondaire', order: 13 },
  '3ème': { id: '3ème', displayName: '3ème', category: '1er Cycle secondaire', order: 13 },

  // 2nd Cycle secondaire (Lycée)
  'lycee': { id: 'lycee', displayName: '2nd Cycle secondaire', category: '2nd Cycle secondaire', order: 14 },
  '2nd-cycle-secondaire': { id: '2nd-cycle-secondaire', displayName: '2nd Cycle secondaire', category: '2nd Cycle secondaire', order: 14 },
  'secondaire_2nd_cycle': { id: 'secondaire_2nd_cycle', displayName: '2nd Cycle secondaire', category: '2nd Cycle secondaire', order: 14 },
  '2nde': { id: '2nde', displayName: '2nde', category: '2nd Cycle secondaire', order: 14 },
  'seconde': { id: 'seconde', displayName: '2nde', category: '2nd Cycle secondaire', order: 14 },
  '1ere': { id: '1ere', displayName: '1ère', category: '2nd Cycle secondaire', order: 15 },
  '1ère': { id: '1ère', displayName: '1ère', category: '2nd Cycle secondaire', order: 15 },
  'premiere': { id: 'premiere', displayName: '1ère', category: '2nd Cycle secondaire', order: 15 },
  'terminale': { id: 'terminale', displayName: 'Tle', category: '2nd Cycle secondaire', order: 16 },
  'tle': { id: 'tle', displayName: 'Tle', category: '2nd Cycle secondaire', order: 16 },
};

// Catégories dans l'ordre hiérarchique
export const LEVEL_CATEGORIES = [
  'Maternelle',
  'Primaire', 
  '1er Cycle secondaire',
  '2nd Cycle secondaire'
] as const;

/**
 * Convertit un ID de niveau en nom d'affichage standardisé
 */
export function getLevelDisplayName(levelId: string): string {
  if (!levelId) return 'Niveau non défini';
  
  const normalizedId = levelId.toLowerCase().trim();
  const levelInfo = LEVEL_MAPPING[normalizedId];
  
  return levelInfo ? levelInfo.displayName : levelId;
}

/**
 * Obtient la catégorie d'un niveau
 */
export function getLevelCategory(levelId: string): string {
  if (!levelId) return 'Autre';
  
  const normalizedId = levelId.toLowerCase().trim();
  const levelInfo = LEVEL_MAPPING[normalizedId];
  
  return levelInfo ? levelInfo.category : 'Autre';
}

/**
 * Obtient l'ordre hiérarchique d'un niveau
 */
export function getLevelOrder(levelId: string): number {
  if (!levelId) return 999;
  
  const normalizedId = levelId.toLowerCase().trim();
  const levelInfo = LEVEL_MAPPING[normalizedId];
  
  return levelInfo ? levelInfo.order : 999;
}

/**
 * Trie une liste de classes selon l'ordre hiérarchique des niveaux
 */
export function sortClassesByLevel<T extends { level?: string; name?: string }>(classes: T[]): T[] {
  return classes.sort((a, b) => {
    const orderA = getLevelOrder(a.level || '');
    const orderB = getLevelOrder(b.level || '');
    
    // Si même niveau, trier par nom
    if (orderA === orderB) {
      return (a.name || '').localeCompare(b.name || '');
    }
    
    return orderA - orderB;
  });
}

/**
 * Groupe les classes par catégorie de niveau
 */
export function groupClassesByCategory<T extends { level?: string }>(classes: T[]): { [category: string]: T[] } {
  const grouped: { [category: string]: T[] } = {};
  
  classes.forEach(cls => {
    const category = getLevelCategory(cls.level || '');
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(cls);
  });
  
  // Trier chaque groupe
  Object.keys(grouped).forEach(category => {
    grouped[category] = sortClassesByLevel(grouped[category]);
  });
  
  return grouped;
}

/**
 * Obtient la liste des catégories de niveaux présentes dans une liste de classes
 */
export function getAvailableCategories<T extends { level?: string }>(classes: T[]): string[] {
  const categories = new Set<string>();
  
  classes.forEach(cls => {
    const category = getLevelCategory(cls.level || '');
    categories.add(category);
  });
  
  // Retourner dans l'ordre hiérarchique
  return LEVEL_CATEGORIES.filter(cat => categories.has(cat)).concat(
    Array.from(categories).filter(cat => !LEVEL_CATEGORIES.includes(cat as any))
  );
}
