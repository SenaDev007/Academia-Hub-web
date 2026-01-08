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

  // Modules principaux (domaines métier)
  const mainModules = [
    { path: '/app', label: 'Tableau de pilotage', icon: LayoutDashboard },
    { path: '/app/students', label: 'Élèves & Scolarité', icon: Users },
    { path: '/app/finance', label: 'Finances & Économat', icon: Calculator },
    { path: '/app/exams', label: 'Examens & Évaluation', icon: BookOpen },
    { path: '/app/planning', label: 'Planification & Études', icon: Building },
    { path: '/app/hr', label: 'Personnel & RH', icon: UserCheck },
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
      className={`fixed left-0 top-0 h-full bg-navy-900 text-white transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-700">
          {isOpen && (
            <h2 className="text-lg font-bold">Academia Hub</h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-navy-700 transition-colors"
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
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
                      ? 'bg-navy-700 text-white'
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Direction
                </p>
              )}
              <Link
                href={generalModule.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors border-l-2 ${
                  isActive(generalModule.path)
                    ? 'bg-navy-700 text-white border-soft-gold'
                    : 'text-gray-300 hover:bg-navy-800 hover:text-white border-transparent'
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
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
                      ? 'bg-navy-700 text-white'
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
                  ? 'bg-navy-700 text-white'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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

        {/* Footer - Contexte */}
        {isOpen && currentLevel && (
          <div className="p-4 border-t border-navy-700">
            <p className="text-xs text-gray-400 mb-1">Niveau actif</p>
            <p className="text-sm font-medium text-white">
              {currentLevel.code === 'MATERNELLE' ? 'Maternelle' :
               currentLevel.code === 'PRIMAIRE' ? 'Primaire' :
               currentLevel.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel.code}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

