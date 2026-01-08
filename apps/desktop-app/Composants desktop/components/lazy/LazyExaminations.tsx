import React, { Suspense } from 'react';
import { lazy } from 'react';
import ModuleLoadingSkeleton from '../loading/ModuleLoadingSkeleton';
import ErrorBoundary from '../loading/ErrorBoundary';
import { GraduationCap } from 'lucide-react';

// Lazy load the Examinations module
const ExaminationsModule = lazy(() => import('../../modules/examens'));

const LazyExaminations: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <ModuleLoadingSkeleton 
            moduleName="Examens"
            icon={GraduationCap}
            description="Chargement du module d'examens..."
          />
        }
      >
        <ExaminationsModule />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyExaminations;
