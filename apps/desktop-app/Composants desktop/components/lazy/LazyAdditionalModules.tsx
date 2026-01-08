import React, { Suspense } from 'react';
import { lazy } from 'react';
import ModuleLoadingSkeleton from '../loading/ModuleLoadingSkeleton';
import ErrorBoundary from '../loading/ErrorBoundary';
import { 
  BookOpen, 
  FlaskConical, 
  Car, 
  Coffee, 
  Heart, 
  Shield, 
  Radio, 
  ShoppingBag, 
  Settings 
} from 'lucide-react';

// Lazy load additional modules
const Library = lazy(() => import('../dashboard/Library'));
const Laboratory = lazy(() => import('../dashboard/Laboratory'));
const Transport = lazy(() => import('../dashboard/Transport'));
const Cafeteria = lazy(() => import('../dashboard/Cafeteria'));
const Health = lazy(() => import('../dashboard/Health'));
const QHSE = lazy(() => import('../dashboard/QHSE'));
const EduCast = lazy(() => import('../dashboard/EduCast'));
const Boutique = lazy(() => import('../dashboard/Boutique'));
const SettingsModule = lazy(() => import('../dashboard/Settings'));

// Module configuration with icons and descriptions
const moduleConfig = {
  library: {
    Component: Library,
    name: 'Bibliothèque',
    icon: BookOpen,
    description: 'Chargement de la gestion de la bibliothèque...'
  },
  laboratory: {
    Component: Laboratory,
    name: 'Laboratoire',
    icon: FlaskConical,
    description: 'Chargement de la gestion du laboratoire...'
  },
  transport: {
    Component: Transport,
    name: 'Transport',
    icon: Car,
    description: 'Chargement de la gestion du transport...'
  },
  cafeteria: {
    Component: Cafeteria,
    name: 'Cantine',
    icon: Coffee,
    description: 'Chargement de la gestion de la cantine...'
  },
  health: {
    Component: Health,
    name: 'Santé',
    icon: Heart,
    description: 'Chargement de la gestion de la santé...'
  },
  qhse: {
    Component: QHSE,
    name: 'QHSE',
    icon: Shield,
    description: 'Chargement de la gestion QHSE...'
  },
  educast: {
    Component: EduCast,
    name: 'EduCast',
    icon: Radio,
    description: 'Chargement du module EduCast...'
  },
  boutique: {
    Component: Boutique,
    name: 'Boutique',
    icon: ShoppingBag,
    description: 'Chargement de la boutique scolaire...'
  },
  settings: {
    Component: SettingsModule,
    name: 'Paramètres',
    icon: Settings,
    description: 'Chargement des paramètres...'
  }
};

// Factory function to create lazy components
const createLazyComponent = (moduleKey: keyof typeof moduleConfig) => {
  const config = moduleConfig[moduleKey];
  const Icon = config.icon;
  
  return () => (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <ModuleLoadingSkeleton 
            moduleName={config.name}
            icon={Icon}
            description={config.description}
          />
        }
      >
        <config.Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// Export individual lazy components
export const LazyLibrary = createLazyComponent('library');
export const LazyLaboratory = createLazyComponent('laboratory');
export const LazyTransport = createLazyComponent('transport');
export const LazyCafeteria = createLazyComponent('cafeteria');
export const LazyHealth = createLazyComponent('health');
export const LazyQHSE = createLazyComponent('qhse');
export const LazyEduCast = createLazyComponent('educast');
export const LazyBoutique = createLazyComponent('boutique');
export const LazySettings = createLazyComponent('settings');

// Export all components as default
export default {
  LazyLibrary,
  LazyLaboratory,
  LazyTransport,
  LazyCafeteria,
  LazyHealth,
  LazyQHSE,
  LazyEduCast,
  LazyBoutique,
  LazySettings
};
