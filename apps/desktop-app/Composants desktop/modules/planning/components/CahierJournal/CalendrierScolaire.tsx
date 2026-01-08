import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CahierJournalEntry } from '../types';

interface CalendrierScolaireProps {
  entries: CahierJournalEntry[];
  onBack: () => void;
}

const CalendrierScolaire: React.FC<CalendrierScolaireProps> = ({ entries, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        entries: []
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === currentDate.toDateString();
      });

      days.push({
        date: currentDate,
        isCurrentMonth: true,
        entries: dayEntries
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        entries: []
      });
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-500';
      case 'en_cours': return 'bg-yellow-500';
      case 'realise': return 'bg-green-500';
      case 'reporte': return 'bg-orange-500';
      case 'valide': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date().toDateString();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendrier Scolaire</h1>
              <p className="text-gray-600">Vue mensuelle des séances planifiées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-100 ${
                day.isCurrentMonth 
                  ? 'bg-white' 
                  : 'bg-gray-50'
              } ${
                day.date.toDateString() === today 
                  ? 'ring-2 ring-blue-500 ring-opacity-50' 
                  : ''
              } hover:bg-gray-50 transition-colors`}
            >
              <div className={`text-sm ${
                day.isCurrentMonth 
                  ? day.date.toDateString() === today 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-900'
                  : 'text-gray-400'
              } mb-1`}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {day.entries.slice(0, 2).map((entry, entryIndex) => (
                  <div
                    key={entryIndex}
                    className={`text-xs px-2 py-1 rounded text-white truncate ${getStatutColor(entry.statut)}`}
                    title={`${entry.matiere} - ${entry.classe}`}
                  >
                    {entry.matiere}
                  </div>
                ))}
                {day.entries.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{day.entries.length - 2} autre(s)
                  </div>
                )}
              </div>

              {day.isCurrentMonth && (
                <button className="w-full mt-1 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  onClick={() => {
                    const dateStr = day.date.toLocaleDateString('fr-FR');
                    alert(`Créer une nouvelle séance pour le ${dateStr}`);
                    // En production, ouvrir le formulaire de création avec la date pré-remplie
                  title="Créer une séance"
                  }}
                  <Plus size={14} className="mx-auto" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Légende</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Planifiée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-600">En cours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Réalisée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-xs text-gray-600">Reportée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-xs text-gray-600">Validée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendrierScolaire;