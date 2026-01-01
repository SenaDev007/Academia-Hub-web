/**
 * ============================================================================
 * UNAUTHORIZED PAGE - SAAS MULTI-TENANT
 * ============================================================================
 * 
 * Page affichée lorsque l'utilisateur n'a pas les permissions nécessaires
 * 
 * ============================================================================
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Accès non autorisé
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {user && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connecté en tant que: <span className="font-semibold">{user.email}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Rôle: <span className="font-semibold">{user.role}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>

          <Link
            to="/dashboard"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

