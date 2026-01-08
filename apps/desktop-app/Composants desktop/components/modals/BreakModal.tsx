import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, Clock, Calendar, Users, Plus, Trash2 } from 'lucide-react';

interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (breaksData: any[]) => void;
  currentBreaks?: any[];
}

const BreakModal: React.FC<BreakModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentBreaks = []
}) => {
  const [breaks, setBreaks] = useState(currentBreaks.length > 0 ? currentBreaks : [
    {
      name: 'Récréation matin',
      type: 'recreation',
      startTime: '10:00',
      endTime: '10:15',
      duration: 15,
      levels: ['Maternelle', 'Primaire']
    },
    {
      name: 'Pause déjeuner',
      type: 'break',
      startTime: '12:00',
      endTime: '13:00',
      duration: 60,
      levels: ['Tous niveaux']
    },
    {
      name: 'Récréation après-midi',
      type: 'recreation',
      startTime: '15:00',
      endTime: '15:15',
      duration: 15,
      levels: ['Maternelle', 'Primaire']
    }
  ]);

  const educationLevels = [
    'Maternelle',
    'Primaire', 
    'Secondaire 1er cycle',
    'Secondaire 2nd cycle',
    'Tous niveaux'
  ];

  const handleBreakChange = (index: number, field: string, value: any) => {
    setBreaks(prev => {
      const newBreaks = [...prev];
      newBreaks[index] = { ...newBreaks[index], [field]: value };
      
      // Recalculer la durée si les heures changent
      if (field === 'startTime' || field === 'endTime') {
        const start = newBreaks[index].startTime;
        const end = newBreaks[index].endTime;
        if (start && end) {
          const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
          const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
          newBreaks[index].duration = endMinutes - startMinutes;
        }
      }
      
      return newBreaks;
    });
  };

  const handleLevelToggle = (breakIndex: number, level: string) => {
    setBreaks(prev => {
      const newBreaks = [...prev];
      const currentLevels = newBreaks[breakIndex].levels;
      
      if (level === 'Tous niveaux') {
        // Si on sélectionne "Tous niveaux", on remplace par cette seule option
        newBreaks[breakIndex].levels = ['Tous niveaux'];
      } else {
        // Si on sélectionne un niveau spécifique
        if (currentLevels.includes('Tous niveaux')) {
          // Si "Tous niveaux" était sélectionné, on le remplace par le niveau spécifique
          newBreaks[breakIndex].levels = [level];
        } else {
          // Sinon, on ajoute/retire le niveau
          if (currentLevels.includes(level)) {
            newBreaks[breakIndex].levels = currentLevels.filter(l => l !== level);
          } else {
            newBreaks[breakIndex].levels = [...currentLevels, level];
          }
        }
      }
      
      return newBreaks;
    });
  };

  const addBreak = () => {
    setBreaks(prev => [...prev, {
      name: 'Nouvelle pause',
      type: 'break',
      startTime: '14:00',
      endTime: '14:15',
      duration: 15,
      levels: ['Tous niveaux']
    }]);
  };

  const removeBreak = (index: number) => {
    setBreaks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(breaks);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration des pauses et récréations"
      size="xl"
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
            form="break-form"
            className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      }
    >
      <form id="break-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Pauses et récréations
            </h4>
            <button
              type="button"
              onClick={addBreak}
              className="px-3 py-1 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          </div>
          
          <div className="space-y-6">
            {breaks.map((breakItem, index) => (
              <div key={index} className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-900/30">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Pause #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeBreak(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom*
                    </label>
                    <input
                      type="text"
                      value={breakItem.name}
                      onChange={(e) => handleBreakChange(index, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type*
                    </label>
                    <select
                      value={breakItem.type}
                      onChange={(e) => handleBreakChange(index, 'type', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="break">Pause</option>
                      <option value="recreation">Récréation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure de début*
                    </label>
                    <input
                      type="time"
                      value={breakItem.startTime}
                      onChange={(e) => handleBreakChange(index, 'startTime', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure de fin*
                    </label>
                    <input
                      type="time"
                      value={breakItem.endTime}
                      onChange={(e) => handleBreakChange(index, 'endTime', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Niveaux concernés*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {educationLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleLevelToggle(index, level)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            breakItem.levels.includes(level)
                              ? 'bg-blue-600 dark:bg-blue-700 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Durée calculée:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{breakItem.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Information</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Les pauses et récréations seront automatiquement intégrées dans tous les emplois du temps. 
              Elles apparaîtront dans la grille horaire et empêcheront la programmation de cours pendant ces créneaux.
            </p>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default BreakModal;