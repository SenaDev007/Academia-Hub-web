import React, { useState } from 'react';
import { 
  Settings, 
  Clock, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Check,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Coffee,
  Users,
  Shield
} from 'lucide-react';
import { WorkHoursConfig } from '../../../../types/planning';

interface SchoolConstraints {
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  mandatoryBreaks: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  blockedTimeSlots: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  minRestBetweenClasses: number;
  lunchBreakMandatory: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

interface SchoolConstraintsProps {
  constraints: SchoolConstraints;
  onUpdateConstraints: (constraints: SchoolConstraints) => void;
  workHours: WorkHoursConfig | null;
}

const SchoolConstraints: React.FC<SchoolConstraintsProps> = ({
  constraints,
  onUpdateConstraints,
  workHours
}) => {
  const [editingBreak, setEditingBreak] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [newBreak, setNewBreak] = useState({
    name: '',
    startTime: '',
    endTime: '',
    duration: 0
  });
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [editingBreakData, setEditingBreakData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    duration: 0
  });
  const [editingSlotData, setEditingSlotData] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [showAddBreak, setShowAddBreak] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);

  const days = [
    { id: 1, name: 'Lundi' },
    { id: 2, name: 'Mardi' },
    { id: 3, name: 'Mercredi' },
    { id: 4, name: 'Jeudi' },
    { id: 5, name: 'Vendredi' },
    { id: 6, name: 'Samedi' }
  ];

  const updateConstraint = (key: keyof SchoolConstraints, value: any) => {
    const updatedConstraints = {
      ...constraints,
      [key]: value
    };
    onUpdateConstraints(updatedConstraints);
  };

  const addMandatoryBreak = () => {
    if (!newBreak.name || !newBreak.startTime || !newBreak.endTime) return;
    
    const duration = calculateDuration(newBreak.startTime, newBreak.endTime);
    const breakToAdd = {
      id: `break-${Date.now()}`,
      ...newBreak,
      duration
    };
    
    updateConstraint('mandatoryBreaks', [...constraints.mandatoryBreaks, breakToAdd]);
    setNewBreak({ name: '', startTime: '', endTime: '', duration: 0 });
    setShowAddBreak(false);
  };

  const removeMandatoryBreak = (id: string) => {
    updateConstraint('mandatoryBreaks', constraints.mandatoryBreaks.filter(b => b.id !== id));
  };

  const startEditingBreak = (breakItem: any) => {
    setEditingBreak(breakItem.id);
    setEditingBreakData({
      name: breakItem.name,
      startTime: breakItem.startTime,
      endTime: breakItem.endTime,
      duration: breakItem.duration
    });
  };

  const saveEditingBreak = () => {
    if (!editingBreak) return;
    
    const duration = calculateDuration(editingBreakData.startTime, editingBreakData.endTime);
    const updatedBreaks = constraints.mandatoryBreaks.map(b => 
      b.id === editingBreak 
        ? { ...b, ...editingBreakData, duration }
        : b
    );
    
    updateConstraint('mandatoryBreaks', updatedBreaks);
    setEditingBreak(null);
    setEditingBreakData({ name: '', startTime: '', endTime: '', duration: 0 });
  };

  const cancelEditingBreak = () => {
    setEditingBreak(null);
    setEditingBreakData({ name: '', startTime: '', endTime: '', duration: 0 });
  };

  const addBlockedSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.reason) return;
    
    const slotToAdd = {
      id: `slot-${Date.now()}`,
      ...newSlot
    };
    
    updateConstraint('blockedTimeSlots', [...constraints.blockedTimeSlots, slotToAdd]);
    setNewSlot({ dayOfWeek: 1, startTime: '', endTime: '', reason: '' });
    setShowAddSlot(false);
  };

  const removeBlockedSlot = (id: string) => {
    updateConstraint('blockedTimeSlots', constraints.blockedTimeSlots.filter(s => s.id !== id));
  };

  const startEditingSlot = (slot: any) => {
    setEditingSlot(slot.id);
    setEditingSlotData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason
    });
  };

  const saveEditingSlot = () => {
    if (!editingSlot) return;
    
    const updatedSlots = constraints.blockedTimeSlots.map(s => 
      s.id === editingSlot 
        ? { ...s, ...editingSlotData }
        : s
    );
    
    updateConstraint('blockedTimeSlots', updatedSlots);
    setEditingSlot(null);
    setEditingSlotData({ dayOfWeek: 1, startTime: '', endTime: '', reason: '' });
  };

  const cancelEditingSlot = () => {
    setEditingSlot(null);
    setEditingSlotData({ dayOfWeek: 1, startTime: '', endTime: '', reason: '' });
  };

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    return days.find(d => d.id === dayOfWeek)?.name || 'Inconnu';
  };

  return (
    <div className="space-y-6">
      {/* Contraintes générales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Contraintes Générales
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Définissez les règles de base pour l'établissement
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Limites horaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heures maximum par jour
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={constraints.maxHoursPerDay}
                  onChange={(e) => updateConstraint('maxHoursPerDay', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  title="Nombre maximum d'heures par jour"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">heures</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(constraints.maxHoursPerDay / 12) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Heures maximum par semaine
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={constraints.maxHoursPerWeek}
                  onChange={(e) => updateConstraint('maxHoursPerWeek', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  title="Nombre maximum d'heures par semaine"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">heures</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(constraints.maxHoursPerWeek / 40) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Repos minimum entre les cours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Repos minimum entre les cours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="60"
                step="5"
                value={constraints.minRestBetweenClasses}
                onChange={(e) => updateConstraint('minRestBetweenClasses', parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                title="Repos minimum entre les cours en minutes"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
            </div>
          </div>

          {/* Pause déjeuner obligatoire */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Coffee className="w-4 h-4 mr-2" />
                Pause déjeuner obligatoire
              </label>
              <button
                onClick={() => updateConstraint('lunchBreakMandatory', !constraints.lunchBreakMandatory)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  constraints.lunchBreakMandatory ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={constraints.lunchBreakMandatory ? 'Désactiver la pause déjeuner obligatoire' : 'Activer la pause déjeuner obligatoire'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    constraints.lunchBreakMandatory ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {constraints.lunchBreakMandatory && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Début</label>
                  <input
                    type="time"
                    value={constraints.lunchBreakStart}
                    onChange={(e) => updateConstraint('lunchBreakStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de début de la pause déjeuner"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={constraints.lunchBreakEnd}
                    onChange={(e) => updateConstraint('lunchBreakEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de fin de la pause déjeuner"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pauses obligatoires */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pauses Obligatoires
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Définissez les créneaux de pause pour tous les enseignants
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddBreak(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une pause
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Liste des pauses */}
          <div className="space-y-3 mb-6">
            {constraints.mandatoryBreaks.map((breakItem) => (
              <div key={breakItem.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{breakItem.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {breakItem.startTime} - {breakItem.endTime} ({formatDuration(breakItem.duration)})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditingBreak(breakItem)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeMandatoryBreak(breakItem.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire d'édition de pause */}
          {editingBreak && (
            <div className="border border-blue-200 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Modifier la pause obligatoire</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nom</label>
                  <input
                    type="text"
                    placeholder="Ex: Récréation matinale"
                    value={editingBreakData.name}
                    onChange={(e) => setEditingBreakData({ ...editingBreakData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Nom de la pause obligatoire"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Début</label>
                  <input
                    type="time"
                    value={editingBreakData.startTime}
                    onChange={(e) => setEditingBreakData({ ...editingBreakData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de début de la pause"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={editingBreakData.endTime}
                    onChange={(e) => setEditingBreakData({ ...editingBreakData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de fin de la pause"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={saveEditingBreak}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    title="Sauvegarder les modifications"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditingBreak}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    title="Annuler les modifications"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire d'ajout de pause */}
          {showAddBreak && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Nouvelle pause obligatoire</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nom</label>
                  <input
                    type="text"
                    placeholder="Ex: Récréation matinale"
                    value={newBreak.name}
                    onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Nom de la pause obligatoire"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Début</label>
                  <input
                    type="time"
                    value={newBreak.startTime}
                    onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de début de la pause"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={newBreak.endTime}
                    onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de fin de la pause"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={addMandatoryBreak}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setShowAddBreak(false);
                      setNewBreak({ name: '', startTime: '', endTime: '', duration: 0 });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Annuler l'ajout de pause"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Créneaux bloqués */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Créneaux Bloqués
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Définissez les créneaux où aucun cours ne peut avoir lieu
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddSlot(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Bloquer un créneau
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Liste des créneaux bloqués */}
          <div className="space-y-3 mb-6">
            {constraints.blockedTimeSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {getDayName(slot.dayOfWeek)} - {slot.startTime} à {slot.endTime}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{slot.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditingSlot(slot)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeBlockedSlot(slot.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {constraints.blockedTimeSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>Aucun créneau bloqué défini</p>
              </div>
            )}
          </div>

          {/* Formulaire d'édition de créneau bloqué */}
          {editingSlot && (
            <div className="border border-blue-200 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Modifier le créneau bloqué</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Jour</label>
                  <select
                    value={editingSlotData.dayOfWeek}
                    onChange={(e) => setEditingSlotData({ ...editingSlotData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    aria-label="Sélectionner le jour"
                  >
                    {days.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Début</label>
                  <input
                    type="time"
                    value={editingSlotData.startTime}
                    onChange={(e) => setEditingSlotData({ ...editingSlotData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de début du créneau bloqué"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={editingSlotData.endTime}
                    onChange={(e) => setEditingSlotData({ ...editingSlotData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de fin du créneau bloqué"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Raison</label>
                  <input
                    type="text"
                    placeholder="Ex: Réunion pédagogique"
                    value={editingSlotData.reason}
                    onChange={(e) => setEditingSlotData({ ...editingSlotData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Raison du blocage"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={saveEditingSlot}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    title="Sauvegarder les modifications"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditingSlot}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    title="Annuler les modifications"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire d'ajout de créneau bloqué */}
          {showAddSlot && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Nouveau créneau bloqué</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Jour</label>
                  <select
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    aria-label="Sélectionner le jour"
                  >
                    {days.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Début</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de début du créneau bloqué"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Heure de fin du créneau bloqué"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Raison</label>
                  <input
                    type="text"
                    placeholder="Ex: Réunion pédagogique"
                    value={newSlot.reason}
                    onChange={(e) => setNewSlot({ ...newSlot, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    title="Raison du blocage de ce créneau"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={addBlockedSlot}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSlot(false);
                      setNewSlot({ dayOfWeek: 1, startTime: '', endTime: '', reason: '' });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Annuler l'ajout de créneau bloqué"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résumé des contraintes */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Résumé des Contraintes Actives
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Max {constraints.maxHoursPerDay}h/jour, {constraints.maxHoursPerWeek}h/semaine
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Repos minimum: {constraints.minRestBetweenClasses}min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              {constraints.mandatoryBreaks.length} pause(s) obligatoire(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              {constraints.blockedTimeSlots.length} créneau(x) bloqué(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Pause déjeuner: {constraints.lunchBreakMandatory ? 'Obligatoire' : 'Optionnelle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolConstraints;
