/**
 * Générateur de noms de reçus professionnels
 * Génère des noms de reçus lisibles et professionnels au lieu d'IDs
 */

export interface ReceiptNameOptions {
  schoolName?: string;
  studentName?: string;
  paymentDate?: string;
}

/**
 * Génère un nom de reçu professionnel basé sur les informations du paiement
 * Format: [ECOLE]-[ANNEE]-[MOIS]-[NUMERO]-[ELEVE]
 * Exemple: "ACADEMIA-2024-12-001-JEAN_DUPONT"
 */
export function generateReceiptName(options: ReceiptNameOptions = {}): string {
  const {
    schoolName = 'ACADEMIA',
    studentName = 'ELEVE',
    paymentDate = new Date().toISOString()
  } = options;

  // Extraire l'année et le mois de la date
  const date = new Date(paymentDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Générer un numéro séquentiel basé sur la date et l'heure
  const timestamp = date.getTime();
  const sequenceNumber = String(Math.floor(timestamp / 1000) % 10000).padStart(3, '0');

  // Nettoyer le nom de l'école (enlever espaces, caractères spéciaux)
  const cleanSchoolName = schoolName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);

  // Nettoyer le nom de l'élève (enlever espaces, caractères spéciaux)
  const cleanStudentName = studentName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .substring(0, 15);

  // Générer le nom du reçu
  const receiptName = `${cleanSchoolName}-${year}-${month}-${sequenceNumber}-${cleanStudentName}`;

  return receiptName;
}

/**
 * Génère un nom de reçu plus simple
 * Format: RECU-[DATE]-[NUMERO]
 * Exemple: "RECU-20241215-001"
 */
export function generateSimpleReceiptName(options: ReceiptNameOptions = {}): string {
  const { paymentDate = new Date().toISOString() } = options;

  const date = new Date(paymentDate);
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeString = String(date.getTime() % 1000).padStart(3, '0');

  return `RECU-${dateString}-${timeString}`;
}

/**
 * Génère un nom de reçu avec préfixe personnalisé
 * Format: [PREFIXE]-[ANNEE]-[MOIS]-[NUMERO]
 * Exemple: "PAY-2024-12-001"
 */
