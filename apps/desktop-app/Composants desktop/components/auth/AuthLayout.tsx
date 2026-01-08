import React from 'react';
import { Shield, Lock, Users } from 'lucide-react';
import { logoAcademiaHub03 } from '../../utils/imagePaths';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showFeatures?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showFeatures = true 
}) => {
  const features = [
    {
      icon: Shield,
      title: 'Sécurité Renforcée',
      description: 'Chiffrement AES-256 et authentification à deux facteurs'
    },
    {
      icon: Lock,
      title: 'Données Protégées',
      description: 'Conformité RGPD et stockage sécurisé local'
    },
    {
      icon: Users,
      title: 'Gestion Multi-utilisateurs',
      description: 'Rôles et permissions granulaires'
    },
    {
      icon: Shield,
      title: 'Interface Native',
      description: 'Performance optimale et expérience desktop'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Section gauche - Informations et fonctionnalités */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          {/* Effets de fond */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <img 
                    src={logoAcademiaHub03} 
                    alt="Academia Hub Logo" 
                    className="w-12 h-12 object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Academia Hub</h1>
                  <p className="text-blue-100 text-sm">Desktop Edition</p>
                </div>
              </div>
            </div>

            {/* Titre principal */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                {title}
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Fonctionnalités */}
            {showFeatures && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white/90 mb-4">
                  Pourquoi choisir Academia Hub ?
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-blue-100 text-sm">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Statistiques de sécurité */}
            <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-blue-100 text-sm">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">256-bit</div>
                  <div className="text-blue-100 text-sm">Chiffrement</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Logo mobile */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <img 
                    src={logoAcademiaHub03} 
                    alt="Academia Hub Logo" 
                    className="w-8 h-8 object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Academia Hub</h1>
                  <p className="text-gray-500 text-sm">Desktop Edition</p>
                </div>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Academia Hub Desktop. Tous droits réservés.
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-400">
                <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">
                  Confidentialité
                </a>
                <span>•</span>
                <a href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">
                  Conditions
                </a>
                <span>•</span>
                <a href="/help" className="hover:text-gray-600 dark:hover:text-gray-300">
                  Aide
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
