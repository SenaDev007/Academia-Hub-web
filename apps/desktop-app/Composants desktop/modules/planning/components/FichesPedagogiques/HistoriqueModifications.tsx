import React, { useState } from 'react';
import { History, User, Clock, Eye, RotateCcw, GitBranch, FileText, Edit3 } from 'lucide-react';

const HistoriqueModifications = ({ fiche, versions, onRestoreVersion, onViewVersion }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  const getActionIcon = (action) => {
    switch (action) {
      case 'creation':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'modification':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'validation':
        return <GitBranch className="w-4 h-4 text-purple-500" />;
      case 'correction':
        return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'creation':
        return 'bg-green-50 border-green-200';
      case 'modification':
        return 'bg-blue-50 border-blue-200';
      case 'validation':
        return 'bg-purple-50 border-purple-200';
      case 'correction':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'creation':
        return 'Création initiale';
      case 'modification':
        return 'Modification';
      case 'validation':
        return 'Validation';
      case 'correction':
        return 'Correction demandée';
      default:
        return 'Action inconnue';
    }
  };

  const calculateChanges = (version) => {
    if (!version.changes) return null;
    
    const changes = version.changes;
    return {
      additions: changes.additions || 0,
      deletions: changes.deletions || 0,
      modifications: changes.modifications || 0
    };
  };

  const formatDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5" />
          Historique des modifications ({versions.length} versions)
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showDiff 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showDiff ? 'Masquer les différences' : 'Voir les différences'}
          </button>
        </div>
      </div>

      {/* Timeline des versions */}
      <div className="relative">
        {/* Ligne de timeline */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-4">
          {versions.map((version, index) => {
            const changes = calculateChanges(version);
            const isLatest = index === 0;
            const previousVersion = versions[index + 1];
            
            return (
              <div key={version.id} className="relative">
                {/* Point sur la timeline */}
                <div className={`absolute left-4 w-4 h-4 rounded-full border-2 ${
                  isLatest 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-white border-gray-300'
                }`}></div>
                
                {/* Contenu de la version */}
                <div className={`ml-12 border rounded-lg p-4 ${getActionColor(version.action)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getActionIcon(version.action)}
                        <span className="font-medium">{getActionText(version.action)}</span>
                        {isLatest && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Version actuelle
                          </span>
                        )}
                        <span className="text-sm text-gray-500">v{version.numero}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{version.auteur}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(version.date).toLocaleString()}</span>
                        </div>
                        {previousVersion && (
                          <span className="text-xs text-gray-500">
                            {formatDuration(previousVersion.date, version.date)} après la version précédente
                          </span>
                        )}
                      </div>
                      
                      {version.commentaire && (
                        <p className="text-sm text-gray-700 mb-3 italic">
                          "{version.commentaire}"
                        </p>
                      )}
                      
                      {changes && showDiff && (
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            +{changes.additions} ajouts
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            -{changes.deletions} suppressions
                          </span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            ~{changes.modifications} modifications
                          </span>
                        </div>
                      )}
                      
                      {version.sections && showDiff && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-gray-700">Sections modifiées :</div>
                          <div className="flex flex-wrap gap-1">
                            {version.sections.map((section, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 text-xs rounded">
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onViewVersion(version)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded"
                        title="Voir cette version"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {!isLatest && (
                        <button
                          onClick={() => onRestoreVersion(version)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded"
                          title="Restaurer cette version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistiques de l'historique */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Statistiques de l'historique</h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{versions.length}</div>
            <div className="text-gray-600">Versions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {versions.filter(v => v.action === 'creation').length}
            </div>
            <div className="text-gray-600">Créations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {versions.filter(v => v.action === 'modification').length}
            </div>
            <div className="text-gray-600">Modifications</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {versions.filter(v => v.action === 'validation').length}
            </div>
            <div className="text-gray-600">Validations</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Première version :</span>
            <span>{new Date(versions[versions.length - 1]?.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Dernière modification :</span>
            <span>{new Date(versions[0]?.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Contributeurs :</span>
            <span>{[...new Set(versions.map(v => v.auteur))].length} personne(s)</span>
          </div>
        </div>
      </div>

      {/* Alerte de restauration */}
      {selectedVersion && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Attention</h4>
          <p className="text-sm text-yellow-800 mb-3">
            Vous êtes sur le point de restaurer la version {selectedVersion.numero} du {new Date(selectedVersion.date).toLocaleString()}.
            Cette action remplacera la version actuelle.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onRestoreVersion(selectedVersion);
                setSelectedVersion(null);
              }}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Confirmer la restauration
            </button>
            <button
              onClick={() => setSelectedVersion(null)}
              className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriqueModifications;