/**
 * Exemples d'utilisation du générateur de noms de reçus
 */

import { 
  generateReceiptName, 
  generateSimpleReceiptName, 
  generateCustomReceiptName,
  generatePaymentTypeReceiptName,
  generateOptimalReceiptName,
  formatReceiptNameForDisplay
} from './receiptNameGenerator';

// Exemple 1: Génération complète avec toutes les informations
const fullReceiptName = generateReceiptName({
  schoolName: 'ACADEMIA HUB',
  studentName: 'Jean Dupont',
  paymentDate: '2024-12-15T10:30:00Z',
  paymentAmount: 50000,
  paymentMethod: 'cash'
});
console.log('Reçu complet:', fullReceiptName);
// Résultat: ACADEMIA-2024-12-001-JEAN_DUPONT

// Exemple 2: Génération simple avec date seulement
const simpleReceiptName = generateSimpleReceiptName({
  paymentDate: '2024-12-15T10:30:00Z'
});
console.log('Reçu simple:', simpleReceiptName);
// Résultat: RECU-20241215-001

// Exemple 3: Génération personnalisée avec préfixe
const customReceiptName = generateCustomReceiptName('PAY', {
  paymentDate: '2024-12-15T10:30:00Z'
});
console.log('Reçu personnalisé:', customReceiptName);
// Résultat: PAY-2024-12-001

// Exemple 4: Génération par type de paiement
const paymentTypeReceiptName = generatePaymentTypeReceiptName({
  paymentDate: '2024-12-15T10:30:00Z',
  paymentAmount: 75000,
  paymentMethod: 'mtn_withdrawal'
});
console.log('Reçu par type:', paymentTypeReceiptName);
// Résultat: MTN-20241215-075000

// Exemple 5: Génération optimale (choisit automatiquement le meilleur format)
const optimalReceiptName = generateOptimalReceiptName({
  schoolName: 'École Primaire',
  studentName: 'Marie Claire',
  paymentDate: '2024-12-15T10:30:00Z',
  paymentAmount: 25000,
  paymentMethod: 'cash'
});
console.log('Reçu optimal:', optimalReceiptName);
// Résultat: COLE-2024-12-001-MARIE_CLAIRE

// Exemple 6: Formatage pour l'affichage
const displayName = formatReceiptNameForDisplay(optimalReceiptName);
console.log('Nom formaté pour affichage:', displayName);
// Résultat: COLE - 2024 - 12 - 001 - MARIE_CLAIRE

// Exemple 7: Utilisation dans un composant React
export const useReceiptName = (paymentData: any) => {
  return generateOptimalReceiptName({
    schoolName: paymentData.schoolName,
    studentName: paymentData.studentName,
    paymentDate: paymentData.paymentDate,
    paymentAmount: paymentData.amount,
    paymentMethod: paymentData.method
  });
};

// Exemple 8: Génération en lot pour plusieurs paiements
export const generateBatchReceiptNames = (payments: any[]) => {
  return payments.map((payment, index) => ({
    ...payment,
    receiptNumber: generateOptimalReceiptName({
      schoolName: payment.schoolName,
      studentName: payment.studentName,
      paymentDate: payment.date,
      paymentAmount: payment.amount,
      paymentMethod: payment.method
    }),
    displayReceiptNumber: formatReceiptNameForDisplay(
      generateOptimalReceiptName({
        schoolName: payment.schoolName,
        studentName: payment.studentName,
        paymentDate: payment.date,
        paymentAmount: payment.amount,
        paymentMethod: payment.method
      })
    )
  }));
};
