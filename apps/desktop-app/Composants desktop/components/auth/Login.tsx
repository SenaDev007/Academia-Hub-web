import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  ArrowRight,
  ArrowLeft,
  User,
  Key,
  Smartphone
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import AuthLayout from './AuthLayout';

const Login: React.FC = () => {
  const { login, isLoading, error, clearError, isOffline, getRememberedIdentifier } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
    twoFactorCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorMethods, setTwoFactorMethods] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  // Vérifier si le compte est verrouillé
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setInterval(() => {
        if (new Date() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          setLoginAttempts(0);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Charger l'identifiant sauvegardé au montage du composant
  useEffect(() => {
    const rememberedIdentifier = getRememberedIdentifier();
    if (rememberedIdentifier) {
      setFormData(prev => ({
        ...prev,
        identifier: rememberedIdentifier,
        rememberMe: true
      }));
      console.log('💾 Identifiant restauré:', rememberedIdentifier);
    }
  }, [getRememberedIdentifier]);

  // Nettoyer les erreurs au changement
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.identifier, formData.password]);

  // Fonction pour nettoyer le localStorage
  const clearStoredData = () => {
    localStorage.removeItem('academia-hub-user-id');
    localStorage.removeItem('academia-hub-remembered-identifier');
    localStorage.removeItem('academia-hub-session');
    console.log('🧹 Données localStorage nettoyées');
    // Recharger la page pour appliquer les changements
    window.location.reload();
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Nettoyer les erreurs de validation
    if (validation[name]) {
      setValidation(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.identifier.trim()) {
      errors.identifier = 'L\'email ou le téléphone est requis';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setValidation({ general: 'Compte temporairement verrouillé. Veuillez réessayer plus tard.' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await login(
        formData.identifier,
        formData.password,
        formData.rememberMe,
        formData.twoFactorCode || undefined
      );

      if (success) {
        navigate('/dashboard');
      } else {
        // Gérer les tentatives de connexion échouées
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          
          if (newAttempts >= 5) {
            setIsLocked(true);
            setLockoutTime(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
            setValidation({ general: 'Trop de tentatives échouées. Compte verrouillé pendant 15 minutes.' });
          } else if (newAttempts >= 3) {
            setValidation({ general: `Tentative ${newAttempts}/5. Attention, le compte sera verrouillé après 5 tentatives.` });
          } else {
            setValidation({ general: 'Identifiants incorrects. Veuillez réessayer.' });
          }
          
          return newAttempts;
        });
      }
    } catch (error: any) {
      setValidation({ general: error.message || 'Erreur lors de la connexion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la réinitialisation du mot de passe
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Formatage du temps de verrouillage
  const getLockoutTimeRemaining = () => {
    if (!lockoutTime) return '';
    
    const now = new Date();
    const diff = lockoutTime.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout
      title="Bienvenue de retour"
      subtitle="Connectez-vous à votre espace personnel sécurisé"
    >
      <div className="p-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l'accueil</span>
          </button>
        </div>

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Bouton de nettoyage temporaire */}
        <div className="mb-4 text-center">
          <button
            type="button"
            onClick={clearStoredData}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            🧹 Nettoyer les données stockées
          </button>
        </div>

        {/* Affichage du verrouillage */}
        {isLocked && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Compte temporairement verrouillé
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Temps restant: {getLockoutTimeRemaining()}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifiant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email ou Téléphone *
            </label>
            <div className="relative">
              {formData.identifier.includes('@') ? (
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              ) : (
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              )}
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                disabled={isLocked}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validation.identifier 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                placeholder="votre@email.com ou +229 XX XX XX XX"
              />
            </div>
            {validation.identifier && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validation.identifier}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLocked}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validation.password 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validation.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validation.password}
              </p>
            )}
          </div>

          {/* Authentification à deux facteurs */}
          {requiresTwoFactor && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center mb-3">
                <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Authentification à deux facteurs
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Entrez le code de vérification envoyé à votre {twoFactorMethods.join(' ou ')}
              </p>
              <input
                type="text"
                name="twoFactorCode"
                value={formData.twoFactorCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-blue-300 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Code de vérification"
                maxLength={6}
              />
            </div>
          )}

          {/* Options de connexion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLocked}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Se souvenir de moi
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLocked}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>

          {/* Affichage des erreurs */}
          {(error || validation.general) && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error || validation.general}
                </p>
              </div>
            </div>
          )}

          {/* Bouton de connexion */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading || isLocked}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
            </div>
          </div>

          {/* Lien vers l'inscription */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Informations de sécurité */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Shield className="w-3 h-3 mr-1" />
              Connexion sécurisée avec chiffrement SSL
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
