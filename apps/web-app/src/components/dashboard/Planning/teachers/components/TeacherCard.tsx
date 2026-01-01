import React from 'react';
import { 
  User, 
  BookOpen, 
  Clock, 
  Calendar, 
  Edit, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Hash
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../../types/planning';
import { EducationalCycle } from '../TeachersTab';

interface TeacherCardProps {
  teacher: PlanningTeacher;
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  onViewPlanning: () => void;
  onEdit: () => void;
  onEditAssignment?: (assignment: any) => void;
  onSaveAssignment?: (assignmentData: any) => Promise<void>;
  selectedCycle: EducationalCycle;
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  classes,
  subjects,
  onViewPlanning,
  onEdit,
  onEditAssignment,
  onSaveAssignment,
  selectedCycle
}) => {
  // Utiliser directement les données de l'enseignant (pas de schedule)
  const actualSubjects = teacher.subjects?.map(subjectName => ({ name: subjectName, id: 'static' })) || [];
  const actualClasses = teacher.classes?.map(className => classes.find(c => c.name === className)).filter(Boolean) || [];

  // Déterminer le type d'affectation selon le mode réel de l'enseignant
  const getAssignmentType = () => {
    // Utiliser le mode de l'enseignant s'il est disponible, sinon utiliser le cycle sélectionné
    const teacherMode = teacher.mode || selectedCycle;
    
    if (teacherMode === 'maternelle' || teacherMode === 'primaire') {
      return 'class-based'; // Un enseignant par classe
    }
    return 'subject-based'; // Un enseignant par matière
  };

  // Utiliser directement les heures de l'enseignant (priorité absolue)
  const realHoursPerWeek = teacher.hoursPerWeek || 0;

  // Utiliser directement les heures de l'enseignant
  const actualHours = teacher.hoursPerWeek || 0;

  // Calculer la charge de travail
  const getWorkloadStatus = (hours: number) => {
    if (hours === 0) return { status: 'none', color: 'gray', label: 'Aucune charge' };
    if (hours < 10) return { status: 'light', color: 'green', label: 'Charge légère' };
    if (hours < 20) return { status: 'normal', color: 'blue', label: 'Charge normale' };
    if (hours < 25) return { status: 'heavy', color: 'orange', label: 'Charge importante' };
    return { status: 'overload', color: 'red', label: 'Surcharge' };
  };

  const workload = getWorkloadStatus(actualHours);
  const assignmentType = getAssignmentType();
  const teacherMode = teacher.mode || selectedCycle;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600">
      {/* En-tête avec photo et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            {/* Indicateur de statut */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${
              teacher.status === 'active' 
                ? 'bg-green-500' 
                : teacher.status === 'inactive'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}>
              {teacher.status === 'active' && <CheckCircle className="w-3 h-3 text-white" />}
              {teacher.status !== 'active' && <AlertCircle className="w-3 h-3 text-white" />}
            </div>
          </div>

          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {teacher.name}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                teacher.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : teacher.status === 'inactive'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {teacher.status === 'active' ? 'Actif' : 
                 teacher.status === 'inactive' ? 'Inactif' : 'En congé'}
              </span>
            </div>
            
            {/* Informations de contact */}
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {teacher.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span>{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              {teacher.matricule && (
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  <span>Mat. {teacher.matricule}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button 
            onClick={onViewPlanning}
            className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            title="Voir le planning"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              // Si on a des affectations, ouvrir l'AssignmentWizard
              if (actualClasses.length > 0 && onEditAssignment) {
                // Créer une affectation fictive pour l'édition
                const assignment = {
                  id: `edit-${teacher.id}`,
                  teacherId: teacher.id,
                  teacherName: teacher.name,
                  mode: assignmentType === 'class-based' ? 'maternelle' : 'secondaire',
                  classId: actualClasses[0]?.id,
                  className: actualClasses[0]?.name,
                  classIds: actualClasses.map(c => c.id),
                  classNames: actualClasses.map(c => c.name),
                  subjectIds: actualSubjects.map(s => s.id),
                  subjectNames: actualSubjects.map(s => s.name),
                  subjectsCount: actualSubjects.length,
                  hoursPerWeek: actualHours,
                  startDate: new Date().toISOString().split('T')[0],
                  status: 'active'
                };
                onEditAssignment(assignment);
              } else {
                // Sinon, ouvrir l'édition de l'enseignant
                onEdit();
              }
            }}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title={actualClasses.length > 0 ? "Modifier l'affectation" : "Modifier l'enseignant"}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informations d'affectation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Matière principale */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              {assignmentType === 'class-based' ? 'Enseignement' : 'Matière'}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {actualSubjects.length > 0 ? (
              actualSubjects.length === 1 ? 
                actualSubjects[0].name :
                `${actualSubjects.length} matières`
            ) : (
              teacher.subject || 'Non assignée'
            )}
          </div>
          {actualSubjects.length > 1 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {actualSubjects.slice(0, 2).map(s => s.name).join(', ')}
              {actualSubjects.length > 2 && ` +${actualSubjects.length - 2} autres`}
            </div>
          )}
          {actualSubjects.length === 0 && teacher.subject && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {teacher.subject}
            </div>
          )}
          {teacher.position && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {teacher.position}
            </div>
          )}
        </div>

        {/* Charge de travail */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              Charge hebdomadaire
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {actualHours}h/semaine
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              workload.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              workload.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
              workload.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
              workload.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
              {workload.label}
            </span>
          </div>
        </div>
      </div>

      {/* Classes assignées */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
            Classes assignées ({actualClasses.length})
          </span>
        </div>
        
        {actualClasses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actualClasses.map((classObj, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-md"
                title={`${classObj.capacity} élèves max`}
              >
                {classObj.name}
                <span className="ml-1 text-blue-600 dark:text-blue-400">
                  ({classObj.capacity})
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aucune classe assignée
          </div>
        )}
      </div>

      {/* Informations supplémentaires selon le mode réel */}
      {assignmentType === 'class-based' && actualClasses.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
            Mode {teacherMode === 'maternelle' ? 'Maternelle' : 'Primaire'}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Enseigne toutes les matières de {actualClasses.length === 1 ? 'sa classe' : 'ses classes'}
          </div>
        </div>
      )}

      {assignmentType === 'subject-based' && actualSubjects.length > 0 && (
        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-xs font-medium text-purple-800 dark:text-purple-300 mb-1">
            Mode Secondaire
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            Spécialisé en {actualSubjects.length === 1 ? actualSubjects[0].name : `${actualSubjects.length} matières`} pour {actualClasses.length} classe{actualClasses.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCard;
