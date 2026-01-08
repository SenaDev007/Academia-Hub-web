import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Copy, Edit, Trash2, Clock, Users, BookOpen } from 'lucide-react';
import { CahierJournalEntry } from '../types';

interface PlanificationSemaineProps {
  entries: CahierJournalEntry[];
  onCreateEntry: (entry: Omit<CahierJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateEntry: (entry: CahierJournalEntry) => void;
  onDuplicateEntry: (entry: CahierJournalEntry) => void;
  onBack: () => void;
}

const PlanificationSemaine: React.FC<PlanificationSemaineProps> = ({ 
  entries, 
  onCreateEntry, 
  onUpdateEntry, 
  onDuplicateEntry, 
  onBack 
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedEntry, setDraggedEntry] = useState<CahierJournalEntry | null>(null);

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const getEntriesForDay = (date: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    }).sort((a, b) => {
      // Trier par heure si disponible, sinon par ordre de création
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleDragStart = (e: React.DragEvent, entry: CahierJournalEntry) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedEntry) {
      const updatedEntry = {
        ...draggedEntry,
        date: targetDate.toISOString().split('T')[0]
      };
      onUpdateEntry(updatedEntry);
      setDraggedEntry(null);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'realise': return 'bg-green-100 text-green-800 border-green-200';
      case 'reporte': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'valide': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatWeekRange = () => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    return `${firstDay.getDate()} ${firstDay.toLocaleDateString('fr-FR', { month: 'long' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('fr-FR', { month: 'long' })} ${lastDay.getFullYear()}`;
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Planification Hebdomadaire</h1>
              <p className="text-gray-600">Organisez vos séances par glisser-déposer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {formatWeekRange()}
          </h2>
          
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayEntries = getEntriesForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isWeekend = index >= 5;

          return (
            <div
              key={day.toISOString()}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] ${
                isWeekend ? 'bg-gray-50' : ''
              } ${isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Day Header */}
              <div className={`p-4 border-b border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                      {dayNames[index]}
                    </h3>
                    <p className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                      {day.getDate()} {day.toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const dateStr = day.toLocaleDateString('fr-FR');
                      if (confirm(`Créer une nouvelle séance pour le ${dateStr} ?`)) {
                        const newEntry = {
                          date: day.toISOString().split('T')[0],
                          classe: '',
                          matiere: '',
                          duree: 60,
                          objectifs: '',
                          competences: [],
                          deroulement: '',
                          supports: '',
                          evaluation: '',
                          observations: '',
                          statut: 'planifie' as const,
                          enseignant: 'Marie KOUASSI'
                        };
                        onCreateEntry(newEntry);
                        alert('✅ Nouvelle séance créée avec succès !');
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Créer une séance"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Day Content */}
              <div className="p-3 space-y-2">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, entry)}
                    className={`p-3 rounded-lg border cursor-move hover:shadow-md transition-all ${getStatutColor(entry.statut)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{entry.matiere}</h4>
                        <p className="text-xs opacity-75 flex items-center gap-1">
                          <Users size={12} />
                          {entry.classe}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => {
                            onDuplicateEntry(entry);
                            alert('✅ Séance dupliquée avec succès !');
                          }}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => {
                            alert('Fonction de modification en cours de développement');
                            // En production, ouvrir le formulaire d'édition
                          }}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {entry.duree}min
                      </span>
                      <span className="truncate max-w-[80px]" title={entry.objectifs}>
                        {entry.objectifs.substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                ))}

                {dayEntries.length === 0 && !isWeekend && (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune séance planifiée</p>
                    <p className="text-xs">Glissez une séance ici</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la semaine</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {entries.filter(e => {
                const entryDate = new Date(e.date);
                return weekDays.some(day => day.toDateString() === entryDate.toDateString());
              }).length}
            </div>
            <div className="text-sm text-gray-600">Séances planifiées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {entries.filter(e => {
                const entryDate = new Date(e.date);
                return weekDays.some(day => day.toDateString() === entryDate.toDateString()) && e.statut === 'realise';
              }).length}
            </div>
            <div className="text-sm text-gray-600">Séances réalisées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {entries.filter(e => {
                const entryDate = new Date(e.date);
                return weekDays.some(day => day.toDateString() === entryDate.toDateString()) && e.statut === 'reporte';
              }).length}
            </div>
            <div className="text-sm text-gray-600">Séances reportées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((entries.filter(e => {
                const entryDate = new Date(e.date);
                return weekDays.some(day => day.toDateString() === entryDate.toDateString()) && e.statut === 'realise';
              }).length / Math.max(1, entries.filter(e => {
                const entryDate = new Date(e.date);
                return weekDays.some(day => day.toDateString() === entryDate.toDateString());
              }).length)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Taux de réalisation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanificationSemaine;