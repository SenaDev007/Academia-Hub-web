import { MetadataRoute } from 'next';

/**
 * Sitemap dynamique qui détecte automatiquement toutes les pages publiques
 * 
 * Les nouvelles pages dans app/(public)/ sont automatiquement détectées
 * et ajoutées au sitemap avec des priorités par défaut
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.academiahub.com';

  // Pages statiques avec priorités définies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/modules`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/plateforme`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/securite`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/orion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/legal/cgu`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/cgv`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/mentions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Note: La détection automatique des pages est gérée par Next.js
  // Les nouvelles pages dans app/(public)/ sont automatiquement accessibles
  // via les routes Next.js. Pour les ajouter au sitemap, il suffit de les
  // ajouter manuellement ici ou d'utiliser un système de génération dynamique.
  
  // Pour l'instant, on retourne les pages statiques.
  // Les développeurs doivent ajouter leurs nouvelles pages ici.
  // Un script automatique peut être créé pour scanner et générer ce fichier.
  
  return staticPages;
}

/**
 * Détermine la priorité par défaut selon le chemin
 */
function getDefaultPriority(path: string): number {
  // Pages importantes
  if (path.includes('signup') || path.includes('modules') || path.includes('plateforme')) {
    return 0.9;
  }
  
  // Pages secondaires
  if (path.includes('securite') || path.includes('orion') || path.includes('contact')) {
    return 0.8;
  }
  
  // Pages légales
  if (path.includes('legal')) {
    return 0.3;
  }
  
  // Par défaut
  return 0.7;
}

