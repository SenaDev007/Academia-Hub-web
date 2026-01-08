import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Key,
  ArrowRight
} from 'lucide-react';
import AuthLayout from './AuthLayout';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});

  // Gestion du changement d'email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validation.email) {
      setValidation(prev => ({ ...prev, email: '' }));
    }
  };

  // Validation de l'email
  const validateEmail = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulation de l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous appelleriez votre service de réinitialisation
      // await userService.requestPasswordReset(email);
      
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Email envoyé"
        subtitle="Vérifiez votre boîte de réception"
        showFeatures={false}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Email de réinitialisation envoyé
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Instructions importantes
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Vérifiez votre dossier spam si vous ne recevez pas l'email</li>
                  <li>• Le lien est valide pendant 24 heures</li>
                  <li>• Ne partagez jamais ce lien avec d'autres personnes</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Réessayer avec un autre email
            </button>
            
            <Link
              to="/login"
              className="block w-full text-center px-6 py-3 text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Nous vous aiderons à récupérer l'accès à votre compte"
    >
      <div className="p-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Réinitialiser le mot de passe
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validation.email 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white transition-colors`}
                placeholder="votre@email.com"
              />
            </div>
            {validation.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validation.email}
              </p>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Informations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Processus de réinitialisation
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Nous vous enverrons un email avec un lien sécurisé</li>
                  <li>• Cliquez sur le lien pour créer un nouveau mot de passe</li>
                  <li>• Le lien expire après 24 heures pour votre sécurité</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Envoyer le lien de réinitialisation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Lien vers la connexion */}
          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à la connexion
            </Link>
          </div>

          {/* Informations de sécurité */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Shield className="w-3 h-3 mr-1" />
              Processus sécurisé et chiffré
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
