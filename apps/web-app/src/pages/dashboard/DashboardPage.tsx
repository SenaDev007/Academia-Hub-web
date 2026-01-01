/**
 * ============================================================================
 * DASHBOARD PAGE - ROUTES IMBRIQUÉES DU DASHBOARD
 * ============================================================================
 * 
 * Page principale du dashboard avec routes imbriquées pour :
 * - Tableau de bord général
 * - Modules métier (students, finance, planning, etc.)
 * - Bilans et synthèse
 * 
 * ============================================================================
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useSchoolLevel } from '../../contexts/SchoolLevelContext';

// Pages du dashboard
import DashboardHome from '../../components/dashboard/Dashboard';
import { SynthesisPage } from '../synthesis/SynthesisPage';

// Placeholders pour les autres pages (à implémenter)
const StudentsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Scolarité & Élèves</h1></div>;
const FinancePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Économat & Finance</h1></div>;
const PlanningPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Études & Planification</h1></div>;
const ExaminationsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Examens & Évaluation</h1></div>;
const HRPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Personnel & RH</h1></div>;
const CommunicationPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Communication</h1></div>;
const SettingsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Paramètres</h1></div>;

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedSchoolLevelId } = useSchoolLevel();
  const schoolLevelId = searchParams.get('schoolLevelId') || selectedSchoolLevelId;

  return (
    <Routes>
      {/* Route par défaut : Tableau de bord général */}
      <Route index element={<DashboardHome />} />

      {/* Routes des modules métier (nécessitent schoolLevelId) */}
      <Route 
        path="students" 
        element={
          schoolLevelId ? (
            <StudentsPage />
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page.
                </p>
              </div>
            </div>
          )
        } 
      />
      
      <Route 
        path="finance" 
        element={
          schoolLevelId ? (
            <FinancePage />
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page.
                </p>
              </div>
            </div>
          )
        } 
      />
      
      <Route 
        path="planning" 
        element={
          schoolLevelId ? (
            <PlanningPage />
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page.
                </p>
              </div>
            </div>
          )
        } 
      />
      
      <Route 
        path="examinations" 
        element={
          schoolLevelId ? (
            <ExaminationsPage />
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page.
                </p>
              </div>
            </div>
          )
        } 
      />
      
      <Route 
        path="hr" 
        element={
          schoolLevelId ? (
            <HRPage />
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page.
                </p>
              </div>
            </div>
          )
        } 
      />
      
      <Route 
        path="communication" 
        element={
          schoolLevelId ? (
            <CommunicationPage />
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Veuillez sélectionner un niveau scolaire pour accéder à cette page.
                </p>
              </div>
            </div>
          )
        } 
      />

      {/* Route Bilans & Synthèse (peut être consultée sans niveau spécifique) */}
      <Route path="synthesis" element={<SynthesisPage />} />

      {/* Route Paramètres (pas besoin de niveau) */}
      <Route path="settings" element={<SettingsPage />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardPage;

