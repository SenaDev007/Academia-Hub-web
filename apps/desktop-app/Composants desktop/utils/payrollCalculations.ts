/**
 * Utilitaires pour les calculs de paie selon la réglementation béninoise
 */

// Types pour les calculs de paie
export type EmployeeType = 'permanent' | 'vacataire';

// Interface pour les éléments de rémunération
export interface SalaryComponents {
  baseSalary?: number;
  hourlyRate?: number;
  workingHours?: number;
  allowances?: {
    transport?: number;
    housing?: number;
    responsibility?: number;
    performance?: number;
    other?: number;
  };
  benefits?: {
    vehicle?: boolean;
    housing?: boolean;
    phone?: boolean;
  };
  overtime?: {
    hours?: number;
    rate?: number;
  };
  absences?: number;
}

// Interface pour les déductions
export interface Deductions {
  advance?: number;
  loan?: number;
  other?: number;
}

// Interface pour les résultats de calcul
export interface PayrollResults {
  grossSalary: number;
  cnssSalary: number;
  cnssEmployee: number;
  cnssEmployer: number;
  taxableIncome: number;
  irpp: number;
  netSalary: number;
  totalEmployerCost: number;
}

// Constantes pour les calculs de paie selon la réglementation béninoise
export const CNSS_EMPLOYEE_RATE = 3.6; // 3,6% pour la part salariale
export const CNSS_EMPLOYER_RATE = 16.4; // 16,4% pour la part patronale
export const CNSS_CEILING = 1000000; // Plafond CNSS en F CFA
export const PROFESSIONAL_TRAINING_TAX = 1.2; // Taxe de formation professionnelle 1,2%

// Barème IRPP (Impôt sur le Revenu des Personnes Physiques) au Bénin
export const IRPP_BRACKETS = [
  { min: 0, max: 50000, rate: 0 },
  { min: 50001, max: 130000, rate: 10 },
  { min: 130001, max: 280000, rate: 15 },
  { min: 280001, max: 530000, rate: 20 },
  { min: 530001, max: Infinity, rate: 30 }
];

/**
 * Calcule l'IRPP selon le barème progressif
 * @param taxableIncome Revenu imposable
 * @returns Montant de l'IRPP
 */
export const calculateIRPP = (taxableIncome: number): number => {
  let tax = 0;
  let remainingIncome = taxableIncome;
  
  for (const bracket of IRPP_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const taxableAmount = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += (taxableAmount * bracket.rate) / 100;
    remainingIncome -= taxableAmount;
  }
  
  return Math.round(tax);
};

/**
 * Calcule le salaire brut pour un employé permanent
 * @param components Éléments de rémunération
 * @returns Salaire brut
 */
export const calculatePermanentGrossSalary = (components: SalaryComponents): number => {
  let grossSalary = components.baseSalary || 0;
  
  // Ajout des indemnités
  if (components.allowances) {
    const totalAllowances = Object.values(components.allowances).reduce((sum, value) => sum + (value || 0), 0);
    grossSalary += totalAllowances;
  }
  
  // Ajout des heures supplémentaires
  if (components.overtime && components.overtime.hours && components.overtime.rate) {
    const overtimePay = (components.baseSalary || 0) / 173.33 * components.overtime.hours * components.overtime.rate;
    grossSalary += overtimePay;
  }
  
  // Déduction pour absences non justifiées
  if (components.absences && components.absences > 0) {
    const dailyRate = (components.baseSalary || 0) / 22; // 22 jours ouvrables par mois en moyenne
    grossSalary -= dailyRate * components.absences;
  }
  
  return Math.round(grossSalary);
};

/**
 * Calcule le salaire brut pour un employé vacataire
 * @param components Éléments de rémunération
 * @returns Salaire brut
 */
export const calculateVacataireGrossSalary = (components: SalaryComponents): number => {
  let grossSalary = (components.hourlyRate || 0) * (components.workingHours || 0);
  
  // Ajout des indemnités diverses
  if (components.allowances && components.allowances.other) {
    grossSalary += components.allowances.other;
  }
  
  return Math.round(grossSalary);
};

/**
 * Calcule la cotisation CNSS (part salariale)
 * @param grossSalary Salaire brut
 * @returns Montant de la cotisation CNSS salariale
 */
