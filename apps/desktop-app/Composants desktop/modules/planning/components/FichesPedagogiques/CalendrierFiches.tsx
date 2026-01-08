import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Eye, Edit3, Clock } from 'lucide-react';

const CalendrierFiches = ({ fiches, onSelectDate, onCreateFiche, onViewFiche }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const joursAbrev = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        fiches: getFichesForDate(prevDate)
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date,
        isCurrentMonth: true,
        fiches: getFichesForDate(date)
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        fiches: getFichesForDate(nextDate)
      });
    }
    
    return days;
  };

  const getFichesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return fiches.filter(fiche => fiche.date === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'validee': return 'bg-green-500';
      case 'en_attente': return 'bg-orange-500';
      case 'corrigee': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {joursAbrev.map(jour => (
          <div key={jour} className="p-2 text-center font-medium text-gray-600 text-sm">
            {jour}
          </div>
        ))}
        
        {/* Grille des jours */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
              !day.isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'
            } ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelectDate(day.date)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${
                isToday(day.date) ? 'text-blue-600' : ''
              }`}>
                {day.date.getDate()}
              </span>
              {day.fiches.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-1 rounded-full">
                  {day.fiches.length}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              {day.fiches.slice(0, 3).map(fiche => (
                <div
                  key={fiche.id}
                  className={`text-xs p-1 rounded text-white truncate ${getStatutColor(fiche.statut)}`}
                  title={fiche.titre}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFiche(fiche);
                  }}
                >
                  {fiche.titre.substring(0, 20)}...
                </div>
              ))}
              {day.fiches.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{day.fiches.length - 3} autres
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    // Implémentation simplifiée de la vue semaine
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Vue semaine en cours de développement</p>
      </div>
    );
  };

  const renderDayView = () => {
    const fichesJour = getFichesForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        {fichesJour.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune fiche prévue pour cette date</p>
            <button
              onClick={() => onCreateFiche(currentDate)}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Créer une fiche
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {fichesJour.map(fiche => (
              <div key={fiche.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{fiche.titre}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{fiche.matiere}</span>
                      <span>{fiche.classe}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fiche.duree || '55'} min
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      fiche.statut === 'validee' ? 'bg-green-100 text-green-800' :
                      fiche.statut === 'en_attente' ? 'bg-orange-100 text-orange-800' :
                      fiche.statut === 'corrigee' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fiche.statut === 'validee' ? 'Validée' :
                       fiche.statut === 'en_attente' ? 'En attente' :
                       fiche.statut === 'corrigee' ? 'À corriger' : 'Brouillon'}
                    </span>
                    
                    <button
                      onClick={() => onViewFiche(fiche)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onEditFiche(fiche)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Calendrier des Fiches
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="font-medium min-w-[200px] text-center">
              {mois[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === mode 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onCreateFiche(new Date())}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvelle fiche
          </button>
        </div>
      </div>
      
      {/* Contenu du calendrier */}
      <div>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
      
      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium text-gray-700">Statuts :</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Validée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>En attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>À corriger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Brouillon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendrierFiches;