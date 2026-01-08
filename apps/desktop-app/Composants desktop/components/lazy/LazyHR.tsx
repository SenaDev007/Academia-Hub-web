import React, { Suspense } from 'react';
import { lazy } from 'react';
import ModuleLoadingSkeleton from '../loading/ModuleLoadingSkeleton';
import ErrorBoundary from '../loading/ErrorBoundary';
import { Building2 } from 'lucide-react';

// Lazy load the HR component
const HR = lazy(() => import('../dashboard/HR'));

const LazyHR: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <ModuleLoadingSkeleton 
            moduleName="Ressources Humaines"
            icon={Building2}
            description="Chargement de la gestion des ressources humaines..."
          />
        }
      >
        <HR />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyHR;
