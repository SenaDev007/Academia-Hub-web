/**
 * Tarification Page Component
 */

import PremiumHeader from '../layout/PremiumHeader';
import Link from 'next/link';
import { CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

export default function TarificationPage() {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      <div className="h-20" />
      
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Tarification transparente. Aucune ambiguïté.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Un investissement initial. Un abonnement mensuel. C'est tout.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 border-2 border-navy-900">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Souscription initiale</h2>
              <div className="text-5xl font-bold text-navy-900 mb-4">100.000 FCFA</div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Accès à tous les modules</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Période d'essai 30 jours</span>
                </li>
              </ul>
              <Link href="/signup" className="btn-primary-crimson w-full text-center block">
                Souscrire maintenant
              </Link>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Abonnement mensuel</h2>
              <div className="text-5xl font-bold text-navy-900 mb-4">15.000 FCFA</div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Maintenance continue</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Support technique</span>
                </li>
              </ul>
              <p className="text-sm text-slate-600 text-center">Démarre après 30 jours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

