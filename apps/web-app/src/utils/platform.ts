/**
 * Platform Detection Utility for Next.js
 * 
 * Détecte la plateforme d'exécution (Web, Desktop, Mobile)
 * et fournit des helpers pour la logique conditionnelle
 */

export type Platform = 'web' | 'desktop' | 'mobile';

/**
 * Détecte la plateforme actuelle
 */
export function getPlatform(): Platform {
  // Vérifier le flag d'environnement explicite
  const envPlatform = process.env.NEXT_PUBLIC_PLATFORM;
  if (envPlatform === 'web' || envPlatform === 'desktop' || envPlatform === 'mobile') {
    return envPlatform;
  }

  // En Next.js, on est toujours sur Web (pas d'Electron)
  // Sauf si on détecte explicitement Electron
  if (typeof window !== 'undefined') {
    // Vérifier si Electron est disponible
    if ((window as any).electronAPI) {
      return 'desktop';
    }
    
    // Vérifier si on est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) {
      return 'mobile';
    }
  }

  // Par défaut, Web (Next.js = Web uniquement)
  return 'web';
}

/**
 * Vérifie si on est sur la plateforme Web
 */
export function isWeb(): boolean {
  return getPlatform() === 'web';
}

/**
 * Vérifie si on est sur la plateforme Desktop (Electron)
 */
export function isDesktop(): boolean {
  return getPlatform() === 'desktop';
}

/**
 * Vérifie si on est sur la plateforme Mobile
 */
export function isMobile(): boolean {
  return getPlatform() === 'mobile';
}

/**
 * Vérifie si Electron API est disponible
 */
export function isElectronAPIAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!(window as any).electronAPI;
}

/**
 * Obtient l'API Electron de manière sécurisée
 */
export function getElectronAPI(): any {
  if (isWeb()) {
    return null;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  return (window as any).electronAPI || null;
}

/**
 * Helper pour exécuter du code uniquement sur Web
 */
export function onWeb<T>(callback: () => T, fallback?: T): T | undefined {
  if (isWeb()) {
    return callback();
  }
  return fallback;
}

/**
 * Helper pour exécuter du code uniquement sur Desktop
 */
export function onDesktop<T>(callback: () => T, fallback?: T): T | undefined {
  if (isDesktop()) {
    return callback();
  }
  return fallback;
}