export const calculateCNSSEmployee = (grossSalary: number): number => {
  const cnssSalary = Math.min(grossSalary, CNSS_CEILING);
  return Math.round((cnssSalary * CNSS_EMPLOYEE_RATE) / 100);
};

/**
 * Calcule la cotisation CNSS (part patronale)
 * @param grossSalary Salaire brut
 * @returns Montant de la cotisation CNSS patronale
 */
export const calculateCNSSEmployer = (grossSalary: number): number => {
  const cnssSalary = Math.min(grossSalary, CNSS_CEILING);
  return Math.round((cnssSalary * CNSS_EMPLOYER_RATE) / 100);
};

/**
 * Calcule la taxe de formation professionnelle
 * @param grossSalary Salaire brut
 * @returns Montant de la taxe de formation professionnelle
 */
export const calculateTrainingTax = (grossSalary: number): number => {
  return Math.round((grossSalary * PROFESSIONAL_TRAINING_TAX) / 100);
};

/**
 * Calcule le revenu imposable
 * @param grossSalary Salaire brut
 * @param cnssEmployee Cotisation CNSS salariale
 * @returns Revenu imposable
 */
export const calculateTaxableIncome = (grossSalary: number, cnssEmployee: number): number => {
  return grossSalary - cnssEmployee;
};

/**
 * Calcule le salaire net
 * @param taxableIncome Revenu imposable
 * @param irpp Montant de l'IRPP
 * @param deductions Autres déductions
 * @returns Salaire net
 */
export const calculateNetSalary = (taxableIncome: number, irpp: number, deductions: Deductions): number => {
  const totalDeductions = (deductions.advance || 0) + (deductions.loan || 0) + (deductions.other || 0);
  return Math.round(taxableIncome - irpp - totalDeductions);
};

/**
 * Calcule le coût total employeur
 * @param grossSalary Salaire brut
 * @param cnssEmployer Cotisation CNSS patronale
 * @param trainingTax Taxe de formation professionnelle
 * @returns Coût total employeur
 */
export const calculateTotalEmployerCost = (grossSalary: number, cnssEmployer: number, trainingTax: number): number => {
  return Math.round(grossSalary + cnssEmployer + trainingTax);
};

/**
 * Effectue tous les calculs de paie pour un employé
 * @param employeeType Type d'employé (permanent ou vacataire)
 * @param components Éléments de rémunération
 * @param deductions Déductions
 * @returns Résultats complets des calculs de paie
 */
export const calculateFullPayroll = (
  employeeType: EmployeeType,
  components: SalaryComponents,
  deductions: Deductions
): PayrollResults => {
  // Calcul du salaire brut selon le type d'employé
  const grossSalary = employeeType === 'permanent'
    ? calculatePermanentGrossSalary(components)
    : calculateVacataireGrossSalary(components);
  
  // Calcul des cotisations CNSS
  const cnssSalary = Math.min(grossSalary, CNSS_CEILING);
  const cnssEmployee = calculateCNSSEmployee(grossSalary);
  const cnssEmployer = calculateCNSSEmployer(grossSalary);
  
  // Calcul du revenu imposable
  const taxableIncome = calculateTaxableIncome(grossSalary, cnssEmployee);
  
  // Calcul de l'IRPP
  const irpp = calculateIRPP(taxableIncome);
  
  // Calcul du salaire net
  const netSalary = calculateNetSalary(taxableIncome, irpp, deductions);
  
  // Calcul du coût total employeur
  const trainingTax = calculateTrainingTax(grossSalary);
  const totalEmployerCost = calculateTotalEmployerCost(grossSalary, cnssEmployer, trainingTax);
  
  return {
    grossSalary,
    cnssSalary,
    cnssEmployee,
    cnssEmployer,
    taxableIncome,
    irpp,
    netSalary,
    totalEmployerCost
  };
};

/**
 * Génère un numéro de bulletin de paie unique
 * @param employeeId Identifiant de l'employé
 * @param period Période de paie (format YYYY-MM)
 * @returns Numéro de bulletin de paie
 */
export const generatePayslipNumber = (employeeId: string, period: string): string => {
  const [year, month] = period.split('-');
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY-${year}${month}-${employeeId}-${randomSuffix}`;
};

/**
 * Formate un montant en F CFA
 * @param amount Montant à formater
 * @returns Montant formaté
 */
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};