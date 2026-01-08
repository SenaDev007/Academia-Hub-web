import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  User, 
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import { PlanningTeacher, WorkedHoursEntry } from '../../../../types/planning';

interface ConsolidationViewProps {
  teachers: PlanningTeacher[];
  workedHours: WorkedHoursEntry[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

type ViewType = 'daily' | 'weekly' | 'monthly';

const ConsolidationView: React.FC<ConsolidationViewProps> = ({
  teachers,
  workedHours,
  selectedPeriod,
  onPeriodChange
}) => {
  const [viewType, setViewType] = useState<ViewType>('weekly');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Générer les données consolidées selon le type de vue
  const consolidatedData = useMemo(() => {
    const now = new Date();
    const data: any[] = [];

    if (viewType === 'daily') {
      // Vue journalière - derniers 7 jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEntries = workedHours.filter(entry => 
          entry.date === dateStr && 
          (selectedEmployee === 'all' || entry.employeeId === selectedEmployee)
        );
        
        const scheduled = dayEntries.reduce((sum, entry) => sum + entry.scheduledHours, 0);
        const validated = dayEntries.reduce((sum, entry) => sum + entry.validatedHours, 0);
        
        data.push({
          period: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          fullDate: dateStr,
          scheduled,
          validated,
          variance: validated - scheduled,
          entries: dayEntries.length
        });
      }
    } else if (viewType === 'weekly') {
      // Vue hebdomadaire - dernières 8 semaines
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekEntries = workedHours.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart && entryDate <= weekEnd &&
            (selectedEmployee === 'all' || entry.employeeId === selectedEmployee);
        });
        
        const scheduled = weekEntries.reduce((sum, entry) => sum + entry.scheduledHours, 0);
        const validated = weekEntries.reduce((sum, entry) => sum + entry.validatedHours, 0);
        
        data.push({
          period: `S${Math.ceil((weekStart.getDate()) / 7)}`,
          fullDate: `${weekStart.toLocaleDateString('fr-FR')} - ${weekEnd.toLocaleDateString('fr-FR')}`,
          scheduled,
          validated,
          variance: validated - scheduled,
          entries: weekEntries.length
        });
      }
    } else {
      // Vue mensuelle - derniers 6 mois
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthEntries = workedHours.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= month && entryDate <= monthEnd &&
            (selectedEmployee === 'all' || entry.employeeId === selectedEmployee);
        });
        
        const scheduled = monthEntries.reduce((sum, entry) => sum + entry.scheduledHours, 0);
        const validated = monthEntries.reduce((sum, entry) => sum + entry.validatedHours, 0);
        
        data.push({
          period: month.toLocaleDateString('fr-FR', { month: 'short' }),
          fullDate: month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          scheduled,
          validated,
          variance: validated - scheduled,
          entries: monthEntries.length
        });
      }
    }

    return data;
  }, [viewType, selectedEmployee, workedHours, currentDate]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const filteredEntries = selectedEmployee === 'all' 
      ? workedHours 
      : workedHours.filter(entry => entry.employeeId === selectedEmployee);
    
    const totalScheduled = filteredEntries.reduce((sum, entry) => sum + entry.scheduledHours, 0);
    const totalValidated = filteredEntries.reduce((sum, entry) => sum + entry.validatedHours, 0);
    const totalOvertime = filteredEntries.reduce((sum, entry) => 
      sum + Math.max(0, entry.validatedHours - entry.scheduledHours), 0);
    const totalUndertime = filteredEntries.reduce((sum, entry) => 
      sum + Math.max(0, entry.scheduledHours - entry.validatedHours), 0);
    
    return {
      totalScheduled,
      totalValidated,
      totalOvertime,
      totalUndertime,
      completionRate: totalScheduled > 0 ? Math.round((totalValidated / totalScheduled) * 100) : 0,
      averageDaily: totalValidated / Math.max(1, new Set(filteredEntries.map(e => e.date)).size)
    };
  }, [workedHours, selectedEmployee]);

  // Données pour le graphique
  const maxValue = Math.max(...consolidatedData.map(d => Math.max(d.scheduled, d.validated)));

  const viewTypes = [
    { id: 'daily' as ViewType, name: 'Journalier', icon: Calendar },
    { id: 'weekly' as ViewType, name: 'Hebdomadaire', icon: BarChart3 },
    { id: 'monthly' as ViewType, name: 'Mensuel', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Consolidation des Heures Travaillées
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Analyse comparative des heures prévues vs réalisées
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les enseignants</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
            
            <button className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prévu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{globalStats.totalScheduled}h</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Validé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{globalStats.totalValidated}h</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heures Sup.</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{globalStats.totalOvertime}h</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux Réalisation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{globalStats.completionRate}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteur de vue */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex space-x-1" role="tablist">
          {viewTypes.map((view) => {
            const Icon = view.icon;
            const isActive = viewType === view.id;

            return (
              <button
                key={view.id}
                onClick={() => setViewType(view.id)}
                className={`
                  flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-slate-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                role="tab"
                aria-selected={isActive ? 'true' : 'false'}
              >
                <Icon className="w-4 h-4 mr-2" />
                {view.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Graphique de consolidation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Évolution {viewType === 'daily' ? 'Journalière' : viewType === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Heures prévues</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Heures validées</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {consolidatedData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.period}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-blue-600 dark:text-blue-400">{item.scheduled}h prévues</span>
                  <span className="text-green-600 dark:text-green-400">{item.validated}h validées</span>
                  <span className={`${
                    item.variance >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.variance > 0 ? '+' : ''}{item.variance}h
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex space-x-1 h-8">
                  {/* Barre des heures prévues */}
                  <div 
                    className="bg-blue-200 dark:bg-blue-800 rounded-l"
                    style={{ width: `${(item.scheduled / maxValue) * 100}%` }}
                  ></div>
                  {/* Barre des heures validées */}
                  <div 
                    className="bg-green-200 dark:bg-green-800 rounded-r"
                    style={{ width: `${(item.validated / maxValue) * 100}%` }}
                  ></div>
                </div>
                
                {/* Indicateurs de variance */}
                {item.variance !== 0 && (
                  <div className="absolute right-0 top-0 h-8 flex items-center">
                    {item.variance > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau détaillé par enseignant (si vue globale) */}
      {selectedEmployee === 'all' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Répartition par Enseignant
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Heures Prévues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Heures Validées
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Écart
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Taux
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {teachers.map((teacher) => {
                  const teacherEntries = workedHours.filter(entry => entry.employeeId === teacher.id);
                  const scheduled = teacherEntries.reduce((sum, entry) => sum + entry.scheduledHours, 0);
                  const validated = teacherEntries.reduce((sum, entry) => sum + entry.validatedHours, 0);
                  const variance = validated - scheduled;
                  const rate = scheduled > 0 ? Math.round((validated / scheduled) * 100) : 0;

                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {teacher.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {scheduled}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {validated}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${
                          variance >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {variance > 0 ? '+' : ''}{variance}h
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rate >= 100 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : rate >= 80
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidationView;
