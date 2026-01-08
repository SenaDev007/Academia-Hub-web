import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PremiumHeader from '../../components/layout/PremiumHeader';
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader,
  AlertCircle,
  Shield,
  Clock,
  X,
} from 'lucide-react';
import { initFedaPayTransaction, FedaPayOptions } from '../../services/paymentService';

/**
 * Statuts de paiement possibles
 */
type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'cancelled';

/**
 * Page Inscription / Souscription
 * 
 * Objectif : Conversion finale avec intégration Fedapay
 * Parcours : Informations établissement → Responsable → Récapitulatif → Paiement Fedapay → Confirmation
 */
const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    responsibleRole: '',
    responsibleEmail: '',
    responsiblePhone: '',
    
    // Niveaux scolaires
    levels: [] as string[],
  });

  // Vérifier si retour depuis Fedapay
  useEffect(() => {
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');
    
    if (status === 'success' && transactionId) {
      setPaymentStatus('success');
      setTransactionId(transactionId);
      setStep(5); // Aller directement à la confirmation
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      setStep(4); // Retour à l'étape de paiement
    } else if (status === 'cancelled') {
      setPaymentStatus('cancelled');
      setStep(4); // Retour à l'étape de paiement
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleLevelChange = (level: string) => {
    setFormData({
      ...formData,
      levels: formData.levels.includes(level)
        ? formData.levels.filter(l => l !== level)
        : [...formData.levels, level],
    });
  };

  // Validation des étapes
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.schoolName.trim()) newErrors.schoolName = 'Le nom de l\'établissement est obligatoire';
    if (!formData.schoolType) newErrors.schoolType = 'Le type d\'établissement est obligatoire';
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est obligatoire';
    if (!formData.city.trim()) newErrors.city = 'La ville est obligatoire';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (formData.levels.length === 0) newErrors.levels = 'Sélectionnez au moins un niveau scolaire';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.responsibleName.trim()) newErrors.responsibleName = 'Le nom du responsable est obligatoire';
    if (!formData.responsibleRole) newErrors.responsibleRole = 'La fonction est obligatoire';
    if (!formData.responsibleEmail.trim()) {
      newErrors.responsibleEmail = 'L\'email du responsable est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.responsibleEmail)) {
      newErrors.responsibleEmail = 'Format d\'email invalide';
    }
    if (!formData.responsiblePhone.trim()) newErrors.responsiblePhone = 'Le téléphone du responsable est obligatoire';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setPaymentStatus('idle');
    }
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setPaymentStatus('processing');
    
    try {
      // Créer la transaction Fedapay
      const paymentOptions: FedaPayOptions = {
        amount: totalAmount,
        currency: 'XOF',
        description: `Souscription initiale Academia Hub - ${formData.schoolName}`,
        callbackUrl: `${window.location.origin}/signup?status=success`,
        customerEmail: formData.responsibleEmail,
        customerPhone: formData.responsiblePhone,
      };
      
      const transactionId = await initFedaPayTransaction(paymentOptions);
      setTransactionId(transactionId);
      
      // TODO: Enregistrer la transaction côté backend avec les données de l'établissement
      // await createSchoolAccount(formData, transactionId);
      
      // Rediriger vers Fedapay (dans une implémentation réelle)
      // window.location.href = `https://fedapay.com/payment/${transactionId}`;
      
      // Simulation : pour le développement
      setTimeout(() => {
        // Simuler un succès après 2 secondes
        setPaymentStatus('success');
        setStep(5);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement:', error);
      setPaymentStatus('failed');
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus('idle');
    handlePayment();
  };

  const totalAmount = 100000; // 100.000 FCFA

  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* Progress Bar */}
      {step < 5 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-navy-900' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-600">
              <span>Établissement</span>
              <span>Responsable</span>
              <span>Récapitulatif</span>
              <span>Paiement</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Informations Établissement */}
      {step === 1 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Informations de l'établissement
            </h2>
            <p className="text-slate-600 mb-8">
              Remplissez les informations de base de votre établissement scolaire.
            </p>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 space-y-6">
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-900 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                    errors.schoolName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.schoolName && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>
                )}
              </div>

              <div>
                <label htmlFor="schoolType" className="block text-sm font-medium text-gray-900 mb-2">
                  Type d'établissement *
                </label>
                <select
                  id="schoolType"
                  name="schoolType"
                  required
                  value={formData.schoolType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                    errors.schoolType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez...</option>
                  <option value="maternelle">Maternelle</option>
                  <option value="primaire">Primaire</option>
                  <option value="secondaire">Secondaire</option>
                  <option value="mixte">Mixte (Maternelle + Primaire + Secondaire)</option>
                </select>
                {errors.schoolType && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolType}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                  Adresse *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                    Pays *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Niveaux scolaires proposés *
                </label>
                <div className="space-y-2">
                  {['Maternelle', 'Primaire', 'Secondaire'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.levels.includes(level)}
                        onChange={() => handleLevelChange(level)}
                        className="w-4 h-4 text-navy-900 border-gray-300 rounded focus:ring-navy-900"
                      />
                      <span className="ml-2 text-gray-900">{level}</span>
                    </label>
                  ))}
                </div>
                {errors.levels && (
                  <p className="mt-1 text-sm text-red-600">{errors.levels}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                className="bg-crimson-600 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors flex items-center"
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Responsable Principal */}
      {step === 2 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Responsable principal
            </h2>
            <p className="text-slate-600 mb-8">
              Informations du responsable principal de l'établissement.
            </p>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 space-y-6">
              <div>
                <label htmlFor="responsibleName" className="block text-sm font-medium text-gray-900 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="responsibleName"
                  name="responsibleName"
                  required
                  value={formData.responsibleName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                    errors.responsibleName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.responsibleName && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsibleName}</p>
                )}
              </div>

              <div>
                <label htmlFor="responsibleRole" className="block text-sm font-medium text-gray-900 mb-2">
                  Fonction *
                </label>
                <select
                  id="responsibleRole"
                  name="responsibleRole"
                  required
                  value={formData.responsibleRole}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                    errors.responsibleRole ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez...</option>
                  <option value="directeur">Directeur</option>
                  <option value="promoteur">Promoteur</option>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="autre">Autre</option>
                </select>
                {errors.responsibleRole && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsibleRole}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="responsibleEmail" className="block text-sm font-medium text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="responsibleEmail"
                    name="responsibleEmail"
                    required
                    value={formData.responsibleEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                      errors.responsibleEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsibleEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.responsibleEmail}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="responsiblePhone" className="block text-sm font-medium text-gray-900 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="responsiblePhone"
                    name="responsiblePhone"
                    required
                    value={formData.responsiblePhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900 ${
                      errors.responsiblePhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsiblePhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.responsiblePhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-900 px-8 py-3 rounded-md text-base font-semibold hover:bg-gray-300 transition-colors flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
              <button
                onClick={handleNext}
                className="bg-crimson-600 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors flex items-center"
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Récapitulatif */}
      {step === 3 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Récapitulatif
            </h2>
            <p className="text-slate-600 mb-8">
              Vérifiez les informations avant de procéder au paiement.
            </p>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Établissement</h3>
                <div className="space-y-2 text-gray-900">
                  <p><strong>Nom :</strong> {formData.schoolName}</p>
                  <p><strong>Type :</strong> {formData.schoolType}</p>
                  <p><strong>Adresse :</strong> {formData.address}</p>
                  <p><strong>Ville :</strong> {formData.city}, {formData.country}</p>
                  <p><strong>Téléphone :</strong> {formData.phone}</p>
                  <p><strong>Email :</strong> {formData.email}</p>
                  <p><strong>Niveaux :</strong> {formData.levels.join(', ') || 'Aucun'}</p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Responsable</h3>
                <div className="space-y-2 text-gray-900">
                  <p><strong>Nom :</strong> {formData.responsibleName}</p>
                  <p><strong>Fonction :</strong> {formData.responsibleRole}</p>
                  <p><strong>Email :</strong> {formData.responsibleEmail}</p>
                  <p><strong>Téléphone :</strong> {formData.responsiblePhone}</p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Souscription</h3>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-900">Souscription initiale</span>
                    <span className="text-2xl font-bold text-navy-900">{totalAmount.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Accès complet à tous les modules. Période d'essai de 30 jours incluse.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-900 px-8 py-3 rounded-md text-base font-semibold hover:bg-gray-300 transition-colors flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
              <button
                onClick={handleNext}
                className="bg-crimson-600 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors flex items-center"
              >
                Procéder au paiement
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 4: Paiement Fedapay */}
      {step === 4 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Paiement sécurisé
            </h2>
            <p className="text-slate-600 mb-8">
              Finalisez votre souscription en payant via Fedapay.
            </p>

            {/* États de paiement */}
            {paymentStatus === 'processing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  <p className="text-blue-800 font-medium">
                    Votre paiement est en cours de traitement...
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-semibold mb-2">
                      Le paiement a échoué
                    </h3>
                    <p className="text-red-700 text-sm mb-4">
                      Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer ou contacter le support si le problème persiste.
                    </p>
                    <button
                      onClick={handleRetryPayment}
                      className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-red-500 transition-colors"
                    >
                      Réessayer le paiement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'cancelled' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <X className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-yellow-800 font-semibold mb-2">
                      Paiement annulé
                    </h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      Vous avez annulé le paiement. Vous pouvez réessayer à tout moment. Votre compte est en attente d'activation.
                    </p>
                    <button
                      onClick={handleRetryPayment}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Réessayer le paiement
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <div className="text-center mb-8">
                <CreditCard className="w-16 h-16 text-navy-900 mx-auto mb-4" />
                <div className="text-4xl font-bold text-navy-900 mb-2">
                  {totalAmount.toLocaleString()} FCFA
                </div>
                <p className="text-slate-600">Souscription initiale</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  Ce que vous obtenez :
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Accès immédiat à tous les 15 modules</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Configuration de votre établissement par notre équipe</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Formation initiale incluse</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Période d'essai de 30 jours (aucun engagement)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Support technique pendant 30 jours</span>
                  </li>
                </ul>
              </div>

              <div className="bg-navy-50 rounded-lg p-4 mb-6 border-l-4 border-navy-900">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-navy-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-navy-900 mb-1">
                      Paiement sécurisé via Fedapay
                    </p>
                    <p className="text-xs text-gray-700">
                      Vos données sont protégées. Le paiement est traité de manière sécurisée.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isSubmitting || paymentStatus === 'processing'}
                className="w-full bg-crimson-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payer et activer Academia Hub
                  </>
                )}
              </button>

              <p className="text-xs text-slate-600 text-center mt-4">
                Paiement sécurisé via Fedapay • Garantie 30 jours • Aucun engagement
              </p>
            </div>

            <div className="flex justify-start mt-8">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="bg-gray-200 text-gray-900 px-8 py-3 rounded-md text-base font-semibold hover:bg-gray-300 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 5: Confirmation */}
      {step === 5 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-900 mb-2">
                Paiement validé avec succès !
              </h2>
              <p className="text-lg text-green-800">
                Votre compte Academia Hub est maintenant activé.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 mb-6">
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Informations de connexion
              </h3>
              <div className="space-y-3 text-gray-900">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-navy-900" />
                  <div>
                    <p className="text-sm text-gray-600">Email (identifiant)</p>
                    <p className="font-semibold">{formData.responsibleEmail}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">
                    Un email de confirmation a été envoyé à <strong>{formData.responsibleEmail}</strong> avec votre lien de connexion et les instructions pour définir votre mot de passe.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">
                Prochaines étapes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Définissez votre mot de passe</p>
                    <p className="text-sm text-gray-600">Utilisez le lien dans l'email de confirmation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Connectez-vous à votre compte</p>
                    <p className="text-sm text-gray-600">Accédez au dashboard et commencez la configuration</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Configurez votre établissement</p>
                    <p className="text-sm text-gray-600">Définissez vos niveaux, classes et effectifs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 rounded-lg p-6 text-white mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Période d'essai active</p>
                  <p className="text-sm text-gray-300">
                    Votre période d'essai de 30 jours est maintenant active. Vous avez accès à tous les modules. L'abonnement mensuel de 15.000 FCFA démarrera automatiquement après 30 jours.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-crimson-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors flex items-center justify-center"
              >
                Accéder à mon compte
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="flex-1 bg-gray-200 text-gray-900 px-8 py-4 rounded-md text-base font-semibold hover:bg-gray-300 transition-colors"
              >
                Contacter le support
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SignupPage;

