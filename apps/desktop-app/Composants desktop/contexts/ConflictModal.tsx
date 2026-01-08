import React, { useState } from 'react';
import { X, AlertTriangle, Check, ArrowRight, Code, Database, Merge } from 'lucide-react';
import { useOffline } from './OfflineProvider';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({ isOpen, onClose }) => {
  const { conflicts, resolveConflict } = useOffline();
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [resolution, setResolution] = useState<'server' | 'client' | 'merge' | null>(null);

  if (!isOpen || conflicts.length === 0) return null;

  const currentConflict = conflicts.find(c => c.id === selectedConflict) || conflicts[0];

  const handleResolve = async () => {
    if (!resolution || !currentConflict) return;

    try {
      await resolveConflict(currentConflict.id, resolution);
      
      // Passer au conflit suivant ou fermer
      const remainingConflicts = conflicts.filter(c => c.id !== currentConflict.id);
      if (remainingConflicts.length > 0) {
        setSelectedConflict(remainingConflicts[0].id);
        setResolution(null);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la résolution du conflit:', error);
    }
  };

  const formatData = (data: any) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const getResolutionConfig = (type: 'server' | 'client' | 'merge') => {
    switch (type) {
      case 'server':
        return {
          title: 'Utiliser la version serveur',
          description: 'Les données du serveur remplaceront vos modifications locales',
          icon: Database,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200'
        };
      case 'client':
        return {
          title: 'Conserver la version locale',
          description: 'Vos modifications locales seront envoyées au serveur',
          icon: Code,
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-200'
        };
      case 'merge':
        return {
          title: 'Fusionner automatiquement',
          description: 'Combinaison intelligente des deux versions',
          icon: Merge,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'from-purple-50 to-violet-50',
          borderColor: 'border-purple-200'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden scale-in">
        {/* En-tête moderne */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200/60">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Résolution de conflits
              </h2>
              <p className="text-slate-600">
                {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''} - Intervention requise
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 micro-bounce"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sélecteur de conflit */}
        {conflicts.length > 1 && (
          <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
            <div className="flex items-center space-x-3 overflow-x-auto">
              {conflicts.map((conflict, index) => (
                <button
                  key={conflict.id}
                  onClick={() => {
                    setSelectedConflict(conflict.id);
                    setResolution(null);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 micro-bounce ${
                    currentConflict.id === conflict.id
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  Conflit {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="space-y-8">
            {/* Informations sur le conflit */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-amber-800 mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Détails du conflit</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-amber-600 font-medium">Endpoint</span>
                  <p className="text-amber-800 font-mono bg-amber-100 px-2 py-1 rounded-lg">
                    {currentConflict.endpoint}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-600 font-medium">Type</span>
                  <p className="text-amber-800 font-semibold">{currentConflict.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-600 font-medium">Détecté le</span>
                  <p className="text-amber-800">{new Date(currentConflict.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Comparaison des données moderne */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Données locales */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/25"></div>
                  <h4 className="font-bold text-slate-900">Version locale</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    Client
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <pre className="text-xs text-blue-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {formatData(currentConflict.localData)}
                  </pre>
                </div>
              </div>

              {/* Données serveur */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/25"></div>
                  <h4 className="font-bold text-slate-900">Version serveur</h4>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Serveur
                  </span>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                  <pre className="text-xs text-emerald-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {formatData(currentConflict.serverData)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Options de résolution modernes */}
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 text-lg">Choisir une stratégie de résolution</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['server', 'client', 'merge'] as const).map((option) => {
                  const config = getResolutionConfig(option);
                  const OptionIcon = config.icon;
                  
                  return (
                    <label
                      key={option}
                      className={`group cursor-pointer transition-all duration-200 ${
                        resolution === option ? 'scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value={option}
                        checked={resolution === option}
                        onChange={(e) => setResolution(e.target.value as any)}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-2xl transition-all duration-200 ${
                        resolution === option
                          ? `bg-gradient-to-br ${config.bgColor} ${config.borderColor} shadow-xl`
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            resolution === option
                              ? `bg-gradient-to-br ${config.color} shadow-lg text-white`
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}>
                            <OptionIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-900">{config.title}</h5>
                          </div>
                          {resolution === option && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {config.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions modernes */}
        <div className="flex items-center justify-between p-8 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div className="text-sm text-slate-600">
            {conflicts.length > 1 && (
              <span className="font-medium">
                Conflit {conflicts.findIndex(c => c.id === currentConflict.id) + 1} sur {conflicts.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-700 border border-slate-300 bg-white rounded-xl hover:bg-slate-50 font-medium transition-all duration-200 micro-bounce"
            >
              Annuler
            </button>
            
            <button
              onClick={handleResolve}
              disabled={!resolution}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 micro-bounce"
            >
              <Check className="w-4 h-4" />
              <span>Résoudre le conflit</span>
              {conflicts.length > 1 && conflicts.findIndex(c => c.id === currentConflict.id) < conflicts.length - 1 && (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;