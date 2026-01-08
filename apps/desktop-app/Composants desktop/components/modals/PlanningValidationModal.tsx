import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, BookOpen, CheckCircle, AlertTriangle, X, Zap } from 'lucide-react';
import { PlanningSchedule, PlanningTeacher, PlanningClass, PlanningSubject } from '../../types/planning';

interface PlanningValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (validations: PlanningValidation[]) => Promise<void>;
  scheduleEntries: PlanningSchedule[];
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  selectedDate?: string;
}

interface PlanningValidation {
  scheduleEntryId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  scheduledHours: number;
  validatedHours: number;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  notes?: string;
}

const PlanningValidationModal: React.FC<PlanningValidationModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  scheduleEntries,
  teachers,
  classes,
  subjects,
  selectedDate
}) => {
  const [validations, setValidations] = useState<PlanningValidation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser les validations à partir des entrées du planning
  useEffect(() => {
    if (isOpen && scheduleEntries.length > 0) {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      
      const newValidations: PlanningValidation[] = scheduleEntries
        .filter(entry => {
          // Filtrer par date si fournie
          if (selectedDate) {
            // Logique de filtrage par date si nécessaire
            return true;
          }
          return true;
        })
        .map(entry => {
          const teacher = teachers.find(t => t.id === entry.teacherId);
          const classItem = classes.find(c => c.id === entry.classId);
          const subject = subjects.find(s => s.id === entry.subjectId);
          
          // Calculer les heures prévues
          const startTime = new Date(`2000-01-01T${entry.startTime}:00`);
          const endTime = new Date(`2000-01-01T${entry.endTime}:00`);
          const scheduledHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          return {
            scheduleEntryId: entry.id,
            employeeId: entry.teacherId,
            employeeName: teacher?.name || 'Enseignant inconnu',
            date,
            scheduledHours,
            validatedHours: scheduledHours, // Par défaut, valider les heures prévues
            classId: entry.classId,
            className: classItem?.name || 'Classe inconnue',
            subjectId: entry.subjectId,
            subjectName: subject?.name || 'Matière inconnue',
            notes: ''
          };
        });
      
      setValidations(newValidations);
    }
  }, [isOpen, scheduleEntries, teachers, classes, subjects, selectedDate]);

  const handleValidationChange = (index: number, field: keyof PlanningValidation, value: any) => {
    setValidations(prev => prev.map((validation, i) => 
      i === index ? { ...validation, [field]: value } : validation
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onValidate(validations);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateVariance = (validation: PlanningValidation) => {
    return validation.validatedHours - validation.scheduledHours;
  };

  const getVarianceColor = (validation: PlanningValidation) => {
    const variance = calculateVariance(validation);
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const totalScheduled = validations.reduce((sum, v) => sum + v.scheduledHours, 0);
  const totalValidated = validations.reduce((sum, v) => sum + v.validatedHours, 0);
  const totalVariance = totalValidated - totalScheduled;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Validation depuis le planning
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validez les heures travaillées basées sur le planning
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Résumé */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalScheduled.toFixed(2)}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Heures prévues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalValidated.toFixed(2)}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Heures validées</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-green-600' : totalVariance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {totalVariance > 0 ? '+' : ''}{totalVariance.toFixed(2)}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Écart total</div>
              </div>
            </div>
          </div>

          {/* Liste des validations */}
          <div className="space-y-4">
            {validations.map((validation, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Informations de base */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{validation.employeeName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {validation.className} - {validation.subjectName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {validation.date}
                      </span>
                    </div>
                  </div>

                  {/* Heures */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Heures prévues
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={validation.scheduledHours}
                          onChange={(e) => handleValidationChange(index, 'scheduledHours', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Heures validées
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={validation.validatedHours}
                          onChange={(e) => handleValidationChange(index, 'validatedHours', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Écart */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Écart:</span>
                      <span className={`text-sm font-medium ${getVarianceColor(validation)}`}>
                        {calculateVariance(validation) > 0 ? '+' : ''}{calculateVariance(validation).toFixed(2)}h
                      </span>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={validation.notes || ''}
                        onChange={(e) => handleValidationChange(index, 'notes', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Notes optionnelles..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || validations.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validation...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Valider ({validations.length} entrées)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanningValidationModal;
