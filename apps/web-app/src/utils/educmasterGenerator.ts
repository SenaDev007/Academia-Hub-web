// Générateur de numéro Educmaster pour Academia Hub Desktop
// Format: AABBCCDDDDDD (12 caractères)

export interface EducmasterConfig {
  department: string;
  academicYear: string;
  classId: string;
  className: string;
  classLevel?: string; // Niveau scolaire de la BDD (maternelle, primaire, college, lycee)
  studentCount: number;
}

// Codes des départements du Bénin
export const DEPARTMENT_CODES: { [key: string]: string } = {
  'alibori': '01',
  'atacora': '02', 
  'atlantique': '03',
  'borgou': '04',
  'collines': '05',
  'couffo': '06',
  'donga': '07',
  'littoral': '08',
  'mono': '09',
  'oueme': '10',
  'plateau': '11',
  'zou': '12'
};

// Codes des cycles éducatifs
export const CYCLE_CODES: { [key: string]: string } = {
  'maternelle': '01',
  'primaire': '02', 
  'college': '03',
  'lycee': '04'
};

/**
 * Détermine le cycle éducatif à partir du niveau de la classe (BDD) ou du nom de la classe
 */
export function getCycleFromClassName(className: string, classLevel?: string): string {
  // Si le niveau de la BDD est fourni, l'utiliser en priorité
  if (classLevel) {
    const levelLower = classLevel.toLowerCase();
    
    if (levelLower.includes('maternelle')) return 'maternelle';
    if (levelLower.includes('primaire')) return 'primaire';
    if (levelLower.includes('college') || levelLower.includes('collège')) return 'college';
    if (levelLower.includes('lycee') || levelLower.includes('lycée')) return 'lycee';
  }
  
  // Fallback : analyser le nom de la classe
  const classLower = className.toLowerCase();
  
  // Maternelle
  if (classLower.includes('maternelle 1') || classLower.includes('maternelle 2') || classLower.includes('maternelle 3') ||
      classLower.includes('maternelle1') || classLower.includes('maternelle2') || classLower.includes('maternelle3')) {
    return 'maternelle';
  }
  
  // Primaire
  if (classLower.includes('ci') || classLower.includes('cp') || classLower.includes('ce1') || 
      classLower.includes('ce2') || classLower.includes('cm1') || classLower.includes('cm2')) {
    return 'primaire';
  }
  
  // Collège
  if (classLower.includes('6ème') || classLower.includes('5ème') || classLower.includes('4ème') || 
      classLower.includes('3ème') || classLower.includes('sixieme') || classLower.includes('cinquieme') || 
      classLower.includes('quatrieme') || classLower.includes('troisieme')) {
    return 'college';
  }
  
  // Lycée
  if (classLower.includes('2nde') || classLower.includes('1ère') || classLower.includes('terminale') || 
      classLower.includes('seconde') || classLower.includes('premiere')) {
    return 'lycee';
  }
  
  // Par défaut, considérer comme primaire
  return 'primaire';
}

/**
 * Extrait l'année d'immatriculation à partir de l'année académique
 */
export function getEnrollmentYear(academicYear: string): string {
  // Format: "2024-2025" ou "academic-year-2024-2025"
  const match = academicYear.match(/(\d{4})-(\d{4})/);
  if (match) {
    return match[1].slice(-2); // Prendre les 2 derniers chiffres de la première année
  }
  
  // Si pas de match, utiliser l'année actuelle
  return new Date().getFullYear().toString().slice(-2);
}

/**
 * Génère le numéro Educmaster avec numéro séquentiel de la base de données
 */
export async function generateEducmasterNumberAsync(config: EducmasterConfig): Promise<string> {
  try {
    // 1. Code département (2 chiffres)
    const departmentCode = DEPARTMENT_CODES[config.department.toLowerCase()] || '08'; // Littoral par défaut
    
    // 2. Année d'immatriculation (2 chiffres)
    const enrollmentYear = getEnrollmentYear(config.academicYear);
    
    // 3. Cycle éducatif (2 chiffres) - Utiliser le niveau de la BDD en priorité
    const cycle = getCycleFromClassName(config.className, config.classLevel);
    const cycleCode = CYCLE_CODES[cycle];
    console.log('🎓 Cycle déterminé:', { 
      className: config.className, 
      classLevel: config.classLevel, 
      cycle, 
      cycleCode 
    });
    
    // 4. Numéro séquentiel (6 chiffres) - Récupéré de la base de données
    const { getNextSequentialNumber } = await import('../services/educmasterService');
    const sequentialNumber = await getNextSequentialNumber(config.department, config.academicYear, cycle);
    const formattedSequential = String(sequentialNumber).padStart(6, '0');
    
    // Assembler le numéro complet
    const educmasterNumber = `${departmentCode}${enrollmentYear}${cycleCode}${formattedSequential}`;
    
    return educmasterNumber;
  } catch (error) {
    console.error('Erreur lors de la génération du numéro Educmaster:', error);
    // Retourner un numéro par défaut en cas d'erreur
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `08${currentYear}02000001`;
  }
}

/**
 * Génère le numéro Educmaster (version synchrone - pour compatibilité)
 */
