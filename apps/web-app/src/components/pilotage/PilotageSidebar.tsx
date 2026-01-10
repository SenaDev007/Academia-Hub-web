/**
 * ============================================================================
 * PILOTAGE SIDEBAR - NAVIGATION PAR DOMAINES MÉTIER
 * ============================================================================
 * 
 * Navigation orientée "domaines métier", pas par écrans techniques.
 * S'adapte au niveau scolaire, aux modules activés, au rôle utilisateur.
 * 
 * Philosophie : Résumer avant de détailler
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calculator,
  BookOpen,
  UserCheck,
  Building,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Network,
  Library,
  Bus,
  UtensilsCrossed,
  HeartPulse,
  ShieldCheck,
  Radio,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import type { User } from '@/types';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';

interface PilotageSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: User;
}

export default function PilotageSidebar({ isOpen, onToggle, user }: PilotageSidebarProps) {
  const pathname = usePathname();
  const { currentLevel } = useSchoolLevel();
  const isSuperDirector = user?.role === 'SUPER_DIRECTOR';
  const [errorCount, setErrorCount] = useState(0);

  // Détecter les erreurs React et console
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    let count = 0;

    const errorHandler = (...args: any[]) => {
      count++;
      setErrorCount(count);
      originalError.apply(console, args);
    };

    const warnHandler = (...args: any[]) => {
      // Compter seulement les warnings critiques
      if (args.some(arg => typeof arg === 'string' && arg.includes('Error'))) {
        count++;
        setErrorCount(count);
      }
      originalWarn.apply(console, args);
    };

    console.error = errorHandler;
    console.warn = warnHandler;

    // Écouter les erreurs non capturées
    const handleError = (event: ErrorEvent) => {
      count++;
      setErrorCount(count);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      count++;
      setErrorCount(count);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Modules principaux (domaines métier)
  const mainModules = [
    { path: '/app', label: 'Tableau de pilotage', icon: LayoutDashboard },
    { path: '/app/students', label: 'Élèves & Scolarité', icon: Users },
    { path: '/app/finance', label: 'Finances & Économat', icon: Calculator },
    { path: '/app/exams-grades', label: 'Examens, Notes & Bulletins', icon: BookOpen },
    { path: '/app/pedagogy', label: 'Organisation Pédagogique', icon: Building },
    { path: '/app/hr', label: 'Personnel, RH & Paie', icon: UserCheck },
    { path: '/app/communication', label: 'Communication', icon: MessageSquare },
  ];

  // Modules supplémentaires
  const supplementaryModules = [
    { path: '/app/library', label: 'Bibliothèque', icon: Library },
    { path: '/app/transport', label: 'Transport', icon: Bus },
    { path: '/app/canteen', label: 'Cantine', icon: UtensilsCrossed },
    { path: '/app/infirmary', label: 'Infirmerie', icon: HeartPulse },
    { path: '/app/qhse', label: 'QHSE', icon: ShieldCheck },
    { path: '/app/educast', label: 'EduCast', icon: Radio },
    { path: '/app/shop', label: 'Boutique', icon: ShoppingBag },
  ];

  // Module Général (Direction uniquement)
  const generalModule = isSuperDirector
    ? { path: '/app/general', label: 'Module Général', icon: Network }
    : null;

  // Paramètres
  const settingsModule = { path: '/app/settings', label: 'Paramètres', icon: Settings };

  const isActive = (path: string) => {
    if (path === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-blue-900 text-white transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {isOpen && (
            <h2 className="text-lg font-bold text-white">Academia Hub</h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-blue-800 transition-colors text-white"
            aria-label="Toggle sidebar"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Modules Principaux */}
          <div className="mb-6">
            {isOpen && (
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 px-2">
                Modules principaux
              </p>
            )}
            {mainModules.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                    active
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-200 hover:bg-blue-800 hover:text-white'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Module Général (Direction) */}
          {generalModule && (
            <div className="mb-6">
              {isOpen && (
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 px-2">
                  Direction
                </p>
              )}
              <Link
                href={generalModule.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors border-l-2 ${
                  isActive(generalModule.path)
                    ? 'bg-blue-700 text-white border-gold-500'
                    : 'text-gray-200 hover:bg-blue-800 hover:text-white border-transparent'
                }`}
                title={!isOpen ? generalModule.label : undefined}
              >
                <Network className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">{generalModule.label}</span>
                )}
              </Link>
            </div>
          )}

          {/* Modules Supplémentaires */}
          <div className="mb-6">
            {isOpen && (
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 px-2">
                Modules supplémentaires
              </p>
            )}
            {supplementaryModules.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                    active
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-200 hover:bg-blue-800 hover:text-white'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Paramètres */}
          <div>
            <Link
              href={settingsModule.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive(settingsModule.path)
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-200 hover:bg-blue-800 hover:text-white'
              }`}
              title={!isOpen ? settingsModule.label : undefined}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium">{settingsModule.label}</span>
              )}
            </Link>
          </div>
        </nav>

        {/* Footer - Contexte & Erreurs */}
        <div className="mt-auto border-t border-blue-800">
          {isOpen && currentLevel && (
            <div className="p-4 border-b border-blue-800">
              <p className="text-xs text-gray-300 mb-1">Niveau actif</p>
              <p className="text-sm font-medium text-white">
                {currentLevel.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel.code}
              </p>
            </div>
          )}
          {errorCount > 0 && (
            <div className="p-3">
              <button
                onClick={() => {
                  setErrorCount(0);
                  console.clear();
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium"
                title="Cliquer pour effacer les erreurs"
              >
                <AlertCircle className="w-4 h-4" />
                {isOpen && <span>{errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

