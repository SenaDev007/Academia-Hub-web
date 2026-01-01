import React, { useState, useEffect, useMemo } from 'react';
import FormModal from './FormModal';
import { 
  Save, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Info, 
  Settings,
  Copy,
  RefreshCw,
  Zap,
  Coffee
} from 'lucide-react';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TeacherConstraints {
  preferredStartTime: string;
  preferredEndTime: string;
  unavailableDays: number[];
  maxHoursPerDay: number;
  notes: string;
}

interface ResolutionSuggestion {
  type: string;
  title: string;
  description: string;
  action: string;
}

interface TeacherAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availabilityData: any) => void;
  teacherId?: string;
  teacherName?: string;
  existingAvailability?: AvailabilitySlot[];
  teacher?: any;
  suggestions?: ResolutionSuggestion[];
  conflictType?: string;
  conflictDescription?: string;
}

const TeacherAvailabilityModal: React.FC<TeacherAvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teacherId,
  teacherName,
  existingAvailability = [],
  teacher,
  suggestions = [],
  conflictType,
  conflictDescription
}) => {
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');
  const [activeTab, setActiveTab] = useState<'availability' | 'constraints'>('availability');
  
  // Utiliser les données du teacher si disponibles, sinon les props individuelles
  const currentTeacherId = teacher?.id || teacherId;
  const currentTeacherName = teacher?.name || teacherName;
  
  // Variables pour les attributs ARIA
  const isAvailabilitySelected = activeTab === 'availability';
  const isConstraintsSelected = activeTab === 'constraints';

  // Jours de la semaine
  const weekDays = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Initialiser les disponibilités depuis existingAvailability
  const initializeAvailability = (): AvailabilitySlot[] => {
    if (existingAvailability.length > 0) {
      return existingAvailability;
    }
    
    // Créer une disponibilité par défaut (lundi-vendredi 8h-17h, samedi 8h-12h)
    return weekDays.map(day => ({
      dayOfWeek: day.id,
      startTime: '08:00',
      endTime: day.id === 6 ? '12:00' : '17:00', // Samedi plus court
      isAvailable: true
    }));
  };

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(initializeAvailability());
  const [constraints, setConstraints] = useState<TeacherConstraints>({
    preferredStartTime: '08:00',
    preferredEndTime: '17:00',
    unavailableDays: [],
    maxHoursPerDay: 6,
    notes: ''
  });

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setAvailability(initializeAvailability());
      setConstraints({
        preferredStartTime: '08:00',
        preferredEndTime: '17:00',
        unavailableDays: [],
        maxHoursPerDay: 6,
        notes: ''
      });
    }
  }, [isOpen]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const availableDays = availability.filter(a => a.isAvailable).length;
    const totalHours = availability.reduce((total, slot) => {
      if (!slot.isAvailable) return total;
      const start = parseInt(slot.startTime.split(':')[0]);
      const end = parseInt(slot.endTime.split(':')[0]);
      return total + (end - start);
    }, 0);
    
    return {
      availableDays,
      totalDays: availability.length,
      totalHours,
      averageHoursPerDay: availableDays > 0 ? Math.round((totalHours / availableDays) * 10) / 10 : 0
    };
  }, [availability]);

  // Modifier la disponibilité d'un jour
  const updateDayAvailability = (dayOfWeek: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability(prev => 
      prev.map(slot => 
        slot.dayOfWeek === dayOfWeek 
          ? { ...slot, [field]: value }
                  : slot
      )
    );
  };

  // Appliquer un modèle de disponibilité
  const applyTemplate = (template: 'full-time' | 'part-time' | 'morning' | 'afternoon') => {
    let newAvailability: AvailabilitySlot[] = [];
    
    switch (template) {
      case 'full-time':
        newAvailability = weekDays.map(day => ({
          dayOfWeek: day.id,
          startTime: '08:00',
          endTime: day.id === 6 ? '12:00' : '17:00',
          isAvailable: true
        }));
        break;
      case 'part-time':
        newAvailability = weekDays.map(day => ({
          dayOfWeek: day.id,
          startTime: '08:00',
          endTime: '13:00',
          isAvailable: day.id <= 5 // Lundi à vendredi seulement
        }));
        break;
      case 'morning':
        newAvailability = weekDays.map(day => ({
          dayOfWeek: day.id,
          startTime: '08:00',
          endTime: '12:00',
          isAvailable: day.id <= 5
        }));
        break;
      case 'afternoon':
        newAvailability = weekDays.map(day => ({
          dayOfWeek: day.id,
          startTime: '13:00',
          endTime: '17:00',
          isAvailable: day.id <= 5
        }));
        break;
    }
    
    setAvailability(newAvailability);
  };

  // Copier la disponibilité d'un jour vers d'autres jours
  const copyDayAvailability = (fromDay: number, toDays: number[]) => {
    const sourceDay = availability.find(a => a.dayOfWeek === fromDay);
    if (!sourceDay) return;
    
    setAvailability(prev => 
      prev.map(slot =>
        toDays.includes(slot.dayOfWeek)
          ? { ...slot, startTime: sourceDay.startTime, endTime: sourceDay.endTime, isAvailable: sourceDay.isAvailable }
            : slot
        )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 TeacherAvailabilityModal - handleSubmit appelé');
    console.log('🔍 TeacherAvailabilityModal - Données à sauvegarder:', {
      teacherId,
      availability,
      constraints
    });
    
    onSave({
      teacherId,
      availability,
      constraints
    });
    onClose();
  };

  const getDayName = (dayOfWeek: number) => {
    return weekDays.find(d => d.id === dayOfWeek)?.name || 'Inconnu';
  };

  const getAvailabilityStatus = (slot: AvailabilitySlot) => {
    if (!slot.isAvailable) return 'unavailable';
    const start = parseInt(slot.startTime.split(':')[0]);
    const end = parseInt(slot.endTime.split(':')[0]);
    const hours = end - start;
    
    if (hours >= 8) return 'full';
    if (hours >= 6) return 'good';
    if (hours >= 4) return 'limited';
    return 'minimal';
  };

  // Appliquer une suggestion de résolution
  const applySuggestion = (suggestion: ResolutionSuggestion) => {
    console.log('🔧 Application de la suggestion:', suggestion);
    
    switch (suggestion.type) {
      case 'reduce_hours':
        // Réduire les heures de disponibilité
        setAvailability(prev => 
          prev.map(slot => ({
            ...slot,
            endTime: slot.isAvailable ? 
              (parseInt(slot.endTime.split(':')[0]) - 1).toString().padStart(2, '0') + ':00' : 
              slot.endTime
          }))
        );
        break;
        
      case 'increase_hours':
        // Augmenter les heures de disponibilité
        setAvailability(prev => 
          prev.map(slot => ({
            ...slot,
            endTime: slot.isAvailable ? 
              (parseInt(slot.endTime.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' : 
              slot.endTime
          }))
        );
        break;
        
      case 'adjust_schedule':
        // Ajuster l'horaire - réduire les heures et ajuster les créneaux
        setAvailability(prev => 
          prev.map(slot => ({
            ...slot,
            startTime: slot.isAvailable ? '09:00' : slot.startTime,
            endTime: slot.isAvailable ? 
              (parseInt(slot.endTime.split(':')[0]) - 1).toString().padStart(2, '0') + ':00' : 
              slot.endTime
          }))
        );
        break;
        
      case 'modify_constraints':
        // Modifier les contraintes - réduire les heures max par jour
        setConstraints(prev => ({
          ...prev,
          maxHoursPerDay: Math.max(2, prev.maxHoursPerDay - 1)
        }));
        break;
        
      case 'update_availability':
        // Mettre à jour la disponibilité - désactiver certains jours
        setAvailability(prev => 
          prev.map((slot, index) => ({
            ...slot,
            isAvailable: index < 4 // Garder seulement lundi à jeudi
          }))
        );
        break;
        
      case 'manual_review':
        // Révision manuelle - ne rien faire automatiquement
        console.log('Révision manuelle requise pour cette suggestion');
        break;
        
      default:
        console.log('Type de suggestion non reconnu:', suggestion.type);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Disponibilités de {currentTeacherName || 'l\'enseignant'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.availableDays}/{stats.totalDays} jours • {stats.totalHours}h/semaine • {stats.averageHoursPerDay}h/jour
            </p>
            {conflictType && conflictDescription && (
              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Conflit détecté: {conflictType}</span>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {conflictDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      }
      size="2xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Statistiques rapides */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{stats.availableDays} jours disponibles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{stats.totalHours}h/semaine</span>
            </div>
          </div>
          
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
            form="availability-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
          </div>
        </div>
      }
    >
      <form id="availability-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Navigation des onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          <nav className="flex space-x-1" role="tablist">
            <button
              type="button"
              onClick={() => setActiveTab('availability')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'availability'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              role="tab"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Disponibilités
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('constraints')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'constraints'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              role="tab"
            >
              <Settings className="w-4 h-4 mr-2" />
              Contraintes
            </button>
          </nav>
        </div>

        {/* Suggestions de résolution */}
        {suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Suggestions de résolution
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voici des suggestions pour résoudre le conflit détecté
                </p>
              </div>
            </div>
            
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {suggestion.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6">
            {/* Modèles rapides */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-500" />
                Modèles rapides
          </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          type="button"
                  onClick={() => applyTemplate('full-time')}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-sm"
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="font-medium">Temps complet</div>
                    <div className="text-xs text-gray-500">8h-17h</div>
                  </div>
                        </button>
                        <button
                          type="button"
                  onClick={() => applyTemplate('part-time')}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-colors text-sm"
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <div className="font-medium">Temps partiel</div>
                    <div className="text-xs text-gray-500">8h-13h</div>
                  </div>
                        </button>
                            <button
                              type="button"
                  onClick={() => applyTemplate('morning')}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors text-sm"
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                    <div className="font-medium">Matinées</div>
                    <div className="text-xs text-gray-500">8h-12h</div>
                  </div>
                            </button>
                            <button
                              type="button"
                  onClick={() => applyTemplate('afternoon')}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-colors text-sm"
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <div className="font-medium">Après-midis</div>
                    <div className="text-xs text-gray-500">13h-17h</div>
                  </div>
                            </button>
                          </div>
            </div>

            {/* Configuration par jour */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Configuration par jour
              </h4>
              
              <div className="space-y-4">
                {availability.map((slot) => {
                  const dayName = getDayName(slot.dayOfWeek);
                  const status = getAvailabilityStatus(slot);
                  
                  return (
                    <div key={slot.dayOfWeek} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 font-medium text-gray-900 dark:text-gray-100">
                          {dayName}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateDayAvailability(slot.dayOfWeek, 'isAvailable', !slot.isAvailable)}
                            className={`p-2 rounded-lg transition-colors ${
                              slot.isAvailable
                                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                            title={slot.isAvailable ? 'Disponible' : 'Indisponible'}
                          >
                            {slot.isAvailable ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {slot.isAvailable && (
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400">De</label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateDayAvailability(slot.dayOfWeek, 'startTime', e.target.value)}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                title="Heure de début de disponibilité"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400">à</label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateDayAvailability(slot.dayOfWeek, 'endTime', e.target.value)}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                title="Heure de fin de disponibilité"
                              />
                            </div>
                            
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'full' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              status === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              status === 'limited' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}>
                              {parseInt(slot.endTime.split(':')[0]) - parseInt(slot.startTime.split(':')[0])}h
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyDayAvailability(slot.dayOfWeek, weekDays.filter(d => d.id !== slot.dayOfWeek).map(d => d.id))}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copier vers les autres jours"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'constraints' && (
          <div className="space-y-6">
            {/* Préférences horaires */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Préférences horaires
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heure de début préférée
            </label>
                  <input
                    type="time"
                    value={constraints.preferredStartTime}
                    onChange={(e) => setConstraints(prev => ({ ...prev, preferredStartTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    title="Heure de début préférée pour les cours"
                  />
        </div>
        
          <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heure de fin préférée
                  </label>
                  <input
                    type="time"
                    value={constraints.preferredEndTime}
                    onChange={(e) => setConstraints(prev => ({ ...prev, preferredEndTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    title="Heure de fin préférée pour les cours"
                  />
                </div>
              </div>
            </div>

            {/* Contraintes de charge */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Contraintes de charge
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heures maximum par jour
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={constraints.maxHoursPerDay}
                    onChange={(e) => setConstraints(prev => ({ ...prev, maxHoursPerDay: parseInt(e.target.value) }))}
                    className="flex-1"
                    title="Nombre maximum d'heures de cours par jour"
                  />
                  <span className="w-12 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {constraints.maxHoursPerDay}h
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Coffee className="w-5 h-5 mr-2 text-green-600" />
                Notes et contraintes particulières
              </h4>
              
              <textarea
                value={constraints.notes}
                onChange={(e) => setConstraints(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Contraintes particulières, préférences, indisponibilités ponctuelles, etc."
              />
            </div>
          </div>
        )}

        {/* Résumé */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-600" />
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Résumé des disponibilités
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.availableDays}</div>
              <div className="text-blue-800 dark:text-blue-200">Jours disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalHours}</div>
              <div className="text-blue-800 dark:text-blue-200">Heures/semaine</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageHoursPerDay}</div>
              <div className="text-blue-800 dark:text-blue-200">Heures/jour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{constraints.maxHoursPerDay}</div>
              <div className="text-blue-800 dark:text-blue-200">Max heures/jour</div>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default TeacherAvailabilityModal;