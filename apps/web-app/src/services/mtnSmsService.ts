// Service MTN SMS pour l'envoi automatique de SMS
// Basé sur l'API MTN SMS v3

import { MTN_SMS_CONFIG, formatPhoneNumber, generateCorrelatorId } from '../config/mtnConfig';

export interface MTNSMSConfig {
  consumerKey: string;
  consumerSecret: string;
  serviceCode: string;
  senderAddress?: string;
}

export interface MTNSMSRequest {
  message: string;
  serviceCode: string;
  receiverAddress: string[];
  clientCorrelatorId: string;
  senderAddress?: string;
  keyword?: string;
  requestDeliveryReceipt?: boolean;
}

export interface MTNSMSResponse {
  statusCode: string;
  statusMessage: string;
  transactionId: string;
  data: {
    status: string;
  };
}

export interface MTNOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface MTNError {
  statusCode: string;
  statusMessage: string;
  supportMessage?: string;
  transactionId?: string;
  timestamp?: string;
  path?: string;
  method?: string;
}

class MTNSMSService {
  private baseUrl = MTN_SMS_CONFIG.SMS_BASE_URL;
  private oauthUrl = MTN_SMS_CONFIG.OAUTH_URL;
  private config: MTNSMSConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config?: MTNSMSConfig) {
    this.config = config || {
      consumerKey: MTN_SMS_CONFIG.CONSUMER_KEY,
      consumerSecret: MTN_SMS_CONFIG.CONSUMER_SECRET,
      serviceCode: MTN_SMS_CONFIG.SERVICE_CODE,
      senderAddress: MTN_SMS_CONFIG.SENDER_ADDRESS
    };
  }

  /**
   * Obtient un token d'accès OAuth2
   */
  private async getAccessToken(): Promise<string> {
    // Vérifier si le token est encore valide
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);
      
      const response = await fetch(this.oauthUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur OAuth2: ${response.status} - ${error}`);
      }

      const tokenData: MTNOAuthResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      // Réduire la durée de vie du token de 5 minutes pour éviter les expirations
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token OAuth2:', error);
      throw error;
    }
  }

  /**
   * Envoie un SMS
   */
  async sendSMS(request: Omit<MTNSMSRequest, 'serviceCode' | 'senderAddress'>): Promise<MTNSMSResponse> {
    try {
      const token = await this.getAccessToken();
      
      const smsRequest: MTNSMSRequest = {
        ...request,
        serviceCode: this.config.serviceCode,
        senderAddress: this.config.senderAddress || this.config.serviceCode,
        requestDeliveryReceipt: true
      };

      const response = await fetch(`${this.baseUrl}/messages/sms/outbound`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smsRequest)
      });

      if (!response.ok) {
        const error: MTNError = await response.json();
        throw new Error(`Erreur SMS MTN: ${error.statusMessage} (${error.statusCode})`);
      }

      const result: MTNSMSResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      throw error;
    }
  }

  /**
   * Envoie un SMS de notification de paiement
   */
  async sendPaymentNotificationSMS(data: {
    parentPhone: string;
    studentName: string;
    amount: number;
    receiptNumber: string;
    schoolName: string;
    transactionId?: string;
  }): Promise<MTNSMSResponse> {
    const message = MTN_SMS_CONFIG.MESSAGE_TEMPLATES.PAYMENT_CONFIRMATION(data);

    return this.sendSMS({
      message,
      receiverAddress: [formatPhoneNumber(data.parentPhone)],
      clientCorrelatorId: data.transactionId || generateCorrelatorId()
    });
  }

  /**
   * Envoie un SMS de rappel de paiement
   */
  async sendPaymentReminderSMS(data: {
    parentPhone: string;
    studentName: string;
    amount: number;
    dueDate: string;
    schoolName: string;
  }): Promise<MTNSMSResponse> {
    const message = MTN_SMS_CONFIG.MESSAGE_TEMPLATES.PAYMENT_REMINDER(data);

    return this.sendSMS({
      message,
      receiverAddress: [formatPhoneNumber(data.parentPhone)],
      clientCorrelatorId: generateCorrelatorId()
    });
  }

  /**
   * Envoie un SMS de confirmation de paiement
   */
  async sendPaymentConfirmationSMS(data: {
    parentPhone: string;
    studentName: string;
    amount: number;
    receiptNumber: string;
    schoolName: string;
    paymentMethod: string;
  }): Promise<MTNSMSResponse> {
    const message = `${data.schoolName}

Paiement confirme
Eleve: ${data.studentName}
Montant: ${data.amount.toLocaleString()} F CFA
No Reçu: ${data.receiptNumber}
Methode: ${data.paymentMethod}

Votre paiement a ete traite avec succes.
Merci pour votre confiance !`;

    return this.sendSMS({
      message,
      receiverAddress: [this.formatPhoneNumber(data.parentPhone)],
      clientCorrelatorId: this.generateCorrelatorId()
    });
  }

  /**
   * Envoie un SMS personnalisé
   */
  async sendCustomSMS(data: {
    parentPhone: string;
    message: string;
    schoolName: string;
  }): Promise<MTNSMSResponse> {
    const fullMessage = MTN_SMS_CONFIG.MESSAGE_TEMPLATES.CUSTOM_MESSAGE(data);

    return this.sendSMS({
      message: fullMessage,
      receiverAddress: [formatPhoneNumber(data.parentPhone)],
      clientCorrelatorId: generateCorrelatorId()
    });
  }

  // Les fonctions formatPhoneNumber et generateCorrelatorId sont maintenant importées depuis mtnConfig

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<MTNSMSConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Réinitialiser le token pour forcer une nouvelle authentification
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return !!(this.config.consumerKey && this.config.consumerSecret && this.config.serviceCode);
  }
}

// Instance par défaut avec configuration depuis mtnConfig
export const mtnSmsService = new MTNSMSService();

export default MTNSMSService;
