import { useState } from 'react';
import { 
  initFedaPayTransaction, 
  checkTransactionStatus,
  FedaPayOptions
} from '../services/paymentService';

interface UsePaymentReturn {
  isLoading: boolean;
  error: string | null;
  transactionId: string | null;
  processPayment: (
    provider: 'fedapay' | 'kkiapay', 
    options: FedaPayOptions | KKiaPayOptions
  ) => Promise<string>;
  verifyPayment: (
    transactionId: string, 
    provider: 'fedapay' | 'kkiapay'
  ) => Promise<boolean>;
}

/**
 * Hook personnalisé pour gérer les paiements
 */
export const usePayment = (): UsePaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  /**
   * Traite un paiement avec le fournisseur spécifié
   */
  const processPayment = async (
    provider: 'fedapay' | 'kkiapay',
    options: FedaPayOptions | KKiaPayOptions
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let id: string;
      
      if (provider === 'fedapay') {
        id = await initFedaPayTransaction(options as FedaPayOptions);
      } else {
        id = await initKKiaPayTransaction(options as KKiaPayOptions);
      }
      
      setTransactionId(id);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors du traitement du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifie le statut d'un paiement
   */
  const verifyPayment = async (
    id: string,
    provider: 'fedapay' | 'kkiapay'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await checkTransactionStatus(id, provider);
      return transaction.status === 'completed';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la vérification du paiement';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    transactionId,
    processPayment,
    verifyPayment
  };
};