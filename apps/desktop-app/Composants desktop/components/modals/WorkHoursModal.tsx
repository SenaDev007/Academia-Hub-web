import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, Clock, Calendar, Settings, AlertTriangle, BarChart3 } from 'lucide-react';

interface WorkHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workHoursData: any) => void;
  currentWorkHours?: any;
}

const WorkHoursModal: React.FC<WorkHoursModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentWorkHours
}) => {
  const [formData, setFormData] = useState({
    startTime: currentWorkHours?.startTime || '08:00',
    endTime: currentWorkHours?.endTime || '17:00',
    lunchBreakStart: currentWorkHours?.lunchBreakStart || '12:00',
    lunchBreakEnd: currentWorkHours?.lunchBreakEnd || '13:00',
    courseDuration: currentWorkHours?.courseDuration || 60,
    breakBetweenCourses: currentWorkHours?.breakBetweenCourses || 5,
    workDays: currentWorkHours?.workDays || [1, 2, 3, 4, 5, 6]
  });

  const weekDays = [
    { id: 1, name: 'Lundi' },
    { id: 2, name: 'Mardi' },
    { id: 3, name: 'Mercredi' },
    { id: 4, name: 'Jeudi' },
    { id: 5, name: 'Vendredi' },
    { id: 6, name: 'Samedi' },
    { id: 7, name: 'Dimanche' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleWorkDayToggle = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(dayId)
        ? prev.workDays.filter(id => id !== dayId)
        : [...prev.workDays, dayId].sort()
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Calculer le nombre total d'heures de travail par jour
  const calculateDailyHours = () => {
    const startTime = formData.startTime || '08:00';
    const endTime = formData.endTime || '17:00';
    const lunchBreakStart = formData.lunchBreakStart || '12:00';
    const lunchBreakEnd = formData.lunchBreakEnd || '13:00';
    
    const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const lunchStart = parseInt(lunchBreakStart.split(':')[0]) * 60 + parseInt(lunchBreakStart.split(':')[1]);
    const lunchEnd = parseInt(lunchBreakEnd.split(':')[0]) * 60 + parseInt(lunchBreakEnd.split(':')[1]);
    
    const totalMinutes = (end - start) - (lunchEnd - lunchStart);
    return Math.floor(totalMinutes / 60) + 'h' + (totalMinutes % 60).toString().padStart(2, '0');
  };

  // Calculer le nombre de créneaux possibles
  const calculatePossibleSlots = () => {
    const startTime = formData.startTime || '08:00';
    const endTime = formData.endTime || '17:00';
    const lunchBreakStart = formData.lunchBreakStart || '12:00';
    const lunchBreakEnd = formData.lunchBreakEnd || '13:00';
    
    const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const lunchStart = parseInt(lunchBreakStart.split(':')[0]) * 60 + parseInt(lunchBreakStart.split(':')[1]);
    const lunchEnd = parseInt(lunchBreakEnd.split(':')[0]) * 60 + parseInt(lunchBreakEnd.split(':')[1]);
    
    const morningMinutes = lunchStart - start;
    const afternoonMinutes = end - lunchEnd;
    const totalWorkMinutes = morningMinutes + afternoonMinutes;
    
    const slotDuration = formData.courseDuration + formData.breakBetweenCourses;
    return slotDuration > 0 ? Math.floor(totalWorkMinutes / slotDuration) : 0;
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration des horaires de travail"
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
            form="work-hours-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      }
    >
      <form id="work-hours-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Horaires généraux */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Horaires généraux
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure de début*
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure de fin*
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="lunchBreakStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Début pause déjeuner*
              </label>
              <input
                type="time"
                id="lunchBreakStart"
                name="lunchBreakStart"
                value={formData.lunchBreakStart}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="lunchBreakEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fin pause déjeuner*
              </label>
              <input
                type="time"
                id="lunchBreakEnd"
                name="lunchBreakEnd"
                value={formData.lunchBreakEnd}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Configuration des cours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Configuration des cours
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="courseDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durée d'un cours (minutes)*
              </label>
              <select
                id="courseDuration"
                name="courseDuration"
                value={formData.courseDuration}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="45">45 minutes</option>
                <option value="50">50 minutes</option>
                <option value="55">55 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="breakBetweenCourses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pause entre cours (minutes)*
              </label>
              <select
                id="breakBetweenCourses"
                name="breakBetweenCourses"
                value={formData.breakBetweenCourses}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="0">Aucune pause</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Jours de travail */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Jours de travail
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekDays.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => handleWorkDayToggle(day.id)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.workDays.includes(day.id)
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                {day.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Résumé */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
          <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Résumé de la configuration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Heures de travail/jour:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">{calculateDailyHours()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Jours de travail:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formData.workDays.length} jours/semaine</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Durée d'un cours:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formData.courseDuration} minutes</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Créneaux possibles/jour:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">{calculatePossibleSlots()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Pause entre cours:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formData.breakBetweenCourses} minutes</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Pause déjeuner:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {formData.lunchBreakStart} - {formData.lunchBreakEnd}
                </span>
              </div>
            </div>
          </div>
          
          {formData.workDays.length === 0 && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-900/30">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">
                  Attention: Aucun jour de travail sélectionné. Veuillez sélectionner au moins un jour.
                </p>
              </div>
            </div>
          )}
        </div>
      </form>
    </FormModal>
  );
};

export default WorkHoursModal;