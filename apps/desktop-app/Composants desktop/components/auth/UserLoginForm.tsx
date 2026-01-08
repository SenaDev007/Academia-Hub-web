import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { UserLoginData, ValidationResult } from '../../types/user';
import { userService } from '../../services/userService';
import { useUser } from '../../contexts/UserContext';

interface UserLoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

const UserLoginForm: React.FC<UserLoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo
}) => {
  const { login, isLoading, error, clearError } = useUser();
  
  const [formData, setFormData] = useState<UserLoginData>({
    identifier: '',
    password: '',
    rememberMe: false,
    twoFactorCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: {} });
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

  // Nettoyer les erreurs au changement
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.identifier, formData.password]);

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Nettoyer les erreurs de validation
    if (validation.errors[name]) {
      setValidation(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' }
      }));
    }
  };

  // Validation du formulaire
  const validateForm = (): ValidationResult => {
    const result = userService.validateLoginData(formData);
    setValidation(result);
    return result;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      onError?.('Compte temporairement verrouillé. Veuillez réessayer plus tard.');
      return;
    }

    if (!validateForm().isValid) {
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
        onSuccess?.();
      } else {
        // Gérer les tentatives de connexion échouées
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          
          if (newAttempts >= 5) {
            setIsLocked(true);
            setLockoutTime(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
            onError?.('Trop de tentatives échouées. Compte verrouillé pendant 15 minutes.');
          } else if (newAttempts >= 3) {
            onError?.(`Tentative ${newAttempts}/5. Attention, le compte sera verrouillé après 5 tentatives.`);
          } else {
            onError?.('Identifiants incorrects. Veuillez réessayer.');
          }
          
          return newAttempts;
        });
      }
    } catch (error: any) {
      onError?.(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la réinitialisation du mot de passe
  const handleForgotPassword = async () => {
    if (!formData.identifier) {
      onError?.('Veuillez saisir votre email ou téléphone pour réinitialiser le mot de passe.');
      return;
    }

    try {
      const result = await userService.requestPasswordReset(formData.identifier);
      if (result.success) {
        onSuccess?.(); // Rediriger vers la page de confirmation
      } else {
        onError?.(result.message);
      }
    } catch (error: any) {
      onError?.(error.message || 'Erreur lors de la demande de réinitialisation');
    }
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
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Connexion
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Accédez à votre espace personnel
        </p>
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
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validation.errors.identifier 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="votre@email.com ou +229 XX XX XX XX"
            />
          </div>
          {validation.errors.identifier && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validation.errors.identifier}
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
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validation.errors.password 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Votre mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLocked}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {validation.errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validation.errors.password}
            </p>
          )}
        </div>

        {/* Authentification à deux facteurs */}
        {requiresTwoFactor && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
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
              className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Bouton de connexion */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading || isLocked}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
              </>
            )}
          </button>
        </div>

        {/* Informations de sécurité */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Connexion sécurisée avec chiffrement SSL
          </p>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;
