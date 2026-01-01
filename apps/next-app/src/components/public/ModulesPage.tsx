/**
 * Modules Page Component
 */

import PremiumHeader from '../layout/PremiumHeader';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      <div className="h-20" />
      
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Tous les modules. Aucun bridage. Accès complet.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            15 modules complets. Aucune option cachée. Aucun supplément.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-navy-900 rounded-lg p-8 text-white text-center">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              Tous les modules sont inclus. Aucune option cachée.
            </h3>
            <p className="text-lg text-gray-100 mb-8">
              Lorsque vous activez Academia Hub, vous obtenez immédiatement l'accès à tous les 15 modules.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-crimson-600 text-white px-10 py-5 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors"
            >
              Activer Academia Hub maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

