import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'image' | 'table' | 'card' | 'list';
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  lines = 1,
  width,
  height,
  className = '',
  animate = true
}) => {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 rounded ${
    animate ? 'animate-pulse' : ''
  }`;

  const getSkeletonContent = () => {
    switch (type) {
      case 'image':
        return (
          <div
            className={`${baseClasses} ${className}`}
            style={{ width: width || '100%', height: height || '200px' }}
          />
        );

      case 'table':
        return (
          <div className={`space-y-3 ${className}`}>
            {/* Header */}
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`${baseClasses} h-4`}
                  style={{ width: `${Math.random() * 100 + 50}px` }}
                />
              ))}
            </div>
            {/* Rows */}
            {Array.from({ length: lines }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`${baseClasses} h-4`}
                    style={{ width: `${Math.random() * 100 + 50}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
            <div className={`${baseClasses} h-6 w-3/4 mb-3`} />
            <div className={`${baseClasses} h-4 w-full mb-2`} />
            <div className={`${baseClasses} h-4 w-2/3`} />
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`${baseClasses} w-8 h-8 rounded-full`} />
                <div className="flex-1 space-y-2">
                  <div className={`${baseClasses} h-4 w-3/4`} />
                  <div className={`${baseClasses} h-3 w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={`${baseClasses} h-4`}
                style={{
                  width: width || (i === lines - 1 ? '60%' : '100%')
                }}
              />
            ))}
          </div>
        );
    }
  };

  return getSkeletonContent();
};

// Composants spécialisés
export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 h-4 rounded animate-pulse"
          style={{ width: `${Math.random() * 100 + 80}px` }}
        />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="bg-gray-200 dark:bg-gray-700 h-4 rounded animate-pulse"
            style={{ width: `${Math.random() * 100 + 60}px` }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <div className="bg-gray-200 dark:bg-gray-700 w-12 h-12 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded animate-pulse" />
        <div className="bg-gray-200 dark:bg-gray-700 h-3 w-1/2 rounded animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded animate-pulse" />
      <div className="bg-gray-200 dark:bg-gray-700 h-4 w-2/3 rounded animate-pulse" />
    </div>
  </div>
);

export const SkeletonImage: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  className?: string;
}> = ({ width = '100%', height = '200px', className = '' }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="bg-gray-200 dark:bg-gray-700 h-4 rounded animate-pulse"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

export default SkeletonLoader;
