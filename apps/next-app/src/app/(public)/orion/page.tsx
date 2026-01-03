/**
 * Page ORION (IA)
 * 
 * Page dédiée à ORION, l'assistant de direction intégré à Academia Hub
 */

import PremiumHeader from '@/components/layout/PremiumHeader';
import InstitutionalFooter from '@/components/public/InstitutionalFooter';
import { bgColor, textColor, typo } from '@/lib/design-tokens';
import AppIcon from '@/components/ui/AppIcon';
import Image from 'next/image';
import Link from 'next/link';

export default function OrionPage() {
  return (
    <>
      <PremiumHeader />
      <main className={`min-h-screen ${bgColor('background')} ${textColor('primary')}`}>
        {/* Hero Section */}
        <section className={`${bgColor('sidebar')} ${textColor('inverse')} py-20 px-4 sm:px-6 lg:px-8`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full mb-6 shadow-xl">
                <AppIcon name="orion" size="dashboard" className="text-white" />
              </div>
              <h1 className={`${typo('h1')} text-white mb-6`}>
                ORION — L'intelligence qui éclaire vos décisions
              </h1>
              <p className={`${typo('large')} text-white/90 max-w-3xl mx-auto leading-relaxed`}>
                ORION est l'assistant de direction intégré à Academia Hub. Il analyse vos données
                et vous aide à comprendre vos chiffres, anticiper les risques et prendre de meilleures décisions.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <AppIcon name="analysis" size="dashboard" className="text-blue-600" />
                </div>
                <h3 className={`${typo('h3')} ${textColor('primary')} mb-4`}>
                  Analyse intelligente
                </h3>
                <p className={`${typo('body')} ${textColor('secondary')}`}>
                  ORION analyse vos données en temps réel et identifie les tendances, anomalies
                  et opportunités d'amélioration.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-gold-100 rounded-xl flex items-center justify-center mb-6">
                  <AppIcon name="warning" size="dashboard" className="text-gold-600" />
                </div>
                <h3 className={`${typo('h3')} ${textColor('primary')} mb-4`}>
                  Alertes proactives
                </h3>
                <p className={`${typo('body')} ${textColor('secondary')}`}>
                  Recevez des alertes intelligentes sur les risques financiers, pédagogiques
                  et opérationnels avant qu'ils ne deviennent critiques.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <AppIcon name="trends" size="dashboard" className="text-green-600" />
                </div>
                <h3 className={`${typo('h3')} ${textColor('primary')} mb-4`}>
                  Recommandations
                </h3>
                <p className={`${typo('body')} ${textColor('secondary')}`}>
                  ORION vous propose des recommandations actionnables basées sur l'analyse
                  de vos données et les meilleures pratiques du secteur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`${bgColor('sidebar')} ${textColor('inverse')} py-16 px-4 sm:px-6 lg:px-8`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`${typo('h2')} text-white mb-6`}>
              Prêt à éclairer vos décisions avec ORION ?
            </h2>
            <p className={`${typo('large')} text-white/90 mb-8`}>
              Découvrez comment ORION peut transformer votre gestion scolaire.
            </p>
            <Link
              href="/signup"
              className="bg-gold-500 text-white px-12 py-5 rounded-subtle font-semibold hover:bg-gold-600 transition-colors inline-flex items-center justify-center text-lg shadow-xl hover:shadow-2xl"
            >
              Démarrer maintenant
              <AppIcon name="arrowRight" size="action" className="ml-2 text-white" />
            </Link>
          </div>
        </section>
      </main>
      <InstitutionalFooter />
    </>
  );
}

