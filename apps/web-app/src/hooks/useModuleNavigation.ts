import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ModuleNavigation {
  navigateToModule: (moduleName: string, tabName?: string) => void;
  navigateToFinancePayroll: () => void;
  navigateToFinance: (tabName?: string) => void;
  navigateToHR: (tabName?: string) => void;
  navigateToCafeteria: (tabName?: string) => void;
  navigateToBoutique: (tabName?: string) => void;
  navigateToCommunication: (tabName?: string) => void;
  navigateToHealth: (tabName?: string) => void;
}

export const useModuleNavigation = (): ModuleNavigation => {
  const navigate = useNavigate();
  
  // Navigation générale vers un module
  const navigateToModule = useCallback((moduleName: string, tabName?: string) => {
    // Utiliser React Router pour la navigation
    const modulePath = tabName ? `/${moduleName}/${tabName}` : `/${moduleName}`;
    
    // Navigation via React Router
    navigate(modulePath);
    
    // Émission d'un événement global pour la compatibilité
    const navigationEvent = new CustomEvent('academiaHub:moduleChange', {
      detail: {
        from: 'HR',
        to: moduleName,
        tab: tabName,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(navigationEvent);
    
    console.log(`Navigation: HR → ${moduleName}${tabName ? ` (${tabName})` : ''}`);
  }, [navigate]);

    // Navigation spécifique vers la gestion de la paie
    const navigateToFinancePayroll = useCallback(() => {
      // Naviguer directement vers la route /payroll qui existe
      navigate('/payroll');
      
      // Émission d'un événement global pour la compatibilité
      const navigationEvent = new CustomEvent('academiaHub:moduleChange', {
        detail: {
          from: 'HR',
          to: 'Finance',
          tab: 'payroll',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(navigationEvent);
      
      console.log('Navigation: HR → Finance (payroll) via /payroll');
    }, [navigate]);

  // Navigation vers le module Finance
  const navigateToFinance = useCallback((tabName?: string) => {
    navigateToModule('Finance', tabName);
  }, [navigateToModule]);

  // Navigation vers le module HR
  const navigateToHR = useCallback((tabName?: string) => {
    navigateToModule('HR', tabName);
  }, [navigateToModule]);

  // Navigation vers le module Cafeteria
  const navigateToCafeteria = useCallback((tabName?: string) => {
    navigateToModule('Cafeteria', tabName);
  }, [navigateToModule]);

  // Navigation vers le module Boutique
  const navigateToBoutique = useCallback((tabName?: string) => {
    navigateToModule('Boutique', tabName);
  }, [navigateToModule]);

  // Navigation vers le module Communication
  const navigateToCommunication = useCallback((tabName?: string) => {
    navigateToModule('Communication', tabName);
  }, [navigateToModule]);

  // Navigation vers le module Health
  const navigateToHealth = useCallback((tabName?: string) => {
    navigateToModule('Health', tabName);
  }, [navigateToModule]);

  return {
    navigateToModule,
    navigateToFinancePayroll,
    navigateToFinance,
    navigateToHR,
    navigateToCafeteria,
    navigateToBoutique,
    navigateToCommunication,
    navigateToHealth
  };
};

export default useModuleNavigation;
