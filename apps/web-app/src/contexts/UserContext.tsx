import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserSession, AuthResponse, SecurityAlert, SystemNotification } from '../types/user';
import { userService } from '../services/userService';
import { authService, User as AuthUser } from '../services/authService';
import { useOfflineAuth } from '../hooks/useOfflineAuth';

// Types pour le contexte
interface UserState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  securityAlerts: SecurityAlert[];
  notifications: SystemNotification[];
  permissions: string[];
  isOnline: boolean;
  isOffline: boolean;
}

interface UserContextType extends UserState {
  login: (identifier: string, password: string, rememberMe?: boolean, twoFactorCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<boolean>;
  changePassword: (passwordData: any) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  checkPermissions: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  clearError: () => void;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markSecurityAlertAsRead: (alertId: string) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  getOfflineQueue: () => Promise<any[]>;
  getRememberedIdentifier: () => string | null;
}

// Actions pour le reducer
type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SESSION'; payload: UserSession | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SECURITY_ALERTS'; payload: SecurityAlert[] }
  | { type: 'SET_NOTIFICATIONS'; payload: SystemNotification[] }
  | { type: 'SET_PERMISSIONS'; payload: string[] }
  | { type: 'SET_ONLINE_STATUS'; payload: { isOnline: boolean; isOffline: boolean } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// État initial
const initialState: UserState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  securityAlerts: [],
  notifications: [],
  permissions: [],
  isOnline: navigator.onLine,
  isOffline: !navigator.onLine
};

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_SECURITY_ALERTS':
      return { ...state, securityAlerts: action.payload };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    
    case 'SET_ONLINE_STATUS':
      return { 
        ...state, 
        isOnline: action.payload.isOnline, 
        isOffline: action.payload.isOffline 
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    
    default:
      return state;
  }
}

// Création du contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé dans un UserProvider');
  }
  return context;
};

// Alias pour maintenir la compatibilité avec l'ancien code
export const useAuth = useUser;

