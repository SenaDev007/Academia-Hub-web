import React from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  User,
  Crown,
  Key,
  Activity,
  Database
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useUser();

  // Fonction pour obtenir l'affichage du rôle
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { name: 'Super Admin', icon: Crown, color: 'text-red-600' };
      case 'admin':
        return { name: 'Administrateur', icon: Shield, color: 'text-blue-600' };
      case 'teacher':
        return { name: 'Enseignant', icon: User, color: 'text-green-600' };
      case 'student':
        return { name: 'Élève', icon: Activity, color: 'text-purple-600' };
      default:
        return { name: 'Utilisateur', icon: User, color: 'text-gray-600' };
    }
  };

  const quickStats = [
    { icon: Users, label: 'Utilisateurs actifs', value: '1,234', color: 'text-blue-600' },
    { icon: TrendingUp, label: 'Performance', value: '98%', color: 'text-green-600' },
    { icon: Shield, label: 'Sécurité', value: '100%', color: 'text-purple-600' },
    { icon: Award, label: 'Satisfaction', value: '4.9/5', color: 'text-orange-600' }
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  const contactInfo = [
    { icon: Mail, text: 'support@academia-hub.com', href: 'mailto:support@academia-hub.com' },
    { icon: Phone, text: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
    { icon: MapPin, text: 'Paris, France', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistiques rapides */}
        <div className="py-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Academia Hub
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Desktop Edition</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Solution complète de gestion scolaire moderne, conçue pour optimiser 
              l'administration éducative avec des outils professionnels et sécurisés.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Modules principaux */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Modules Principaux
            </h4>
            <ul className="space-y-3">
              {[
                'Gestion des Élèves',
                'Finance & Comptabilité',
                'Planning & Emplois du temps',
                'Communication',
                'Examens & Évaluations',
                'Ressources Humaines'
              ].map((module, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>{module}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support et contact */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Support & Contact
            </h4>
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>{contact.text}</span>
                  </a>
                );
              })}
            </div>
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Réseaux Sociaux
              </h5>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Informations utilisateur connecté */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isAuthenticated && user ? 'Utilisateur Connecté' : 'Session'}
            </h4>
            {isAuthenticated && user ? (
              <div className="space-y-4">
                {/* Profil utilisateur */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {(() => {
                          const roleInfo = getRoleDisplay(user.role);
                          const RoleIcon = roleInfo.icon;
                          return (
                            <>
                              <RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />
                              <span className={`text-xs font-medium ${roleInfo.color}`}>
                                {roleInfo.name}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations système */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Version:</span>
                    <span className="font-medium text-gray-900 dark:text-white">v2.1.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                    <span className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>En ligne</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sécurité:</span>
                    <span className="flex items-center space-x-1 text-purple-600">
                      <Shield className="w-4 h-4" />
                      <span>Protégé</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Aucun utilisateur connecté
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Connectez-vous pour voir vos informations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informations système détaillées */}
        <div className="py-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Version et technologie */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-600" />
                Version & Technologie
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version App:</span>
                  <span className="font-medium text-gray-900 dark:text-white">v2.1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Electron:</span>
                  <span className="font-medium text-gray-900 dark:text-white">28.x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Node.js:</span>
                  <span className="font-medium text-gray-900 dark:text-white">18.x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">React:</span>
                  <span className="font-medium text-gray-900 dark:text-white">18.x</span>
                </div>
              </div>
            </div>

            {/* Statut système */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                Statut Système
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Connexion:</span>
                  <span className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>En ligne</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Base de données:</span>
                  <span className="flex items-center space-x-1 text-green-600">
                    <Database className="w-4 h-4" />
                    <span>Connectée</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sécurité:</span>
                  <span className="flex items-center space-x-1 text-purple-600">
                    <Shield className="w-4 h-4" />
                    <span>Protégé</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Performance:</span>
                  <span className="flex items-center space-x-1 text-green-600">
                    <Zap className="w-4 h-4" />
                    <span>Optimisé</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Environnement */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Globe className="w-4 h-4 mr-2 text-purple-600" />
                Environnement
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plateforme:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Desktop</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">OS:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Windows 10+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Langue:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Français</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fuseau:</span>
                  <span className="font-medium text-gray-900 dark:text-white">GMT+1</span>
                </div>
              </div>
            </div>

            {/* Dernière mise à jour */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                Mise à jour
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dernière MAJ:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Prochaine:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Auto</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Canal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Stable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Build:</span>
                  <span className="font-medium text-gray-900 dark:text-white">2101</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="py-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>© {currentYear} Academia Hub. Tous droits réservés.</span>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Conditions d'utilisation
              </a>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Fait avec passion pour l'éducation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
