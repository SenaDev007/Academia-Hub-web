/**
 * ============================================================================
 * SUB MODULE NAVIGATION - NAVIGATION INTERNE PAR SOUS-MODULES
 * ============================================================================
 * 
 * Navigation par tabs pour les sous-modules (3 à 7 max)
 * Ordre logique du travail réel, noms métier
 * 
 * ============================================================================
 */

'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SubModule {
  /** Identifiant unique du sous-module */
  id: string;
  /** Nom métier (jamais technique) */
  label: string;
  /** Icône optionnelle */
  icon?: string;
  /** Badge optionnel (compteur, statut) */
  badge?: ReactNode;
  /** Route associée */
  href?: string;
  /** Désactivé */
  disabled?: boolean;
}

export interface SubModuleNavigationProps {
  /** Liste des sous-modules (3 à 7 max) */
  modules: SubModule[];
  /** Sous-module actif */
  activeModuleId?: string;
  /** Callback lors du changement */
  onModuleChange?: (moduleId: string) => void;
  /** Style personnalisé */
  className?: string;
}

export default function SubModuleNavigation({
  modules,
  activeModuleId,
  onModuleChange,
  className,
}: SubModuleNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer le module actif
  const getActiveModuleId = () => {
    if (activeModuleId) return activeModuleId;
    
    // Essayer de détecter depuis l'URL
    for (const module of modules) {
      if (module.href && pathname?.includes(module.href)) {
        return module.id;
      }
    }
    
    return modules[0]?.id;
  };

  const currentActiveId = getActiveModuleId();

  const handleModuleClick = (module: SubModule) => {
    if (module.disabled) return;
    
    if (onModuleChange) {
      onModuleChange(module.id);
    } else if (module.href) {
      router.push(module.href);
    }
  };

  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <nav className="flex space-x-1 px-4" aria-label="Sous-modules">
        {modules.map((module) => {
          const isActive = currentActiveId === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module)}
              disabled={module.disabled}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors',
                'border-b-2 border-transparent',
                'hover:text-blue-600 hover:border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? 'text-blue-600 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center space-x-2">
                {module.icon && (
                  <span className="text-base">{module.icon}</span>
                )}
                <span>{module.label}</span>
                {module.badge && (
                  <span className="ml-2">{module.badge}</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

