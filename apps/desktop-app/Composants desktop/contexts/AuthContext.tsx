/**
 * ============================================================================
 * AUTH CONTEXT - SAAS MULTI-TENANT
 * ============================================================================
 * 
 * Gestion de l'authentification pour la plateforme Web SaaS
 * - JWT-based authentication
 * - Session management
 * - Role-based access control
 * - Tenant isolation
 * 
 * Online-first : Aucune logique offline
 * ============================================================================
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { api, setAuthToken, setTenantId } from '../lib/api/client';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
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

export interface AuthState {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_TENANT_ID'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// ============================================================================
// REDUCER
// ============================================================================

const initialState: AuthState = {
  user: null,
  token: null,
  tenantId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    
    case 'SET_TENANT_ID':
      return { ...state, tenantId: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Vérifier la session au chargement
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Vérifier la session existante
  const checkExistingSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const token = localStorage.getItem('authToken');
      const tenantId = localStorage.getItem('tenantId');

      if (!token) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Vérifier le token avec l'API
      try {
        const response = await api.auth.profile();
        const userData = response.data;

        // Construire l'objet User
        const user: User = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || 'user',
          tenantId: userData.tenantId || tenantId || '',
          permissions: userData.permissions || [],
          avatar: userData.avatar,
          phone: userData.phone,
          status: userData.status || 'active',
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };

        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_TENANT_ID', payload: user.tenantId || tenantId });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });

        // Mettre à jour les headers API
        setAuthToken(token);
        if (user.tenantId) {
          setTenantId(user.tenantId);
        }
      } catch (error: any) {
        // Token invalide ou expiré
        console.error('Session invalide:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('tenantId');
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification de la session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la vérification de la session' });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de connexion
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Appel API
      const response = await api.auth.login({
        email,
        password,
        rememberMe,
      });

      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        const userData = response.data.user;

        // Construire l'objet User
        const user: User = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || 'user',
          tenantId: userData.tenantId || '',
          permissions: userData.permissions || [],
          avatar: userData.avatar,
          phone: userData.phone,
          status: userData.status || 'active',
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };

        // Sauvegarder le token et tenant_id
        localStorage.setItem('authToken', token);
        if (user.tenantId) {
          localStorage.setItem('tenantId', user.tenantId);
          setTenantId(user.tenantId);
        }

        // Mettre à jour les headers API
        setAuthToken(token);

        // Mettre à jour l'état
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_TENANT_ID', payload: user.tenantId });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });

        return true;
      } else {
        throw new Error(response.data?.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la connexion';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      // Appel API pour invalider le token côté serveur
      try {
        await api.auth.logout();
      } catch (error) {
        console.error('Erreur lors de la déconnexion API:', error);
      }

      // Nettoyer le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenantId');

      // Réinitialiser l'état
      dispatch({ type: 'LOGOUT' });

      // Rediriger vers la page de login
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await api.auth.register(userData);

      if (response.data) {
        // Après inscription réussie, connecter l'utilisateur
        return await login(userData.email, userData.password);
      } else {
        throw new Error(response.data?.message || 'Échec de l\'inscription');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Rafraîchir la session
  const refreshSession = async (): Promise<void> => {
    await checkExistingSession();
  };

  // Vérifier une permission
  const checkPermission = (permission: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === 'super_admin') return true;
    return state.user.permissions.includes(permission);
  };

  // Vérifier un rôle
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  // Supprimer l'erreur
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    refreshSession,
    checkPermission,
    hasRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

