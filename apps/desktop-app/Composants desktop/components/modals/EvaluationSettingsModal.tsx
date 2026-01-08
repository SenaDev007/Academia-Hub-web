import React, { useState } from 'react';
import FormModal from './FormModal';
import { Settings, Save } from 'lucide-react';

interface EvaluationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings?: any;
}

const EvaluationSettingsModal: React.FC<EvaluationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState({
    defaultSystem: currentSettings?.defaultSystem || 'benin',
    primaryGradingSystem: currentSettings?.primaryGradingSystem || 'numeric',
    secondaryGradingSystem: currentSettings?.secondaryGradingSystem || 'numeric_weighted',
    enableAPC: currentSettings?.enableAPC || false,
    passingGrade: currentSettings?.passingGrade || 10,
    councilThreshold: currentSettings?.councilThreshold || 8,
    maxGrade: currentSettings?.maxGrade || 20,
    roundingMethod: currentSettings?.roundingMethod || 'round_2_decimals',
    showClassAverage: currentSettings?.showClassAverage || true,
    showRank: currentSettings?.showRank || true,
    commentGeneration: currentSettings?.commentGeneration || 'ai_assisted'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres d'évaluation"
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
            form="settings-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      }
    >
      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Système d'évaluation</h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="defaultSystem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Système d'évaluation par défaut
              </label>
              <select
                id="defaultSystem"
                name="defaultSystem"
                value={settings.defaultSystem}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="benin">Système Béninois</option>
                <option value="french">Système Français</option>
                <option value="custom">Système Personnalisé</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryGradingSystem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notation au primaire
                </label>
                <select
                  id="primaryGradingSystem"
                  name="primaryGradingSystem"
                  value={settings.primaryGradingSystem}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="numeric">Notes sur 20 (sans coefficient)</option>
                  <option value="letter">Lettres (A, B, C, D, E)</option>
                  <option value="qualitative">Qualitatif (TB, B, AB, I)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="secondaryGradingSystem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notation au secondaire
                </label>
                <select
                  id="secondaryGradingSystem"
                  name="secondaryGradingSystem"
                  value={settings.secondaryGradingSystem}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="numeric_weighted">Notes sur 20 (avec coefficients)</option>
                  <option value="numeric_simple">Notes sur 20 (sans coefficient)</option>
                  <option value="letter_weighted">Lettres avec coefficients</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableAPC"
                name="enableAPC"
                checked={settings.enableAPC}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="enableAPC" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Activer l'Approche Par Compétences (APC)
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Paramètres de calcul</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="passingGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note de passage
              </label>
              <input
                type="number"
                id="passingGrade"
                name="passingGrade"
                value={settings.passingGrade}
                onChange={handleChange}
                min="0"
                max="20"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="councilThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seuil conseil de classe (secondaire)
              </label>
              <input
                type="number"
                id="councilThreshold"
                name="councilThreshold"
                value={settings.councilThreshold}
                onChange={handleChange}
                min="0"
                max="20"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="maxGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note maximale
              </label>
              <input
                type="number"
                id="maxGrade"
                name="maxGrade"
                value={settings.maxGrade}
                onChange={handleChange}
                min="10"
                max="100"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="roundingMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Méthode d'arrondi
              </label>
              <select
                id="roundingMethod"
                name="roundingMethod"
                value={settings.roundingMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="round_2_decimals">Arrondi à 2 décimales</option>
                <option value="round_1_decimal">Arrondi à 1 décimale</option>
                <option value="round_nearest">Arrondi à l'entier le plus proche</option>
                <option value="truncate">Troncature (sans arrondi)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Options d'affichage</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="showClassAverage" className="text-sm text-gray-700 dark:text-gray-300">
                Afficher la moyenne de classe
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="showClassAverage"
                  name="showClassAverage"
                  checked={settings.showClassAverage}
                  onChange={handleChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-600 border-4 border-gray-300 dark:border-gray-700 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showClassAverage"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="showRank" className="text-sm text-gray-700 dark:text-gray-300">
                Afficher le rang de l'élève
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="showRank"
                  name="showRank"
                  checked={settings.showRank}
                  onChange={handleChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-600 border-4 border-gray-300 dark:border-gray-700 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showRank"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div>
              <label htmlFor="commentGeneration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Génération des commentaires
              </label>
              <select
                id="commentGeneration"
                name="commentGeneration"
                value={settings.commentGeneration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="manual">Manuel uniquement</option>
                <option value="ai_suggestions">Suggestions IA (validation manuelle)</option>
                <option value="ai_assisted">IA assistée (génération automatique avec édition)</option>
                <option value="ai_automatic">IA automatique (génération complète)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start space-x-3">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Information</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Ces paramètres s'appliqueront à toutes les nouvelles évaluations. Les évaluations existantes ne seront pas affectées.
            </p>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default EvaluationSettingsModal;