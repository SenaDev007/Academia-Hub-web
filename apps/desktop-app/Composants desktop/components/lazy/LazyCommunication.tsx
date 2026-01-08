import React, { Suspense } from 'react';
import { lazy } from 'react';
import FastModuleLoader from '../loading/FastModuleLoader';
import ErrorBoundary from '../loading/ErrorBoundary';
import { MessageSquare } from 'lucide-react';
import { useLazyModule } from '../../hooks/useLazyModule';

// Optimized lazy loading with caching and intelligent preloading
const communicationImport = () => import('../dashboard/Communication');
const Communication = lazy(communicationImport);

const LazyCommunication: React.FC = () => {
  const { Component, loading, error, retry } = useLazyModule(
    communicationImport,
    {
      preload: false,
      preloadOnHover: true,
      preloadOnIdle: true,
      priority: 'medium',
      cacheKey: 'communication-module',
      timeout: 8000
    }
  );

  if (error) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <MessageSquare className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Impossible de charger le module Communication
            </p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (Component) {
    return (
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <FastModuleLoader 
            moduleName="Communication"
            icon={MessageSquare}
            description="Chargement du module de communication..."
            showMinimal={false}
          />
        }
      >
        <Communication />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyCommunication;
