import React, { useState } from 'react';
import { X, FileText, Camera, PenTool } from 'lucide-react';

interface CertificateGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  students?: any[];
  classes?: any[];
}

const CertificateGenerationModal: React.FC<CertificateGenerationModalProps> = ({
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
    certificateType: 'scolarity',
    academicYear: getCurrentAcademicYear(),
    reason: '',
    customText: '',
    includePhoto: true,
    includeSignature: true
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const certificateTypes = [
    { value: 'scolarity', label: 'Certificat de scolarité' },
    { value: 'attendance', label: 'Certificat d\'assiduité' },
    { value: 'behavior', label: 'Certificat de bonne conduite' },
    { value: 'participation', label: 'Certificat de participation' }
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
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-8 text-white rounded-t-3xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Génération de Certificat</h2>
                  <p className="text-blue-100 text-lg">Créez un certificat officiel personnalisé</p>
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
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Élève concerné *</span>
                </span>
              </label>
              <div className="relative">
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 bg-white shadow-sm hover:shadow-md"
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

            {/* Type de certificat */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Type de certificat *</span>
                </span>
              </label>
              <div className="relative">
                <select
                  name="certificateType"
                  value={formData.certificateType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  {certificateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Année scolaire et Motif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Année scolaire</span>
                  </span>
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="">Sélectionner une année</option>
                  {generateAcademicYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Motif du certificat</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Ex: Inscription universitaire, bourse, etc."
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Texte personnalisé */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Texte personnalisé</span>
                </span>
              </label>
              <textarea
                name="customText"
                value={formData.customText}
                onChange={handleInputChange}
                rows={4}
                placeholder="Texte additionnel pour le certificat..."
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
              />
            </div>

            {/* Options */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Options de personnalisation</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    name="includePhoto"
                    checked={formData.includePhoto}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Camera className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inclure la photo de l'élève</span>
                  </div>
                </label>

                <label className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    name="includeSignature"
                    checked={formData.includeSignature}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <PenTool className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inclure la signature</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t-2 border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Générer le certificat</span>
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

export default CertificateGenerationModal;
