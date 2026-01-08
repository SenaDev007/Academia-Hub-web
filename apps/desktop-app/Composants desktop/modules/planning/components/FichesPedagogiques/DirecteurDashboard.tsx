import React, { useState } from 'react';
import { User, Clock, FileText, CheckCircle, XCircle, MessageSquare, Send, Eye, Edit3, AlertTriangle, Award, TrendingUp, Users, Calendar } from 'lucide-react';
import FicheValidationView from './FicheValidationView';
import FicheValidationForm from './FicheValidationForm';
import DirecteurAnalytics from './DirecteurAnalytics';

const DirecteurDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [filters, setFilters] = useState({
    statut: '',
    matiere: '',
    classe: '',
    enseignant: '',
    urgence: ''
  });

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'en-attente', label: 'Fiches en attente', icon: Clock },
    { id: 'validees', label: 'Fiches validées', icon: CheckCircle },
    { id: 'analytics', label: 'Analyses', icon: Award },
    { id: 'enseignants', label: 'Suivi enseignants', icon: Users }
  ];

  // Données simulées pour la démo
  const fichesEnAttente = [
    {
      id: 1,
      titre: "Les fractions - Addition et soustraction",
      enseignant: "M. KOUASSI Jean",
      matiere: "Mathématiques",
      classe: "6ème",
      dateEnvoi: "2025-01-18 14:30",
      statut: "en_attente",
      priorite: "normale",
      saNumero: "SA 3",
      sequenceNumero: "Séquence 2",
      datePrevue: "2025-01-20",
      commentaireEnseignant: "Première version de ma fiche sur les fractions",
      tempsAttente: "2 jours",
      conformiteAPC: 78
    },
    {
      id: 2,
      titre: "La conjugaison du présent",
      enseignant: "Mme ADJOVI Marie",
      matiere: "Français",
      classe: "5ème",
      dateEnvoi: "2025-01-17 10:15",
      statut: "en_attente",
      priorite: "urgente",
      saNumero: "SA 2",
      sequenceNumero: "Séquence 1",
      datePrevue: "2025-01-19",
      commentaireEnseignant: "",
      tempsAttente: "3 jours",
      conformiteAPC: 85
    },
    {
      id: 3,
      titre: "Les états de la matière",
      enseignant: "M. DOSSOU Paul",
      matiere: "Sciences Physiques",
      classe: "4ème",
      dateEnvoi: "2025-01-16 16:45",
      statut: "en_attente",
      priorite: "normale",
      saNumero: "SA 1",
      sequenceNumero: "Séquence 3",
      datePrevue: "2025-01-22",
      commentaireEnseignant: "Fiche corrigée selon vos dernières remarques",
      tempsAttente: "4 jours",
      conformiteAPC: 92
    }
  ];

  const stats = {
    fichesEnAttente: 8,
    fichesValidees: 98,
    fichesCorrigees: 12,
    delaiMoyenValidation: "2.3 jours",
    tauxValidation: 92,
    conformiteMoyenne: 85
  };

  const getPriorityBadge = (priorite) => {
    return priorite === 'urgente' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getConformiteBadge = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-yellow-100 text-yellow-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-sm opacity-90">En attente</span>
          </div>
          <div className="text-3xl font-bold">{stats.fichesEnAttente}</div>
          <div className="text-sm opacity-90">fiches à valider</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6" />
            <span className="text-sm opacity-90">Validées</span>
          </div>
          <div className="text-3xl font-bold">{stats.fichesValidees}</div>
          <div className="text-sm opacity-90">ce trimestre</div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-6 h-6" />
            <span className="text-sm opacity-90">À corriger</span>
          </div>
          <div className="text-3xl font-bold">{stats.fichesCorrigees}</div>
          <div className="text-sm opacity-90">renvoyées</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm opacity-90">Taux validation</span>
          </div>
          <div className="text-3xl font-bold">{stats.tauxValidation}%</div>
          <div className="text-sm opacity-90">acceptées</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6" />
            <span className="text-sm opacity-90">Conformité APC</span>
          </div>
          <div className="text-3xl font-bold">{stats.conformiteMoyenne}%</div>
          <div className="text-sm opacity-90">score moyen</div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm opacity-90">Délai moyen</span>
          </div>
          <div className="text-3xl font-bold">{stats.delaiMoyenValidation}</div>
          <div className="text-sm opacity-90">de validation</div>
        </div>
      </div>

      {/* Fiches urgentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Fiches urgentes à traiter
          </h2>
          <span className="text-sm text-gray-600">
            {fichesEnAttente.filter(f => f.priorite === 'urgente').length} fiche(s) urgente(s)
          </span>
        </div>
        
        <div className="space-y-3">
          {fichesEnAttente.filter(f => f.priorite === 'urgente').map(fiche => (
            <div key={fiche.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">{fiche.titre}</h3>
                  <div className="flex items-center gap-4 text-sm text-red-700 mt-1">
                    <span>{fiche.enseignant}</span>
                    <span>{fiche.matiere} - {fiche.classe}</span>
                    <span>En attente depuis {fiche.tempsAttente}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFiche(fiche);
                      setActiveTab('validation');
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Traiter maintenant
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toutes les fiches en attente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Toutes les fiches en attente</h2>
        
        <div className="space-y-3">
          {fichesEnAttente.map(fiche => (
            <div key={fiche.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{fiche.titre}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityBadge(fiche.priorite)}`}>
                      {fiche.priorite}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getConformiteBadge(fiche.conformiteAPC)}`}>
                      APC: {fiche.conformiteAPC}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{fiche.enseignant}</span>
                    </div>
                    <span>{fiche.matiere} - {fiche.classe}</span>
                    <span>{fiche.saNumero}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Reçu le {fiche.dateEnvoi}</span>
                    </div>
                  </div>
                  
                  {fiche.commentaireEnseignant && (
                    <div className="mt-2 text-sm text-gray-700 italic">
                      "{fiche.commentaireEnseignant}"
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFiche(fiche);
                      setActiveTab('view');
                    }}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="Voir la fiche"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedFiche(fiche);
                      setActiveTab('validation');
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFichesEnAttente = () => (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-5 gap-4">
          <select
            value={filters.statut}
            onChange={(e) => setFilters({...filters, statut: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours de validation</option>
          </select>
          
          <select
            value={filters.matiere}
            onChange={(e) => setFilters({...filters, matiere: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Toutes les matières</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Français">Français</option>
            <option value="Sciences Physiques">Sciences Physiques</option>
          </select>
          
          <select
            value={filters.classe}
            onChange={(e) => setFilters({...filters, classe: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Toutes les classes</option>
            <option value="6ème">6ème</option>
            <option value="5ème">5ème</option>
            <option value="4ème">4ème</option>
          </select>
          
          <select
            value={filters.enseignant}
            onChange={(e) => setFilters({...filters, enseignant: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tous les enseignants</option>
            <option value="M. KOUASSI">M. KOUASSI</option>
            <option value="Mme ADJOVI">Mme ADJOVI</option>
            <option value="M. DOSSOU">M. DOSSOU</option>
          </select>
          
          <select
            value={filters.urgence}
            onChange={(e) => setFilters({...filters, urgence: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Toutes priorités</option>
            <option value="urgente">Urgentes</option>
            <option value="normale">Normales</option>
          </select>
        </div>
      </div>

      {/* Liste détaillée */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Fiches en attente de validation ({fichesEnAttente.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {fichesEnAttente.map(fiche => (
            <div key={fiche.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-medium">{fiche.titre}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityBadge(fiche.priorite)}`}>
                      {fiche.priorite === 'urgente' ? '🔴 Urgente' : '🔵 Normale'}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${getConformiteBadge(fiche.conformiteAPC)}`}>
                      APC: {fiche.conformiteAPC}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 text-sm text-gray-600 mb-3">
                    <div className="space-y-1">
                      <div><span className="font-medium">Enseignant:</span> {fiche.enseignant}</div>
                      <div><span className="font-medium">Matière:</span> {fiche.matiere}</div>
                      <div><span className="font-medium">Classe:</span> {fiche.classe}</div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="font-medium">SA N°:</span> {fiche.saNumero}</div>
                      <div><span className="font-medium">Date prévue:</span> {fiche.datePrevue}</div>
                      <div><span className="font-medium">Reçu le:</span> {fiche.dateEnvoi}</div>
                    </div>
                  </div>
                  
                  {fiche.commentaireEnseignant && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">Message de l'enseignant:</div>
                      <div className="text-sm text-blue-800 italic">"{fiche.commentaireEnseignant}"</div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>⏱️ En attente depuis {fiche.tempsAttente}</span>
                    <span>📊 Score APC: {fiche.conformiteAPC}%</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => {
                      setSelectedFiche(fiche);
                      setActiveTab('view');
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    Consulter
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedFiche(fiche);
                      setActiveTab('validation');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    Valider
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'en-attente':
        return renderFichesEnAttente();
      case 'view':
        return (
          <FicheValidationView
            fiche={selectedFiche}
            onValidate={() => setActiveTab('validation')}
            onClose={() => setActiveTab('dashboard')}
          />
        );
      case 'validation':
        return (
          <FicheValidationForm
            fiche={selectedFiche}
            onValidated={() => setActiveTab('dashboard')}
            onClose={() => setActiveTab('dashboard')}
          />
        );
      case 'analytics':
        return (
          <DirecteurAnalytics
            onClose={() => setActiveTab('dashboard')}
          />
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Espace Directeur</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Directeur ASSOGBA Pierre
              </span>
            </div>
            <div className="text-sm text-gray-600">
              CEG Sainte-Marie • Année 2024-2025 • 1er Trimestre
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'en-attente' && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                      {fichesEnAttente.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default DirecteurDashboard;