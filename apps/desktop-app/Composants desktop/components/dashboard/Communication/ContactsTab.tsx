import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  RefreshCw,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useCommunicationData } from '../../../hooks/useCommunicationData';
import { Contact, ContactFilters } from '../../../types/communication';

const ContactsTab: React.FC = () => {
  const {
    contacts,
    contactGroups,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    importContacts,
    exportContacts,
    syncContactsWithStudents,
    fetchContacts
  } = useCommunicationData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'email' | 'phone' | 'whatsapp'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Filtrage des contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !searchTerm || 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm) ||
        contact.students.some(student => 
          student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.className.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus = selectedStatus === 'all' || contact.status === selectedStatus;
      
      const matchesClass = selectedClass === 'all' || 
        contact.students.some(student => student.classId === selectedClass);

      const matchesChannel = selectedChannel === 'all' || 
        (selectedChannel === 'email' && contact.email) ||
        (selectedChannel === 'phone' && contact.phone) ||
        (selectedChannel === 'whatsapp' && contact.whatsapp);

      return matchesSearch && matchesStatus && matchesClass && matchesChannel;
    });
  }, [contacts, searchTerm, selectedStatus, selectedClass, selectedChannel]);

  // Statistiques des contacts
  const contactStats = useMemo(() => {
    const total = contacts.length;
    const active = contacts.filter(c => c.status === 'active').length;
    const withEmail = contacts.filter(c => c.email).length;
    const withPhone = contacts.filter(c => c.phone).length;
    const withWhatsApp = contacts.filter(c => c.whatsapp).length;

    return {
      total,
      active,
      inactive: total - active,
      withEmail,
      withPhone,
      withWhatsApp,
      emailRate: total > 0 ? Math.round((withEmail / total) * 100) : 0,
      phoneRate: total > 0 ? Math.round((withPhone / total) * 100) : 0,
      whatsappRate: total > 0 ? Math.round((withWhatsApp / total) * 100) : 0
    };
  }, [contacts]);

  const handleCreateContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      try {
        await deleteContact(contactId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleImportContacts = async (file: File) => {
    try {
      const result = await importContacts(file, {
        skipDuplicates: true,
        updateExisting: false
      });
      
      alert(`Import terminé: ${result.imported} contacts importés, ${result.skipped} ignorés`);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
    }
  };

  const handleExportContacts = async () => {
    try {
      const filters: ContactFilters = {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined
      };
      
      const result = await exportContacts(filters, 'csv');
      alert(`Export terminé: ${result.filePath}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const handleSyncWithStudents = async () => {
    try {
      const result = await syncContactsWithStudents();
      alert(`Synchronisation terminée: ${result.synced} contacts synchronisés, ${result.created} créés, ${result.updated} mis à jour`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  const getStatusIcon = (status: Contact['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPreferredChannelIcon = (channel: Contact['preferredChannel']) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'sms':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Contacts</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{contactStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Actifs</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{contactStats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avec Email</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{contactStats.emailRate}%</p>
            </div>
            <Mail className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avec Téléphone</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{contactStats.phoneRate}%</p>
            </div>
            <Phone className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSyncWithStudents}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Synchroniser
          </button>
          
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </button>
          
          <button
            onClick={handleExportContacts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          
          <button
            onClick={handleCreateContact}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nouveau contact
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canal préféré
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Filtrer par canal préféré"
              >
                <option value="all">Tous les canaux</option>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Filtrer par classe"
              >
                <option value="all">Toutes les classes</option>
                {/* TODO: Ajouter les vraies classes */}
                <option value="6a">6ème A</option>
                <option value="6b">6ème B</option>
                <option value="5a">5ème A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des contacts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des contacts...</span>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucun contact trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedStatus !== 'all' || selectedClass !== 'all' || selectedChannel !== 'all'
                ? 'Aucun contact ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter des contacts ou synchroniser avec les élèves.'
              }
            </p>
            <button
              onClick={handleCreateContact}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un contact
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Élève(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Canaux
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dernier contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                              {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.email || contact.phone || 'Pas de contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {contact.students.map((student, index) => (
                          <div key={index} className="flex items-center">
                            <span>{student.studentName}</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({student.className})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {contact.email && (
                          <Mail className="w-4 h-4 text-blue-500" title="Email disponible" />
                        )}
                        {contact.phone && (
                          <Phone className="w-4 h-4 text-green-500" title="Téléphone disponible" />
                        )}
                        {contact.whatsapp && (
                          <MessageSquare className="w-4 h-4 text-green-600" title="WhatsApp disponible" />
                        )}
                        <div className="ml-2">
                          {getPreferredChannelIcon(contact.preferredChannel)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(contact.status)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-100 capitalize">
                          {contact.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {contact.lastContactedAt 
                        ? new Date(contact.lastContactedAt).toLocaleDateString('fr-FR')
                        : 'Jamais'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TODO: Ajouter les modales pour l'import, l'édition, etc. */}
    </div>
  );
};

export default ContactsTab;
