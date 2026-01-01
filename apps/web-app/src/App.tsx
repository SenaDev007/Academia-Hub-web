import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages publiques premium
import PremiumLandingPage from './pages/PremiumLandingPage';
import PlateformePage from './pages/public/PlateformePage';
import ModulesPage from './pages/public/ModulesPage';
import TarificationPage from './pages/public/TarificationPage';
import SecuritePage from './pages/public/SecuritePage';
import ContactPage from './pages/public/ContactPage';
import SignupPage from './pages/public/SignupPage';

// Pages d'authentification
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SaasLogin from './components/auth/SaasLogin';

// Pages dashboard (protégées)
import DashboardPage from './pages/dashboard/DashboardPage';
import DashboardLayoutWithSidebar from './components/layout/DashboardLayoutWithSidebar';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { SchoolLevelProvider } from './contexts/SchoolLevelContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SchoolSettingsProvider } from './contexts/SchoolSettingsContext';
import { DocumentSettingsProvider } from './contexts/DocumentSettingsContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import UnauthorizedPage from './components/auth/UnauthorizedPage';

/**
 * Application principale Academia Hub Web SaaS
 * 
 * Application Web pure - Online-first, API REST uniquement
 * Aucune dépendance Electron ou Node.js
 * 
 * Note: Utilise BrowserRouter au lieu de HashRouter pour Web
 * (HashRouter était pour Electron)
 */
function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <SchoolLevelProvider>
          <ThemeProvider>
            <SchoolSettingsProvider>
              <DocumentSettingsProvider>
                <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Routes>
                    {/* ============================================================
                        PAGES PUBLIQUES PREMIUM
                        ============================================================ */}
                    <Route path="/" element={<PremiumLandingPage />} />
                    <Route path="/plateforme" element={<PlateformePage />} />
                    <Route path="/modules" element={<ModulesPage />} />
                    <Route path="/tarification" element={<TarificationPage />} />
                    <Route path="/securite" element={<SecuritePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    {/* ============================================================
                        AUTHENTIFICATION
                        ============================================================ */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <SaasLogin />
                        </PublicRoute>
                      } 
                    />
                    <Route 
                      path="/forgot-password" 
                      element={
                        <PublicRoute>
                          <ForgotPasswordPage />
                        </PublicRoute>
                      } 
                    />
                    
                    {/* ============================================================
                        DASHBOARD (PROTÉGÉ)
                        ============================================================ */}
                    <Route 
                      path="/dashboard/*" 
                      element={
                        <ProtectedRoute>
                          <DashboardLayoutWithSidebar>
                            <DashboardPage />
                          </DashboardLayoutWithSidebar>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* ============================================================
                        ROUTES D'ERREUR
                        ============================================================ */}
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-white"><div className="text-center"><h1 className="text-3xl font-bold text-navy-900 mb-4">Page non trouvée</h1><p className="text-slate-600 mb-8">La page que vous recherchez n'existe pas.</p><a href="/" className="text-crimson-600 hover:text-crimson-500 font-semibold">Retour à l'accueil</a></div></div>} />
                  </Routes>
                </div>
              </Router>
            </DocumentSettingsProvider>
          </SchoolSettingsProvider>
        </ThemeProvider>
        </SchoolLevelProvider>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;

