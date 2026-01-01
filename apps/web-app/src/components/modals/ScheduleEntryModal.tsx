import React, { useState, useEffect, useMemo } from 'react';
import FormModal from './FormModal';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  MapPin, 
  AlertTriangle,
  Info,
  Sparkles,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield
} from 'lucide-react';
import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningRoom, WorkHoursConfig } from '../../types/planning';
import { assignmentDynamicsService, AssignmentContext, SmartSuggestion } from '../../services/assignmentDynamicsService';

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: {
    id: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomId?: string;
    notes?: string;
    class: string;
    subject: string;
    teacher: string;
    day: string;
    time: string;
    duration: string;
    durationMinutes: number;
  }) => Promise<void>;
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  teachers: PlanningTeacher[];
  rooms: PlanningRoom[];
  workHours: WorkHoursConfig | null;
  editingEntry?: {
    id: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomId?: string;
    notes?: string;
  };
  selectedClass?: string;
  preSelectedDay?: number;
  preSelectedTime?: string;
  // Props pour compatibilité avec Planning.tsx
  scheduleData?: Record<string, unknown>;
  isEdit?: boolean;
}

interface ScheduleEntryData {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  notes?: string;
}

const ScheduleEntryModal: React.FC<ScheduleEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classes,
  subjects,
  teachers,
  rooms,
  workHours,
  editingEntry,
  selectedClass,
  preSelectedDay,
  preSelectedTime
}) => {
  const [formData, setFormData] = useState<ScheduleEntryData>({
    classId: selectedClass || '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: preSelectedDay || 1,
    startTime: preSelectedTime?.split('-')[0] || '08:00',
    endTime: preSelectedTime?.split('-')[1] || '09:00',
    roomId: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentContext, setAssignmentContext] = useState<AssignmentContext | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Initialiser le formulaire
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        classId: editingEntry.classId || '',
        subjectId: editingEntry.subjectId || '',
        teacherId: editingEntry.teacherId || '',
        dayOfWeek: editingEntry.dayOfWeek || 1,
        startTime: editingEntry.startTime || '08:00',
        endTime: editingEntry.endTime || '09:00',
        roomId: editingEntry.roomId || '',
        notes: editingEntry.notes || ''
      });
    } else if (selectedClass) {
      setFormData(prev => ({ ...prev, classId: selectedClass }));
    }
  }, [editingEntry, selectedClass]);

  // Jours de la semaine
  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Charger le contexte d'affectation quand un enseignant est sélectionné
  useEffect(() => {
    const loadAssignmentContext = async () => {
      if (!formData.teacherId) {
        setAssignmentContext(null);
        setSmartSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const context = await assignmentDynamicsService.getTeacherAssignmentContext(formData.teacherId, 'school-1');
        setAssignmentContext(context);

        if (context) {
          const selectedClass = classes.find(c => c.id === formData.classId);
          const selectedSubject = subjects.find(s => s.id === formData.subjectId);
          const suggestions = assignmentDynamicsService.generateSmartSuggestions(
            context,
            selectedClass,
            selectedSubject,
            `${formData.startTime}-${formData.endTime}`
          );
          setSmartSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contexte d\'affectation:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadAssignmentContext();
  }, [formData.teacherId, formData.classId, formData.subjectId, formData.startTime, formData.endTime, classes, subjects]);

  // Filtrer les matières selon la classe sélectionnée et le contexte d'affectation
  const availableSubjects = useMemo(() => {
    if (!formData.classId) return subjects;
    
    const selectedClass = classes.find(c => c.id === formData.classId);
    if (!selectedClass) return subjects;

    // Si un enseignant est sélectionné, utiliser le service de dynamisme
    if (formData.teacherId && assignmentContext) {
      return assignmentDynamicsService.filterAvailableSubjects(subjects, assignmentContext.teacher, selectedClass);
    }

    // Sinon, filtrer par niveau
    return subjects.filter(subject => subject.level === selectedClass.level);
  }, [subjects, formData.classId, formData.teacherId, assignmentContext, classes]);

  // Filtrer les enseignants selon la matière sélectionnée et le contexte d'affectation
  const availableTeachers = useMemo(() => {
    if (!formData.subjectId) return teachers;
    
    const selectedSubject = subjects.find(s => s.id === formData.subjectId);
    if (!selectedSubject) return teachers;

    const selectedClass = classes.find(c => c.id === formData.classId);

    // Utiliser le service de dynamisme pour filtrer
    return assignmentDynamicsService.filterAvailableTeachers(teachers, selectedClass, selectedSubject);
  }, [teachers, formData.subjectId, formData.classId, subjects, classes]);

  // Valider le formulaire avec le service de dynamisme
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.classId) {
      newErrors.classId = 'Veuillez sélectionner une classe';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Veuillez sélectionner une matière';
    }

    if (!formData.teacherId) {
      newErrors.teacherId = 'Veuillez sélectionner un enseignant';
    }

    if (!formData.startTime || !formData.endTime) {
      newErrors.time = 'Veuillez sélectionner les heures de début et fin';
    } else if (formData.startTime >= formData.endTime) {
      newErrors.time = 'L\'heure de fin doit être après l\'heure de début';
    }

    // Validation intelligente avec le service de dynamisme (synchronisée pour l'instant)
    if (formData.teacherId && formData.classId && formData.subjectId) {
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
      const selectedClass = classes.find(c => c.id === formData.classId);
      const selectedSubject = subjects.find(s => s.id === formData.subjectId);

      if (selectedTeacher && selectedClass && selectedSubject) {
        // Validation basique (la validation complète avec disponibilités sera faite côté serveur)
        if (selectedTeacher.classes && !selectedTeacher.classes.includes(selectedClass.name)) {
          newErrors.classId = `L'enseignant ${selectedTeacher.name} n'est pas assigné à cette classe`;
        }

        const teacherWithMode = selectedTeacher as PlanningTeacher & { mode?: string };
        if (teacherWithMode.mode === 'secondaire' && selectedTeacher.subject !== selectedSubject.name) {
          newErrors.subjectId = `L'enseignant ${selectedTeacher.name} ne peut pas enseigner cette matière`;
        }
      }
    }

    // Vérifier les contraintes d'heures de travail
    if (workHours && workHours.startTime && workHours.endTime && 
        formData.startTime && formData.endTime) {
      try {
        const startHour = parseInt(formData.startTime.split(':')[0]);
        const endHour = parseInt(formData.endTime.split(':')[0]);
        const workStartHour = parseInt(workHours.startTime.split(':')[0]);
        const workEndHour = parseInt(workHours.endTime.split(':')[0]);

        if (startHour < workStartHour || endHour > workEndHour) {
          newErrors.time = `Le cours doit être programmé entre ${workHours.startTime} et ${workHours.endTime}`;
        }
      } catch (error) {
        console.warn('Erreur lors de la validation des heures de travail:', error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const generatedId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔍 ScheduleEntryModal - editingEntry:', editingEntry);
      console.log('🔍 ScheduleEntryModal - ID généré:', generatedId);
      console.log('🔍 ScheduleEntryModal - ID final:', editingEntry?.id || generatedId);
      
      const scheduleData = {
        id: editingEntry?.id || generatedId,
        classId: formData.classId,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        roomId: formData.roomId || undefined,
        notes: formData.notes || undefined,
        // Données pour l'affichage
        class: classes.find(c => c.id === formData.classId)?.name || '',
        subject: subjects.find(s => s.id === formData.subjectId)?.name || '',
        teacher: teachers.find(t => t.id === formData.teacherId)?.name || '',
        day: days.find(d => d.id === formData.dayOfWeek)?.name || '',
        time: `${formData.startTime}-${formData.endTime}`,
        duration: calculateDuration().toString(),
        durationMinutes: calculateDurationMinutes()
      };

      await onSave(scheduleData);
    onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculer la durée en heures
  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    // Convertir les heures en minutes pour un calcul précis
    const startParts = formData.startTime.split(':');
    const endParts = formData.endTime.split(':');
    
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    
    const durationMinutes = endMinutes - startMinutes;
    
    // Retourner la durée en heures avec décimales pour plus de précision
    return Math.round((durationMinutes / 60) * 10) / 10;
  };

  // Calculer la durée en minutes
  const calculateDurationMinutes = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const startParts = formData.startTime.split(':');
    const endParts = formData.endTime.split(':');
    
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    
    return endMinutes - startMinutes;
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Modifier le cours' : 'Planifier un nouveau cours'}
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Validation automatique des contraintes</span>
          </div>
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="schedule-entry-form"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  {editingEntry ? (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Modifier le cours
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Créer le cours
                    </>
                  )}
                </>
              )}
          </button>
          </div>
        </div>
      }
    >
      {/* Header personnalisé */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          {editingEntry ? (
            <Target className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingEntry ? 'Modifier le cours' : 'Planifier un nouveau cours'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {editingEntry ? 'Ajustez les informations du cours existant' : 'Créez un nouveau créneau dans l\'emploi du temps'}
          </p>
        </div>
      </div>

      <form id="schedule-entry-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section principale */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informations du cours</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sélectionnez la classe, la matière et l'enseignant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Classe */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Classe *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.classId ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                disabled={!!selectedClass}
                title="Sélectionner une classe"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level})
                  </option>
                ))}
              </select>
              {errors.classId && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{errors.classId}</span>
            </div>
              )}
            </div>
            
            {/* Matière */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <BookOpen className="w-4 h-4 text-green-600" />
                Matière *
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value, teacherId: '' }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.subjectId ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                title="Sélectionner une matière"
              >
                <option value="">Sélectionner une matière</option>
                {availableSubjects.map((subject: PlanningSubject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.level})
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{errors.subjectId}</span>
                </div>
              )}
            </div>
            
            {/* Enseignant */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-purple-600" />
                Enseignant *
                {isLoadingSuggestions && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                )}
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.teacherId ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                title="Sélectionner un enseignant"
              >
                <option value="">Sélectionner un enseignant</option>
                {availableTeachers.map((teacher: PlanningTeacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.subject} {teacher.classes && teacher.classes.length > 0 ? `(${teacher.classes.join(', ')})` : ''}
                  </option>
                ))}
              </select>
              {errors.teacherId && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{errors.teacherId}</span>
                </div>
              )}
              
              {/* Affichage du contexte d'affectation avec disponibilités */}
              {assignmentContext && (
                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Affectation actuelle:</span>
                  </div>
                  <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                    <div>Mode: {assignmentContext.mode}</div>
                    <div>Classes: {assignmentContext.assignedClasses.map(c => c.name).join(', ')}</div>
                    <div>Heures: {assignmentContext.totalHours}h/semaine</div>
                    {assignmentContext.specificSubject && (
                      <div>Matière spécialisée: {assignmentContext.specificSubject.name}</div>
                    )}
                  </div>
                  
                  {/* Informations de disponibilité */}
                  <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Disponibilités:</span>
                    </div>
                    <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                      {assignmentContext.availability?.isAvailable ? (
                        <>
                          <div>✅ Disponible {assignmentContext.availability.availableDays.length} jours/semaine</div>
                          <div>🕐 {assignmentContext.availability.totalAvailableHours}h disponibles</div>
                          <div>📅 Jours: {assignmentContext.availability.availableDays.map(d => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d]).join(', ')}</div>
                        </>
                      ) : (
                        <div className="text-orange-600 dark:text-orange-400">
                          ⚠️ Disponibilités non configurées
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
            </div>
            
        {/* Section horaires */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Planification horaire</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Définissez le jour et les heures du cours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-green-600" />
                Jour de la semaine *
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400"
                title="Sélectionner un jour"
              >
                {days.map(day => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-green-600" />
                Heure de début *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.time ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                title="Sélectionner l'heure de début"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-green-600" />
                Heure de fin *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.time ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                title="Sélectionner l'heure de fin"
              />
            </div>
          </div>

          {errors.time && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-3">
              <XCircle className="w-4 h-4" />
              <span>{errors.time}</span>
            </div>
          )}
        </div>

        {/* Durée calculée et informations */}
        {formData.startTime && formData.endTime && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Résumé du cours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Informations calculées automatiquement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Durée</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {calculateDuration()}h
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(() => {
                    const duration = calculateDuration();
                    if (duration === 0) return 'Aucune durée';
                    if (duration === 1) return '1 heure';
                    if (duration < 1) {
                      const minutes = Math.round(duration * 60);
                      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
                    }
                    return `${duration} heures`;
                  })()}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Jour</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {days.find(d => d.id === formData.dayOfWeek)?.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.startTime} - {formData.endTime}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Statut</span>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  Prêt
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Toutes les informations requises
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions intelligentes */}
        {smartSuggestions.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggestions intelligentes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Basées sur les affectations et disponibilités de l'enseignant
                  {assignmentContext && (
                    <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">
                      ({assignmentContext.mode} • {assignmentContext.totalHours}h/semaine • {assignmentContext.availability?.isAvailable ? `${assignmentContext.availability.availableDays.length} jours dispo` : 'disponibilités non configurées'})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartSuggestions.slice(0, 4).map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    suggestion.priority === 'high'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : suggestion.priority === 'medium'
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                  }`}
                  onClick={() => {
                    if (suggestion.type === 'class' && formData.classId !== suggestion.value) {
                      setFormData(prev => ({ ...prev, classId: suggestion.value }));
                    } else if (suggestion.type === 'subject' && formData.subjectId !== suggestion.value) {
                      setFormData(prev => ({ ...prev, subjectId: suggestion.value }));
                    } else if (suggestion.type === 'teacher' && formData.teacherId !== suggestion.value) {
                      setFormData(prev => ({ ...prev, teacherId: suggestion.value }));
                    } else if (suggestion.type === 'time' && suggestion.value.includes('-')) {
                      const [startTime, endTime] = suggestion.value.split('-');
                      setFormData(prev => ({ ...prev, startTime, endTime }));
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      suggestion.priority === 'high' ? 'bg-green-600' :
                      suggestion.priority === 'medium' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {suggestion.type === 'teacher' && <User className="w-4 h-4 text-white" />}
                      {suggestion.type === 'subject' && <BookOpen className="w-4 h-4 text-white" />}
                      {suggestion.type === 'class' && <Calendar className="w-4 h-4 text-white" />}
                      {suggestion.type === 'time' && <Clock className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {suggestion.reason}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          suggestion.priority === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {suggestion.priority === 'high' ? 'Priorité haute' :
                           suggestion.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(suggestion.confidence * 100)}% de confiance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {smartSuggestions.length > 4 && (
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  +{smartSuggestions.length - 4} autres suggestions disponibles
                </span>
              </div>
            )}
          </div>
        )}

        {/* Section informations complémentaires */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informations complémentaires</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ajoutez des détails optionnels au cours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salle */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-orange-600" />
                Salle (optionnel)
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400"
                title="Sélectionner une salle"
              >
                <option value="">Aucune salle</option>
                {rooms && rooms.map((room: PlanningRoom) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.type} {room.capacity && `(${room.capacity} places)`}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Info className="w-4 h-4 text-orange-600" />
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 resize-none"
                placeholder="Notes supplémentaires sur ce cours..."
              />
            </div>
          </div>
        </div>
        
        {/* Contraintes d'heures de travail */}
        {workHours && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contraintes d'heures</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Heures de travail autorisées : {workHours.startTime} - {workHours.endTime}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </FormModal>
  );
};

export default ScheduleEntryModal;