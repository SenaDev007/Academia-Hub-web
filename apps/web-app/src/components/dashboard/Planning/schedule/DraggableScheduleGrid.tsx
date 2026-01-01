import React, { useState, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Move,
  GripVertical
} from 'lucide-react';
import { PlanningSchedule, PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';

interface DraggableScheduleGridProps {
  schedule: PlanningSchedule[];
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  workHours: any;
  onScheduleUpdate: (schedule: PlanningSchedule[]) => void;
  onEditEntry: (entry: PlanningSchedule) => void;
  onDeleteEntry: (entryId: string) => void;
  onAddEntry: (dayOfWeek: number, timeSlot: string) => void;
}

interface DragState {
  isDragging: boolean;
  draggedEntry: PlanningSchedule | null;
  dragOverSlot: string | null;
  startPosition: { x: number; y: number } | null;
}

const DraggableScheduleGrid: React.FC<DraggableScheduleGridProps> = ({
  schedule,
  teachers,
  classes,
  subjects,
  workHours,
  onScheduleUpdate,
  onEditEntry,
  onDeleteEntry,
  onAddEntry
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEntry: null,
    dragOverSlot: null,
    startPosition: null
  });

  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Créneaux horaires
  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Obtenir l'entrée pour un créneau spécifique
  const getEntryForSlot = (dayOfWeek: number, timeSlot: string): PlanningSchedule | null => {
    return schedule.find(entry => 
      entry.dayOfWeek === dayOfWeek && 
      entry.startTime === timeSlot.split('-')[0]
    ) || null;
  };

  // Vérifier si un créneau est disponible pour le déplacement
  const isSlotAvailable = (dayOfWeek: number, timeSlot: string, excludeEntryId?: string): boolean => {
    const entry = getEntryForSlot(dayOfWeek, timeSlot);
    return !entry || (excludeEntryId && entry.id === excludeEntryId);
  };

  // Gestion du début du drag
  const handleDragStart = useCallback((e: React.DragEvent, entry: PlanningSchedule) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', entry.id);
    
    setDragState({
      isDragging: true,
      draggedEntry: entry,
      dragOverSlot: null,
      startPosition: { x: e.clientX, y: e.clientY }
    });

    // Ajouter une classe pour l'effet visuel
    (e.target as HTMLElement).classList.add('opacity-50');
  }, []);

  // Gestion de la fin du drag
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('opacity-50');
    
    setDragState({
      isDragging: false,
      draggedEntry: null,
      dragOverSlot: null,
      startPosition: null
    });
    setHoveredSlot(null);
  }, []);

  // Gestion du survol pendant le drag
  const handleDragOver = useCallback((e: React.DragEvent, dayOfWeek: number, timeSlot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const slotKey = `${dayOfWeek}_${timeSlot}`;
    setHoveredSlot(slotKey);
    
    if (dragState.draggedEntry) {
      setDragState(prev => ({
        ...prev,
        dragOverSlot: slotKey
      }));
    }
  }, [dragState.draggedEntry]);

  // Gestion de la sortie du survol
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Vérifier si on sort vraiment du slot
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setHoveredSlot(null);
      setDragState(prev => ({
        ...prev,
        dragOverSlot: null
      }));
    }
  }, []);

  // Gestion du drop
  const handleDrop = useCallback((e: React.DragEvent, dayOfWeek: number, timeSlot: string) => {
    e.preventDefault();
    
    const entryId = e.dataTransfer.getData('text/plain');
    const entry = schedule.find(e => e.id === entryId);
    
    if (!entry) return;

    const newStartTime = timeSlot.split('-')[0];
    const newEndTime = timeSlot.split('-')[1];
    
    // Vérifier si le créneau est disponible
    if (!isSlotAvailable(dayOfWeek, timeSlot, entryId)) {
      console.warn('Créneau non disponible');
      return;
    }

    // Mettre à jour l'entrée
    const updatedEntry: PlanningSchedule = {
      ...entry,
      dayOfWeek,
      startTime: newStartTime,
      endTime: newEndTime,
      day: days.find(d => d.id === dayOfWeek)?.name || 'Inconnu',
      time: timeSlot
    };

    // Mettre à jour le planning
    const updatedSchedule = schedule.map(s => 
      s.id === entryId ? updatedEntry : s
    );
    
    onScheduleUpdate(updatedSchedule);
    
    setDragState({
      isDragging: false,
      draggedEntry: null,
      dragOverSlot: null,
      startPosition: null
    });
    setHoveredSlot(null);
  }, [schedule, onScheduleUpdate, days]);

  // Obtenir la classe CSS pour un slot
  const getSlotClasses = (dayOfWeek: number, timeSlot: string, entry: PlanningSchedule | null) => {
    const baseClasses = "relative min-h-[60px] border border-gray-200 dark:border-gray-600 rounded-lg p-2 transition-all duration-200";
    const slotKey = `${dayOfWeek}_${timeSlot}`;
    
    if (dragState.isDragging && hoveredSlot === slotKey) {
      return `${baseClasses} bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 ring-2 ring-blue-400`;
    }
    
    if (entry) {
      return `${baseClasses} bg-white dark:bg-gray-700 hover:shadow-md cursor-move`;
    }
    
    return `${baseClasses} bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`;
  };

  // Obtenir la couleur selon le type de cours
  const getEntryColor = (entry: PlanningSchedule) => {
    const subject = subjects.find(s => s.id === entry.subjectId);
    if (!subject) return 'bg-gray-500';
    
    // Couleurs par niveau
    switch (subject.level) {
      case 'Maternelle': return 'bg-pink-500';
      case 'Primaire': return 'bg-green-500';
      case 'Secondaire': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* En-tête avec jours */}
      <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="p-3 text-center font-medium text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 mx-auto mb-1" />
          <span className="text-xs">Heure</span>
        </div>
        {days.map(day => (
          <div key={day.id} className="p-3 text-center font-medium text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs">{day.short}</div>
          </div>
        ))}
      </div>

      {/* Grille des créneaux */}
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {timeSlots.map(timeSlot => (
          <div key={timeSlot} className="grid grid-cols-8 min-h-[60px]">
            {/* Colonne des heures */}
            <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {timeSlot}
              </span>
            </div>

            {/* Colonnes des jours */}
            {days.map(day => {
              const entry = getEntryForSlot(day.id, timeSlot);
              const slotKey = `${day.id}_${timeSlot}`;
              const isHovered = hoveredSlot === slotKey;
              const isDragging = dragState.isDragging && dragState.draggedEntry?.id === entry?.id;

              return (
                <div
                  key={`${day.id}_${timeSlot}`}
                  className={getSlotClasses(day.id, timeSlot, entry)}
                  onDragOver={(e) => handleDragOver(e, day.id, timeSlot)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.id, timeSlot)}
                  onClick={() => !entry && onAddEntry(day.id, timeSlot)}
                >
                  {entry ? (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, entry)}
                      onDragEnd={handleDragEnd}
                      className={`h-full rounded-lg p-2 text-white cursor-move transition-all duration-200 hover:shadow-lg ${
                        isDragging ? 'opacity-50' : ''
                      } ${getEntryColor(entry)}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 opacity-70" />
                          <span className="text-xs font-medium truncate">
                            {entry.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(entry);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(entry.id);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs opacity-90 truncate">
                        {entry.teacher}
                      </div>
                      
                      <div className="text-xs opacity-75 truncate">
                        {entry.class}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      {isHovered && dragState.isDragging ? (
                        <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                          Déposer ici
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddEntry(day.id, timeSlot)}
                          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Ajouter un cours"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span>Maternelle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Primaire</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Secondaire</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Glissez-déposez pour réorganiser • Cliquez pour ajouter
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableScheduleGrid;
