import React, { useState } from 'react';
import { Search, Filter, Eye, Edit3, Download, Send, MessageSquare, Trash2, Copy } from 'lucide-react';
import EnvoiDirecteurModal from './EnvoiDirecteurModal';
import fichesPedagogiquesService from './services/fichesPedagogiquesService';

const FichesList = ({ filters, niveauxScolaires, onSelectFiche, onEditFiche }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showEnvoiDirecteur, setShowEnvoiDirecteur] = useState(false);
  const [selectedFicheForSend, setSelectedFicheForSend] = useState(null);

  // Données exemple
  const fiches = [
    {
      anneeScolaire: "2024-2025",
      trimestre: "1",
      id: 1,
      titre: "Les fractions - Addition et soustraction",
      matiere: "Mathématiques",
      niveauScolaire: "secondaire",
      classe: "6ème",
      saNumero: "SA 3",
      sequenceNumero: "Séquence 2",
      date: "2025-01-20",
      statut: "en_attente",
      enseignant: "M. KOUASSI",
      commentaires: 2,
      lastModified: "2025-01-18 14:30"
    },
    {
      anneeScolaire: "2024-2025",
      trimestre: "1",
      id: 2,
      titre: "La conjugaison du présent",
      matiere: "Français",
      niveauScolaire: "secondaire",
      classe: "5ème",
      saNumero: "SA 2",
      sequenceNumero: "Séquence 1",
      date: "2025-01-19",
      statut: "validee",
      enseignant: "Mme ADJOVI",
      commentaires: 0,
      lastModified: "2025-01-17 10:15"
    },
    {
      anneeScolaire: "2024-2025",
      trimestre: "2",
      id: 3,
      titre: "Les états de la matière",
      matiere: "Sciences Physiques",
      niveauScolaire: "secondaire",
      classe: "4ème",
      saNumero: "SA 1",
      sequenceNumero: "Séquence 3",
      date: "2025-01-22",
      statut: "corrigee",
      enseignant: "M. DOSSOU",
      commentaires: 3,
      lastModified: "2025-01-16 16:45"
    },
    {
      anneeScolaire: "2024-2025",
      trimestre: "2",
      id: 4,
      titre: "La photosynthèse",
      matiere: "SVT",
      niveauScolaire: "secondaire",
      classe: "3ème",
      saNumero: "SA 2",
      sequenceNumero: "Séquence 1",
      date: "2025-01-21",
      statut: "brouillon",
      enseignant: "Mme TOSSOU",
      commentaires: 0,
      lastModified: "2025-01-15 09:20"
    },
    {
      anneeScolaire: "2024-2025",
      trimestre: "3",
      id: 5,
      titre: "L'Empire du Mali",
      matiere: "Histoire-Géographie",
      niveauScolaire: "secondaire",
      classe: "6ème",
      saNumero: "SA 1",
      sequenceNumero: "Séquence 2",
      date: "2025-01-23",
      statut: "en_attente",
      enseignant: "M. KPOTCHOU",
      commentaires: 1,
      lastModified: "2025-01-14 11:30"
    },
    {
      anneeScolaire: "2023-2024",
      trimestre: "3",
      id: 6,
      titre: "Découverte des formes",
      matiere: "Mathématiques",
      niveauScolaire: "maternelle",
      classe: "Grande Section",
      saNumero: "SA 1",
      sequenceNumero: "Séquence 1",
      date: "2025-01-24",
      statut: "validee",
      enseignant: "Mme AKPOVI",
      commentaires: 0,
      lastModified: "2025-01-13 08:45"
    },
    {
      anneeScolaire: "2024-2025",
      trimestre: "1",
      id: 7,
      titre: "Les tables de multiplication",
      matiere: "Mathématiques",
      niveauScolaire: "primaire",
      classe: "CE2",
      saNumero: "SA 4",
      sequenceNumero: "Séquence 2",
      date: "2025-01-25",
      statut: "en_attente",
      enseignant: "M. GBAGUIDI",
      commentaires: 1,
      lastModified: "2025-01-12 15:20"
    }
  ];

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      en_attente: { color: 'bg-orange-100 text-orange-800', text: 'En attente' },
      validee: { color: 'bg-green-100 text-green-800', text: 'Validée' },
      corrigee: { color: 'bg-red-100 text-red-800', text: 'À corriger' }
    };
    
    return badges[statut] || badges.brouillon;
  };

  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = fiche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fiche.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fiche.enseignant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAnneeScolaire = !filters.anneeScolaire || fiche.anneeScolaire === filters.anneeScolaire;
    const matchesTrimestre = !filters.trimestre || fiche.trimestre === filters.trimestre;
    const matchesNiveauScolaire = !filters.niveauScolaire || fiche.niveauScolaire === filters.niveauScolaire;
    const matchesClasse = !filters.classe || fiche.classe === filters.classe;
    const matchesMatiere = !filters.matiere || fiche.matiere === filters.matiere;
    const matchesStatut = !filters.statut || fiche.statut === filters.statut;
    
    return matchesSearch && matchesAnneeScolaire && matchesTrimestre && matchesNiveauScolaire && matchesClasse && matchesMatiere && matchesStatut;
  });

  const sortedFiches = [...filteredFiches].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'titre':
        aVal = a.titre;
        bVal = b.titre;
        break;
      case 'matiere':
        aVal = a.matiere;
        bVal = b.matiere;
        break;
      case 'statut':
        aVal = a.statut;
        bVal = b.statut;
        break;
      case 'date':
      default:
        aVal = new Date(a.date);
        bVal = new Date(b.date);
        break;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleEnvoyerDirecteur = async (ficheId, commentaire) => {
    try {
      await fichesPedagogiquesService.envoyerPourValidation(ficheId, commentaire);
      
      // Notification de succès
      alert('✅ Fiche envoyée au directeur avec succès !\n\nUne notification WhatsApp a été envoyée au directeur. Vous recevrez une réponse sous 48h maximum.');
      
      setShowEnvoiDirecteur(false);
      setSelectedFicheForSend(null);
      
    } catch (error) {
      console.error('Erreur envoi directeur:', error);
      alert('❌ Erreur lors de l\'envoi de la fiche au directeur');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Liste des Fiches Pédagogiques</h2>
        <div className="text-sm text-gray-600">
          {sortedFiches.length} fiche(s) trouvée(s)
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, matière ou enseignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="date">Trier par date</option>
              <option value="titre">Trier par titre</option>
              <option value="matiere">Trier par matière</option>
              <option value="statut">Trier par statut</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des fiches */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matière/Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SA/Séquence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFiches.map(fiche => (
                <tr key={fiche.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{fiche.titre}</div>
                      <div className="text-sm text-gray-500">
                        Modifié le {fiche.lastModified}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{fiche.matiere}</div>
                      <div className="text-gray-500">{niveauxScolaires[fiche.niveauScolaire]?.nom} - {fiche.classe}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{fiche.saNumero}</div>
                    <div className="text-gray-500">{fiche.sequenceNumero}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {fiche.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutBadge(fiche.statut).color}`}>
                        {getStatutBadge(fiche.statut).text}
                      </span>
                      {fiche.commentaires > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-xs">{fiche.commentaires}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {fiche.enseignant}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectFiche(fiche)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onEditFiche(fiche)}
                        className="p-1 text-gray-600 hover:text-green-600"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="p-1 text-gray-600 hover:text-purple-600"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="p-1 text-gray-600 hover:text-indigo-600"
                        title="Télécharger PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {(fiche.statut === 'brouillon' || fiche.statut === 'corrigee') && (
                        <button
                          onClick={() => {
                            setSelectedFicheForSend(fiche);
                            setShowEnvoiDirecteur(true);
                          }}
                          className="p-1 text-gray-600 hover:text-orange-600"
                          title="Envoyer au directeur"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        className="p-1 text-gray-600 hover:text-red-600"
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
        
        {sortedFiches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">Aucune fiche trouvée</div>
            <div className="text-sm text-gray-400">
              Essayez de modifier vos critères de recherche ou de filtrage
            </div>
          </div>
        )}
      </div>

      {/* Actions groupées */}
      {sortedFiches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Actions groupées :
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Export PDF multiple
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Envoyer sélection au directeur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'envoi au directeur */}
      {showEnvoiDirecteur && selectedFicheForSend && (
        <EnvoiDirecteurModal
          fiche={selectedFicheForSend}
          onClose={() => {
            setShowEnvoiDirecteur(false);
            setSelectedFicheForSend(null);
          }}
          onEnvoyer={handleEnvoyerDirecteur}
        />
      )}
    </div>
  );
};

export default FichesList;