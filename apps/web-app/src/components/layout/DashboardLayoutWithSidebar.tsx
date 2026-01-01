/**
 * ============================================================================
 * DASHBOARD LAYOUT WITH SIDEBAR - LAYOUT COMPLET AVEC SIDEBAR
 * ============================================================================
 * 
 * Layout principal du dashboard avec :
 * - Sidebar avec navigation
 * - Sélecteur de niveau scolaire
 * - Zone de contenu principale
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../dashboard/Sidebar';
import { SchoolLevelSelector } from '../school-level/SchoolLevelSelector';
import { useSchoolLevel } from '../../contexts/SchoolLevelContext';

const DashboardLayoutWithSidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { selectedSchoolLevelId, isLevelRequired } = useSchoolLevel();

  // Routes qui n'ont pas besoin de niveau scolaire
  const routesWithoutLevel = ['/dashboard', '/dashboard/settings'];
  const needsLevel = !routesWithoutLevel.some(route => location.pathname === route);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-20">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Menu button (mobile) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Sélecteur de niveau scolaire (compact) */}
              <div className="flex-1 flex justify-end">
                <div className="max-w-xs w-full">
                  <SchoolLevelSelector compact={true} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Avertissement si niveau requis mais non sélectionné */}
          {needsLevel && !selectedSchoolLevelId && isLevelRequired && (
            <div className="mx-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page
                </p>
              </div>
            </div>
          )}

          {/* Page Content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutWithSidebar;

