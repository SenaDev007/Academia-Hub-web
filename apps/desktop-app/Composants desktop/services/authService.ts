/**
 * ============================================================================
 * AUTH SERVICE - SAAS MULTI-TENANT
 * ============================================================================
 * 
 * Service d'authentification pour la plateforme Web SaaS
 * - Utilise uniquement l'API REST (aucun fallback offline)
 * - Gestion JWT
 * - Online-first
 * 
 * ============================================================================
 */

import { api, setAuthToken, setTenantId } from '../lib/api/client';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    access_token: string;
  };
  error?: string;
}

class AuthService {
  /**
   * Connexion d'un utilisateur
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    try {
      const response = await api.auth.login({ email, password, rememberMe });

      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        const user = response.data.user;

        // Sauvegarder le token
        localStorage.setItem('authToken', token);
        setAuthToken(token);

        // Sauvegarder le tenant_id si disponible
        if (user.tenantId) {
          localStorage.setItem('tenantId', user.tenantId);
          setTenantId(user.tenantId);
        }

        return {
          success: true,
          data: {
            user,
            access_token: token,
          },
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Échec de la connexion',
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la connexion';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.auth.register(userData);

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Échec de l\'inscription',
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      // Appel API pour invalider le token côté serveur
      await api.auth.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion API:', error);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('academia-hub-remembered-email');
    }
  }

  /**
   * Obtenir le profil de l'utilisateur actuel
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.auth.profile();

      if (response.data) {
        return {
          success: true,
          data: {
            user: response.data,
            access_token: localStorage.getItem('authToken') || '',
          },
        };
      } else {
        return {
          success: false,
          error: 'Profil non trouvé',
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération du profil';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.auth.refresh();

      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        setAuthToken(token);

        return {
          success: true,
          data: {
            user: response.data.user,
            access_token: token,
          },
        };
      } else {
        return {
          success: false,
          error: 'Échec du rafraîchissement du token',
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du rafraîchissement';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

// Export d'une instance singleton
export const authService = new AuthService();
export default authService;
