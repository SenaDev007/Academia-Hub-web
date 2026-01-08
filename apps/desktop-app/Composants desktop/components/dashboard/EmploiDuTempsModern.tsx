import React, { useState, useMemo } from 'react';
import { Filter, Download, Printer, Clock, MapPin, ChevronLeft, ChevronRight, Plus, Calendar, Users, BookOpen, BarChart3, Settings } from 'lucide-react';

interface ScheduleEntry {
  id: string | number;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  class: string;
  room: string;
  duration?: string;
}

interface Break {
  name: string;
  startTime: string;
  endTime: string;
}

interface Class {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
}

interface EmploiDuTempsProps {
  schedules: ScheduleEntry[];
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
}

const EmploiDuTempsModern: React.FC<EmploiDuTempsProps> = ({
  schedules,
  classes,
  teachers,
  subjects,
  rooms
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const breaks: Break[] = [
    { name: 'Récréation', startTime: '10:00', endTime: '10:15' },
    { name: 'Déjeuner', startTime: '12:00', endTime: '13:00' },
    { name: 'Récréation', startTime: '15:00', endTime: '15:15' }
  ];

  const subjectColors: { [key: string]: string } = {
    'Mathématiques': 'bg-blue-500',
    'Français': 'bg-red-500',
    'Anglais': 'bg-green-500',
    'Physique': 'bg-purple-500',
    'Chimie': 'bg-orange-500',
    'SVT': 'bg-teal-500',
    'Histoire': 'bg-yellow-500',
    'Géographie': 'bg-indigo-500',
    'EPS': 'bg-pink-500',
    'Art': 'bg-rose-500',
    'Musique': 'bg-cyan-500'
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      return (
        (selectedClass === 'all' || schedule.class === selectedClass) &&
        (selectedSubject === 'all' || schedule.subject === selectedSubject) &&
        (selectedTeacher === 'all' || schedule.teacher === selectedTeacher)
      );
    });
  }, [schedules, selectedClass, selectedSubject, selectedTeacher]);

  const getScheduleForSlot = (day: string, time: string) => {
    return filteredSchedules.find(schedule => schedule.day === day && schedule.time === time);
  };

  const isBreakTime = (time: string) => {
    return breaks.some(breakItem => {
      const [startHour] = breakItem.startTime.split(':');
      const [slotHour] = time.split('-')[0].split(':');
      return startHour === slotHour;
    });
  };

  const getBreakForTime = (time: string) => {
    return breaks.find(breakItem => {
      const [startHour] = breakItem.startTime.split(':');
      const [slotHour] = time.split('-')[0].split(':');
      return startHour === slotHour;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (schedule: ScheduleEntry) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedSchedule: ScheduleEntry) => {
    // In a real app, this would update the backend
    console.log('Updated schedule:', updatedSchedule);
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  };

  const handleAddNew = () => {
    setEditingSchedule(null);
    setIsAddModalOpen(true);
  };

  const handleSaveNew = (newSchedule: ScheduleEntry) => {
    // In a real app, this would add to the backend
    console.log('New schedule:', newSchedule);
    setIsAddModalOpen(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['Jour', 'Horaire', 'Matière', 'Enseignant', 'Classe', 'Salle'],
      ...filteredSchedules.map(s => [s.day, s.time, s.subject, s.teacher, s.class, s.room])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emploi-du-temps-${selectedClass}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {isEditModalOpen && editingSchedule && (
        <EditModal
          schedule={editingSchedule}
          onSave={handleSaveEdit}
          onClose={() => setIsEditModalOpen(false)}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          mode="edit"
        />
      )}
      {isAddModalOpen && (
        <EditModal
          schedule={{
            id: Date.now(),
            day: 'Lundi',
            time: '08:00 - 09:00',
            subject: subjects[0]?.name || '',
            teacher: teachers[0]?.name || '',
            class: classes[0]?.name || '',
            room: rooms[0]?.name || '',
            duration: '45min'
          }}
          onSave={handleSaveNew}
          onClose={() => setIsAddModalOpen(false)}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          mode="add"
        />
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-2">Emploi du Temps</h2>
              <p className="text-violet-100 text-lg">Gérez et visualisez l'emploi du temps des classes</p>
        </div>
            <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
          >
                <Calendar className="w-5 h-5 mr-2" />
            {viewMode === 'table' ? 'Vue Grille' : 'Vue Tableau'}
          </button>
          <button
            onClick={handlePrint}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
          >
                <Printer className="w-5 h-5 mr-2" />
            Imprimer
          </button>
          <button
            onClick={handleAddNew}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
          >
                <Plus className="w-5 h-5 mr-2" />
            Ajouter
          </button>
          <button
            onClick={handleExport}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
          >
                <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cours</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{schedules?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Classes Actives</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(schedules?.map(s => s.class)).size || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Matières</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(schedules?.map(s => s.subject)).size || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enseignants</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(schedules?.map(s => s.teacher)).size || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mr-4">
              <Filter className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Filtres et Options</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personnalisez l'affichage de l'emploi du temps</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
              aria-label="Sélectionner une classe"
            >
              <option value="all">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Matière
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
              aria-label="Sélectionner une matière"
            >
              <option value="all">Toutes les matières</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Enseignant
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
              aria-label="Sélectionner un enseignant"
            >
              <option value="all">Tous les enseignants</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
              ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Semaine
            </label>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-1 shadow-sm">
              <button
                onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-all duration-200"
                title="Semaine précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
                <span className="px-4 py-2 text-center min-w-[80px] text-gray-900 dark:text-gray-100 font-semibold">
                S{currentWeek + 1}
              </span>
              <button
                onClick={() => setCurrentWeek(currentWeek + 1)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-all duration-200"
                title="Semaine suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Emploi du Temps - Vue Tableau</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Planning hebdomadaire des cours</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-900/50 dark:to-violet-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-violet-600" />
                    Horaire
                    </div>
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {timeSlots.map(timeSlot => {
                  const breakInfo = isBreakTime(timeSlot) ? getBreakForTime(timeSlot) : null;
                  
                  return (
                    <tr key={timeSlot} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          {timeSlot}
                        </div>
                      </td>
                      {days.map(day => {
                        const schedule = getScheduleForSlot(day, timeSlot);
                        
                        if (breakInfo) {
                          return (
                            <td key={day} className="px-6 py-4">
                              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                              <div className="text-center">
                                  <div className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                  {breakInfo.name}
                                </div>
                                <div className="text-xs text-amber-600 dark:text-amber-400">
                                  {breakInfo.startTime} - {breakInfo.endTime}
                                  </div>
                                </div>
                              </div>
                            </td>
                          );
                        }
                        
                        if (schedule) {
                          return (
                            <td key={day} className="px-6 py-4">
                              <div className={`p-4 rounded-xl ${subjectColors[schedule.subject] || 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white relative group hover:shadow-lg transition-all duration-200 cursor-pointer`}>
                                <div className="font-semibold text-sm mb-1">
                                  {schedule.subject}
                                  {schedule.duration && (
                                    <span className="font-bold ml-1 text-xs opacity-90">({schedule.duration})</span>
                                  )}
                                </div>
                                <div className="text-xs opacity-90 mb-1">{schedule.teacher}</div>
                                <div className="text-xs opacity-75 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {schedule.room}
                                </div>
                                <button
                                  onClick={() => handleEdit(schedule)}
                                  className="absolute top-2 right-2 p-1.5 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/30"
                                  title="Modifier"
                                >
                                  <Settings className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={day} className="px-6 py-4">
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                              <div className="text-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                              Libre
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Emploi du Temps - Vue Grille</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Planning par jour de la semaine</p>
              </div>
            </div>
          </div>
          <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {days.map(day => (
                <div key={day} className="bg-gradient-to-br from-gray-50 to-violet-50 dark:from-gray-900/50 dark:to-violet-900/10 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{day}</h4>
                  </div>
              <div className="space-y-3">
                {timeSlots.map(timeSlot => {
                  const schedule = getScheduleForSlot(day, timeSlot);
                  const breakInfo = isBreakTime(timeSlot) ? getBreakForTime(timeSlot) : null;
                  
                  if (breakInfo) {
                    return (
                          <div key={timeSlot} className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                            <div className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                          {breakInfo.name}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          {breakInfo.startTime} - {breakInfo.endTime}
                        </div>
                      </div>
                    );
                  }
                  
                  if (schedule) {
                    return (
                          <div key={timeSlot} className={`p-4 rounded-xl ${subjectColors[schedule.subject] || 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white relative group hover:shadow-lg transition-all duration-200 cursor-pointer`}>
                            <div className="font-semibold text-sm mb-1">
                          {schedule.subject}
                          {schedule.duration && (
                                <span className="font-bold ml-1 text-xs opacity-90">({schedule.duration})</span>
                          )}
                        </div>
                            <div className="text-xs opacity-90 mb-1">{schedule.teacher}</div>
                            <div className="text-xs opacity-75 mb-1">{timeSlot}</div>
                        <div className="text-xs opacity-75 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {schedule.room}
                        </div>
                        <button
                          onClick={() => handleEdit(schedule)}
                              className="absolute top-2 right-2 p-1.5 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/30"
                          title="Modifier"
                        >
                              <Settings className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                        <div key={timeSlot} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                          <div className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                        {timeSlot} - Libre
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mr-4">
              <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Légende des Matières</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Codes couleur pour identifier les matières</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(subjectColors).map(([subject, color]) => (
              <div key={subject} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-900/50 dark:to-violet-900/10 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className={`w-6 h-6 rounded-lg ${color} shadow-sm`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject}</span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditModalProps {
  schedule: ScheduleEntry;
  onSave: (schedule: ScheduleEntry) => void;
  onClose: () => void;
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
  mode: 'edit' | 'add';
}

const EditModal: React.FC<EditModalProps> = ({ schedule, onSave, onClose, subjects, teachers, rooms, mode }) => {
  const [editedSchedule, setEditedSchedule] = useState(schedule);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
          {mode === 'edit' ? 'Modifier' : 'Ajouter'} l'emploi du temps
        </h3>
          <p className="text-violet-100 text-sm mt-1">
            {mode === 'edit' ? 'Modifiez les détails du cours' : 'Ajoutez un nouveau cours au planning'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Matière
            </label>
            <select
              value={editedSchedule.subject}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
              aria-label="Sélectionner la matière"
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Enseignant
            </label>
            <select
              value={editedSchedule.teacher}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, teacher: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
              aria-label="Sélectionner l'enseignant"
            >
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
              ))}
            </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Salle
            </label>
            <select
              value={editedSchedule.room}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, room: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
              aria-label="Sélectionner la salle"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.name}>{room.name}</option>
              ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Jour
            </label>
            <select
              value={editedSchedule.day}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, day: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
              aria-label="Sélectionner le jour"
            >
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Horaire
            </label>
            <select
              value={editedSchedule.time}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
              aria-label="Sélectionner l'horaire"
            >
              {[
                '08:00 - 09:00',
                '09:00 - 10:00',
                '10:00 - 11:00',
                '11:00 - 12:00',
                '12:00 - 13:00',
                '13:00 - 14:00',
                '14:00 - 15:00',
                '15:00 - 16:00',
                '16:00 - 17:00'
              ].map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Durée
            </label>
            <input
              type="text"
              value={editedSchedule.duration || ''}
              onChange={(e) => setEditedSchedule({
                ...editedSchedule,
                duration: e.target.value || undefined
              })}
              placeholder="Ex: 45min, 1h, 1h30min"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
            />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmploiDuTempsModern;
