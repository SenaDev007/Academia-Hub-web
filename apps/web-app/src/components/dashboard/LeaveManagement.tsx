import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  User,
  CalendarDays,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import hrService, { Leave, LeaveBalance } from '../../services/hrService';
import LeaveModal from '../modals/LeaveModal';
import ConfirmModal from '../modals/ConfirmModal';

const LeaveManagement: React.FC = () => {
  const { user } = useUser();
  
  // États des données
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États des modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  
  // États de filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Charger les données
  const fetchData = async () => {
    if (!user?.schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [leavesData, balancesData] = await Promise.all([
        hrService.getLeaves(user.schoolId),
        hrService.getLeaveBalances(user.schoolId)
      ]);
      
      setLeaves(leavesData);
      setLeaveBalances(balancesData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [user?.schoolId]);
  
  // Filtrer les congés
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    const matchesType = !typeFilter || leave.leaveType === typeFilter;
    const matchesDate = !dateFilter || 
                       (new Date(leave.startDate) >= new Date(dateFilter) && 
                        new Date(leave.endDate) <= new Date(dateFilter));
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, endIndex);
  
  // Gestion des actions
  const handleCreateLeave = () => {
    setSelectedLeave(null);
    setIsEditMode(false);
    setIsViewMode(false);
    setIsLeaveModalOpen(true);
  };
  
  const handleEditLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsLeaveModalOpen(true);
  };
  
  const handleViewLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsEditMode(false);
    setIsViewMode(true);
    setIsLeaveModalOpen(true);
  };
  
  const handleDeleteLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsConfirmModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedLeave) return;
    
    try {
      await hrService.deleteLeave(selectedLeave.id);
      await fetchData();
      setIsConfirmModalOpen(false);
      setSelectedLeave(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };
  
  const handleApproveLeave = async (leave: Leave) => {
    try {
      await hrService.approveLeave(leave.id, user?.name || 'Admin');
      await fetchData();
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err);
    }
  };
  
  const handleRejectLeave = async (leave: Leave) => {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      try {
        await hrService.rejectLeave(leave.id, user?.name || 'Admin', reason);
        await fetchData();
      } catch (err) {
        console.error('Erreur lors du rejet:', err);
      }
    }
  };
  
  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  // Obtenir la couleur du type de congé
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'sick': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'maternity': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'paternity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'personal': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'unpaid': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'compensatory': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  // Statistiques
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Congés
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les demandes de congés et les soldes des employés
          </p>
        </div>
        <button
          onClick={handleCreateLeave}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle demande
        </button>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejetés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par employé ou raison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
          
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
              <option value="cancelled">Annulé</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              aria-label="Filtrer par type de congé"
            >
              <option value="">Tous les types</option>
              <option value="annual">Congés annuels</option>
              <option value="sick">Congés maladie</option>
              <option value="maternity">Congés maternité</option>
              <option value="paternity">Congés paternité</option>
              <option value="personal">Congés personnels</option>
              <option value="unpaid">Congés sans solde</option>
              <option value="compensatory">Congés compensatoires</option>
            </select>
            
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              aria-label="Filtrer par date"
            />
          </div>
        )}
      </div>
      
      {/* Liste des congés */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Demandes de congés ({filteredLeaves.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedLeaves.map((leave) => (
            <div key={leave.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {leave.employeeName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{leave.position}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type de congé</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(leave.leaveType)}`}>
                        {leave.leaveType === 'annual' ? 'Congés annuels' :
                         leave.leaveType === 'sick' ? 'Congés maladie' :
                         leave.leaveType === 'maternity' ? 'Congés maternité' :
                         leave.leaveType === 'paternity' ? 'Congés paternité' :
                         leave.leaveType === 'personal' ? 'Congés personnels' :
                         leave.leaveType === 'unpaid' ? 'Congés sans solde' :
                         leave.leaveType === 'compensatory' ? 'Congés compensatoires' : leave.leaveType}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Période</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Durée</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {leave.duration} jour{leave.duration > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status === 'pending' ? 'En attente' :
                         leave.status === 'approved' ? 'Approuvé' :
                         leave.status === 'rejected' ? 'Rejeté' :
                         leave.status === 'cancelled' ? 'Annulé' : leave.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Raison</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{leave.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewLeave(leave)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {leave.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveLeave(leave)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Approuver"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRejectLeave(leave)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Rejeter"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleEditLeave(leave)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteLeave(leave)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredLeaves.length)} sur {filteredLeaves.length} résultats
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Précédent
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSave={fetchData}
        leaveData={selectedLeave}
        isEdit={isEditMode}
        isView={isViewMode}
        employees={[]} // TODO: Passer la liste des employés
      />
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer la demande de congé"
        message="Êtes-vous sûr de vouloir supprimer cette demande de congé ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default LeaveManagement;
