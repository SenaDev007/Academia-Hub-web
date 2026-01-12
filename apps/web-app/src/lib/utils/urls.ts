/**
 * ============================================================================
 * URL HELPER - GESTION CENTRALISÉE DES URLs
 * ============================================================================
 * 
 * Helper centralisé pour gérer toutes les URLs de l'application
 * Supporte : local, preview (Vercel), production
 * 
 * ============================================================================
 */

/**
 * Environnement actuel
 */
export type AppEnvironment = 'local' | 'preview' | 'production';

/**
 * Détecte l'environnement actuel
 */
export function getAppEnvironment(): AppEnvironment {
  // En production, vérifier si on est sur Vercel preview ou production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'local';
    }
    
    // Vercel preview (contient .vercel.app)
    if (hostname.includes('.vercel.app')) {
      return 'preview';
    }
    
    // Production (domaine custom)
    return 'production';
  }
  
  // Côté serveur, utiliser les variables d'environnement
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV;
  
  if (env === 'development' || !env) {
    return 'local';
  }
  
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  
  return 'production';
}

/**
 * Récupère l'URL de base de l'application
 * 
 * @returns URL de base (ex: http://localhost:3001 ou https://academia-hub.com)
 */
export function getAppBaseUrl(): string {
  const env = getAppEnvironment();
  
  // Utiliser la variable d'environnement si définie
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback selon l'environnement
  switch (env) {
    case 'local':
      return 'http://localhost:3001';
    case 'preview':
      // En preview Vercel, utiliser l'URL fournie par Vercel
      if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`;
      }
      return process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3001';
    case 'production':
      // En production, utiliser le domaine de base
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'academia-hub.com';
      return `https://${baseDomain}`;
    default:
      return 'http://localhost:3001';
  }
}

/**
 * Récupère l'URL de base de l'API
 * 
 * @returns URL de l'API (ex: http://localhost:3000/api)
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  const env = getAppEnvironment();
  
  switch (env) {
    case 'local':
      return 'http://localhost:3000/api';
    case 'preview':
    case 'production':
      // En preview/prod, l'API est sur le même domaine ou un sous-domaine API
      const appUrl = getAppBaseUrl();
      // Si l'API est sur un sous-domaine différent
      const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
      if (apiDomain) {
        return `https://${apiDomain}/api`;
      }
      // Sinon, utiliser le même domaine
      return `${appUrl}/api`;
    default:
      return 'http://localhost:3000/api';
  }
}

/**
 * Récupère le domaine de base (sans protocole)
 * 
 * @returns Domaine de base (ex: localhost:3001 ou academia-hub.com)
 */
export function getBaseDomain(): string {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (baseDomain) {
    return baseDomain;
  }
  
  const env = getAppEnvironment();
  
  switch (env) {
    case 'local':
      return 'localhost:3001';
    case 'preview':
      if (typeof window !== 'undefined') {
        return window.location.host;
      }
      return process.env.VERCEL_URL || 'localhost:3001';
    case 'production':
      return 'academia-hub.com';
    default:
      return 'localhost:3001';
  }
}

/**
 * Construit l'URL de redirection vers un tenant (sous-domaine)
 * 
 * @param tenantSlug - Slug du tenant (ex: "college-x")
 * @param path - Chemin optionnel (ex: "/login")
 * @param queryParams - Paramètres de requête optionnels
 * @returns URL complète vers le sous-domaine
 */
export function getTenantRedirectUrl(
  tenantSlug: string,
  path: string = '/app',
  queryParams?: Record<string, string>
): string {
  const env = getAppEnvironment();
  const baseDomain = getBaseDomain();
  
  // En local, utiliser un paramètre de requête au lieu d'un sous-domaine
  if (env === 'local') {
    const url = new URL(path, getAppBaseUrl());
    url.searchParams.set('tenant', tenantSlug);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return url.toString();
  }
  
  // En preview/production, utiliser le sous-domaine
  const protocol = env === 'local' ? 'http' : 'https';
  const subdomain = tenantSlug;
  const domain = `${subdomain}.${baseDomain}`;
  
  const url = new URL(path, `${protocol}://${domain}`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Construit l'URL complète à partir d'un chemin relatif
 * 
 * @param path - Chemin relatif (ex: "/login")
 * @returns URL complète
 */
export function getFullUrl(path: string): string {
  const baseUrl = getAppBaseUrl();
  return new URL(path, baseUrl).toString();
}

/**
 * Construit l'URL de l'API à partir d'un chemin relatif
 * 
 * @param path - Chemin relatif (ex: "/auth/login")
 * @returns URL complète de l'API
 */
export function getApiUrl(path: string): string {
  const apiBaseUrl = getApiBaseUrl();
  // S'assurer que le chemin commence par /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, apiBaseUrl).toString();
}
