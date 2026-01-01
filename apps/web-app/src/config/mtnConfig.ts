// Configuration MTN SMS
export const MTN_SMS_CONFIG = {
  // Clés API MTN (à configurer dans les variables d'environnement)
  CONSUMER_KEY: process.env.REACT_APP_MTN_CONSUMER_KEY || 'M3Z4DO7pMG4uPEhV9bkCLyd7c0einoq7',
  CONSUMER_SECRET: process.env.REACT_APP_MTN_CONSUMER_SECRET || 'ISPRytvCDIJ7P5Ed',
  
  // Mode test (désactive l'API réelle)
  TEST_MODE: false,
  
  // Configuration SMS
  SERVICE_CODE: process.env.REACT_APP_MTN_SERVICE_CODE || 'ACAD-HUB',
  SENDER_ADDRESS: process.env.REACT_APP_MTN_SENDER_ADDRESS || 'ACAD-HUB',
  
  // URLs API
  SMS_BASE_URL: 'https://api.mtn.com/v3/sms/',
  OAUTH_URL: 'https://api.mtn.com/v1/oauth/access_token/accesstoken?grant_type=client_credentials',
  
  // Configuration des messages
  MESSAGE_TEMPLATES: {
    PAYMENT_CONFIRMATION: (data: {
      schoolName: string;
      studentName: string;
      amount: number;
      receiptNumber: string;
      transactionId?: string;
      amountGiven?: number;
      change?: number;
      totalExpected?: number;
      totalPaid?: number;
      totalRemaining?: number;
    }) => `${data.schoolName}

Paiement de frais scolaires
No Reçu: ${data.receiptNumber}
Eleve: ${data.studentName}

DETAILS DU PAIEMENT
Montant: ${data.amount.toLocaleString()} F CFA
Somme remise: ${data.amountGiven ? data.amountGiven.toLocaleString() : data.amount.toLocaleString()} F CFA
Reliquat: ${data.change ? data.change.toLocaleString() : '0'} F CFA

BILAN DE SCOLARITE
Total attendu: ${data.totalExpected ? data.totalExpected.toLocaleString() : 'N/A'} F CFA
Total verse: ${data.totalPaid ? data.totalPaid.toLocaleString() : 'N/A'} F CFA
Restant a payer: ${data.totalRemaining ? data.totalRemaining.toLocaleString() : 'N/A'} F CFA

Paiement enregistre avec succes !
Merci pour votre confiance.

${data.transactionId ? `ID: ${data.transactionId}` : ''}`,

    PAYMENT_REMINDER: (data: {
      schoolName: string;
      studentName: string;
      amount: number;
      dueDate: string;
    }) => `${data.schoolName}

Rappel de paiement
Eleve: ${data.studentName}
Montant: ${data.amount.toLocaleString()} F CFA
Echeance: ${data.dueDate}

Veuillez effectuer le paiement avant la date limite.
Merci de votre comprehension.`,

    CUSTOM_MESSAGE: (data: {
      schoolName: string;
      message: string;
    }) => `${data.schoolName}

${data.message}`
  }
};

// Fonction pour formater les numéros de téléphone
export const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les espaces et caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 0, le remplacer par +225 (Côte d'Ivoire)
  if (cleaned.startsWith('0')) {
    return '+225' + cleaned.substring(1);
  }
  
  // Si le numéro commence par 225, ajouter +
  if (cleaned.startsWith('225')) {
    return '+' + cleaned;
  }
  
  // Si le numéro commence par +, le retourner tel quel
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Par défaut, ajouter +225
  return '+225' + cleaned;
};

// Fonction pour générer un ID de corrélation unique
export const generateCorrelatorId = (): string => {
  return `academia-sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
