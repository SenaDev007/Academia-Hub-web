import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface FastModuleLoaderProps {
  moduleName: string;
  icon?: LucideIcon;
  description?: string;
  progress?: number;
  showMinimal?: boolean;
}

const FastModuleLoader: React.FC<FastModuleLoaderProps> = memo(({ 
  moduleName, 
  icon: Icon,
  description = "Chargement en cours...",
  progress = 0,
  showMinimal = false
}) => {
  if (showMinimal) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            {Icon && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-3 h-3 text-blue-600" />
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {moduleName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {/* Icon et animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              {Icon && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            Chargement de {moduleName}
          </h3>

          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {description}
          </p>

          {/* Barre de progression */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
              </div>
            </div>
          )}

          {/* Points d'animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

FastModuleLoader.displayName = 'FastModuleLoader';

export default FastModuleLoader;