// Provider du contexte
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const offlineAuth = useOfflineAuth();

  // Mettre à jour l'état de connexion
  useEffect(() => {
    dispatch({ 
      type: 'SET_ONLINE_STATUS', 
      payload: { 
        isOnline: offlineAuth.isOnline, 
        isOffline: offlineAuth.isOffline 
      } 
    });
  }, [offlineAuth.isOnline, offlineAuth.isOffline]);

  // Vérifier la session au chargement
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Vérifier la session existante
  const checkExistingSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Vérifier d'abord le localStorage pour une session existante
      const savedUserId = localStorage.getItem('academia-hub-user-id');
      if (savedUserId) {
        console.log('🔍 Session existante trouvée, ID utilisateur:', savedUserId);
        
        // Utiliser l'authentification hors ligne qui gère automatiquement le mode en ligne/hors ligne
        const user = await offlineAuth.getCurrentUser();
        if (user) {
          console.log('✅ Utilisateur restauré depuis la session:', user.email);
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          
          // Charger les permissions
        loadUserPermissions();
        
        // Charger les notifications
        loadNotifications();
        
        // Charger les alertes de sécurité
        loadSecurityAlerts();
      } else {
        console.log('❌ Aucune session valide trouvée');
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
      } else {
        console.log('❌ Aucun ID utilisateur sauvegardé');
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la vérification de la session' });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Charger les permissions de l'utilisateur
  const loadUserPermissions = async () => {
    try {
      if (state.user) {
        // Logique pour charger les permissions basées sur le rôle
        const permissions = getUserPermissionsByRole(state.user.role);
        dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
    }
  };

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      const notifications = await userService.getNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  // Charger les alertes de sécurité
  const loadSecurityAlerts = async () => {
    try {
      const alerts = await userService.getSecurityAlerts();
      dispatch({ type: 'SET_SECURITY_ALERTS', payload: alerts });
    } catch (error) {
      console.error('Erreur lors du chargement des alertes de sécurité:', error);
    }
  };

  // Fonction de connexion
  const login = async (
    identifier: string, 
    password: string, 
    rememberMe = false, 
    twoFactorCode?: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Utiliser le nouveau service d'authentification avec base de données réelle
      const authResponse = await authService.login(identifier, password, rememberMe);

      if (authResponse.success && authResponse.data) {
        // Convertir l'utilisateur AuthUser en User
        const user: User = {
          id: authResponse.data.user.id,
          username: authResponse.data.user.username,
          email: authResponse.data.user.email,
          firstName: authResponse.data.user.firstName,
          lastName: authResponse.data.user.lastName,
          role: authResponse.data.user.role,
          schoolId: authResponse.data.user.schoolId, // Utiliser le schoolId de la base de données
          avatar: authResponse.data.user.avatar, // Inclure l'avatar de la base de données
          phone: authResponse.data.user.phone, // Inclure le numéro de téléphone
          status: 'active',
          createdAt: authResponse.data.user.createdAt,
          updatedAt: new Date().toISOString()
        };
        
        console.log('🔍 UserContext - Avatar dans l\'objet utilisateur:', user.avatar);
        console.log('🔍 UserContext - Téléphone dans l\'objet utilisateur:', user.phone);

        // Créer une session
        const session: UserSession = {
          id: `session-${user.id}`,
          userId: user.id,
          token: `token-${Date.now()}`,
          expiresAt: rememberMe ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };

        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_SESSION', payload: session });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Sauvegarder l'ID utilisateur pour la persistance de session
        localStorage.setItem('academia-hub-user-id', user.id);
        console.log('💾 ID utilisateur sauvegardé:', user.id);
        
        // Sauvegarder les identifiants si "Se souvenir de moi" est coché
        if (rememberMe) {
          localStorage.setItem('academia-hub-remembered-identifier', identifier);
          console.log('💾 Identifiant sauvegardé pour "Se souvenir de moi":', identifier);
        } else {
          // Supprimer l'identifiant sauvegardé si "Se souvenir de moi" n'est pas coché
          localStorage.removeItem('academia-hub-remembered-identifier');
          console.log('🗑️ Identifiant supprimé du localStorage');
        }
      } else {
        throw new Error(authResponse.error || 'Échec de la connexion');
      }

      // Charger les notifications et alertes
      await Promise.all([
        loadNotifications(),
        loadSecurityAlerts()
      ]);

      return true;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de la connexion' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction pour récupérer l'identifiant sauvegardé
  const getRememberedIdentifier = (): string | null => {
    return localStorage.getItem('academia-hub-remembered-identifier');
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer l'ID utilisateur du localStorage
      localStorage.removeItem('academia-hub-user-id');
      console.log('🗑️ ID utilisateur supprimé du localStorage');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Fonction d'inscription
  const register = async (userData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Utiliser le nouveau service d'authentification avec base de données réelle
      const result = await authService.register(userData);
      return result.success;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de l\'inscription' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const updatedUser = await userService.updateProfile(profileData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      return true;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de la mise à jour du profil' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (passwordData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await userService.changePassword(passwordData);
      return result.success;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors du changement de mot de passe' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de rafraîchissement de la session
  const refreshSession = async (): Promise<void> => {
    try {
      await checkExistingSession();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
    }
  };

  // Fonction de vérification des permissions
  const checkPermissions = (permission: string): boolean => {
    return state.permissions.includes(permission) || state.user?.role === 'super_admin';
  };

  // Fonction de vérification du rôle
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  // Fonction de suppression de l'erreur
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Fonction de marquage des notifications comme lues
  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      await userService.markNotificationAsRead(notificationId);
      const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  };

  // Fonction de marquage des alertes de sécurité comme lues
  const markSecurityAlertAsRead = async (alertId: string): Promise<void> => {
    try {
      await userService.markSecurityAlertAsRead(alertId);
      const updatedAlerts = state.securityAlerts.filter(a => a.id !== alertId);
      dispatch({ type: 'SET_SECURITY_ALERTS', payload: updatedAlerts });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error);
    }
  };

  // Fonctions de synchronisation hors ligne
  const syncOfflineData = async (): Promise<void> => {
    try {
      await offlineAuth.syncOfflineData();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  };

  const getOfflineQueue = async (): Promise<any[]> => {
    try {
      return await offlineAuth.getOfflineQueue();
    } catch (error) {
      console.error('Erreur lors de la récupération de la queue hors ligne:', error);
      return [];
    }
  };

  // Valeur du contexte
  const contextValue: UserContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    refreshSession,
    checkPermissions,
    hasRole,
    clearError,
    markNotificationAsRead,
    markSecurityAlertAsRead,
    syncOfflineData,
    getOfflineQueue,
    getRememberedIdentifier
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Fonction utilitaire pour obtenir les permissions par rôle
function getUserPermissionsByRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    super_admin: [
      'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.manage',
      'system.settings', 'system.logs', 'system.backup', 'system.restore',
      'finance.manage', 'hr.manage', 'communication.manage', 'planning.manage',
      'students.manage', 'examinations.manage'
    ],
    admin: [
      'users.read', 'users.update', 'users.create',
      'finance.read', 'finance.update', 'hr.read', 'hr.update',
      'communication.manage', 'planning.manage', 'students.manage'
    ],
    hr_manager: [
      'users.read', 'users.update', 'hr.manage', 'planning.read',
      'communication.read', 'students.read'
    ],
    finance_manager: [
      'finance.manage', 'users.read', 'students.read',
      'communication.read', 'planning.read'
    ],
    teacher: [
      'planning.read', 'planning.update', 'students.read',
      'communication.read', 'examinations.read', 'examinations.update'
    ],
    staff: [
      'planning.read', 'students.read', 'communication.read'
    ],
    parent: [
      'students.read', 'finance.read', 'communication.read'
    ],
    student: [
      'students.read', 'examinations.read', 'communication.read'
    ]
  };

  return permissions[role] || [];
}
