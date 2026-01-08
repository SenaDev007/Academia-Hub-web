import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTenant } from '../contexts/TenantContext';

interface TenantRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const TenantRoute: React.FC<TenantRouteProps> = ({ children, requiredRoles = [] }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { school, isLoading: tenantLoading } = useTenant();
  const location = useLocation();

  // Show loading state if auth or tenant is still loading
  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if school exists and is active
  if (!school) {
    return <Navigate to="/school-not-found" replace />;
  }

  if (school.status && school.status !== 'active') {
    if (school.status === 'pending_payment') {
      return <Navigate to="/register/school/plan" replace />;
    }
    if (school.status === 'pending_kyc') {
      return <Navigate to="/register/school/kyc" replace />;
    }
    if (school.status === 'suspended' || school.status === 'expired') {
      return <Navigate to="/subscription" replace />;
    }
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default TenantRoute;