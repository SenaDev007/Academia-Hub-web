import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, Eye, MessageCircle, Filter, Search, Calendar } from 'lucide-react';
import { CahierJournalEntry, IValidationWorkflow } from './types';
import { NotificationService } from "./services/NotificationService";
import CahierJournalView from './CahierJournalView';
import { useCahierJournalData } from '../../hooks/useCahierJournalData';

interface DirectorDashboardProps {
  onBack: () => void;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ onBack }) => {
  const [selectedEntry, setSelectedEntry] = useState<CahierJournalEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Utiliser les données réelles depuis le hook
  const { data: allEntries, loading, error } = useCahierJournalData();

  // Filtrer les séances en attente de validation
  const pendingEntries = allEntries.filter(entry => 
    entry.statut === 'en_attente_validation' || 
    entry.statut === 'valide' || 
    entry.statut === 'reporte'
  );

  // Charger les notifications depuis localStorage
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('platform_notifications') || '[]');
    setNotifications(storedNotifications);
  }, []);

  const filteredEntries = pendingEntries.filter(entry => {
    const matchesSearch = 
      entry.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.enseignant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || entry.statut === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (workflowId: string, comment?: string) => {
    const entry = pendingEntries.find(e => e.id === workflowId);
    if (!entry) return;
    
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'approve',
      entry,
      'Directeur',
      comment || 'Validation rapide approuvée'
    );
    
    notificationService.sendWhatsAppNotification(
      '22912345678', // Numéro de l'enseignant
      message,
      entry.id
    );
    
    // Mettre à jour les données réelles
    const updatedEntries = allEntries.map(entry => 
      entry.id === workflowId 
        ? { ...entry, statut: 'valide' as const, updatedAt: new Date().toISOString() }
        : entry
    );
    
    // Mettre à jour le hook avec les données mises à jour
    // (à implémenter)
    
    alert('✅ Séance approuvée. L\'enseignant a été notifié par WhatsApp.');
  };

  const handleReject = (workflowId: string, comment: string) => {
    const entry = pendingEntries.find(e => e.id === workflowId);
    if (!entry) return;
    
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'reject',
      entry,
      'Directeur',
      comment
    );
    
    notificationService.sendWhatsAppNotification(
      '22912345678', // Numéro de l'enseignant
      message,
      entry.id
    );
    
    // Mettre à jour les données réelles
    const updatedEntries = allEntries.map(entry => 
      entry.id === workflowId 
        ? { ...entry, statut: 'reporte' as const, updatedAt: new Date().toISOString() }
        : entry
    );
    
    // Mettre à jour le hook avec les données mises à jour
    // (à implémenter)
    
    alert('❌ Séance rejetée. L\'enseignant a été notifié par WhatsApp.');
  };

  const handleReturn = (workflowId: string, comment: string) => {
    const entry = pendingEntries.find(e => e.id === workflowId);
    if (!entry) return;
    
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'return',
      entry,
      'Directeur',
      comment
    );
    
    notificationService.sendWhatsAppNotification(
      '22912345678', // Numéro de l'enseignant
      message,
      entry.id
    );
    
    // Mettre à jour les données réelles
    const updatedEntries = allEntries.map(entry => 
      entry.id === workflowId 
        ? { ...entry, statut: 'planifie' as const, updatedAt: new Date().toISOString() }
        : entry
    );
    
    // Mettre à jour le hook avec les données mises à jour
    // (à implémenter)
    
    alert('🔄 Séance retournée pour révision. L\'enseignant a été notifié par WhatsApp.');
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente_validation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'valide': return 'bg-green-100 text-green-800 border-green-200';
      case 'reporte': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente_validation': return 'En attente';
      case 'valide': return 'Validé';
      case 'reporte': return 'Rejeté';
      default: return statut;
    }
  };

  if (selectedEntry) {
    return (
      <CahierJournalView
        entry={selectedEntry}
        onEdit={() => {}}
        onBack={() => setSelectedEntry(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <MessageCircle className="text-blue-600" />
              Espace Directeur - Validation des Séances
            </h1>
            <p className="text-gray-600 mt-1">Examinez et validez les séances soumises par les enseignants</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <div className="relative">
              <Bell className="text-gray-600" size={24} />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingEntries.filter(e => e.statut === 'en_attente_validation').length}
              </p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-3xl font-bold text-green-600">
                {pendingEntries.filter(e => e.statut === 'valide').length}
              </p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-3xl font-bold text-red-600">
                {pendingEntries.filter(e => e.statut === 'reporte').length}
              </p>
            </div>
            <AlertTriangle className="text-red-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{pendingEntries.length}</p>
            </div>
            <MessageCircle className="text-gray-400" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par enseignant, matière, classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente_validation">En attente</option>
            <option value="valide">Validées</option>
            <option value="reporte">Rejetées</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter size={16} />
            Plus de filtres
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune séance trouvée</h3>
            <p className="text-gray-600">Aucune séance ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entry.matiere} - {entry.classe}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.statut)}`}>
                      {getStatusLabel(entry.statut)}
                    </span>
                    {entry.statut === 'en_attente_validation' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Enseignant:</span> {entry.enseignant}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Durée:</span> {entry.duree} minutes
                    </div>
                    <div>
                      <span className="font-medium">Soumise le:</span> {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">{entry.objectifs}</p>

                  <div className="flex flex-wrap gap-2">
                    {entry.competences.map((competence, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {competence}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Examiner
                  </button>
                </div>
              </div>

              {/* Actions rapides pour les séances en attente */}
              {entry.statut === 'en_attente_validation' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(entry.id, 'Validation rapide')}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approuver rapidement
                    </button>
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Examiner en détail
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Instructions pour la validation</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Examinez chaque séance pour vérifier la conformité aux programmes officiels</li>
          <li>• Vérifiez la cohérence entre objectifs, compétences et déroulement</li>
          <li>• Approuvez les séances conformes ou retournez-les avec des commentaires constructifs</li>
          <li>• Les enseignants recevront automatiquement une notification WhatsApp de votre décision</li>
        </ul>
      </div>
    </div>
  );
};

export default DirectorDashboard;