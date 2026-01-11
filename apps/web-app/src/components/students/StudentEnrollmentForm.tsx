/**
 * ============================================================================
 * STUDENT ENROLLMENT FORM - FORMULAIRE D'INSCRIPTION AVEC RÉGIME TARIFAIRE
 * ============================================================================
 * 
 * Formulaire complet d'inscription d'élève avec sélection du régime tarifaire
 * 
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';

interface FeeRegime {
  id: string;
  code: string;
  label: string;
  description?: string;
  isDefault: boolean;
  rules: Array<{
    feeType: string;
    discountType: string;
    discountValue: number;
  }>;
}

interface StudentEnrollmentFormProps {
  academicYearId: string;
  schoolLevelId: string;
  onSubmit: (data: {
    student: any;
    feeProfile: {
      feeRegimeId: string;
      justification?: string;
    };
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export default function StudentEnrollmentForm({
  academicYearId,
  schoolLevelId,
  onSubmit,
  onCancel,
  initialData,
}: StudentEnrollmentFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Informations élève
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    nationality: initialData?.nationality || '',
    primaryLanguage: initialData?.primaryLanguage || 'FR',
    // Régime tarifaire
    feeRegimeId: '',
    justification: '',
  });

  // Régimes disponibles
  const [regimes, setRegimes] = useState<FeeRegime[]>([]);
  const [selectedRegime, setSelectedRegime] = useState<FeeRegime | null>(null);
  const [isLoadingRegimes, setIsLoadingRegimes] = useState(false);

  // Charger les régimes tarifaires
  useEffect(() => {
    loadRegimes();
  }, [academicYearId, schoolLevelId]);

  const loadRegimes = async () => {
    setIsLoadingRegimes(true);
    try {
      const params = new URLSearchParams({
        academicYearId,
        schoolLevelId,
      });

      const response = await fetch(`/api/finance/fee-regimes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRegimes(data);

        // Sélectionner le régime par défaut
        const defaultRegime = data.find((r: FeeRegime) => r.isDefault);
        if (defaultRegime) {
          setSelectedRegime(defaultRegime);
          setFormData((prev) => ({ ...prev, feeRegimeId: defaultRegime.id }));
        }
      }
    } catch (error) {
      console.error('Failed to load fee regimes:', error);
      setError('Impossible de charger les régimes tarifaires');
    } finally {
      setIsLoadingRegimes(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleRegimeChange = (regimeId: string) => {
    const regime = regimes.find((r) => r.id === regimeId);
    setSelectedRegime(regime || null);
    handleInputChange('feeRegimeId', regimeId);
    
    // Réinitialiser la justification si ce n'est pas une réduction
    if (regime?.code !== 'REDUCTION') {
      handleInputChange('justification', '');
    }
  };

  const validateStep1 = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('Le prénom est obligatoire');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.feeRegimeId) {
      setError('Veuillez sélectionner un régime tarifaire');
      return false;
    }

    const regime = regimes.find((r) => r.id === formData.feeRegimeId);
    if (regime?.code === 'REDUCTION' && !formData.justification.trim()) {
      setError('Une justification est obligatoire pour les réductions');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setError(null);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        student: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined,
          nationality: formData.nationality || undefined,
          primaryLanguage: formData.primaryLanguage,
        },
        feeProfile: {
          feeRegimeId: formData.feeRegimeId,
          justification: formData.justification || undefined,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRegimeBadgeColor = (code: string) => {
    switch (code) {
      case 'STANDARD':
        return 'bg-blue-100 text-blue-800';
      case 'ENFANT_ENSEIGNANT':
        return 'bg-green-100 text-green-800';
      case 'REDUCTION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegimeLabel = (code: string) => {
    switch (code) {
      case 'STANDARD':
        return 'Standard';
      case 'ENFANT_ENSEIGNANT':
        return 'Enfant d\'enseignant';
      case 'REDUCTION':
        return 'Réduction exceptionnelle';
      default:
        return code;
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="ml-2 text-sm font-medium">Informations élève</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200" />
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            2
          </div>
          <span className="ml-2 text-sm font-medium">Régime tarifaire</span>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Étape 1 : Informations élève */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                Remplissez les informations de base de l'élève. Vous pourrez sélectionner le régime tarifaire à l'étape suivante.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationalité
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Béninoise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Langue principale
              </label>
              <select
                value={formData.primaryLanguage}
                onChange={(e) => handleInputChange('primaryLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FR">Français</option>
                <option value="EN">Anglais</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Étape 2 : Régime tarifaire */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 mb-1">
                Sélection du régime de scolarité
              </p>
              <p className="text-sm text-blue-700">
                Cette décision impacte toute l'année scolaire. Le régime peut être modifié uniquement par la direction.
              </p>
            </div>
          </div>

          {isLoadingRegimes ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600">Chargement des régimes...</p>
            </div>
          ) : regimes.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                Aucun régime tarifaire configuré pour ce niveau. Veuillez configurer les régimes dans les paramètres financiers.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {regimes.map((regime) => (
                  <label
                    key={regime.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.feeRegimeId === regime.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="feeRegime"
                        value={regime.id}
                        checked={formData.feeRegimeId === regime.id}
                        onChange={() => handleRegimeChange(regime.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getRegimeBadgeColor(
                                regime.code
                              )}`}
                            >
                              {getRegimeLabel(regime.code)}
                            </span>
                            {regime.isDefault && (
                              <span className="text-xs text-gray-500">(Par défaut)</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {regime.label}
                        </p>
                        {regime.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {regime.description}
                          </p>
                        )}
                        {regime.rules.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-gray-700">
                              Règles de réduction :
                            </p>
                            {regime.rules.map((rule, idx) => (
                              <div key={idx} className="text-xs text-gray-600 ml-4">
                                • {rule.feeType}:{' '}
                                {rule.discountType === 'FIXED'
                                  ? `${rule.discountValue.toLocaleString('fr-FR')} FCFA`
                                  : `${rule.discountValue}%`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Justification pour réduction */}
              {selectedRegime?.code === 'REDUCTION' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justification de la réduction <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.justification}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Expliquez la raison de la réduction (ex: situation sociale, bourse, etc.)"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Cette justification sera validée par la direction.
                  </p>
                </div>
              )}

              {/* Avertissement */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Important
                    </p>
                    <p className="text-sm text-yellow-700">
                      Le régime tarifaire sélectionné sera appliqué pour toute l'année scolaire.
                      Toute modification nécessitera une validation par la direction.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          {step === 2 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Retour
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.feeRegimeId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Enregistrer l'inscription</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

