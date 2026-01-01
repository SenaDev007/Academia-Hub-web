import React, { useState } from 'react';
import { Download, FileText, CheckSquare, Filter, Calendar, Users } from 'lucide-react';

const ExportBulk = ({ fiches, onBulkExport }) => {
  const [selectedFiches, setSelectedFiches] = useState([]);
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf',
    structure: 'individuel',
    qualite: 'haute',
    includeIndex: true,
    groupBy: 'matiere',
    dateRange: 'all'
  });
  const [filters, setFilters] = useState({
    matiere: '',
    classe: '',
    statut: '',
    enseignant: '',
    dateDebut: '',
    dateFin: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const filteredFiches = fiches.filter(fiche => {
    return (
      (!filters.matiere || fiche.matiere === filters.matiere) &&
      (!filters.classe || fiche.classe === filters.classe) &&
      (!filters.statut || fiche.statut === filters.statut) &&
      (!filters.enseignant || fiche.enseignant.includes(filters.enseignant)) &&
      (!filters.dateDebut || fiche.date >= filters.dateDebut) &&
      (!filters.dateFin || fiche.date <= filters.dateFin)
    );
  });

  const toggleFicheSelection = (ficheId) => {
    setSelectedFiches(prev => 
      prev.includes(ficheId) 
        ? prev.filter(id => id !== ficheId)
        : [...prev, ficheId]
    );
  };

  const selectAllFiltered = () => {
    const allIds = filteredFiches.map(f => f.id);
    setSelectedFiches(allIds);
  };

  const clearSelection = () => {
    setSelectedFiches([]);
  };

  const handleBulkExport = async () => {
    setIsExporting(true);
    
    try {
      const selectedFichesData = fiches.filter(f => selectedFiches.includes(f.id));
      
      const exportData = {
        fiches: selectedFichesData,
        options: exportOptions,
        timestamp: new Date().toISOString(),
        totalCount: selectedFichesData.length,
        grouping: groupFichesByOption(selectedFichesData)
      };
      
      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onBulkExport(exportData);
      
    } catch (error) {
      console.error('Erreur lors de l\'export groupé:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const groupFichesByOption = (fichesData) => {
    const groupBy = exportOptions.groupBy;
    
    return fichesData.reduce((groups, fiche) => {
      let key;
      switch (groupBy) {
        case 'matiere':
          key = fiche.matiere;
          break;
        case 'classe':
          key = fiche.classe;
          break;
        case 'enseignant':
          key = fiche.enseignant;
          break;
        case 'date':
          key = new Date(fiche.date).toLocaleDateString();
          break;
        default:
          key = 'Toutes';
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(fiche);
      return groups;
    }, {});
  };

  const getEstimatedSize = () => {
    const baseSize = selectedFiches.length * (
      exportOptions.qualite === 'haute' ? 2.5 :
      exportOptions.qualite === 'moyenne' ? 1.5 : 0.8
    );
    
    return baseSize > 1000 ? `${(baseSize / 1000).toFixed(1)} GB` : `${Math.round(baseSize)} MB`;
  };

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      en_attente: { color: 'bg-orange-100 text-orange-800', text: 'En attente' },
      validee: { color: 'bg-green-100 text-green-800', text: 'Validée' },
      corrigee: { color: 'bg-red-100 text-red-800', text: 'À corriger' }
    };
    
    return badges[statut] || badges.brouillon;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export groupé de fiches
        </h3>
        
        <div className="text-sm text-gray-600">
          {selectedFiches.length} fiche(s) sélectionnée(s) sur {filteredFiches.length}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Filtres */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matière
              </label>
              <select
                value={filters.matiere}
                onChange={(e) => setFilters({...filters, matiere: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Français">Français</option>
                <option value="Sciences Physiques">Sciences Physiques</option>
                <option value="SVT">SVT</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe
              </label>
              <select
                value={filters.classe}
                onChange={(e) => setFilters({...filters, classe: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                <option value="6ème">6ème</option>
                <option value="5ème">5ème</option>
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({...filters, statut: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                <option value="validee">Validées</option>
                <option value="en_attente">En attente</option>
                <option value="brouillon">Brouillons</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Période
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateDebut}
                  onChange={(e) => setFilters({...filters, dateDebut: e.target.value})}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                />
                <input
                  type="date"
                  value={filters.dateFin}
                  onChange={(e) => setFilters({...filters, dateFin: e.target.value})}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des fiches */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Fiches disponibles</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAllFiltered}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Tout désélectionner
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredFiches.map(fiche => (
              <div
                key={fiche.id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedFiches.includes(fiche.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => toggleFicheSelection(fiche.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedFiches.includes(fiche.id)}
                    onChange={() => toggleFicheSelection(fiche.id)}
                    className="rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{fiche.titre}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <span>{fiche.matiere}</span>
                      <span>•</span>
                      <span>{fiche.classe}</span>
                      <span>•</span>
                      <span>{fiche.date}</span>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutBadge(fiche.statut).color}`}>
                    {getStatutBadge(fiche.statut).text}
                  </span>
                </div>
              </div>
            ))}
            
            {filteredFiches.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune fiche ne correspond aux filtres</p>
              </div>
            )}
          </div>
        </div>

        {/* Options d'export */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-4">Options d'export</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions({...exportOptions, format: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="docx">Word (DOCX)</option>
                <option value="zip">Archive ZIP</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Structure
              </label>
              <select
                value={exportOptions.structure}
                onChange={(e) => setExportOptions({...exportOptions, structure: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="individuel">Fichiers individuels</option>
                <option value="combine">Document combiné</option>
                <option value="dossier">Dossier par groupe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grouper par
              </label>
              <select
                value={exportOptions.groupBy}
                onChange={(e) => setExportOptions({...exportOptions, groupBy: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="matiere">Matière</option>
                <option value="classe">Classe</option>
                <option value="enseignant">Enseignant</option>
                <option value="date">Date</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualité
              </label>
              <select
                value={exportOptions.qualite}
                onChange={(e) => setExportOptions({...exportOptions, qualite: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeIndex}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeIndex: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm">Inclure un index</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé de l'export */}
      {selectedFiches.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Résumé de l'export</h4>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{selectedFiches.length}</div>
              <div className="text-gray-600">Fiches</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Object.keys(groupFichesByOption(fiches.filter(f => selectedFiches.includes(f.id)))).length}
              </div>
              <div className="text-gray-600">Groupes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{getEstimatedSize()}</div>
              <div className="text-gray-600">Taille estimée</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {exportOptions.format.toUpperCase()}
              </div>
              <div className="text-gray-600">Format</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleBulkExport}
          disabled={selectedFiches.length === 0 || isExporting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Export en cours...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exporter ({selectedFiches.length})
            </>
          )}
        </button>
      </div>

      {/* Conseils */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Conseils pour l'export groupé</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Utilisez les filtres pour sélectionner rapidement les fiches pertinentes</p>
          <p>• Le groupement facilite l'organisation des fichiers exportés</p>
          <p>• L'export combiné crée un seul document avec toutes les fiches</p>
          <p>• Vérifiez la taille estimée avant de lancer l'export</p>
        </div>
      </div>
    </div>
  );
};

export default ExportBulk;