import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, Award, Calendar, Star, Download, Users } from 'lucide-react';

interface HonorRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (honorRollData: any) => void;
  honorRollData?: any;
  isEdit?: boolean;
  classes?: any[];
}

const HonorRollModal: React.FC<HonorRollModalProps> = ({
  isOpen,
  onClose,
  onSave,
  honorRollData,
  isEdit = false,
  classes = []
}) => {
  const defaultClasses = [
    { id: 'CLS-001', name: 'Terminale S' },
    { id: 'CLS-002', name: '1ère L' },
    { id: 'CLS-003', name: '3ème A' },
    { id: 'CLS-004', name: '2nde B' }
  ];

  const allClasses = classes.length > 0 ? classes : defaultClasses;

  const [formData, setFormData] = useState({
    title: honorRollData?.title || '',
    period: honorRollData?.period || 'trimester1',
    classId: honorRollData?.classId || '',
    criteriaType: honorRollData?.criteriaType || 'average',
    minimumAverage: honorRollData?.minimumAverage || 14,
    topCount: honorRollData?.topCount || 10,
    includeSubjectDetails: honorRollData?.includeSubjectDetails !== undefined ? honorRollData.includeSubjectDetails : true,
    includeAIFactors: honorRollData?.includeAIFactors !== undefined ? honorRollData.includeAIFactors : true,
    generateCertificates: honorRollData?.generateCertificates !== undefined ? honorRollData.generateCertificates : false,
    format: honorRollData?.format || 'pdf',
    notes: honorRollData?.notes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
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
      title={isEdit ? "Modifier un tableau d'honneur" : "Générer un tableau d'honneur"}
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
            form="honor-roll-form"
            className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Générer"}
          </button>
        </div>
      }
    >
      <form id="honor-roll-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Informations du tableau d'honneur
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Tableau d'honneur - 1er Trimestre 2023-2024"
              />
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
              </select>
            </div>
            
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe*
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner une classe</option>
                <option value="all">Toutes les classes</option>
                {allClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format de sortie*
              </label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="web">Page web</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Critères de sélection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
            Critères de sélection
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="criteriaType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de critère*
              </label>
              <select
                id="criteriaType"
                name="criteriaType"
                value={formData.criteriaType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="average">Moyenne générale minimale</option>
                <option value="top">Top N des élèves</option>
                <option value="improvement">Meilleure progression</option>
                <option value="subject">Excellence par matière</option>
              </select>
            </div>
            
            {formData.criteriaType === 'average' && (
              <div>
                <label htmlFor="minimumAverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Moyenne minimale*
                </label>
                <input
                  type="number"
                  id="minimumAverage"
                  name="minimumAverage"
                  value={formData.minimumAverage}
                  onChange={handleChange}
                  required
                  min="0"
                  max="20"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
            
            {formData.criteriaType === 'top' && (
              <div>
                <label htmlFor="topCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre d'élèves*
                </label>
                <input
                  type="number"
                  id="topCount"
                  name="topCount"
                  value={formData.topCount}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSubjectDetails"
                name="includeSubjectDetails"
                checked={formData.includeSubjectDetails}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeSubjectDetails" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les détails par matière
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAIFactors"
                name="includeAIFactors"
                checked={formData.includeAIFactors}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeAIFactors" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure l'analyse IA des facteurs de réussite
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="generateCertificates"
                name="generateCertificates"
                checked={formData.generateCertificates}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="generateCertificates" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Générer des certificats d'excellence
              </label>
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
              placeholder="Instructions ou commentaires particuliers..."
            />
          </div>
        </div>
        
        {/* Aperçu */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-900/30">
          <h4 className="text-lg font-medium text-yellow-900 dark:text-yellow-300 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Aperçu du tableau d'honneur
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-yellow-800 dark:text-yellow-300">Critère:</span>
                <span className="font-bold text-yellow-900 dark:text-yellow-200">
                  {formData.criteriaType === 'average' ? `Moyenne ≥ ${formData.minimumAverage}` : 
                   formData.criteriaType === 'top' ? `Top ${formData.topCount} élèves` :
                   formData.criteriaType === 'improvement' ? 'Meilleure progression' : 'Excellence par matière'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-yellow-800 dark:text-yellow-300">Période:</span>
                <span className="font-medium text-yellow-900 dark:text-yellow-200">
                  {formData.period === 'trimester1' ? '1er Trimestre' :
                   formData.period === 'trimester2' ? '2ème Trimestre' :
                   formData.period === 'trimester3' ? '3ème Trimestre' : 'Année complète'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-yellow-800 dark:text-yellow-300">Classe:</span>
                <span className="font-medium text-yellow-900 dark:text-yellow-200">
                  {formData.classId === 'all' ? 'Toutes les classes' : 
                   formData.classId ? allClasses.find(c => c.id === formData.classId)?.name || 'Classe sélectionnée' : 
                   'Non sélectionnée'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-yellow-800 dark:text-yellow-300">Détails par matière:</span>
                <span className="font-medium text-yellow-900 dark:text-yellow-200">
                  {formData.includeSubjectDetails ? 'Inclus' : 'Non inclus'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-yellow-800 dark:text-yellow-300">Analyse IA:</span>
                <span className="font-medium text-yellow-900 dark:text-yellow-200">
                  {formData.includeAIFactors ? 'Incluse' : 'Non incluse'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-yellow-800 dark:text-yellow-300">Certificats:</span>
                <span className="font-medium text-yellow-900 dark:text-yellow-200">
                  {formData.generateCertificates ? 'Générés' : 'Non générés'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Aperçu du tableau
            </button>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default HonorRollModal;