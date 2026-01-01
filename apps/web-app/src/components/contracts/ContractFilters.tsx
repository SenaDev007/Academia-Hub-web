import React, { useState } from 'react';
import { Search, Filter, X, Calendar, Users, DollarSign } from 'lucide-react';
import { Contract } from '../../services/hrService';

interface ContractFiltersProps {
  contracts: Contract[];
  onFilteredContracts: (contracts: Contract[]) => void;
}

const ContractFilters: React.FC<ContractFiltersProps> = ({ contracts, onFilteredContracts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    let filtered = contracts;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contractType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contract => contract.contractType === typeFilter);
    }

    // Filtre par durée
    if (durationFilter !== 'all') {
      filtered = filtered.filter(contract => contract.contractDuration === durationFilter);
    }

    onFilteredContracts(filtered);
  }, [contracts, searchTerm, statusFilter, typeFilter, durationFilter, onFilteredContracts]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDurationFilter('all');
  };

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (durationFilter !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recherche et filtres</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trouvez rapidement les contrats recherchés</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filtres</span>
          {getFilterCount() > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, poste ou type de contrat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="inline-block w-4 h-4 mr-2" />
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="expired">Expiré</option>
              <option value="terminated">Résilié</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          {/* Filtre par type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="inline-block w-4 h-4 mr-2" />
              Type de contrat
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les types</option>
              <option value="permanent">Permanent</option>
              <option value="vacataire">Vacataire</option>
            </select>
          </div>

          {/* Filtre par durée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              Durée
            </label>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Toutes les durées</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="mission-ponctuelle">Mission ponctuelle</option>
            </select>
          </div>
        </div>
      )}

      {/* Actions */}
      {getFilterCount() > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Effacer les filtres</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractFilters;
