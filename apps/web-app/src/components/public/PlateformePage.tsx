/**
 * Plateforme Page Component
 */

import PremiumHeader from '../layout/PremiumHeader';
import Link from 'next/link';
import { Database, FileCheck, Shield, BarChart3, ArrowRight } from 'lucide-react';

export default function PlateformePage() {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      <div className="h-20" />
      
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Academia Hub : Le Système de Direction Scolaire que vous méritez.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-10">
            Une vision claire, une gestion rigoureuse, une autorité assumée.
            Notre plateforme est conçue pour les leaders qui transforment l'éducation.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/modules" className="btn-secondary">
              Découvrir les modules
            </Link>
            <Link href="/signup" className="btn-primary-crimson">
              Activer maintenant
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-12 text-center">
            Les Piliers de notre Système
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-institutional">
              <Shield className="icon-card-primary" />
              <h3 className="text-xl font-semibold text-navy-900 mb-3">Centralisation Intégrale</h3>
              <p className="text-slate-600">
                Toutes vos données, tous vos processus, un seul point de contrôle.
              </p>
            </div>
            <div className="card-institutional">
              <Database className="icon-card-primary" />
              <h3 className="text-xl font-semibold text-navy-900 mb-3">Traçabilité Absolue</h3>
              <p className="text-slate-600">
                Chaque action est enregistrée, chaque décision est documentée.
              </p>
            </div>
            <div className="card-institutional">
              <BarChart3 className="icon-card-primary" />
              <h3 className="text-xl font-semibold text-navy-900 mb-3">Gouvernance Stratégique</h3>
              <p className="text-slate-600">
                Des indicateurs clés de performance aux bilans financiers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

