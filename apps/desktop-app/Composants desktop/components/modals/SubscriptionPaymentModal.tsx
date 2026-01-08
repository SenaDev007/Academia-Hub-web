import React, { useState } from 'react';
import FormModal from './FormModal';
import { DollarSign, CreditCard, Phone, CheckCircle, AlertTriangle, Shield, Globe } from 'lucide-react';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  planName?: string;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  planName = ''
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'fedapay' | 'kkiapay'>('fedapay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      setIsSuccess(true);
      
      // Wait a bit before closing the modal
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Paiement de l'abonnement"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Annuler
          </button>
          {!isSuccess && (
            <button
              type="submit"
              form="subscription-payment-form"
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Payer maintenant
                </>
              )}
            </button>
          )}
        </div>
      }
    >
      {isSuccess ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Paiement réussi !</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Votre abonnement {planName} a été activé avec succès.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Un reçu a été envoyé à votre adresse email.
          </p>
        </div>
      ) : (
        <form id="subscription-payment-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Résumé de l'abonnement
            </h4>
            
            <div className="space-y-3">
              {planName && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{planName}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Période:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Mensuel</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{amount.toLocaleString()} F CFA</span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Montant total:</span>
                <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{(amount ?? 0).toLocaleString()} F CFA</span>
              </div>
            </div>
          </div>
          
          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Méthode de paiement
            </h4>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <div className="text-center">
                <Globe className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Paiement avec FedaPay</h5>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                  Vous serez redirigé vers la plateforme sécurisée FedaPay pour finaliser votre paiement.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <img src="https://www.fedapay.com/wp-content/uploads/2020/09/mtn-mobile-money-logo.png" alt="MTN Mobile Money" className="h-8 object-contain" />
                  <img src="https://www.fedapay.com/wp-content/uploads/2020/09/moov-money-logo.png" alt="Moov Money" className="h-8 object-contain" />
                  <img src="https://www.fedapay.com/wp-content/uploads/2020/09/orange-money-logo.png" alt="Orange Money" className="h-8 object-contain" />
                  <img src="https://www.fedapay.com/wp-content/uploads/2020/09/visa-logo.png" alt="Visa" className="h-8 object-contain" />
                  <img src="https://www.fedapay.com/wp-content/uploads/2020/09/mastercard-logo.png" alt="Mastercard" className="h-8 object-contain" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
          
          {/* Security Notice */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vos informations de paiement sont sécurisées et cryptées. Nous ne stockons pas vos données de carte bancaire.
              </p>
            </div>
          </div>
        </form>
      )}
    </FormModal>
  );
};

export default SubscriptionPaymentModal;