export function generateCustomReceiptName(
  prefix: string = 'PAY',
  options: ReceiptNameOptions = {}
): string {
  const { paymentDate = new Date().toISOString() } = options;

  const date = new Date(paymentDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sequenceNumber = String(Math.floor(date.getTime() / 1000) % 1000).padStart(3, '0');

  return `${prefix.toUpperCase()}-${year}-${month}-${sequenceNumber}`;
}

/**
 * Génère un nom de reçu basé sur le type de paiement
 * Format: [TYPE]-[DATE]-[MONTANT]
 * Exemple: "CASH-20241215-50000"
 */
export function generatePaymentTypeReceiptName(options: ReceiptNameOptions = {}): string {
  const {
    paymentDate = new Date().toISOString()
  } = options;

  const date = new Date(paymentDate);
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeString = String(date.getTime() % 1000).padStart(3, '0');

  return `PAY-${dateString}-${timeString}`;
}

/**
 * Fonction principale qui choisit automatiquement le meilleur format
 * selon les données disponibles
 */
export function generateOptimalReceiptName(options: ReceiptNameOptions = {}): string {
  const { schoolName, studentName, paymentDate } = options;

  // Si on a toutes les informations, utiliser le format complet
  if (schoolName && studentName && paymentDate) {
    return generateReceiptName(options);
  }

  // Si on a le nom de l'école et la date, utiliser le format simple
  if (schoolName && paymentDate) {
    return generateSimpleReceiptName(options);
  }

  // Sinon, utiliser le format personnalisé par défaut
  return generateCustomReceiptName('RECU', options);
}

/**
 * Valide un nom de reçu généré
 */
export function validateReceiptName(receiptName: string): boolean {
  // Vérifier que le nom n'est pas vide et contient au moins un tiret
  return Boolean(receiptName && receiptName.length > 0 && receiptName.includes('-'));
}

/**
 * Formate un nom de reçu pour l'affichage
 */
export function formatReceiptNameForDisplay(receiptName: string): string {
  return receiptName.replace(/-/g, ' - ');
}

/**
 * Génère un numéro de reçu selon le format: REC-0AA0AA-000-Classe
 * Où 0AA0AA représente l'année scolaire (ex: 025026 pour 2025-2026)
 * Format: REC-025026-000-CI
 */
export function generateAcademicYearReceiptNumber(
  academicYear: string = '2025-2026',
  className: string = 'CI',
  sequenceNumber: number = 1
): string {
  // Extraire les années de l'année scolaire (ex: "2025-2026" -> ["2025", "2026"])
  const years = academicYear.split('-');
  if (years.length !== 2) {
    // Si le format n'est pas correct, utiliser l'année actuelle
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    years[0] = currentYear.toString();
    years[1] = nextYear.toString();
  }

  // Formater les années avec 3 chiffres (ex: 2025 -> 025, 2026 -> 026)
  const year1 = years[0].slice(-3).padStart(3, '0');
  const year2 = years[1].slice(-3).padStart(3, '0');
  
  // Concaténer les années (ex: 025026)
  const academicYearCode = `${year1}${year2}`;
  
  // Formater le numéro séquentiel sur 3 chiffres
  const formattedSequence = String(sequenceNumber).padStart(3, '0');
  
  // Gérer le cas spécial de la Maternelle AVANT le nettoyage
  let cleanClassName = className.toUpperCase();
  
  // Vérifier si c'est une classe de Maternelle avant le nettoyage
  if (cleanClassName.includes('MATERNELLE')) {
    // Extraire le numéro de la classe (1, 2, ou 3)
    const match = cleanClassName.match(/MATERNELLE\s*(\d+)/);
    if (match) {
      cleanClassName = `MAT${match[1]}`;
    } else {
      cleanClassName = 'MAT';
    }
  } else {
    // Nettoyer le nom de la classe (enlever espaces, caractères spéciaux)
    cleanClassName = cleanClassName
      .replace(/1ÈRE/g, '1ERE')
      .replace(/1ERE/g, '1ERE')
      .replace(/2NDE/g, '2NDE')
      .replace(/2NDE/g, '2NDE')
      .replace(/TLE/g, 'TLE')
      .replace(/ème/g, 'EME')
      .replace(/ÈME/g, 'EME')
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
  }
  
  // Générer le numéro de reçu
  const receiptNumber = `REC-${academicYearCode}-${formattedSequence}-${cleanClassName}`;
  
  return receiptNumber;
}

/**
 * Génère un numéro de reçu avec séquence automatique basée sur un compteur persistant
 * Format: REC-025026-000-CI
 */
export function generateAutoSequenceReceiptNumber(
  academicYear: string = '2025-2026',
  className: string = 'CI'
): string {
  // Créer une clé unique pour cette année scolaire et classe
  const yearCode = academicYear.replace('-', '');
  const classKey = className.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const storageKey = `receipt_counter_${yearCode}_${classKey}`;
  
  // Récupérer le compteur actuel depuis le localStorage
  let currentCount = 0;
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedCount = localStorage.getItem(storageKey);
    if (storedCount) {
      currentCount = parseInt(storedCount, 10) || 0;
    }
  }
  
  // Incrémenter le compteur
  currentCount += 1;
  
  // Sauvegarder le nouveau compteur
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(storageKey, currentCount.toString());
  }
  
  return generateAcademicYearReceiptNumber(academicYear, className, currentCount);
}

/**
 * Génère un numéro de reçu avec séquence automatique basée sur la date (ancienne méthode)
 * Format: REC-025026-000-CI
 * @deprecated Utilisez generateAutoSequenceReceiptNumber pour un compteur séquentiel
 */
export function generateDateBasedReceiptNumber(
  academicYear: string = '2025-2026',
  className: string = 'CI'
): string {
  // Générer un numéro séquentiel basé sur l'heure actuelle
  const now = new Date();
  const sequenceNumber = (now.getHours() * 60 + now.getMinutes()) % 1000 + 1;
  
  return generateAcademicYearReceiptNumber(academicYear, className, sequenceNumber);
}

/**
 * Réinitialise le compteur de reçus pour une année scolaire et classe donnée
 */
export function resetReceiptCounter(
  academicYear: string = '2025-2026',
  className: string = 'CI'
): void {
  const yearCode = academicYear.replace('-', '');
  const classKey = className.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const storageKey = `receipt_counter_${yearCode}_${classKey}`;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(storageKey);
  }
}

/**
 * Récupère le compteur actuel pour une année scolaire et classe donnée
 */
export function getCurrentReceiptCounter(
  academicYear: string = '2025-2026',
  className: string = 'CI'
): number {
  const yearCode = academicYear.replace('-', '');
  const classKey = className.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const storageKey = `receipt_counter_${yearCode}_${classKey}`;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedCount = localStorage.getItem(storageKey);
    return storedCount ? parseInt(storedCount, 10) || 0 : 0;
  }
  
  return 0;
}