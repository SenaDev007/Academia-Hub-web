import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertCircle, X, Settings, Zap, Database, Wifi } from 'lucide-react';
import { useOffline } from './OfflineProvider';

interface SyncStatusProps {
  className?: string;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ className = '' }) => {
  const { 
    isOnline, 
    isSyncing, 
    syncProgress, 
    pendingChanges, 
    lastSyncTime,
    conflicts,
    forceSync,
    clearCache 
  } = useOffline();

  const [showDetails, setShowDetails] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  // Auto-sync périodique
  useEffect(() => {
    if (!autoSync || !isOnline || isSyncing) return;

    const interval = setInterval(() => {
      if (pendingChanges > 0) {
        forceSync();
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [autoSync, isOnline, isSyncing, pendingChanges, forceSync]);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Jamais';
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getSyncStatusConfig = () => {
    if (conflicts.length > 0) {
      return {
        color: 'text-red-600',
        bgColor: 'from-red-50 to-rose-50',
        borderColor: 'border-red-200',
        icon: AlertCircle,
        text: `${conflicts.length} conflit${conflicts.length > 1 ? 's' : ''} à résoudre`,
        pulse: true
      };
    }
    
    if (isSyncing) {
      return {
        color: 'text-blue-600',
        bgColor: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        icon: RefreshCw,
        text: `Synchronisation... ${Math.round(syncProgress)}%`,
        pulse: false
      };
    }
    
    if (pendingChanges > 0) {
      return {
        color: 'text-amber-600',
        bgColor: 'from-amber-50 to-yellow-50',
        borderColor: 'border-amber-200',
        icon: Clock,
        text: `${pendingChanges} modification${pendingChanges > 1 ? 's' : ''} en attente`,
        pulse: true
      };
    }
    
    return {
      color: 'text-emerald-600',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle,
      text: 'Tout est synchronisé',
      pulse: false
    };
  };

  const status = getSyncStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className={`card-modern ${className}`}>
      {/* En-tête moderne */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${status.bgColor} border ${status.borderColor} rounded-2xl flex items-center justify-center ${status.pulse ? 'animate-pulse' : ''}`}>
              <StatusIcon className={`w-6 h-6 ${status.color} ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Synchronisation</h3>
              <p className={`text-sm font-medium ${status.color}`}>
                {status.text}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {isOnline && pendingChanges > 0 && (
              <button
                onClick={forceSync}
                disabled={isSyncing}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 micro-bounce"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Barre de progression moderne */}
        {isSyncing && (
          <div className="mt-4 fade-in-up">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Synchronisation en cours</span>
              <span className="font-bold">{Math.round(syncProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Détails étendus */}
      {showDetails && (
        <div className="p-6 space-y-6 fade-in-up">
          {/* Métriques visuelles */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/60">
              <div className="text-2xl font-bold text-slate-900">{pendingChanges}</div>
              <div className="text-xs text-slate-600 font-medium">En attente</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/60">
              <div className="text-2xl font-bold text-slate-900">{conflicts.length}</div>
              <div className="text-xs text-slate-600 font-medium">Conflits</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/60">
              <div className={`text-2xl font-bold ${isOnline ? 'text-emerald-600' : 'text-orange-600'}`}>
                {isOnline ? '100' : '0'}%
              </div>
              <div className="text-xs text-slate-600 font-medium">Connectivité</div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Wifi className={`w-4 h-4 ${isOnline ? 'text-emerald-500' : 'text-orange-500'}`} />
                <span className="text-sm font-medium text-slate-700">Statut réseau</span>
              </div>
              <span className={`text-sm font-bold ${isOnline ? 'text-emerald-600' : 'text-orange-600'}`}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Dernière sync</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{formatTime(lastSyncTime)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Cache local</span>
              </div>
              <span className="text-sm font-bold text-slate-900">Actif</span>
            </div>
          </div>

          {/* Options avancées */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Synchronisation automatique</span>
              </div>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  autoSync 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' 
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                    autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={clearCache}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl hover:from-red-100 hover:to-rose-100 font-medium transition-all duration-200 micro-bounce"
            >
              <X className="w-4 h-4" />
              <span>Vider le cache local</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;