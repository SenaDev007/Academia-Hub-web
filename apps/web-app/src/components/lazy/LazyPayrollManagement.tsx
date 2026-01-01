import React, { Suspense } from 'react';
import { lazy } from 'react';
import ModuleLoadingSkeleton from '../loading/ModuleLoadingSkeleton';
import ErrorBoundary from '../loading/ErrorBoundary';
import { Calculator } from 'lucide-react';

// Lazy load the PayrollManagement component
const PayrollManagement = lazy(() => import('../dashboard/PayrollManagement'));

const LazyPayrollManagement: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <ModuleLoadingSkeleton 
            moduleName="Gestion de la Paie"
            icon={Calculator}
            description="Chargement de la gestion de la paie..."
          />
        }
      >
        <PayrollManagement />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyPayrollManagement;
