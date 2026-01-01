import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Module import functions
const moduleImports = {
  students: () => import('../components/dashboard/Students'),
  finance: () => import('../components/dashboard/Finance'),
  planning: () => import('../components/dashboard/Planning'),
  examinations: () => import('../../modules/examens'),
  communication: () => import('../components/dashboard/Communication'),
  hr: () => import('../components/dashboard/HR'),
  payroll: () => import('../components/dashboard/PayrollManagement'),
  library: () => import('../components/dashboard/Library'),
  laboratory: () => import('../components/dashboard/Laboratory'),
  transport: () => import('../components/dashboard/Transport'),
  cafeteria: () => import('../components/dashboard/Cafeteria'),
  health: () => import('../components/dashboard/Health'),
  qhse: () => import('../components/dashboard/QHSE'),
  educast: () => import('../components/dashboard/EduCast'),
  boutique: () => import('../components/dashboard/Boutique'),
  settings: () => import('../components/dashboard/Settings')
};

// Module priority levels
const modulePriority = {
  high: ['students', 'finance', 'hr', 'planning'],
  medium: ['examinations', 'communication', 'payroll'],
  low: ['library', 'laboratory', 'transport', 'cafeteria', 'health', 'qhse', 'educast', 'boutique', 'settings']
};

// Module dependencies (which modules are likely to be visited after current one)
const moduleDependencies = {
  students: ['examinations', 'finance'],
  finance: ['payroll', 'hr'],
  hr: ['payroll', 'finance'],
  planning: ['examinations', 'students'],
  examinations: ['students', 'planning'],
  communication: ['students', 'hr'],
  payroll: ['hr', 'finance'],
  library: ['students'],
  laboratory: ['students', 'examinations'],
  transport: ['students'],
  cafeteria: ['students'],
  health: ['students'],
  qhse: ['hr', 'students'],
  educast: ['communication', 'examinations'],
  boutique: ['students', 'finance'],
  settings: []
};

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  timeout?: number;
}

export function useModulePreloader() {
  const location = useLocation();
  const preloadedModules = useRef<Set<string>>(new Set());
  const preloadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const getCurrentModule = useCallback(() => {
    const path = location.pathname;
    const module = path.split('/').pop() || 'overview';
    return module === 'dashboard' ? 'overview' : module;
  }, [location.pathname]);

  const preloadModule = useCallback(async (
    moduleName: string, 
    options: PreloadOptions = {}
  ) => {
    const { priority = 'medium', delay = 0, timeout = 5000 } = options;

    // Skip if already preloaded or currently loading
    if (preloadedModules.current.has(moduleName)) {
      return;
    }

    // Clear existing timeout for this module
    const existingTimeout = preloadTimeouts.current.get(moduleName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const preloadWithTimeout = async () => {
      try {
        const importFn = moduleImports[moduleName as keyof typeof moduleImports];
        if (!importFn) {
          console.warn(`Module ${moduleName} not found in imports`);
          return;
        }

        // Set timeout for preload
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Preload timeout for ${moduleName}`)), timeout);
        });

        await Promise.race([importFn(), timeoutPromise]);
        preloadedModules.current.add(moduleName);
        
        console.log(`✅ Preloaded module: ${moduleName}`);
      } catch (error) {
        console.warn(`❌ Failed to preload module ${moduleName}:`, error);
      }
    };

    if (delay > 0) {
      const timeoutId = setTimeout(preloadWithTimeout, delay);
      preloadTimeouts.current.set(moduleName, timeoutId);
    } else {
      preloadWithTimeout();
    }
  }, []);

  const preloadModules = useCallback(async (
    moduleNames: string[], 
    options: PreloadOptions = {}
  ) => {
    const { priority = 'medium', delay = 0 } = options;
    
    // Preload modules in parallel with staggered delays to avoid overwhelming the browser
    const promises = moduleNames.map((moduleName, index) => 
      preloadModule(moduleName, { 
        ...options, 
        delay: delay + (index * 100) // Stagger by 100ms
      })
    );

    await Promise.allSettled(promises);
  }, [preloadModule]);

  const preloadByPriority = useCallback(async (priority: 'high' | 'medium' | 'low') => {
    const modules = modulePriority[priority];
    await preloadModules(modules, { priority, delay: 0 });
  }, [preloadModules]);

  const preloadDependencies = useCallback(async (currentModule: string) => {
    const dependencies = moduleDependencies[currentModule as keyof typeof moduleDependencies] || [];
    if (dependencies.length > 0) {
      await preloadModules(dependencies, { priority: 'medium', delay: 500 });
    }
  }, [preloadModules]);

  const preloadOnHover = useCallback((moduleName: string) => {
    // Preload on hover with a small delay to avoid unnecessary requests
    preloadModule(moduleName, { priority: 'high', delay: 200 });
  }, [preloadModule]);

  const preloadOnIdle = useCallback(() => {
    // Use requestIdleCallback for low-priority preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadByPriority('low');
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        preloadByPriority('low');
      }, 2000);
    }
  }, [preloadByPriority]);

  // Preload high-priority modules on mount
  useEffect(() => {
    preloadByPriority('high');
  }, [preloadByPriority]);

  // Preload dependencies when module changes
  useEffect(() => {
    const currentModule = getCurrentModule();
    if (currentModule !== 'overview') {
      preloadDependencies(currentModule);
    }
  }, [getCurrentModule, preloadDependencies]);

  // Preload low-priority modules when idle
  useEffect(() => {
    preloadOnIdle();
  }, [preloadOnIdle]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      preloadTimeouts.current.forEach(timeout => clearTimeout(timeout));
      preloadTimeouts.current.clear();
    };
  }, []);

  return {
    preloadModule,
    preloadModules,
    preloadByPriority,
    preloadDependencies,
    preloadOnHover,
    preloadedModules: preloadedModules.current,
    getCurrentModule
  };
}

// Hook for preloading modules based on user behavior
export function useSmartPreloader() {
  const { preloadOnHover, preloadDependencies, getCurrentModule } = useModulePreloader();
  const hoveredModules = useRef<Set<string>>(new Set());

  const handleModuleHover = useCallback((moduleName: string) => {
    if (!hoveredModules.current.has(moduleName)) {
      hoveredModules.current.add(moduleName);
      preloadOnHover(moduleName);
    }
  }, [preloadOnHover]);

  const handleModuleClick = useCallback((moduleName: string) => {
    // Preload dependencies when a module is clicked
    preloadDependencies(moduleName);
  }, [preloadDependencies]);

  return {
    handleModuleHover,
    handleModuleClick,
    getCurrentModule
  };
}
