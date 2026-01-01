import React, { useState } from 'react';
import { X, Award, Download, Printer, Eye } from 'lucide-react';

interface AttestationGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  students?: any[];
  classes?: any[];
}

const AttestationGenerationModal: React.FC<AttestationGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  students = [],
  classes = []
}) => {
  // Générer les années scolaires dynamiquement
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Si on est entre septembre et décembre, on est dans l'année scolaire en cours
    if (currentMonth >= 9) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      // Si on est entre janvier et août, on est dans l'année scolaire précédente
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Générer 5 années : 2 précédentes, actuelle, 2 suivantes
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    
    return years;
  };

  const [formData, setFormData] = useState({
    studentId: '',
    attestationType: 'success',
    academicYear: getCurrentAcademicYear(),
    grade: '',
    mention: '',
    customText: '',
    includePhoto: true,
    includeSignature: true
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const attestationTypes = [
    { value: 'success', label: 'Attestation de réussite' },
    { value: 'honor', label: 'Attestation de mention' },
    { value: 'participation', label: 'Attestation de participation' },
    { value: 'achievement', label: 'Attestation de mérite' }
  ];

  const mentions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'very_good', label: 'Très bien' },
    { value: 'good', label: 'Bien' },
    { value: 'satisfactory', label: 'Assez bien' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Simulation de génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onGenerate(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col border border-gray-200/20 dark:border-gray-700/50">
        {/* Header avec gradient */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white rounded-t-3xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Génération d'Attestation</h2>
                  <p className="text-green-100 text-lg">Créez une attestation officielle personnalisée</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {/* Décoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sélection de l'élève */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Élève concerné *</span>
                </span>
              </label>
              <div className="relative">
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="">Sélectionner un élève</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          {/* Type d'attestation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type d'attestation *
            </label>
            <select
              name="attestationType"
              value={formData.attestationType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {attestationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Année scolaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année scolaire
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner une année</option>
              {generateAcademicYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Classe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Classe
            </label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              placeholder="Ex: Terminale A, 3ème B"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Mention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mention
            </label>
            <select
              name="mention"
              value={formData.mention}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner une mention</option>
              {mentions.map(mention => (
                <option key={mention.value} value={mention.value}>
                  {mention.label}
                </option>
              ))}
            </select>
          </div>

          {/* Texte personnalisé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texte personnalisé
            </label>
            <textarea
              name="customText"
              value={formData.customText}
              onChange={handleInputChange}
              rows={3}
              placeholder="Texte additionnel pour l'attestation..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Options</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="includePhoto"
                checked={formData.includePhoto}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Inclure la photo de l'élève
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="includeSignature"
                checked={formData.includeSignature}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Inclure la signature du directeur
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Générer l'attestation</span>
                </>
              )}
            </button>
          </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttestationGenerationModal;
