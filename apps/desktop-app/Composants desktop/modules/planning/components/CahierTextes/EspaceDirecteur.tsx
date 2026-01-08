import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart3, Calendar, Settings, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import ValidationAdmin from './ValidationAdmin';
import RapportAvancement from './RapportAvancement';
import GestionUtilisateurs from './GestionUtilisateurs';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface EspaceDirecteurProps {
  user: User;
}

const EspaceDirecteur: React.FC<EspaceDirecteurProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'validation' | 'rapports' | 'utilisateurs' | 'parametres'>('dashboard');
  const [statistiques] = useState({
    cahiers_en_attente: 12,
    cahiers_valides: 156,
    cahiers_refuses: 8,
    enseignants_actifs: 24,
    total_heures: 1248,
    taux_validation: 89
  });

  const sections = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'validation', label: 'Validation Cahiers', icon: CheckCircle },
    { id: 'rapports', label: 'Rapports', icon: FileText },
    { id: 'utilisateurs', label: 'Gestion Utilisateurs', icon: Users },
    { id: 'parametres', label: 'Paramètres', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Directeur</h2>
              <p className="text-gray-600">Vue d'ensemble de l'activité pédagogique de l'établissement</p>
            </div>

            {/* Cartes statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">En attente de validation</p>
                    <p className="text-2xl font-bold text-gray-900">{statistiques.cahiers_en_attente}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Cahiers validés</p>
                    <p className="text-2xl font-bold text-gray-900">{statistiques.cahiers_valides}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Enseignants actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{statistiques.enseignants_actifs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Taux de validation</p>
                    <p className="text-2xl font-bold text-gray-900">{statistiques.taux_validation}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertes et actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    Alertes et Notifications
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {statistiques.cahiers_en_attente > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-md">
                        <p className="text-sm text-yellow-800">
                          {statistiques.cahiers_en_attente} cahier(s) de texte en attente de validation
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        Rapport mensuel disponible pour téléchargement
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-800">
                        Système de sauvegarde automatique actif
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveSection('validation')}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm font-medium text-blue-900">Valider les cahiers en attente</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSection('rapports')}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm font-medium text-green-900">Générer un rapport</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSection('utilisateurs')}
                      className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-sm font-medium text-purple-900">Gérer les utilisateurs</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'validation':
        return <ValidationAdmin user={user} />;

      case 'rapports':
        return <RapportAvancement user={user} />;

      case 'utilisateurs':
        return <GestionUtilisateurs user={user} />;

      case 'parametres':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Paramètres de l'Établissement</h2>
              <p className="text-gray-600">Configuration et paramètres généraux</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres Généraux</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'établissement
                    </label>
                    <input
                      type="text"
                      defaultValue="Collège d'Enseignement Général de Cotonou"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code établissement
                    </label>
                    <input
                      type="text"
                      defaultValue="CEG-COT-001"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année scolaire
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Sauvegarder les paramètres
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Espace Directeur</h1>
                <p className="text-sm text-gray-500">Administration pédagogique</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id as any)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceDirecteur;