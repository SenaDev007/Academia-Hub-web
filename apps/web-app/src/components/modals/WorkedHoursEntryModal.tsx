import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  User, 
  Loader2,
  FileText,
  Shield,
  Zap,
  AlertTriangle,
  X,
  CheckCircle,
  Calendar,
  BookOpen,
  Save
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject, WorkedHoursEntry } from '../../types/planning';
import { availabilityService } from '../../services/availabilityService';

interface WorkedHoursEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkedHoursEntry) => Promise<void>;
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  allEmployees?: PlanningTeacher[]; // Tous les employés
  editingEntry?: WorkedHoursEntry | null;
  preSelectedDate?: string;
  preSelectedEmployee?: string;
}

const WorkedHoursEntryModal: React.FC<WorkedHoursEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teachers,
  classes,
  subjects,
  allEmployees,
  editingEntry,
  preSelectedDate,
  preSelectedEmployee
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    date: '',
    scheduledHours: 0,
    validatedHours: 0,
    classId: '',
    className: '',
    subjectId: '',
    subjectName: '',
    entryMode: 'manual' as 'manual' | 'planning_validation' | 'badge' | 'biometric',
    notes: '',
    status: 'pending' as 'pending' | 'validated' | 'disputed'
  });

  // Nouveaux champs pour les heures d'arrivée et de sortie
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  // Fonction pour calculer les heures validées automatiquement
  const calculateValidatedHours = (arrival: string, departure: string): number => {
    if (!arrival || !departure) return 0;
    
    try {
      const [arrivalHour, arrivalMin] = arrival.split(':').map(Number);
      const [departureHour, departMin] = departure.split(':').map(Number);
      
      const arrivalMinutes = arrivalHour * 60 + arrivalMin;
      const departureMinutes = departureHour * 60 + departMin;
      
      const totalMinutes = departureMinutes - arrivalMinutes;
      const hours = totalMinutes / 60;
      
      return Math.max(0, Math.round(hours * 4) / 4); // Arrondir au quart d'heure
    } catch (error) {
      console.error('Erreur dans le calcul des heures:', error);
      return 0;
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<unknown[]>([]);
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);


  // Initialiser les données du formulaire
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        employeeId: editingEntry.employeeId || '',
        employeeName: editingEntry.employeeName || '',
        date: editingEntry.date || '',
        scheduledHours: editingEntry.scheduledHours || 0,
        validatedHours: editingEntry.validatedHours || 0,
        classId: editingEntry.classId || '',
        className: editingEntry.className || '',
        subjectId: editingEntry.subjectId || '',
        subjectName: editingEntry.subjectName || '',
        entryMode: editingEntry.entryMode || 'manual',
        notes: editingEntry.notes || '',
        status: editingEntry.status || 'pending'
      });
    } else {
      setFormData({
        employeeId: preSelectedEmployee || '',
        employeeName: '',
        date: preSelectedDate || new Date().toISOString().split('T')[0],
        scheduledHours: 0,
        validatedHours: 0,
        classId: '',
        className: '',
        subjectId: '',
        subjectName: '',
        entryMode: 'manual',
        notes: '',
        status: 'pending'
      });
    }
  }, [editingEntry, preSelectedDate, preSelectedEmployee, teachers]);

  // Debug: Log des données reçues (optionnel)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'development') {
      console.log('🔍 WorkedHoursEntryModal - allEmployees:', allEmployees?.length || 0);
      console.log('🔍 WorkedHoursEntryModal - teachers:', teachers?.length || 0);
    }
  }, [allEmployees, teachers]);

  // Fonction pour récupérer les disponibilités d'un enseignant
  const fetchTeacherAvailability = useCallback(async (teacherId: string) => {
    if (!teacherId) return;
    
    console.log('🔄 Récupération des disponibilités pour teacherId:', teacherId);
    setIsLoadingAvailability(true);
    try {
      const availability = await availabilityService.getTeacherAvailability(teacherId, 'school-1');
      console.log('📊 Disponibilités récupérées:', availability);
      setAvailabilityData(availability);
      
      // Calculer les heures prévues pour le jour sélectionné
      let dailyHours = 0;
      if (availability && availability.length > 0) {
        // Obtenir le jour de la semaine de la date sélectionnée
        const selectedDate = new Date(formData.date);
        const dayOfWeek = selectedDate.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
        const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convertir dimanche (0) en 7
        
        console.log(`📅 Date sélectionnée: ${formData.date}, Jour de la semaine: ${adjustedDayOfWeek}`);
        
        availability.forEach((slot, index) => {
          // Utiliser les noms de colonnes de la base de données (snake_case)
          const slotData = slot as { is_available?: number | boolean; day_of_week?: number; start_time?: string; end_time?: string };
          const isAvailable = slotData.is_available === 1 || slotData.is_available === true;
          
          console.log(`🔍 Créneau ${index + 1}: jour=${slotData.day_of_week}, disponible=${slotData.is_available}, isAvailable=${isAvailable}, adjustedDayOfWeek=${adjustedDayOfWeek}`);
          
          if (isAvailable && slotData.day_of_week === adjustedDayOfWeek) {
            const startTime = parseInt((slotData.start_time || '08:00').split(':')[0]);
            const endTime = parseInt((slotData.end_time || '17:00').split(':')[0]);
            const hours = endTime - startTime;
            dailyHours += hours;
            console.log(`⏰ Créneau du jour ${adjustedDayOfWeek}: ${slotData.start_time} - ${slotData.end_time} = ${hours}h`);
          } else {
            console.log(`❌ Créneau ignoré: jour=${slotData.day_of_week}, isAvailable=${isAvailable}, adjustedDayOfWeek=${adjustedDayOfWeek}`);
          }
        });
      }
      
      console.log('📊 Heures quotidiennes calculées:', dailyHours);
      
      // Mettre à jour les heures prévues automatiquement
      console.log(`🔄 Mise à jour des heures prévues: ${dailyHours}h`);
      setFormData(prev => ({
        ...prev,
        scheduledHours: dailyHours
      }));
      console.log(`✅ Heures prévues mises à jour: ${dailyHours}h`);
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [formData.date]);

  // Fonction pour récupérer les heures de contrat d'un employé non-enseignant
  const fetchEmployeeContractHours = useCallback(async (employeeId: string) => {
    if (!employeeId) return;
    
    console.log('🔄 Récupération des heures de contrat pour employeeId:', employeeId);
    setIsLoadingAvailability(true);
    try {
      // Simuler la récupération depuis la table contracts
      // En réalité, il faudrait faire un appel API
      const contractHours = 8; // Heures par défaut depuis le contrat
      console.log('📊 Heures de contrat récupérées:', contractHours);
      
      // Mettre à jour les heures prévues automatiquement
      setFormData(prev => ({
        ...prev,
        scheduledHours: contractHours
      }));
      console.log(`✅ Heures prévues mises à jour: ${contractHours}h`);
    } catch (error) {
      console.error('Erreur lors de la récupération des heures de contrat:', error);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, []);

  // Mettre à jour le nom de l'employé quand l'ID change
  useEffect(() => {
    if (formData.employeeId) {
      const employee = (allEmployees && allEmployees.length > 0 ? allEmployees : teachers).find(emp => emp.id === formData.employeeId);
      console.log('👤 Employé sélectionné:', employee);
      if (employee) {
        setFormData(prev => ({
          ...prev,
          employeeName: employee.name
        }));
        
        // Vérifier si c'est un enseignant
        const canTeach = (employee as unknown as { canTeach?: boolean }).canTeach;
        console.log('🎓 Est enseignant (canTeach):', canTeach);
        
        // Définir le type d'employé
        setIsTeacher(canTeach || false);
        
        // Si c'est un enseignant, récupérer ses disponibilités
        if (canTeach) {
          console.log('🔄 Déclenchement de la récupération des disponibilités...');
          fetchTeacherAvailability(employee.id);
        } else {
          console.log('👨‍💼 Personnel non-enseignant - récupération depuis le contrat');
          fetchEmployeeContractHours(employee.id);
        }
      }
    }
  }, [formData.employeeId, allEmployees, teachers, fetchTeacherAvailability, fetchEmployeeContractHours]);

  // Recalculer les heures prévues quand la date change (pour les enseignants)
  useEffect(() => {
    if (formData.employeeId && formData.date) {
      const employee = (allEmployees && allEmployees.length > 0 ? allEmployees : teachers).find(emp => emp.id === formData.employeeId);
      if (employee && (employee as unknown as { canTeach?: boolean }).canTeach) {
        console.log('📅 Date changée, recalcul des heures prévues...');
        fetchTeacherAvailability(employee.id);
      }
    }
  }, [formData.date, formData.employeeId, allEmployees, teachers, fetchTeacherAvailability]);

  // Calculer automatiquement les heures validées quand les heures d'arrivée/départ changent
  useEffect(() => {
    if (arrivalTime && departureTime) {
      const calculatedHours = calculateValidatedHours(arrivalTime, departureTime);
      setFormData(prev => ({
        ...prev,
        validatedHours: calculatedHours
      }));
    }
  }, [arrivalTime, departureTime]);

  // Mettre à jour le nom de la classe et les matières quand l'ID change
  useEffect(() => {
    if (formData.classId) {
      const classItem = classes.find(c => c.id === formData.classId);
      if (classItem) {
        setFormData(prev => ({
          ...prev,
          className: classItem.name
        }));

        // Utiliser le niveau de la classe depuis la base de données
        const classLevel = (classItem as { level?: string }).level;
        let subjectId = '';
        let subjectName = '';

        if (classLevel === 'maternelle') {
          subjectId = 'SUB-MAT';
          subjectName = 'Toutes les matières (Maternelle)';
        } else if (classLevel === 'primaire') {
          subjectId = 'SUB-PRI';
          subjectName = 'Toutes les matières (Primaire)';
        }

        if (subjectId && subjectName) {
          setFormData(prev => ({
            ...prev,
            subjectId,
            subjectName
          }));
        }
      }
    }
  }, [formData.classId, classes]);

  // Note: Le nom de la matière est maintenant mis à jour directement dans le onChange du select

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Veuillez sélectionner un employé';
    }
    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }
    if (formData.scheduledHours <= 0) {
      newErrors.scheduledHours = 'Les heures prévues doivent être supérieures à 0';
    }
    if (formData.validatedHours < 0) {
      newErrors.validatedHours = 'Les heures validées ne peuvent pas être négatives';
    }
    if (!arrivalTime) {
      newErrors.arrivalTime = 'Veuillez saisir l\'heure d\'arrivée';
    }
    if (!departureTime) {
      newErrors.departureTime = 'Veuillez saisir l\'heure de sortie';
    }
    if (arrivalTime && departureTime && arrivalTime >= departureTime) {
      newErrors.departureTime = 'L\'heure de sortie doit être après l\'heure d\'arrivée';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const entryData = {
        id: editingEntry?.id || `worked_hours_${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        date: formData.date,
        scheduledHours: formData.scheduledHours,
        validatedHours: formData.validatedHours,
        classId: formData.classId,
        className: formData.className,
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        entryMode: formData.entryMode,
        notes: formData.notes,
        status: formData.status,
        validatedBy: '',
        validatedAt: '',
        action: editingEntry ? 'update' : 'create'
      };

      await onSave(entryData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Employé', icon: User },
    { id: 2, title: 'Horaires', icon: Clock },
    { id: 3, title: 'Détails', icon: FileText },
    { id: 4, title: 'Validation', icon: Shield }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header moderne avec gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingEntry ? 'Modifier les heures travaillées' : 'Nouvelle entrée d\'heures'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {editingEntry ? 'Modifiez les détails de l\'entrée' : 'Saisissez les heures travaillées'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
              aria-label="Fermer le modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`
                    ml-2 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isCompleted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-12 h-0.5 mx-4 transition-colors
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content avec scroll */}
        <div className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Étape 1: Employé */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sélection de l'employé</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choisissez l'employé concerné par cette entrée</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <User className="w-4 h-4 inline mr-2" />
                    Employé *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    required
                    aria-label="Sélectionner un employé"
                  >
                    <option value="">Sélectionner un employé</option>
                    {(allEmployees && allEmployees.length > 0 ? allEmployees : teachers).map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position || employee.subject} {employee.department ? `(${employee.department})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.employeeId && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.employeeId}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Étape 2: Horaires */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Clock className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Horaires de travail</h3>
                  <p className="text-gray-600 dark:text-gray-400">Définissez les heures prévues et validées</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Date des heures travaillées"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Heures prévues (h) *
                        </label>
                        {isLoadingAvailability && (
                          <div className="flex items-center text-blue-600 text-sm">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Récupération...
                          </div>
                        )}
                        {availabilityData.length > 0 && !isLoadingAvailability && (
                          <div className="flex items-center text-green-600 text-sm">
                            <Zap className="w-4 h-4 mr-1" />
                            Auto-rempli
                          </div>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={formData.scheduledHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledHours: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        aria-label="Heures prévues"
                      />
                      {availabilityData.length > 0 && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Basé sur {availabilityData.length} créneau{availabilityData.length > 1 ? 'x' : ''} de disponibilité
                          </p>
                          <button
                            type="button"
                            onClick={() => fetchTeacherAvailability(formData.employeeId)}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                          >
                            Recharger
                          </button>
                        </div>
                      )}
                      {errors.scheduledHours && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.scheduledHours}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Heure d'arrivée *
                        </label>
                        <input
                          type="time"
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          aria-label="Heure d'arrivée"
                        />
                        {errors.arrivalTime && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.arrivalTime}
                          </p>
                        )}
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Heure de sortie *
                        </label>
                        <input
                          type="time"
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          aria-label="Heure de sortie"
                        />
                        {errors.departureTime && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.departureTime}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Heures validées (h) *
                        </label>
                        {arrivalTime && departureTime && (
                          <div className="flex items-center text-purple-600 text-sm">
                            <Zap className="w-4 h-4 mr-1" />
                            Auto-calculé
                          </div>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={formData.validatedHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, validatedHours: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        aria-label="Heures validées"
                        readOnly={!!(arrivalTime && departureTime)}
                      />
                      {arrivalTime && departureTime && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          Calculé automatiquement: {arrivalTime} → {departureTime}
                        </p>
                      )}
                      {errors.validatedHours && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.validatedHours}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Détails */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails de l'activité</h3>
                  <p className="text-gray-600 dark:text-gray-400">Précisez la classe, matière et autres informations</p>
                </div>

                {/* Sélecteurs classe et matière - uniquement pour les enseignants */}
                {isTeacher && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        Classe
                      </label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        aria-label="Sélectionner une classe"
                      >
                        <option value="">Sélectionner une classe</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Matière
                      </label>
                      <select
                        value={formData.subjectId}
                        onChange={(e) => {
                          const selectedSubject = subjects.find(s => s.id === e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            subjectId: e.target.value,
                            subjectName: selectedSubject?.name || ''
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        aria-label="Sélectionner une matière"
                      >
                        <option value="">Sélectionner une matière</option>
                        {(() => {
                          // Récupérer le niveau de la classe sélectionnée depuis la base de données
                          const selectedClass = classes.find(c => c.id === formData.classId);
                          const classLevel = selectedClass ? (selectedClass as { level?: string }).level : null;
                          
                          if (classLevel === 'maternelle') {
                            return (
                              <option key="SUB-MAT" value="SUB-MAT">
                                Toutes les matières (Maternelle)
                              </option>
                            );
                          } else if (classLevel === 'primaire') {
                            return (
                              <option key="SUB-PRI" value="SUB-PRI">
                                Toutes les matières (Primaire)
                              </option>
                            );
                          } else if (classLevel === '1er-cycle-secondaire') {
                            // 1er cycle secondaire : matières du 1er cycle (dédupliquées)
                            const firstCycleSubjects = subjects.filter(subject => 
                              (subject as { level?: string }).level === 'secondaire_1er_cycle'
                            );
                            
                            // Dédupliquer par nom de matière
                            const uniqueSubjects = firstCycleSubjects.reduce((acc, subject) => {
                              const subjectName = (subject as { name?: string }).name;
                              if (!acc.find(s => (s as { name?: string }).name === subjectName)) {
                                acc.push(subject);
                              }
                              return acc;
                            }, [] as typeof firstCycleSubjects);
                            
                            return uniqueSubjects.map(subject => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ));
                          } else if (classLevel === '2nd-cycle-secondaire') {
                            // 2nd cycle secondaire : matières du 2nd cycle (dédupliquées)
                            const secondCycleSubjects = subjects.filter(subject => 
                              (subject as { level?: string }).level === 'secondaire_2nd_cycle'
                            );
                            
                            // Dédupliquer par nom de matière
                            const uniqueSubjects = secondCycleSubjects.reduce((acc, subject) => {
                              const subjectName = (subject as { name?: string }).name;
                              if (!acc.find(s => (s as { name?: string }).name === subjectName)) {
                                acc.push(subject);
                              }
                              return acc;
                            }, [] as typeof secondCycleSubjects);
                            
                            return uniqueSubjects.map(subject => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ));
                          } else {
                            // Autres niveaux : filtrer par niveau exact
                            const levelSubjects = subjects.filter(subject => 
                              (subject as { level?: string }).level === classLevel
                            );
                            
                            return levelSubjects.map(subject => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ));
                          }
                        })()}
                      </select>
                    </div>
                  </div>
                )}

                {/* Message informatif pour les non-enseignants */}
                {isTeacher === false && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Personnel non-enseignant
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Les heures prévues sont récupérées depuis le contrat. Classe et matière non applicables.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                    placeholder="Ajoutez des notes ou commentaires..."
                  />
                </div>
              </div>
            )}

            {/* Étape 4: Validation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validation et statut</h3>
                  <p className="text-gray-600 dark:text-gray-400">Définissez le mode de saisie et le statut</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Mode de saisie
                    </label>
                    <select
                      value={formData.entryMode}
                      onChange={(e) => setFormData(prev => ({ ...prev, entryMode: e.target.value as 'manual' | 'planning_validation' | 'badge' | 'biometric' }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      aria-label="Mode de saisie"
                    >
                      <option value="manual">Manuel</option>
                      <option value="planning_validation">Validation planning</option>
                      <option value="badge">Badge</option>
                      <option value="biometric">Biométrique</option>
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'validated' | 'disputed' }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      aria-label="Statut"
                    >
                      <option value="pending">En attente</option>
                      <option value="validated">Validé</option>
                      <option value="disputed">Contesté</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              <div className="flex space-x-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingEntry ? 'Mettre à jour' : 'Enregistrer'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkedHoursEntryModal;