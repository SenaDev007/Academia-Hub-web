import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Calendar,
  X,
  Check,
  Filter,
  Search,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { WorkedHoursAlert } from '../../../../types/planning';

interface AlertsViewProps {
  alerts: WorkedHoursAlert[];
  onResolveAlert: (alertId: string) => void;
}

const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onResolveAlert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'absence' | 'overtime' | 'undertime' | 'contract_exceeded'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Filtrer les alertes
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = !searchTerm || 
        alert.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesResolved = showResolved || !alert.isResolved;
      
      return matchesSearch && matchesType && matchesSeverity && matchesResolved;
    });
  }, [alerts, searchTerm, filterType, filterSeverity, showResolved]);

  // Statistiques des alertes
  const alertStats = useMemo(() => {
    const activeAlerts = alerts.filter(alert => !alert.isResolved);
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
    const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');
    const overtimeAlerts = activeAlerts.filter(alert => alert.type === 'overtime');
    const absenceAlerts = activeAlerts.filter(alert => alert.type === 'absence');

    return {
      totalActive: activeAlerts.length,
      critical: criticalAlerts.length,
      high: highAlerts.length,
      overtime: overtimeAlerts.length,
      absence: absenceAlerts.length,
      resolved: alerts.filter(alert => alert.isResolved).length
    };
  }, [alerts]);

  const getSeverityColor = (severity: WorkedHoursAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type: WorkedHoursAlert['type']) => {
    switch (type) {
      case 'overtime': return <TrendingUp className="w-5 h-5" />;
      case 'absence': return <TrendingDown className="w-5 h-5" />;
      case 'undertime': return <Clock className="w-5 h-5" />;
      case 'contract_exceeded': return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: WorkedHoursAlert['type']) => {
    switch (type) {
      case 'overtime': return 'Heures supplémentaires';
      case 'absence': return 'Absence';
      case 'undertime': return 'Sous-temps';
      case 'contract_exceeded': return 'Contrat dépassé';
      default: return type;
    }
  };

  const getSeverityLabel = (severity: WorkedHoursAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return severity;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir marquer cette alerte comme résolue ?')) {
      onResolveAlert(alertId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques des alertes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertes Actives</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{alertStats.totalActive}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critiques</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{alertStats.critical}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heures Sup.</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{alertStats.overtime}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absences</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{alertStats.absence}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration des seuils d'alerte */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Configuration des Alertes
            </h4>
            <p className="text-yellow-700 dark:text-yellow-300">
              Définissez les seuils de déclenchement des alertes automatiques pour un meilleur contrôle.
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Configurer
          </button>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par enseignant ou message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les types</option>
              <option value="overtime">Heures supplémentaires</option>
              <option value="absence">Absences</option>
              <option value="undertime">Sous-temps</option>
              <option value="contract_exceeded">Contrat dépassé</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevé</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>

            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                showResolved 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {showResolved ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
              {showResolved ? 'Masquer résolues' : 'Voir résolues'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border-2 p-6 transition-all duration-200 ${
              alert.isResolved 
                ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-75'
                : getSeverityColor(alert.severity)
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  alert.isResolved 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : alert.severity === 'critical' 
                    ? 'bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300'
                    : alert.severity === 'high'
                    ? 'bg-orange-200 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300'
                    : 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {alert.isResolved ? <CheckCircle className="w-5 h-5" /> : getTypeIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {alert.message}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.isResolved 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : getSeverityColor(alert.severity).split(' ')[0] + ' ' + getSeverityColor(alert.severity).split(' ')[1]
                    }`}>
                      {alert.isResolved ? 'Résolu' : getSeverityLabel(alert.severity)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {alert.employeeName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(alert.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-1 flex items-center justify-center">
                        {getTypeIcon(alert.type)}
                      </span>
                      {getTypeLabel(alert.type)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {alert.details}
                  </p>
                  
                  {alert.threshold && alert.actualValue && (
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Seuil: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{alert.threshold}h</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Réel: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{alert.actualValue}h</span>
                      </div>
                    </div>
                  )}
                  
                  {alert.isResolved && alert.resolvedAt && alert.resolvedBy && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Résolu le {new Date(alert.resolvedAt).toLocaleDateString('fr-FR')} par {alert.resolvedBy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {!alert.isResolved && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    title="Marquer comme résolu"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Résoudre
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BellOff className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune alerte trouvée</h3>
          <p>Aucune alerte ne correspond aux critères de recherche sélectionnés.</p>
        </div>
      )}

      {/* Résumé des actions recommandées */}
      {alertStats.totalActive > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Actions Recommandées
          </h4>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            {alertStats.critical > 0 && (
              <p>• Traiter en priorité les {alertStats.critical} alerte(s) critique(s)</p>
            )}
            {alertStats.overtime > 0 && (
              <p>• Vérifier les {alertStats.overtime} cas d'heures supplémentaires</p>
            )}
            {alertStats.absence > 0 && (
              <p>• Justifier les {alertStats.absence} absence(s) détectée(s)</p>
            )}
            <p>• Mettre à jour les seuils d'alerte si nécessaire</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsView;
