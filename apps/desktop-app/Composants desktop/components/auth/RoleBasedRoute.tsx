/**
 * ============================================================================
 * ROLE-BASED ROUTE - SAAS MULTI-TENANT
 * ============================================================================
 * 
 * Composant de route basée sur les rôles et permissions
 * - Vérification d'authentification
 * - Vérification de rôle
 * - Vérification de permission
 * - Redirection sécurisée
 * 
 * ============================================================================
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute, ProtectedRouteProps } from './ProtectedRoute';

interface RoleBasedRouteProps extends Omit<ProtectedRouteProps, 'requiredRole' | 'requiredPermission'> {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  anyRole?: boolean; // Si true, l'utilisateur doit avoir au moins un des rôles
  anyPermission?: boolean; // Si true, l'utilisateur doit avoir au moins une des permissions
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  anyRole = false,
  anyPermission = false,
  redirectTo = '/unauthorized',
  ...rest
}) => {
  const { user, isAuthenticated, isLoading, checkPermission, hasRole } = useAuth();

  // En cours de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Vérification des rôles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = anyRole
      ? requiredRoles.some(role => hasRole(role))
      : requiredRoles.every(role => hasRole(role));

    if (!hasRequiredRole) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Vérification des permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = anyPermission
      ? requiredPermissions.some(permission => checkPermission(permission))
      : requiredPermissions.every(permission => checkPermission(permission));

    if (!hasRequiredPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleBasedRoute;

