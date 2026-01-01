import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  User, 
  BookOpen, 
  Users, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject, WorkedHoursEntry } from '../../../../types/planning';
import { WorkedHoursEntryModal } from '../../../modals';

interface TimeTrackingViewProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  allEmployees?: any[]; // Tous les employés
  workedHours?: WorkedHoursEntry[];
  onSave: (data: any) => Promise<void>;
}

const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({
  teachers,
  classes,
  subjects,
  allEmployees,
  workedHours = [],
  onSave
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'validated' | 'disputed'>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkedHoursEntry | null>(null);

  // Log des données reçues
  useEffect(() => {
    console.log('🔍 TimeTrackingView - Données reçues:');
    console.log('  - workedHours:', workedHours);
    console.log('  - workedHours.length:', workedHours.length, 'entrées');
    console.log('  - Type de workedHours:', typeof workedHours);
    console.log('  - Is Array:', Array.isArray(workedHours));
    if (workedHours && workedHours.length > 0) {
      console.log('  - Première entrée:', workedHours[0]);
      console.log('  - Structure de la première entrée:', Object.keys(workedHours[0]));
    } else {
      console.log('  - Aucune donnée ou tableau vide');
    }
  }, [workedHours]);

  // Filtrer les entrées
  const filteredEntries = useMemo(() => {
    console.log('🔍 TimeTrackingView - Filtrage des entrées:', workedHours.length, 'entrées totales');
    return workedHours.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.subjectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
      const matchesEmployee = filterEmployee === 'all' || entry.employeeId === filterEmployee;
      
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [workedHours, searchTerm, filterStatus, filterEmployee]);

  // Statistiques pour la date sélectionnée
  const dayStats = useMemo(() => {
    const dayEntries = workedHours.filter(entry => entry.date === selectedDate);
    const totalScheduled = dayEntries.reduce((sum, entry) => sum + entry.scheduledHours, 0);
    const totalValidated = dayEntries.reduce((sum, entry) => sum + entry.validatedHours, 0);
    const pendingEntries = dayEntries.filter(entry => entry.status === 'pending').length;
    
    return {
      totalScheduled,
      totalValidated,
      pendingEntries,
      variance: totalValidated - totalScheduled
    };
  }, [workedHours, selectedDate]);

  const getStatusColor = (status: WorkedHoursEntry['status']) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'disputed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: WorkedHoursEntry['status']) => {
    switch (status) {
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEntryModeLabel = (mode: WorkedHoursEntry['entryMode']) => {
    switch (mode) {
      case 'manual': return 'Saisie manuelle';
      case 'planning_validation': return 'Validation planning';
      case 'badge': return 'Badgeuse';
      case 'biometric': return 'Biométrie';
      default: return mode;
    }
  };

  const handleValidateEntry = async (entryId: string) => {
    try {
      await onSave({
        action: 'validate',
        entryId,
        validatedBy: 'current-user', // TODO: Récupérer l'utilisateur actuel
        validatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        await onSave({
          action: 'delete',
          entryId
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques du jour sélectionné */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Résumé du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
              aria-label="Sélectionner la date"
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dayStats.totalScheduled}h</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Heures prévues</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dayStats.totalValidated}h</div>
            <div className="text-sm text-green-600 dark:text-green-400">Heures validées</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            dayStats.variance >= 0 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className={`text-2xl font-bold ${
              dayStats.variance >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {dayStats.variance > 0 ? '+' : ''}{dayStats.variance}h
            </div>
            <div className={`text-sm ${
              dayStats.variance >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              Écart
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dayStats.pendingEntries}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">En attente</div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par enseignant, classe ou matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validé</option>
              <option value="disputed">Contesté</option>
            </select>

            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
              aria-label="Filtrer par enseignant"
            >
              <option value="all">Tous les enseignants</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des entrées */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Entrées d'heures travaillées ({filteredEntries.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Enseignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Classe/Matière
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Heures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.employeeName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {entry.className && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {entry.className}
                        </div>
                      )}
                      {entry.subjectName && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {entry.subjectName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-gray-100">
                        Prévu: {entry.scheduledHours}h
                      </div>
                      <div className={`${
                        entry.validatedHours > entry.scheduledHours 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : entry.validatedHours < entry.scheduledHours
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        Validé: {entry.validatedHours}h
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {getEntryModeLabel(entry.entryMode)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {getStatusIcon(entry.status)}
                      <span className="ml-1 capitalize">{entry.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {entry.status === 'pending' && (
                        <button
                          onClick={() => handleValidateEntry(entry.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Valider"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune entrée trouvée</h3>
            <p>Aucune entrée d'heures travaillées ne correspond aux critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal pour ajout/modification d'entrées */}
      {isAddModalOpen && (
        <WorkedHoursEntryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={async (data) => {
            await onSave(data);
            setIsAddModalOpen(false);
          }}
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          allEmployees={allEmployees}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
};

export default TimeTrackingView;
