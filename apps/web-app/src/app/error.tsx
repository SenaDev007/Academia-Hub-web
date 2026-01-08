/**
 * Error Boundary
 * 
 * Gestion des erreurs globales
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-navy-900 mb-4">
          Une erreur s'est produite
        </h1>
        <p className="text-slate-600 mb-8">
          Désolé, une erreur inattendue s'est produite. Veuillez réessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-navy-900 text-white px-6 py-3 rounded-md font-semibold hover:bg-navy-800 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

