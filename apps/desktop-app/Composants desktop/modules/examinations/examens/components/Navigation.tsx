import React from 'react';
import { 
  Home, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Award 
} from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'saisie', label: 'Saisie des Notes', icon: BookOpen },
    { id: 'bordereau', label: 'Bordereaux', icon: ClipboardList },
    { id: 'conseils', label: 'Conseils de Classe', icon: Users },
    { id: 'bulletins', label: 'Bulletins', icon: FileText },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
    { id: 'tableaux', label: 'Tableaux d\'Honneur', icon: Award }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeView === item.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
