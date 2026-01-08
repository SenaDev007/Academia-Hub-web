import React, { useState } from 'react';
import FormModal from './FormModal';
import { Brain, Save, TrendingUp, AlertTriangle, Target, Lightbulb, Download } from 'lucide-react';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (insightData: any) => void;
  insightData?: any;
  isEdit?: boolean;
}

const AIInsightModal: React.FC<AIInsightModalProps> = ({
  isOpen,
  onClose,
  onSave,
  insightData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    title: insightData?.title || '',
    insightType: insightData?.insightType || 'trend',
    targetAudience: insightData?.targetAudience || 'teachers',
    analysisScope: insightData?.analysisScope || 'class',
    targetClass: insightData?.targetClass || '',
    targetSubject: insightData?.targetSubject || '',
    period: insightData?.period || 'trimester1',
    includeRecommendations: insightData?.includeRecommendations !== undefined ? insightData.includeRecommendations : true,
    includeComparisons: insightData?.includeComparisons !== undefined ? insightData.includeComparisons : true,
    includeVisualizations: insightData?.includeVisualizations !== undefined ? insightData.includeVisualizations : true,
    confidenceThreshold: insightData?.confidenceThreshold || 80,
    notes: insightData?.notes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier une analyse IA" : "Nouvelle analyse IA"}
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="ai-insight-form"
            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Générer"}
          </button>
        </div>
      }
    >
      <form id="ai-insight-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Paramètres de l'analyse IA
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre de l'analyse*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Analyse des tendances de performance en mathématiques"
              />
            </div>
            
            <div>
              <label htmlFor="insightType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type d'analyse*
              </label>
              <select
                id="insightType"
                name="insightType"
                value={formData.insightType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="trend">Analyse de tendances</option>
                <option value="risk">Détection de décrochage</option>
                <option value="prediction">Prédiction de réussite</option>
                <option value="comparison">Analyse comparative</option>
                <option value="factor">Facteurs de réussite</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Public cible*
              </label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="teachers">Enseignants</option>
                <option value="administration">Administration</option>
                <option value="parents">Parents</option>
                <option value="students">Élèves</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="analysisScope" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Portée de l'analyse*
              </label>
              <select
                id="analysisScope"
                name="analysisScope"
                value={formData.analysisScope}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="school">Établissement entier</option>
                <option value="level">Niveau d'éducation</option>
                <option value="class">Classe spécifique</option>
                <option value="subject">Matière spécifique</option>
                <option value="student">Élève individuel</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="targetClass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe cible
              </label>
              <select
                id="targetClass"
                name="targetClass"
                value={formData.targetClass}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Toutes les classes</option>
                <option value="terminale">Terminale</option>
                <option value="premiere">Première</option>
                <option value="seconde">Seconde</option>
                <option value="troisieme">Troisième</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="targetSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Matière cible
              </label>
              <select
                id="targetSubject"
                name="targetSubject"
                value={formData.targetSubject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Toutes les matières</option>
                <option value="math">Mathématiques</option>
                <option value="physics">Physique-Chimie</option>
                <option value="french">Français</option>
                <option value="history">Histoire-Géographie</option>
                <option value="english">Anglais</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Période*
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="trimester1">1er Trimestre</option>
                <option value="trimester2">2ème Trimestre</option>
                <option value="trimester3">3ème Trimestre</option>
                <option value="annual">Année complète</option>
                <option value="multi_year">Plusieurs années</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Options d'analyse */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Options d'analyse
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeRecommendations"
                name="includeRecommendations"
                checked={formData.includeRecommendations}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeRecommendations" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les recommandations pédagogiques
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeComparisons"
                name="includeComparisons"
                checked={formData.includeComparisons}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeComparisons" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les comparaisons historiques
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeVisualizations"
                name="includeVisualizations"
                checked={formData.includeVisualizations}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeVisualizations" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les visualisations graphiques
              </label>
            </div>
            
            <div className="mt-4">
              <label htmlFor="confidenceThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seuil de confiance IA (%)
              </label>
              <input
                type="range"
                id="confidenceThreshold"
                name="confidenceThreshold"
                min="50"
                max="95"
                step="5"
                value={formData.confidenceThreshold}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>50% (Plus d'insights)</span>
                <span>{formData.confidenceThreshold}%</span>
                <span>95% (Plus précis)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes et instructions spéciales
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Instructions ou questions spécifiques pour l'IA..."
            />
          </div>
        </div>
        
        {/* Aperçu de l'analyse */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-900/30">
          <h4 className="text-lg font-medium text-purple-900 dark:text-purple-300 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Aperçu de l'analyse IA
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.insightType === 'trend' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Analyse de tendances</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identification des patterns d'évolution des résultats dans le temps et des facteurs influençant ces tendances.
                </p>
              </div>
            )}
            
            {formData.insightType === 'risk' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Détection de décrochage</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identification précoce des élèves à risque de décrochage scolaire basée sur plusieurs indicateurs.
                </p>
              </div>
            )}
            
            {formData.insightType === 'prediction' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Prédiction de réussite</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prévision des taux de réussite futurs basée sur l'historique et les tendances actuelles.
                </p>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Données analysées</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Notes et évaluations</li>
                <li>• Assiduité et comportement</li>
                <li>• Historique des performances</li>
                <li>• Facteurs contextuels</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Résultats attendus</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Insights actionnables</li>
                <li>• Recommandations ciblées</li>
                <li>• Visualisations claires</li>
                <li>• Prédictions quantifiées</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exemple d'analyse
            </button>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default AIInsightModal;