import React from 'react';
import { BookOpen, Users, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../../types/planning';

interface AssignmentSummaryProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  selectedCycle: string;
}

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({
  teachers,
  classes,
  subjects,
  selectedCycle
}) => {
  // Calculer les statistiques d'affectation
  const stats = React.useMemo(() => {
    const assignedTeachers = teachers.filter(t => t.classes && t.classes.length > 0);
    const unassignedTeachers = teachers.filter(t => !t.classes || t.classes.length === 0);
    
    const assignedClasses = new Set();
    const assignedSubjects = new Set();
    
    teachers.forEach(teacher => {
      if (teacher.classes) {
        teacher.classes.forEach(className => assignedClasses.add(className));
      }
      if (teacher.subject) {
        assignedSubjects.add(teacher.subject);
      }
    });

    const unassignedClasses = classes.filter(c => !assignedClasses.has(c.name));
    const uncoveredSubjects = subjects.filter(s => !assignedSubjects.has(s.name));

    return {
      assignedTeachers: assignedTeachers.length,
      unassignedTeachers: unassignedTeachers.length,
      assignedClasses: assignedClasses.size,
      unassignedClasses: unassignedClasses.length,
      coveredSubjects: assignedSubjects.size,
      uncoveredSubjects: uncoveredSubjects.length,
      totalHours: teachers.reduce((acc, t) => acc + (t.hoursPerWeek || 0), 0)
    };
  }, [teachers, classes, subjects]);

  const getCycleInfo = (cycle: string) => {
    switch (cycle) {
      case 'maternelle':
        return {
          name: 'Maternelle',
          description: 'Un enseignant par classe (toutes matières)',
          icon: '🧸'
        };
      case 'primaire':
        return {
          name: 'Primaire',
          description: 'Un enseignant par classe (toutes matières)',
          icon: '📚'
        };
      case 'secondaire':
        return {
          name: 'Secondaire',
          description: 'Un enseignant par matière (plusieurs classes)',
          icon: '🎓'
        };
      default:
        return {
          name: 'Tous les cycles',
          description: 'Vue d\'ensemble complète',
          icon: '🏫'
        };
    }
  };

  const cycleInfo = getCycleInfo(selectedCycle);

  return (
    <div className="space-y-6">
      {/* En-tête du cycle */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{cycleInfo.icon}</span>
          <h3 className="text-xl font-bold">{cycleInfo.name}</h3>
        </div>
        <p className="text-blue-100">{cycleInfo.description}</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enseignants assignés */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Enseignants assignés
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.assignedTeachers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            sur {teachers.length} total
          </div>
        </div>

        {/* Classes couvertes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Classes couvertes
            </div>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.assignedClasses}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            sur {classes.length} total
          </div>
        </div>

        {/* Matières couvertes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Matières couvertes
            </div>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.coveredSubjects}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            sur {subjects.length} total
          </div>
        </div>

        {/* Charge totale */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Charge totale
            </div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalHours}h
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            par semaine
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="space-y-4">
        {/* Enseignants non assignés */}
        {stats.unassignedTeachers > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {stats.unassignedTeachers} enseignant{stats.unassignedTeachers > 1 ? 's' : ''} non assigné{stats.unassignedTeachers > 1 ? 's' : ''}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Ces enseignants n'ont aucune classe assignée et ne contribuent pas à l'emploi du temps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Classes non couvertes */}
        {stats.unassignedClasses > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  {stats.unassignedClasses} classe{stats.unassignedClasses > 1 ? 's' : ''} sans enseignant
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Ces classes n'ont pas d'enseignant assigné et ne peuvent pas avoir d'emploi du temps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Matières non couvertes */}
        {stats.uncoveredSubjects > 0 && selectedCycle === 'secondaire' && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200">
                  {stats.uncoveredSubjects} matière{stats.uncoveredSubjects > 1 ? 's' : ''} sans enseignant
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Ces matières n'ont pas d'enseignant spécialisé assigné.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tout va bien */}
        {stats.unassignedTeachers === 0 && stats.unassignedClasses === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Toutes les affectations sont complètes
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Tous les enseignants ont des classes assignées et toutes les classes ont un enseignant.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSummary;
