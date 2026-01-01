import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Users, Award, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { documentsService } from '../../services/api/documents';

interface Student {
  id: string;
  name: string;
  class: string;
}

interface DocumentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (documentData: any) => void;
  students: Student[];
}

const DocumentGenerationModal: React.FC<DocumentGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  students
}) => {
  const [documentType, setDocumentType] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [format, setFormat] = useState<'pdf' | 'docx' | 'xlsx'>('pdf');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Options de documents disponibles
  const documentOptions = [
    {
      id: 'bulletin',
      name: 'Bulletin de notes',
      icon: Award,
      description: 'Bulletin de notes pour un ou plusieurs élèves',
      requiresStudents: true,
      requiresYear: true,
      requiresSemester: true
    },
    {
      id: 'attestation',
      name: 'Attestation de scolarité',
      icon: FileText,
      description: 'Attestation de présence et d\'inscription',
      requiresStudents: true
    },
    {
      id: 'list',
      name: 'Liste d\'élèves',
      icon: Users,
      description: 'Liste complète des élèves d\'une classe',
      requiresClass: true
    },
    {
      id: 'trombinoscope',
      name: 'Trombinoscope',
      icon: Users,
      description: 'Trombinoscope avec photos des élèves',
      requiresClass: true
    },
    {
      id: 'certificate',
      name: 'Certificat de réussite',
      icon: Award,
      description: 'Certificat de fin d\'année ou de cycle',
      requiresStudents: true,
      requiresYear: true
    }
  ];

  // Années académiques
  const academicYears = [
    '2023-2024',
    '2024-2025',
    '2025-2026'
  ];

  // Semestres
  const semesters = [
    '1er Semestre',
    '2ème Semestre',
    'Année complète'
  ];

  // Classes uniques
  const uniqueClasses = [...new Set(students.map(s => s.class))];

  useEffect(() => {
    if (isOpen) {
      setDocumentType('');
      setSelectedStudents([]);
      setSelectedClass('');
      setFormat('pdf');
      setIncludeHeader(true);
      setIncludeFooter(true);
      setAcademicYear('');
      setSemester('');
      setError('');
    }
  }, [isOpen]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const handleGenerate = async () => {
    if (!documentType) {
      setError('Veuillez sélectionner un type de document');
      return;
    }

    const selectedOption = documentOptions.find(opt => opt.id === documentType);
    if (!selectedOption) return;

    // Validation selon le type de document
    if (selectedOption.requiresStudents && selectedStudents.length === 0) {
      setError('Veuillez sélectionner au moins un élève');
      return;
    }

    if (selectedOption.requiresClass && !selectedClass) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    if (selectedOption.requiresYear && !academicYear) {
      setError('Veuillez sélectionner une année académique');
      return;
    }

    if (selectedOption.requiresSemester && !semester) {
      setError('Veuillez sélectionner un semestre');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
    const documentData = {
        type: documentType,
        students: selectedStudents,
        class: selectedClass,
        format,
        includeHeader,
        includeFooter,
        academicYear,
        semester
    };
    
    onGenerate(documentData);
    onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSelectedOption = () => documentOptions.find(opt => opt.id === documentType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Génération de documents
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
        {/* Type de document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Type de document
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setDocumentType(option.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      documentType === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {option.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options de format */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'pdf' | 'docx' | 'xlsx')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="pdf">PDF</option>
                <option value="docx">Word (DOCX)</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>
            
            {getSelectedOption()?.requiresYear && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Année académique
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Sélectionner une année</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {getSelectedOption()?.requiresSemester && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semestre
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Sélectionner un semestre</option>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            )}
        </div>
        
          {/* Sélection de classe */}
          {getSelectedOption()?.requiresClass && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classe
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner une classe</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}
            
          {/* Sélection d'élèves */}
          {getSelectedOption()?.requiresStudents && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Élèves sélectionnés ({selectedStudents.length})
              </label>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAllStudents}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={handleDeselectAllStudents}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
            </div>
            
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                <input
                  type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.class}
                      </p>
                    </div>
                </label>
                ))}
              </div>
            </div>
          )}
            
          {/* Options d'affichage */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
                <input
                  type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure l'en-tête
              </span>
                </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeFooter}
                onChange={(e) => setIncludeFooter(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure le pied de page
              </span>
            </label>
        </div>
        
          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Générer le document</span>
                </>
              )}
            </button>
              </div>
            </div>
          </div>
        </div>
  );
};

export default DocumentGenerationModal;