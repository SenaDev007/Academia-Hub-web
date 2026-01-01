import React, { useState, useEffect } from 'react';
import { Clock, Settings, CheckCircle, AlertTriangle, X, Save } from 'lucide-react';
import { WorkHoursConfig } from '../../types/planning';

interface WorkHoursConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WorkHoursConfig) => Promise<void>;
  currentConfig?: WorkHoursConfig | null;
}

const WorkHoursConfigModal: React.FC<WorkHoursConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}) => {
  const [formData, setFormData] = useState({
    defaultWorkingHours: 8,
    overtimeThreshold: 40,
    maxDailyHours: 10,
    maxWeeklyHours: 50,
    alertThresholds: {
      absenceHours: 2,
      overtimeHours: 5
    },
    payrollIntegration: {
      enabled: false,
      autoGenerateReports: false,
      reportGenerationDay: 25
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        defaultWorkingHours: currentConfig.defaultWorkingHours,
        overtimeThreshold: currentConfig.overtimeThreshold,
        maxDailyHours: currentConfig.maxDailyHours,
        maxWeeklyHours: currentConfig.maxWeeklyHours,
        alertThresholds: currentConfig.alertThresholds,
        payrollIntegration: currentConfig.payrollIntegration
      });
    }
  }, [currentConfig]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.defaultWorkingHours <= 0) {
      newErrors.defaultWorkingHours = 'Les heures de travail par défaut doivent être positives';
    }

    if (formData.maxDailyHours <= 0) {
      newErrors.maxDailyHours = 'Le maximum d\'heures par jour doit être positif';
    }

    if (formData.maxWeeklyHours <= 0) {
      newErrors.maxWeeklyHours = 'Le maximum d\'heures par semaine doit être positif';
    }

    if (formData.maxDailyHours > formData.maxWeeklyHours) {
      newErrors.maxDailyHours = 'Le maximum d\'heures par jour ne peut pas dépasser le maximum par semaine';
    }

    if (formData.overtimeThreshold < formData.defaultWorkingHours) {
      newErrors.overtimeThreshold = 'Le seuil d\'heures supplémentaires doit être supérieur aux heures par défaut';
    }

    if (formData.alertThresholds.absenceHours < 0) {
      newErrors.absenceHours = 'Le seuil d\'alerte d\'absence ne peut pas être négatif';
    }

    if (formData.alertThresholds.overtimeHours < 0) {
      newErrors.overtimeHours = 'Le seuil d\'alerte d\'heures supplémentaires ne peut pas être négatif';
    }

    if (formData.payrollIntegration.reportGenerationDay < 1 || formData.payrollIntegration.reportGenerationDay > 31) {
      newErrors.reportGenerationDay = 'Le jour de génération doit être entre 1 et 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Configuration des heures de travail
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configurez les paramètres de gestion des heures travaillées
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Heures de travail par défaut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Heures de travail par défaut (h/jour)
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="24"
              value={formData.defaultWorkingHours}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultWorkingHours: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {errors.defaultWorkingHours && (
              <p className="text-red-500 text-sm mt-1">{errors.defaultWorkingHours}</p>
            )}
          </div>

          {/* Limites d'heures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum d'heures par jour
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={formData.maxDailyHours}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDailyHours: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.maxDailyHours && (
                <p className="text-red-500 text-sm mt-1">{errors.maxDailyHours}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum d'heures par semaine
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="168"
                value={formData.maxWeeklyHours}
                onChange={(e) => setFormData(prev => ({ ...prev, maxWeeklyHours: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.maxWeeklyHours && (
                <p className="text-red-500 text-sm mt-1">{errors.maxWeeklyHours}</p>
              )}
            </div>
          </div>

          {/* Seuil d'heures supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seuil d'heures supplémentaires (h/semaine)
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={formData.overtimeThreshold}
              onChange={(e) => setFormData(prev => ({ ...prev, overtimeThreshold: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {errors.overtimeThreshold && (
              <p className="text-red-500 text-sm mt-1">{errors.overtimeThreshold}</p>
            )}
          </div>

          {/* Seuils d'alerte */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Seuils d'alerte
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seuil d'alerte d'absence (h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.alertThresholds.absenceHours}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    alertThresholds: { 
                      ...prev.alertThresholds, 
                      absenceHours: parseFloat(e.target.value) || 0 
                    } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.absenceHours && (
                  <p className="text-red-500 text-sm mt-1">{errors.absenceHours}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seuil d'alerte d'heures sup (h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.alertThresholds.overtimeHours}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    alertThresholds: { 
                      ...prev.alertThresholds, 
                      overtimeHours: parseFloat(e.target.value) || 0 
                    } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.overtimeHours && (
                  <p className="text-red-500 text-sm mt-1">{errors.overtimeHours}</p>
                )}
              </div>
            </div>
          </div>

          {/* Intégration paie */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Intégration avec la paie
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="payrollEnabled"
                  checked={formData.payrollIntegration.enabled}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    payrollIntegration: { 
                      ...prev.payrollIntegration, 
                      enabled: e.target.checked 
                    } 
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="payrollEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activer l'intégration avec la paie
                </label>
              </div>

              {formData.payrollIntegration.enabled && (
                <div className="space-y-4 pl-7">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoGenerateReports"
                      checked={formData.payrollIntegration.autoGenerateReports}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        payrollIntegration: { 
                          ...prev.payrollIntegration, 
                          autoGenerateReports: e.target.checked 
                        } 
                      }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="autoGenerateReports" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Génération automatique des rapports
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jour de génération automatique (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.payrollIntegration.reportGenerationDay}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        payrollIntegration: { 
                          ...prev.payrollIntegration, 
                          reportGenerationDay: parseInt(e.target.value) || 25 
                        } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors.reportGenerationDay && (
                      <p className="text-red-500 text-sm mt-1">{errors.reportGenerationDay}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkHoursConfigModal;
