import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, FileText, Calendar, BarChart3, Brain, Download } from 'lucide-react';

interface AnalyticsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reportData: any) => void;
  reportData?: any;
  isEdit?: boolean;
  classes?: any[];
}

const AnalyticsReportModal: React.FC<AnalyticsReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reportData,
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
    title: reportData?.title || '',
    reportType: reportData?.reportType || 'trimester',
    classId: reportData?.classId || '',
    period: reportData?.period || 'trimester1',
    includeGraphics: reportData?.includeGraphics !== undefined ? reportData.includeGraphics : true,
    includeAIAnalysis: reportData?.includeAIAnalysis !== undefined ? reportData.includeAIAnalysis : true,
    includeStudentDetails: reportData?.includeStudentDetails !== undefined ? reportData.includeStudentDetails : true,
    includeTeacherComments: reportData?.includeTeacherComments !== undefined ? reportData.includeTeacherComments : true,
    format: reportData?.format || 'pdf',
    notes: reportData?.notes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      title={isEdit ? "Modifier un rapport" : "Générer un nouveau rapport"}
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
            form="analytics-report-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Générer"}
          </button>
        </div>
      }
    >
      <form id="analytics-report-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations du rapport
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre du rapport*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: PV Conseil de Classe - Terminale S"
              />
            </div>
            
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de rapport*
              </label>
              <select
                id="reportType"
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="trimester">PV Trimestriel</option>
                <option value="annual">Rapport Annuel</option>
                <option value="sequential">Rapport Séquentiel</option>
                <option value="comparative">Analyse Comparative</option>
                <option value="honor_roll">Tableau d'Honneur</option>
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
                <option value="word">Word</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Options du rapport */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Options du rapport
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeGraphics"
                name="includeGraphics"
                checked={formData.includeGraphics}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeGraphics" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les graphiques et visualisations
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAIAnalysis"
                name="includeAIAnalysis"
                checked={formData.includeAIAnalysis}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeAIAnalysis" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure l'analyse IA et les recommandations
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeStudentDetails"
                name="includeStudentDetails"
                checked={formData.includeStudentDetails}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeStudentDetails" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les détails par élève
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeTeacherComments"
                name="includeTeacherComments"
                checked={formData.includeTeacherComments}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeTeacherComments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les commentaires des enseignants
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
              placeholder="Instructions particulières pour ce rapport..."
            />
          </div>
        </div>
        
        {/* Aperçu IA */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-900/30">
          <h4 className="text-lg font-medium text-purple-900 dark:text-purple-300 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Aperçu de l'analyse IA
          </h4>
          
          <div className="space-y-4">
            <p className="text-purple-800 dark:text-purple-300">
              L'IA analysera les données suivantes pour ce rapport:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Tendances identifiées</h5>
                <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
                  <li>• Évolution des moyennes par période</li>
                  <li>• Comparaison avec les années précédentes</li>
                  <li>• Matières avec les meilleures progressions</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Recommandations</h5>
                <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
                  <li>• Actions pédagogiques ciblées</li>
                  <li>• Soutien pour les élèves à risque</li>
                  <li>• Optimisation des méthodes d'enseignement</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Aperçu du rapport
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default AnalyticsReportModal;