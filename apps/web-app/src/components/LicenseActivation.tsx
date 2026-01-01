import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, Mail, Download, CheckCircle, AlertCircle, Copy, Send } from 'lucide-react';

interface LicenseActivationProps {
  productKey: string;
  schoolName: string;
  promoterEmail: string;
}

const LicenseActivation: React.FC<LicenseActivationProps> = ({ 
  productKey, 
  schoolName, 
  promoterEmail 
}) => {
  const [step, setStep] = useState<'product-key' | 'activation' | 'success'>('product-key');
  const [activationKey, setActivationKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleActivationKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationKey.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Simuler la validation de la clé d'activation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous appelleriez votre service de licence pour valider la clé
      // const result = await licenseService.validateActivationKey(activationKey);
      
      // Pour l'exemple, on simule une validation réussie
      setStep('success');
    } catch (err) {
      setError('Erreur lors de la validation de la clé d\'activation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Activer le mode démo (15 jours)
    setStep('success');
  };

  const sendProductKeyEmail = async () => {
    try {
      // Ici, vous appelleriez votre service pour envoyer l'email
      // await licenseService.sendProductKeyEmail({...}, promoterEmail);
      
      // Simuler l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Email envoyé avec succès !');
    } catch (err) {
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Licence activée avec succès !
            </h1>
            
            <p className="text-gray-600 mb-6">
              Votre école <strong>{schoolName}</strong> est maintenant activée.
              Vous pouvez commencer à utiliser Academia Hub.
            </p>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300"
            >
              Accéder au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30"></div>
                <Key className="relative w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Activation de votre licence</h1>
            <p className="text-gray-600">École: {schoolName}</p>
          </div>

          {step === 'product-key' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Clé produit générée
                </h3>
                
                <div className="bg-white border border-blue-300 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono text-blue-800">{productKey}</code>
                    <button
                      onClick={() => copyToClipboard(productKey)}
                      className="ml-2 p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Copier la clé"
                    >
                      {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <p className="text-blue-700 text-sm mb-4">
                  Cette clé produit a été générée pour votre école. 
                  Veuillez l'envoyer à notre équipe pour obtenir votre clé d'activation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={sendProductKeyEmail}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer par email
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(productKey)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier la clé
                  </button>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Prochaines étapes
                </h3>
                
                <ol className="text-orange-800 text-sm space-y-2">
                  <li>1. Copiez la clé produit ci-dessus</li>
                  <li>2. Envoyez-la à <strong>yehiortech@gmail.com</strong></li>
                  <li>3. Notre équipe vérifiera et vous enverra votre clé d'activation</li>
                  <li>4. Utilisez cette clé pour activer votre licence complète</li>
                </ol>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-xs">
                    <strong>Note:</strong> La clé produit est unique à votre école et sera utilisée pour vérifier votre demande.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep('activation')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  J'ai ma clé d'activation
                </button>
                
                <button
                  onClick={handleDemoMode}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Mode démo (15 jours)
                </button>
              </div>
            </div>
          )}

          {step === 'activation' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Activation de votre licence
                </h3>
                
                <form onSubmit={handleActivationKeySubmit} className="space-y-4">
                  <div>
                    <label htmlFor="activationKey" className="block text-sm font-medium text-green-700 mb-2">
                      Clé d'activation
                    </label>
                    <input
                      type="text"
                      id="activationKey"
                      value={activationKey}
                      onChange={(e) => setActivationKey(e.target.value)}
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('product-key')}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Retour
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Activation...
                        </div>
                      ) : (
                        'Activer la licence'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseActivation;
