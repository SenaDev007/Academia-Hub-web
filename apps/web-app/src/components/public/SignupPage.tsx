/**
 * Signup Page Component
 * 
 * Parcours d'onboarding complet :
 * 1. Informations établissement
 * 2. Responsable principal
 * 3. Récapitulatif & Paiement
 * 4. Confirmation & Redirection
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PremiumHeader from '../layout/PremiumHeader';
import { createEstablishment, checkSubdomainAvailability } from '@/services/onboarding.service';
import { generateSubdomain } from '@/lib/utils/subdomain';
import {
  Building,
  User,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader,
  AlertCircle,
  Check,
  X,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FormErrors {
  [key: string]: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [subdomainPreview, setSubdomainPreview] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState<{ subdomain: string; redirectUrl: string } | null>(null);

  const [formData, setFormData] = useState({
    // Établissement
    schoolName: '',
    schoolType: '',
    address: '',
    city: '',
    country: 'Bénin',
    phone: '',
    email: '',
    
    // Responsable
    responsibleName: '',
    responsibleEmail: '',
    responsiblePhone: '',
    password: '',
    passwordConfirm: '',
  });

  // Générer le sous-domaine en temps réel
  useEffect(() => {
    if (formData.schoolName) {
      const generated = generateSubdomain(formData.schoolName);
      setSubdomainPreview(generated);
      
      // Vérifier la disponibilité après un délai
      const timeoutId = setTimeout(() => {
        if (generated.length >= 3) {
          checkSubdomain(generated);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSubdomainPreview('');
      setSubdomainStatus(null);
    }
  }, [formData.schoolName]);

  const checkSubdomain = async (subdomain: string) => {
    setSubdomainStatus('checking');
    try {
      const result = await checkSubdomainAvailability(subdomain);
      setSubdomainStatus(result.available ? 'available' : 'taken');
    } catch (error) {
      setSubdomainStatus(null);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: FormErrors = {};

    if (stepNumber === 1) {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'Le nom de l\'établissement est requis';
      if (!formData.schoolType) newErrors.schoolType = 'Le type d\'établissement est requis';
      if (!formData.country) newErrors.country = 'Le pays est requis';
      if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
      if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    if (stepNumber === 2) {
      if (!formData.responsibleName.trim()) newErrors.responsibleName = 'Le nom du responsable est requis';
      if (!formData.responsibleEmail.trim()) newErrors.responsibleEmail = 'L\'email est requis';
      if (formData.responsibleEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.responsibleEmail)) {
        newErrors.responsibleEmail = 'Format d\'email invalide';
      }
      if (!formData.responsiblePhone.trim()) newErrors.responsiblePhone = 'Le téléphone est requis';
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1 && subdomainStatus === 'taken') {
        setErrors({ ...errors, schoolName: 'Ce nom génère un sous-domaine déjà utilisé. Veuillez modifier le nom.' });
        return;
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handlePayment = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // TODO: Intégrer Fedapay ici
      // Pour l'instant, on simule un paiement réussi
      const paymentId = `pay_${Date.now()}`;

      // Créer l'établissement
      const result = await createEstablishment({
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        responsibleName: formData.responsibleName,
        responsibleEmail: formData.responsibleEmail,
        responsiblePhone: formData.responsiblePhone,
        password: formData.password,
        paymentId,
        paymentStatus: 'completed',
      });

      setOnboardingResult(result);
      setStep(4);

      // Rediriger automatiquement après 3 secondes
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 3000);

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la création de l\'établissement';
      setErrors({ submit: errorMessage });
      
      // Si l'erreur est critique, rediriger vers la page d'erreur
      if (errorMessage.includes('sous-domaine') || errorMessage.includes('email')) {
        setTimeout(() => {
          router.push(`/onboarding-error?error=${encodeURIComponent(errorMessage)}`);
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = 100000;

  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      <div className="h-20" />

      {/* Progress Bar */}
      {step < 4 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-navy-900' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>Établissement</span>
              <span>Responsable</span>
              <span>Paiement</span>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Étape 1 : Informations Établissement */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Informations de l'établissement</h2>
              <p className="text-slate-600 mb-8">Renseignez les informations de votre établissement scolaire</p>
              
              <div className="bg-gray-50 rounded-lg p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nom officiel de l'établissement *
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    required
                    value={formData.schoolName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                      errors.schoolName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: École Primaire Les Étoiles"
                  />
                  {errors.schoolName && (
                    <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>
                  )}
                  
                  {/* Prévisualisation du sous-domaine */}
                  {subdomainPreview && (
                    <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">Votre sous-domaine :</span>
                        <span className="font-mono font-semibold text-navy-900">
                          {subdomainPreview}.academiahub.com
                        </span>
                        {subdomainStatus === 'checking' && (
                          <Loader className="w-4 h-4 animate-spin text-slate-400" />
                        )}
                        {subdomainStatus === 'available' && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        {subdomainStatus === 'taken' && (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {subdomainStatus === 'taken' && (
                        <p className="mt-2 text-xs text-red-600">
                          Ce sous-domaine est déjà utilisé. Un suffixe sera ajouté automatiquement.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Type d'établissement *
                  </label>
                  <select
                    name="schoolType"
                    required
                    value={formData.schoolType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                      errors.schoolType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="maternelle">Maternelle</option>
                    <option value="primaire">Primaire</option>
                    <option value="secondaire">Secondaire</option>
                    <option value="mixte">Mixte (Primaire + Secondaire)</option>
                    <option value="universitaire">Universitaire</option>
                  </select>
                  {errors.schoolType && (
                    <p className="mt-1 text-sm text-red-600">{errors.schoolType}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Pays *</label>
                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="Bénin">Bénin</option>
                      <option value="Togo">Togo</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Sénégal">Sénégal</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900"
                      placeholder="Ex: Cotonou"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Adresse</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900"
                    placeholder="Adresse complète de l'établissement"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Téléphone de l'établissement *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+229 XX XX XX XX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email de l'établissement *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="contact@ecole.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button onClick={handleNext} className="btn-primary-crimson flex items-center">
                  Continuer <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 : Responsable Principal */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Responsable principal</h2>
              <p className="text-slate-600 mb-8">Créez le compte administrateur principal de l'établissement</p>
              
              <div className="bg-gray-50 rounded-lg p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="responsibleName"
                    required
                    value={formData.responsibleName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                      errors.responsibleName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Jean DUPONT"
                  />
                  {errors.responsibleName && (
                    <p className="mt-1 text-sm text-red-600">{errors.responsibleName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="responsibleEmail"
                      required
                      value={formData.responsibleEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                        errors.responsibleEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="jean.dupont@ecole.com"
                    />
                    {errors.responsibleEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.responsibleEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="responsiblePhone"
                      required
                      value={formData.responsiblePhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                        errors.responsiblePhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+229 XX XX XX XX"
                    />
                    {errors.responsiblePhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.responsiblePhone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 pr-10 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Minimum 8 caractères"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="passwordConfirm"
                      required
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 ${
                        errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Répétez le mot de passe"
                    />
                    {errors.passwordConfirm && (
                      <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="flex items-center text-slate-600 hover:text-navy-900">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </button>
                <button onClick={handleNext} className="btn-primary-crimson flex items-center">
                  Continuer <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Récapitulatif & Paiement */}
          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Récapitulatif et paiement</h2>
              <p className="text-slate-600 mb-8">Vérifiez les informations et procédez au paiement</p>
              
              <div className="space-y-6">
                {/* Récapitulatif */}
                <div className="bg-gray-50 rounded-lg p-8 space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Récapitulatif</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Établissement :</span>
                      <p className="font-semibold text-navy-900">{formData.schoolName}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Type :</span>
                      <p className="font-semibold text-navy-900">{formData.schoolType}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Sous-domaine :</span>
                      <p className="font-mono font-semibold text-navy-900">
                        {subdomainPreview}.academiahub.com
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Responsable :</span>
                      <p className="font-semibold text-navy-900">{formData.responsibleName}</p>
                    </div>
                  </div>
                </div>

                {/* Paiement */}
                <div className="bg-white rounded-lg border-2 border-navy-900 p-8">
                  <div className="text-center mb-8">
                    <CreditCard className="w-16 h-16 text-navy-900 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-navy-900 mb-2">
                      {totalAmount.toLocaleString()} FCFA
                    </div>
                    <p className="text-slate-600">Souscription initiale (paiement unique)</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Accès immédiat à tous les modules • Période d'essai 30 jours
                    </p>
                  </div>

                  {errors.submit && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={isSubmitting}
                    className="w-full btn-primary-crimson flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payer et activer Academia Hub
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center mt-4">
                    Paiement sécurisé via Fedapay
                  </p>
                </div>
              </div>

              <div className="flex justify-start mt-8">
                <button onClick={handleBack} className="flex items-center text-slate-600 hover:text-navy-900">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 : Confirmation */}
          {step === 4 && onboardingResult && (
            <div className="text-center">
              <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Votre établissement est activé !
              </h2>
              
              <p className="text-lg text-slate-600 mb-8">
                Votre compte a été créé avec succès. Vous allez être redirigé automatiquement vers votre plateforme.
              </p>

              <div className="bg-gray-50 rounded-lg p-8 mb-8">
                <div className="space-y-4 text-left">
                  <div>
                    <span className="text-slate-600">Sous-domaine :</span>
                    <p className="font-mono font-semibold text-navy-900 text-lg">
                      {onboardingResult.subdomain}.academiahub.com
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Statut :</span>
                    <p className="font-semibold text-green-600">Période d'essai active (30 jours)</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <a
                  href={onboardingResult.redirectUrl}
                  className="btn-primary-crimson inline-flex items-center"
                >
                  Accéder à la plateforme
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <p className="text-sm text-slate-500">
                  Redirection automatique dans quelques secondes...
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
