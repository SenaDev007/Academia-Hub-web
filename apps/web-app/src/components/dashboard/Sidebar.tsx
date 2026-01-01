import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  X,
  Home,
  Users,
  Calculator,
  BookOpen,
  MessageSquare,
  Settings,
  GraduationCap,
  UserCheck,
  Building,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Bell,
  HelpCircle,
  User,
  Crown,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { useSchoolLevel } from '../../contexts/SchoolLevelContext';
import { SchoolLevelSelector } from '../school-level/SchoolLevelSelector';
import { logoAcademiaHub03 } from '../../utils/imagePaths';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { settings: schoolSettings, isLoading: schoolSettingsLoading } = useSchoolSettings();
  const { selectedSchoolLevelId, schoolLevels } = useSchoolLevel();

  const menuItems = [
    { 
      icon: Home, 
      label: 'Tableau de bord', 
      path: '/dashboard',
      description: 'Vue d\'ensemble et statistiques',
      badge: null
    },
    { 
      icon: Calculator, 
      label: 'Économat & Finance', 
      path: '/dashboard/finance',
      description: 'Gestion financière et comptabilité',
      badge: null
    },
    { 
      icon: Users, 
      label: 'Scolarité & Élèves', 
      path: '/dashboard/students',
      description: 'Gestion des élèves et inscriptions',
      badge: null
    },
    { 
      icon: Building, 
      label: 'Études & Planification', 
      path: '/dashboard/planning',
      description: 'Emplois du temps et planning',
      badge: null
    },
    { 
      icon: BookOpen, 
      label: 'Examens & Évaluation', 
      path: '/dashboard/examinations',
      description: 'Examens, notes et bulletins',
      badge: null
    },
    { 
      icon: MessageSquare, 
      label: 'Communication', 
      path: '/dashboard/communication',
      description: 'SMS, emails et notifications',
      badge: null
    },
    { 
      icon: UserCheck, 
      label: 'Personnel & RH', 
      path: '/dashboard/hr',
      description: 'Gestion du personnel et RH',
      badge: null
    },
    { 
      icon: Settings, 
      label: 'Paramètres', 
      path: '/dashboard/settings',
      description: 'Configuration et préférences',
      badge: null
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50
        transform transition-all duration-300 ease-in-out
        ${isOpen 
          ? 'translate-x-0 w-72' 
          : '-translate-x-full lg:translate-x-0 lg:w-20'
        }
      `}>
        <div className="flex flex-col h-full">
          {/* Header avec logo et profil utilisateur */}
          <div className={`border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
            isOpen ? 'p-6' : 'p-4'
          }`}>
            {/* Bouton de fermeture mobile */}
            <div className="flex items-center justify-end mb-4">
              <button 
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Fermer la sidebar"
                title="Fermer la sidebar"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Informations de l'école */}
            {isOpen ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {schoolSettings?.logo ? (
                      <img 
                        src={schoolSettings.logo} 
                        alt="Logo de l'école" 
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback vers l'icône Building si l'image ne charge pas
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Building className={`w-5 h-5 text-white ${schoolSettings?.logo ? 'hidden' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {schoolSettingsLoading ? (
                        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-32 rounded"></div>
                      ) : (
                        schoolSettings?.abbreviation || schoolSettings?.name || 'École'
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {schoolSettingsLoading ? (
                        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-3 w-24 rounded mt-1"></div>
                      ) : (
                        schoolSettings?.name || 'Établissement Scolaire'
                      )}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Shield className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        {schoolSettings?.motto || 'Établissement Privé'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Version compacte - seulement le logo de l'école */
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden"
                     title={schoolSettings?.name || 'Établissement Scolaire'}>
                  {schoolSettings?.logo ? (
                    <img 
                      src={schoolSettings.logo} 
                      alt="Logo de l'école" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback vers l'icône Building si l'image ne charge pas
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Building className={`w-5 h-5 text-white ${schoolSettings?.logo ? 'hidden' : ''}`} />
                </div>
              </div>
            )}
          </div>


          {/* Navigation */}
          <nav className={`flex-1 space-y-2 overflow-y-auto transition-all duration-300 ${
            isOpen ? 'px-4 py-6' : 'px-2 py-4'
          }`}>
            {/* Sélecteur de niveau scolaire (OBLIGATOIRE) */}
            {isOpen && (
              <div className="mb-4 px-4">
                <SchoolLevelSelector compact={false} />
              </div>
            )}

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              // Désactiver les items qui nécessitent un niveau si aucun niveau n'est sélectionné
              const isDisabled = item.requiresLevel && !selectedSchoolLevelId;
              
              return (
                <div
                  key={item.path}
                  onClick={() => {
                    if (!isDisabled) {
                      if (item.requiresLevel && selectedSchoolLevelId) {
                        navigate(`${item.path}?schoolLevelId=${selectedSchoolLevelId}`);
                      } else {
                        navigate(item.path);
                      }
                      onClose();
                    }
                  }}
                  className={`
                    flex items-center rounded-xl font-medium transition-all duration-300 text-sm group relative overflow-hidden
                    ${isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'}
                    ${isDisabled 
                      ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600' 
                      : 'cursor-pointer'
                    }
                    ${!isDisabled && active 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-500' 
                      : !isDisabled
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700'
                      : ''
                    }
                  `}
                  title={!isOpen ? item.label : undefined}
                >
                  {/* Effet de brillance pour l'élément actif */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"></div>
                  )}
                  
                  <div className="relative flex items-center w-full">
                    <Icon className={`${isOpen ? 'w-5 h-5 mr-3' : 'w-5 h-5'} ${active ? 'text-white' : ''} transition-transform duration-200 group-hover:scale-110`} />
                    {isOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="transition-all duration-300 truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                              active 
                                ? 'bg-white/20 text-white border border-white/30' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${
                          active 
                            ? 'text-blue-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {isOpen && (
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${active ? 'text-white' : 'text-gray-400'} group-hover:translate-x-1`} />
                    )}
                  </div>
                  
                  {/* Tooltip pour le mode fermé */}
                  {!isOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-300 mt-0.5">{item.description}</div>
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
            isOpen ? 'p-4' : 'p-2'
          }`}>
            {isOpen ? (
              <div className="space-y-3">
                {/* Version et copyright */}
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-3">
                    <img 
                      src={logoAcademiaHub03} 
                      alt="Academia Hub Logo" 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        console.warn('Logo Academia Hub non trouvé, utilisation de l\'icône fallback');
                        e.currentTarget.style.display = 'none';
                        // Afficher l'icône Sparkles en fallback
                        const fallback = document.createElement('div');
                        fallback.innerHTML = `<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`;
                        e.currentTarget.parentNode?.appendChild(fallback);
                      }}
                    />
                    <span className="font-semibold text-base">Academia Hub v2.1.0</span>
                  </div>
                <p>© 2025 - Tous droits réservés</p>
                  <div className="flex items-center justify-center space-x-1">
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span>Version sécurisée</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center space-y-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto overflow-hidden">
                  <img 
                    src={logoAcademiaHub03} 
                    alt="Academia Hub Logo" 
                    className="w-6 h-6 object-contain filter brightness-0 invert"
                    onError={(e) => {
                      console.warn('Logo Academia Hub non trouvé, utilisation de l\'icône fallback');
                      e.currentTarget.style.display = 'none';
                      // Afficher l'icône Zap en fallback
                      const fallback = document.createElement('div');
                      fallback.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`;
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
                <p className="font-semibold text-base">v2.1.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;