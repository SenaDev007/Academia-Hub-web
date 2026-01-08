import React, { useState } from 'react';
import { Search, Filter, Calendar, Download, Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import CahierTexteService from './services/CahierTexteService';
import NotificationService from './services/NotificationService';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface CahierTexteHistoryProps {
  user: User;
}

interface HistoriqueEntry {
  id: string;
  date: string;
  matiere: string;
  classe: string;
  theme: string;
  duree: string;
  statut: 'brouillon' | 'soumis' | 'validé' | 'refusé';
  enseignant: string;
  dateCreation: string;
  dateModification?: string;
  commentaire?: string;
}

const CahierTexteHistory: React.FC<CahierTexteHistoryProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({
    matiere: '',
    classe: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
    enseignant: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Données simulées
  const historique: HistoriqueEntry[] = [
    {
      id: '1',
      date: '2025-01-20',
      matiere: 'Mathématiques',
      classe: '6èmeA',
      theme: 'Les nombres décimaux - Addition et soustraction',
      duree: '2h',
      statut: 'validé',
      enseignant: 'Prof. Marie AGBODJAN',
      dateCreation: '2025-01-20T10:30:00',
      dateModification: '2025-01-20T14:20:00',
      commentaire: 'Très bon cours, objectifs atteints'
    },
    {
      id: '2',
      date: '2025-01-19',
      matiere: 'Physique',
      classe: '5èmeB',
      theme: 'La masse et la masse volumique',
      duree: '1h30',
      statut: 'soumis',
      enseignant: 'Prof. Marie AGBODJAN',
      dateCreation: '2025-01-19T16:45:00'
    },
    {
      id: '3',
      date: '2025-01-18',
      matiere: 'Mathématiques',
      classe: '4èmeC',
      theme: 'Théorème de Pythagore - Applications',
      duree: '2h',
      statut: 'validé',
      enseignant: 'Prof. Marie AGBODJAN',
      dateCreation: '2025-01-18T09:15:00',
      dateModification: '2025-01-18T15:30:00'
    },
    {
      id: '4',
      date: '2025-01-17',
      matiere: 'Mathématiques',
      classe: '6èmeA',
      theme: 'Les fractions - Comparaison',
      duree: '2h',
      statut: 'refusé',
      enseignant: 'Prof. Marie AGBODJAN',
      dateCreation: '2025-01-17T11:20:00',
      commentaire: 'Objectifs à préciser, contenu à développer'
    },
    {
      id: '5',
      date: '2025-01-16',
      matiere: 'Physique',
      classe: '5èmeB',
      theme: 'Les états de la matière',
      duree: '1h30',
      statut: 'brouillon',
      enseignant: 'Prof. Marie AGBODJAN',
      dateCreation: '2025-01-16T14:10:00'
    }
  ];

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'validé': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'soumis': return <Clock className="h-5 w-5 text-yellow-600" />;  
      case 'refusé': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Edit className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validé': return 'text-green-600 bg-green-100';
      case 'soumis': return 'text-yellow-600 bg-yellow-100';
      case 'refusé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'validé': return 'Validé';
      case 'soumis': return 'En attente';
      case 'refusé': return 'Refusé';
      default: return 'Brouillon';
    }
  };

  const filteredData = historique.filter(entry => {
    const matchSearch = entry.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       entry.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       entry.classe.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchMatiere = !filtres.matiere || entry.matiere === filtres.matiere;
    const matchClasse = !filtres.classe || entry.classe === filtres.classe;
    const matchStatut = !filtres.statut || entry.statut === filtres.statut;
    const matchDateDebut = !filtres.dateDebut || entry.date >= filtres.dateDebut;
    const matchDateFin = !filtres.dateFin || entry.date <= filtres.dateFin;
    
    // Filtre enseignant pour les rôles admin
    const matchEnseignant = user.role === 'enseignant' || !filtres.enseignant || 
                           entry.enseignant.toLowerCase().includes(filtres.enseignant.toLowerCase());

    return matchSearch && matchMatiere && matchClasse && matchStatut && 
           matchDateDebut && matchDateFin && matchEnseignant;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const resetFiltres = () => {
    setFiltres({
      matiere: '',
      classe: '',
      statut: '',
      dateDebut: '',
      dateFin: '',
      enseignant: ''
    });
  };

  const exporterDonnees = async () => {
    try {
      NotificationService.showInfo('Génération du rapport en cours...');
      
      const blob = await CahierTexteService.exporterPDF(filteredData, 'rapport');
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `historique_cahier_texte_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      NotificationService.showSuccess('Rapport exporté avec succès');
    } catch (error) {
      NotificationService.showError('Erreur lors de l\'export');
      console.error('Erreur export:', error);
    }
  };

  const voirDetails = (entry: HistoriqueEntry) => {
    // Ouvrir modal de détails ou naviguer vers une page dédiée
    alert(`Affichage des détails pour: ${entry.theme}`);
  };

  const modifierCours = (entry: HistoriqueEntry) => {
    if (entry.statut !== 'brouillon') {
      NotificationService.showWarning('Seuls les brouillons peuvent être modifiés');
      return;
    }
    // Naviguer vers l'édition
    alert(`Modification du cours: ${entry.theme}`);
  };

  const supprimerCours = async (entry: HistoriqueEntry) => {
    if (entry.statut !== 'brouillon') {
      NotificationService.showWarning('Seuls les brouillons peuvent être supprimés');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        // Appeler service de suppression
        await CahierTexteService.supprimerBrouillon(entry.id);
        NotificationService.showSuccess('Cours supprimé avec succès');
        // Rafraîchir la liste
        window.location.reload();
      } catch (error) {
        NotificationService.showError('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des Cours</h2>
          <p className="text-gray-600">Consultez et gérez vos entrées du cahier de texte</p>
        </div>
        <button
          onClick={exporterDonnees}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par thème, matière ou classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                <select
                  value={filtres.matiere}
                  onChange={(e) => setFiltres({...filtres, matiere: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les matières</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Français">Français</option>
                  <option value="Histoire">Histoire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <select
                  value={filtres.classe}
                  onChange={(e) => setFiltres({...filtres, classe: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les classes</option>
                  <option value="6èmeA">6èmeA</option>
                  <option value="5èmeB">5èmeB</option>
                  <option value="4èmeC">4èmeC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={filtres.statut}
                  onChange={(e) => setFiltres({...filtres, statut: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="soumis">En attente</option>
                  <option value="validé">Validé</option>
                  <option value="refusé">Refusé</option>
                </select>
              </div>
              {user.role !== 'enseignant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
                  <input
                    type="text"
                    value={filtres.enseignant}
                    onChange={(e) => setFiltres({...filtres, enseignant: e.target.value})}
                    placeholder="Nom de l'enseignant"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input
                  type="date"
                  value={filtres.dateDebut}
                  onChange={(e) => setFiltres({...filtres, dateDebut: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input
                  type="date"
                  value={filtres.dateFin}
                  onChange={(e) => setFiltres({...filtres, dateFin: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFiltres}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredData.length} résultat(s) trouvé(s)
          </h3>
          <div className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matière / Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thème
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                {user.role !== 'enseignant' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enseignant
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.matiere}</div>
                    <div className="text-sm text-gray-500">{entry.classe}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {entry.theme}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.duree}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(entry.statut)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.statut)}`}>
                        {getStatusText(entry.statut)}
                      </span>
                    </div>
                  </td>
                  {user.role !== 'enseignant' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.enseignant}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => voirDetails(entry)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(user.role === 'enseignant' && entry.statut === 'brouillon') && (
                        <button
                          onClick={() => modifierCours(entry)}
                          className="text-green-600 hover:text-green-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {(user.role === 'enseignant' && entry.statut === 'brouillon') && (
                        <button
                          onClick={() => supprimerCours(entry)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CahierTexteHistory;