'use client';

/**
 * Provider pour initialiser le wrapper Electron compatibilité
 * 
 * ⚠️ NEXT.JS = WEB UNIQUEMENT
 * Ce wrapper remplace Electron par HTTP
 */

import { useEffect } from 'react';

export function ElectronCompatProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialiser le wrapper Electron compatibilité côté client uniquement
    if (typeof window !== 'undefined') {
      import('@/utils/electron-compat').then((module) => {
        // Le wrapper s'expose automatiquement sur window.electronAPI
        console.log('✅ Electron compat wrapper initialized (Web mode)');
      }).catch((error) => {
        console.warn('⚠️ Electron compat wrapper not loaded:', error);
      });
    }
  }, []);

  return <>{children}</>;
}

