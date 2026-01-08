/**
 * ============================================================================
 * PROTECTED ROUTE - SAAS MULTI-TENANT
 * ============================================================================
 * 
 * Composant de route protégée avec :
 * - Vérification d'authentification
 * - Vérification des permissions
 * - Vérification des rôles
 * - Redirection sécurisée
 * 
 * ============================================================================
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, checkPermission, hasRole } = useAuth();
  const location = useLocation();

  // En cours de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Vérification de permission
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Vérification de rôle
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

