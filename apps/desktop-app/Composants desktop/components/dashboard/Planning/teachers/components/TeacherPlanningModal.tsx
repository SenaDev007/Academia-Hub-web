import React, { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronRight, Clock, Users, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../../types/planning';

interface TeacherPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: PlanningTeacher | null;
  classes: PlanningClass[];
  subjects: PlanningSubject[];
}

const TeacherPlanningModal: React.FC<TeacherPlanningModalProps> = ({
  isOpen,
  onClose,
  teacher,
  classes,
  subjects
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['assignments']));

  // Utiliser directement les données de l'enseignant
  const teacherData = useMemo(() => {
    if (!teacher) return null;

    // Utiliser directement les données de l'enseignant
    const assignedClasses = teacher.classes?.map(className => classes.find(c => c.name === className)).filter(Boolean) || [];
    const assignedSubjects = teacher.subject ? [{ name: teacher.subject, id: 'static' }] : [];

    // Calculer les heures par classe
    const classHours = assignedClasses.map(classObj => {
      return {
        class: classObj,
        hours: teacher.hoursPerWeek || 18,
        subjects: assignedSubjects,
        entries: []
      };
    });

    const totalHours = teacher.hoursPerWeek || 0;

    return {
      assignedClasses,
      assignedSubjects,
      classHours,
      totalHours,
      scheduleEntries: []
    };
  }, [teacher, classes, subjects]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!isOpen || !teacher || !teacherData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Planning de {teacher.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {teacher.subject} • {teacherData.totalHours}h/semaine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Affectations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('assignments')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Affectations ({teacherData.assignedClasses.length})
                </h3>
              </div>
              {expandedSections.has('assignments') ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.has('assignments') && (
              <div className="px-4 pb-4">
                {teacherData.assignedClasses.length > 0 ? (
                  <div className="space-y-3">
                    {teacherData.assignedClasses.map((classObj, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{classObj.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{classObj.level}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {teacher.hoursPerWeek || 18}h/semaine
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune affectation</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Résumé</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {teacherData.assignedClasses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {teacherData.assignedSubjects.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Matières</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {teacherData.totalHours}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Par semaine</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPlanningModal;