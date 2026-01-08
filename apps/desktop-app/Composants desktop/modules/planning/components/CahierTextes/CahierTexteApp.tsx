import React, { useState } from 'react';
import { BookOpen, Calendar, FileText, Users, Settings } from 'lucide-react';
import CahierTexteBoard from './CahierTexteBoard';
import CahierTexteEntry from './CahierTexteEntry';
import CahierTexteHistory from './CahierTexteHistory';
import ValidationAdmin from './ValidationAdmin';
import CalendrierScolaire from './CalendrierScolaire';
import RapportAvancement from './RapportAvancement';
import NotificationCenter from './NotificationCenter';
import EspaceDirecteur from './EspaceDirecteur';

type TabType = 'dashboard' | 'entry' | 'history' | 'validation' | 'calendar' | 'reports';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

const CahierTexteApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Prof. Marie AGBODJAN',
    role: 'enseignant',
    matieres: ['Mathématiques', 'Physique'],
    classes: ['6èmeA', '5èmeB', '4èmeC']
  });
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BookOpen, roles: ['enseignant', 'directeur', 'conseiller', 'administrateur'] },
    { id: 'entry', label: 'Saisie Quotidienne', icon: FileText, roles: ['enseignant'] },
    { id: 'history', label: 'Historique', icon: Calendar, roles: ['enseignant', 'directeur', 'conseiller'] },
    { id: 'validation', label: 'Validation Admin', icon: Users, roles: ['directeur', 'conseiller', 'administrateur'] },
    { id: 'calendar', label: 'Calendrier Scolaire', icon: Calendar, roles: ['enseignant', 'directeur', 'conseiller', 'administrateur'] },
    { id: 'reports', label: 'Rapports', icon: Settings, roles: ['directeur', 'conseiller', 'administrateur'] }
  ];

  const availableTabs = tabs.filter(tab => tab.roles.includes(user.role));

  const changeUserRole = (newRole: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur') => {
    const roleUsers = {
      enseignant: {
        id: '1',
        name: 'Prof. Marie AGBODJAN',
        role: 'enseignant' as const,
        matieres: ['Mathématiques', 'Physique'],
        classes: ['6èmeA', '5èmeB', '4èmeC']
      },
      directeur: {
        id: '2',
        name: 'Dr. Jean KOUDJO',
        role: 'directeur' as const,
        matieres: ['Administration'],
        classes: ['Toutes']
      },
      conseiller: {
        id: '3',
        name: 'Mme Célestine ZOMAHOUN',
        role: 'conseiller' as const,
        matieres: ['Pédagogie'],
        classes: ['Toutes']
      },
      administrateur: {
        id: '4',
        name: 'Admin Système',
        role: 'administrateur' as const,
        matieres: ['Système'],
        classes: ['Toutes']
      }
    };
    
    setUser(roleUsers[newRole]);
    setShowRoleSelector(false);
    setActiveTab('dashboard');
  };

  // Si l'utilisateur est directeur ou administrateur, afficher l'espace dédié
  if (user.role === 'directeur' || user.role === 'administrateur') {
    return (
      <div>
        {/* Bouton pour changer de rôle (pour démonstration) */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Changer de rôle ({user.role})
          </button>
          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
              <button
                onClick={() => changeUserRole('enseignant')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Enseignant
              </button>
              <button
                onClick={() => changeUserRole('directeur')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Directeur
              </button>
              <button
                onClick={() => changeUserRole('conseiller')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Conseiller
              </button>
              <button
                onClick={() => changeUserRole('administrateur')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Administrateur
              </button>
            </div>
          )}
        </div>
        <EspaceDirecteur user={user} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CahierTexteBoard user={user} />;
      case 'entry':
        return <CahierTexteEntry user={user} />;
      case 'history':
        return <CahierTexteHistory user={user} />;
      case 'validation':
        return <ValidationAdmin user={user} />;
      case 'calendar':
        return <CalendrierScolaire user={user} />;
      case 'reports':
        return <RapportAvancement user={user} />;
      default:
        return <CahierTexteBoard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Cahier de texte</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter userId={user.id} />
              {/* Bouton pour changer de rôle (pour démonstration) */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Changer de rôle
                </button>
                {showRoleSelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => changeUserRole('enseignant')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Enseignant
                    </button>
                    <button
                      onClick={() => changeUserRole('directeur')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Directeur
                    </button>
                    <button
                      onClick={() => changeUserRole('conseiller')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Conseiller
                    </button>
                    <button
                      onClick={() => changeUserRole('administrateur')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Administrateur
                    </button>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default CahierTexteApp;