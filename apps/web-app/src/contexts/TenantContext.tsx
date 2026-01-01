/**
 * ============================================================================
 * TENANT CONTEXT - SAAS MULTI-TENANT
 * ============================================================================
 * 
 * Gestion du tenant (école) pour la plateforme Web SaaS
 * - Résolution par subdomain
 * - Résolution par header X-Tenant-ID
 * - Gestion du tenant_id dans les requêtes API
 * 
 * Online-first : Aucune logique offline
 * ============================================================================
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../lib/api/client';
import { useAuth } from './AuthContext';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  slug: string;
  countryId: string;
  status: 'active' | 'suspended' | 'cancelled';
  subscriptionPlan: string;
  subscriptionStatus: string;
  settings: {
    logo?: string;
    theme?: string;
    language?: string;
    [key: string]: any;
  };
}

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Résoudre le tenant depuis le subdomain ou l'utilisateur
  const resolveTenant = async (): Promise<string | null> => {
    // 1. Depuis l'utilisateur connecté (priorité)
    if (user?.tenantId) {
      return user.tenantId;
    }

    // 2. Depuis le subdomain
    const subdomain = extractSubdomain(window.location.hostname);
    if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost') {
      try {
        // Résoudre subdomain → tenant_id via API
        const response = await api.tenants?.getBySubdomain?.(subdomain);
        if (response?.data?.id) {
          return response.data.id;
        }
      } catch (error) {
        console.error('Erreur lors de la résolution du subdomain:', error);
      }
    }

    // 3. Depuis localStorage (temporaire)
    const savedTenantId = localStorage.getItem('tenantId');
    if (savedTenantId) {
      return savedTenantId;
    }

    return null;
  };

  // Extraire le subdomain
  const extractSubdomain = (hostname: string): string | null => {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  };

  // Charger les informations du tenant
  const loadTenant = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Appel API pour récupérer les infos du tenant
      const response = await api.tenants?.getById?.(id);
      
      if (response?.data) {
        const tenantData: Tenant = {
          id: response.data.id,
          name: response.data.name,
          subdomain: response.data.subdomain,
          slug: response.data.slug,
          countryId: response.data.countryId,
          status: response.data.status,
          subscriptionPlan: response.data.subscriptionPlan,
          subscriptionStatus: response.data.subscriptionStatus,
          settings: response.data.settings || {},
        };

        setTenant(tenantData);
        setTenantId(id);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('tenantId', id);
      } else {
        throw new Error('Tenant non trouvé');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du tenant:', error);
      setError(error.message || 'Erreur lors du chargement du tenant');
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir le tenant
  const refreshTenant = async () => {
    if (tenantId) {
      await loadTenant(tenantId);
    }
  };

  // Charger le tenant au montage ou quand l'utilisateur change
  useEffect(() => {
    const initializeTenant = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const resolvedTenantId = await resolveTenant();
      
      if (resolvedTenantId) {
        await loadTenant(resolvedTenantId);
      } else {
        setError('Aucun tenant trouvé');
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, [isAuthenticated, user?.tenantId]);

  const value: TenantContextType = {
    tenant,
    tenantId,
    isLoading,
    error,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
