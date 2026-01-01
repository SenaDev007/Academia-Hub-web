import React, { Suspense } from 'react';
import { lazy } from 'react';
import ModuleLoadingSkeleton from '../loading/ModuleLoadingSkeleton';
import ErrorBoundary from '../loading/ErrorBoundary';
import { Users } from 'lucide-react';

// Lazy load the Students component
const Students = lazy(() => import('../dashboard/Students'));

const LazyStudents: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <ModuleLoadingSkeleton 
            moduleName="Étudiants"
            icon={Users}
            description="Chargement de la gestion des étudiants..."
          />
        }
      >
        <Students />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyStudents;
