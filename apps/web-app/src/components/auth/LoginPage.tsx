/**
 * Login Page Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, LoginCredentials } from '@/services/auth.service';
import { GraduationCap, Loader, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // ============================================
      // IDENTIFIANTS PROVISOIRES (TEST)
      // ============================================
      const testCredentials = [
        { email: 'admin@test.com', password: 'admin123', role: 'DIRECTOR' },
        { email: 'directeur@test.com', password: 'directeur123', role: 'DIRECTOR' },
        { email: 'enseignant@test.com', password: 'enseignant123', role: 'TEACHER' },
        { email: 'comptable@test.com', password: 'comptable123', role: 'ACCOUNTANT' },
      ];

      const testUser = testCredentials.find(
        (tc) => tc.email === credentials.email && tc.password === credentials.password
      );

      if (testUser) {
        // Connexion provisoire réussie - créer une session de test
        const sessionData = {
          user: {
            id: `test-user-${Date.now()}`,
            email: testUser.email,
            firstName: 'Test',
            lastName: 'User',
            role: testUser.role,
            tenantId: 'test-tenant-id',
          },
          token: 'test-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        // Stocker dans sessionStorage
        sessionStorage.setItem('academia_session', JSON.stringify(sessionData));
        // Stocker aussi dans un cookie lisible côté serveur pour les Server Components
        try {
          document.cookie = `academia_test_session=${encodeURIComponent(
            JSON.stringify(sessionData.user),
          )}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        } catch (cookieError) {
          console.warn('Unable to set test session cookie:', cookieError);
        }
        
        // Rediriger vers le dashboard
        window.location.href = '/app';
        return;
      }

      // Si pas d'identifiants de test, essayer l'API normale
      // Extraire le sous-domaine depuis l'URL
      const host = window.location.host;
      const parts = host.split('.');
      const subdomain = parts.length > 2 && parts[0] !== 'localhost' ? parts[0] : undefined;
      
      // Appeler l'API route Next.js
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          tenantSubdomain: subdomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      // Rediriger vers le dashboard normal pour les utilisateurs (tenants)
      // Le middleware gérera la redirection vers le bon sous-domaine
      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-lg mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Academia Hub</h1>
          <p className="text-sm text-graphite-700 mt-2">Connexion à votre compte</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              placeholder="votre.email@etablissement.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Identifiants provisoires (TEST) */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">🔑 Identifiants provisoires (Test) :</p>
          <div className="text-xs text-blue-800 space-y-1">
            <p>• <strong>admin@test.com</strong> / admin123 (Directeur)</p>
            <p>• <strong>directeur@test.com</strong> / directeur123 (Directeur)</p>
            <p>• <strong>enseignant@test.com</strong> / enseignant123 (Enseignant)</p>
            <p>• <strong>comptable@test.com</strong> / comptable123 (Comptable)</p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/forgot-password"
            className="text-sm text-crimson-600 hover:text-crimson-500"
          >
            Mot de passe oublié ?
          </Link>
          <p className="text-sm text-graphite-700">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-crimson-600 hover:text-crimson-500 font-semibold">
              Activer Academia Hub
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

