import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, UserPlus, Mail, Phone, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface UtilisateurData {
  id?: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  matieres: string[];
  classes: string[];
  telephone?: string;
  adresse?: string;
  statut: string;
}

interface GestionUtilisateursProps {
  user: User;
}

const GestionUtilisateurs: React.FC<GestionUtilisateursProps> = ({ user }) => {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UtilisateurData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formData, setFormData] = useState<UtilisateurData>({
    email: '',
    nom: '',
    prenom: '',
    role: 'enseignant',
    matieres: [],
    classes: [],
    telephone: '',
    adresse: '',
    statut: 'actif'
  });

  const roles = [
    { value: 'enseignant', label: 'Enseignant' },
    { value: 'directeur', label: 'Directeur' },
    { value: 'conseiller', label: 'Conseiller Pédagogique' },
    { value: 'administrateur', label: 'Administrateur' }
  ];

  const matieresList = [
    'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie',
    'Sciences de la Vie et de la Terre (SVT)', 'Physique-Chimie',
    'Éducation Civique et Morale', 'Éducation Physique et Sportive',
    'Arts Plastiques', 'Musique', 'Technologie', 'Informatique'
  ];

  const classesList = [
    '6èmeA', '6èmeB', '6èmeC', '5èmeA', '5èmeB', '5èmeC',
    '4èmeA', '4èmeB', '4èmeC', '3èmeA', '3èmeB', '3èmeC'
  ];

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUtilisateurs(data.data.users);
      } else {
        console.error('Erreur chargement utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModal = (utilisateur?: UtilisateurData) => {
    if (utilisateur) {
      setSelectedUser(utilisateur);
      setFormData(utilisateur);
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        nom: '',
        prenom: '',
        role: 'enseignant',
        matieres: [],
        classes: [],
        telephone: '',
        adresse: '',
        statut: 'actif'
      });
    }
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const sauvegarderUtilisateur = async () => {
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await chargerUtilisateurs();
        fermerModal();
        // Afficher notification de succès
      } else {
        console.error('Erreur sauvegarde utilisateur');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const supprimerUtilisateur = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await chargerUtilisateurs();
        // Afficher notification de succès
      } else {
        console.error('Erreur suppression utilisateur');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const utilisateursFiltres = utilisateurs.filter(utilisateur => {
    const matchSearch = !searchTerm || 
      utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRole = !roleFilter || utilisateur.role === roleFilter;
    
    return matchSearch && matchRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrateur': return 'bg-red-100 text-red-800';
      case 'directeur': return 'bg-purple-100 text-purple-800';
      case 'conseiller': return 'bg-blue-100 text-blue-800';
      case 'enseignant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">Gérer les enseignants et le personnel administratif</p>
        </div>
        <button
          onClick={() => ouvrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les rôles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {utilisateursFiltres.length} utilisateur(s) trouvé(s)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matières/Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {utilisateursFiltres.map((utilisateur) => (
                <tr key={utilisateur.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {utilisateur.prenom} {utilisateur.nom}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {utilisateur.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(utilisateur.role)}`}>
                      {roles.find(r => r.value === utilisateur.role)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {utilisateur.matieres?.length > 0 && (
                        <div className="mb-1">
                          <strong>Matières:</strong> {utilisateur.matieres.slice(0, 2).join(', ')}
                          {utilisateur.matieres.length > 2 && ` +${utilisateur.matieres.length - 2}`}
                        </div>
                      )}
                      {utilisateur.classes?.length > 0 && (
                        <div>
                          <strong>Classes:</strong> {utilisateur.classes.slice(0, 3).join(', ')}
                          {utilisateur.classes.length > 3 && ` +${utilisateur.classes.length - 3}`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {utilisateur.telephone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {utilisateur.telephone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(utilisateur.statut)}`}>
                      {utilisateur.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => ouvrirModal(utilisateur)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.role === 'administrateur' && utilisateur.id !== user.id && (
                        <button
                          onClick={() => supprimerUtilisateur(utilisateur.id!)}
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
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              </div>

              {formData.role === 'enseignant' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matières enseignées</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {matieresList.map(matiere => (
                        <label key={matiere} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.matieres.includes(matiere)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, matieres: [...formData.matieres, matiere]});
                              } else {
                                setFormData({...formData, matieres: formData.matieres.filter(m => m !== matiere)});
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{matiere}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classes assignées</label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {classesList.map(classe => (
                        <label key={classe} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.classes.includes(classe)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, classes: [...formData.classes, classe]});
                              } else {
                                setFormData({...formData, classes: formData.classes.filter(c => c !== classe)});
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{classe}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={fermerModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sauvegarderUtilisateur}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {selectedUser ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUtilisateurs;