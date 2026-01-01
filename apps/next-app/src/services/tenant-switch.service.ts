/**
 * Tenant Switch Service
 * 
 * Service pour gérer le changement de tenant actif
 * pour les utilisateurs SUPER_DIRECTOR (promoteurs)
 */

import apiClient from '@/lib/api/client';
import type { Tenant } from '@/types';

/**
 * Change le tenant actif pour l'utilisateur connecté
 * Redirige vers le sous-domaine du nouveau tenant
 */
export async function switchTenant(tenantId: string, subdomain: string): Promise<void> {
  try {
    // Mettre à jour le tenant actif côté backend
    await apiClient.post('/auth/switch-tenant', { tenantId });
    
    // Rediriger vers le sous-domaine du nouveau tenant
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    
    // Si on est déjà sur un sous-domaine, remplacer
    // Sinon, construire l'URL complète
    if (host.includes('.')) {
      const parts = host.split('.');
      const baseDomain = parts.slice(-2).join('.'); // academiahub.com
      window.location.href = `${protocol}//${subdomain}.${baseDomain}/app`;
    } else {
      // En développement local, utiliser le header X-Tenant-Subdomain
      window.location.href = `/app?tenant=${subdomain}`;
    }
  } catch (error) {
    console.error('Error switching tenant:', error);
    throw new Error('Erreur lors du changement d\'établissement');
  }
}

/**
 * Récupère la liste des tenants accessibles pour l'utilisateur actuel
 */
export async function getAccessibleTenants(): Promise<Tenant[]> {
  try {
    const response = await apiClient.get<Tenant[]>('/auth/accessible-tenants');
    return response.data;
  } catch (error) {
    console.error('Error fetching accessible tenants:', error);
    return [];
  }
}