export function generateEducmasterNumber(config: EducmasterConfig): string {
  try {
    // 1. Code département (2 chiffres)
    const departmentCode = DEPARTMENT_CODES[config.department.toLowerCase()] || '08'; // Littoral par défaut
    
    // 2. Année d'immatriculation (2 chiffres)
    const enrollmentYear = getEnrollmentYear(config.academicYear);
    
    // 3. Cycle éducatif (2 chiffres) - Utiliser le niveau de la BDD en priorité
    const cycle = getCycleFromClassName(config.className, config.classLevel);
    const cycleCode = CYCLE_CODES[cycle];
    
    // 4. Numéro séquentiel (6 chiffres) - Utilise le studentCount fourni
    const sequentialNumber = String(config.studentCount).padStart(6, '0');
    
    // Assembler le numéro complet
    const educmasterNumber = `${departmentCode}${enrollmentYear}${cycleCode}${sequentialNumber}`;
    
    return educmasterNumber;
  } catch (error) {
    console.error('Erreur lors de la génération du numéro Educmaster:', error);
    // Retourner un numéro par défaut en cas d'erreur
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `08${currentYear}02000001`;
  }
}

/**
 * Génère le numéro Educmaster avec format lisible (avec tirets) - Version asynchrone
 */
export async function generateEducmasterNumberFormattedAsync(config: EducmasterConfig): Promise<string> {
  const baseNumber = await generateEducmasterNumberAsync(config);
  return `${baseNumber.slice(0, 2)}-${baseNumber.slice(2, 6)}-${baseNumber.slice(6)}`;
}

/**
 * Génère le numéro Educmaster avec format lisible (avec tirets) - Version synchrone
 */
export function generateEducmasterNumberFormatted(config: EducmasterConfig): string {
  const baseNumber = generateEducmasterNumber(config);
  return `${baseNumber.slice(0, 2)}-${baseNumber.slice(2, 6)}-${baseNumber.slice(6)}`;
}

/**
 * Valide un numéro Educmaster
 */
export function validateEducmasterNumber(educmasterNumber: string): boolean {
  // Supprimer les tirets pour la validation
  const cleanNumber = educmasterNumber.replace(/-/g, '');
  
  // Vérifier la longueur (12 caractères)
  if (cleanNumber.length !== 12) {
    return false;
  }
  
  // Vérifier que tous les caractères sont des chiffres
  if (!/^\d{12}$/.test(cleanNumber)) {
    return false;
  }
  
  // Vérifier que le code département est valide
  const departmentCode = cleanNumber.slice(0, 2);
  const validDepartmentCodes = Object.values(DEPARTMENT_CODES);
  if (!validDepartmentCodes.includes(departmentCode)) {
    return false;
  }
  
  // Vérifier que le code cycle est valide
  const cycleCode = cleanNumber.slice(4, 6);
  const validCycleCodes = Object.values(CYCLE_CODES);
  if (!validCycleCodes.includes(cycleCode)) {
    return false;
  }
  
  return true;
}

/**
 * Décode un numéro Educmaster pour obtenir ses informations
 */
export function decodeEducmasterNumber(educmasterNumber: string): {
  department: string;
  enrollmentYear: string;
  cycle: string;
  sequentialNumber: number;
  isValid: boolean;
} {
  const cleanNumber = educmasterNumber.replace(/-/g, '');
  
  if (!validateEducmasterNumber(educmasterNumber)) {
    return {
      department: 'Inconnu',
      enrollmentYear: '00',
      cycle: 'Inconnu',
      sequentialNumber: 0,
      isValid: false
    };
  }
  
  const departmentCode = cleanNumber.slice(0, 2);
  const enrollmentYear = cleanNumber.slice(2, 4);
  const cycleCode = cleanNumber.slice(4, 6);
  const sequentialNumber = parseInt(cleanNumber.slice(6), 10);
  
  // Trouver le nom du département
  const departmentName = Object.entries(DEPARTMENT_CODES).find(([_, code]) => code === departmentCode)?.[0] || 'Inconnu';
  
  // Trouver le nom du cycle
  const cycleName = Object.entries(CYCLE_CODES).find(([_, code]) => code === cycleCode)?.[0] || 'Inconnu';
  
  return {
    department: departmentName,
    enrollmentYear: `20${enrollmentYear}`,
    cycle: cycleName,
    sequentialNumber,
    isValid: true
  };
}

/**
 * Exemples de numéros Educmaster générés
 */
export const EDUCMASTER_EXAMPLES = [
  {
    description: 'Élève du Littoral, immatriculé en 2025, en maternelle, n°45',
    number: '082501000045',
    formatted: '08-2501-000045'
  },
  {
    description: 'Élève du Couffo, immatriculé en 2025, au primaire, n°1234',
    number: '062502001234',
    formatted: '06-2502-001234'
  },
  {
    description: 'Élève d\'Alibori, immatriculé en 2025, au collège, n°12500',
    number: '012503012500',
    formatted: '01-2503-012500'
  },
  {
    description: 'Élève de l\'Ouémé, immatriculé en 2025, au lycée, n°5678',
    number: '102504005678',
    formatted: '10-2504-005678'
  }
];
