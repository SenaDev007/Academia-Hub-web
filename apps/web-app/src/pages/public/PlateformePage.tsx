import React from 'react';
import { Link } from 'react-router-dom';
import PremiumHeader from '../../components/layout/PremiumHeader';
import {
  Target,
  Database,
  Shield,
  FileCheck,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * Page Plateforme / Méthode
 * 
 * Objectif : Rassurer intellectuellement un décideur
 * Ton : Institutionnel, mature, aucun superlatif inutile
 */
const PlateformePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Academia Hub : une méthode, pas un logiciel
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Nous ne vendons pas des fonctionnalités. Nous proposons un système de gestion institutionnelle qui transforme la façon dont vous dirigez votre établissement scolaire.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">
            Notre vision
          </h2>
          <div className="space-y-6 text-lg text-gray-900 leading-relaxed">
            <p>
              Academia Hub est conçu pour les promoteurs et directeurs d'établissements scolaires privés qui exigent la rigueur, la transparence et le contrôle total de leur organisation.
            </p>
            <p>
              Nous croyons que gérer un établissement scolaire, c'est gérer une entreprise. Avec des méthodes, des processus, des contrôles. Pas avec de l'improvisation.
            </p>
            <p>
              Notre plateforme centralise toutes les opérations de votre établissement dans un système unique, traçable, auditable, et évolutif.
            </p>
          </div>
        </div>
      </section>

      {/* Approche par Système */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-12 text-center">
            Approche par système
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Centralisation */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Centralisation totale
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Toutes vos données sont dans un seul système. Élèves, finances, RH, examens, communication : tout est interconnecté, isolé par niveau scolaire, et accessible selon les rôles que vous définissez.
              </p>
            </div>

            {/* Traçabilité */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Traçabilité complète
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Chaque action est enregistrée. Qui a fait quoi, quand, pourquoi. Vous pouvez auditer toutes les opérations. Vous avez une traçabilité complète de l'historique de votre établissement.
              </p>
            </div>

            {/* Gouvernance */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Gouvernance scolaire
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Vous définissez les rôles, les permissions, les processus. Le système applique vos règles. Vous gardez le contrôle total sur qui fait quoi dans votre établissement.
              </p>
            </div>

            {/* Visibilité */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Visibilité en temps réel
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Vous voyez l'état de votre établissement en temps réel. Effectifs, finances, performances : tous vos indicateurs sont centralisés et accessibles instantanément.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Méthode de Gestion */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Méthode de gestion institutionnelle
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Academia Hub applique une méthode de gestion structurée, basée sur des processus clairs et des contrôles systématiques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <Target className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Processus standardisés
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chaque module suit des processus clairs et reproductibles :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Workflows d'approbation pour les actions sensibles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Validation obligatoire avant les opérations critiques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Règles métier configurables par établissement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Documentation intégrée pour chaque processus</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <BarChart3 className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Contrôles systématiques
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Des contrôles automatiques garantissent la cohérence des données :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Vérification de cohérence des données en temps réel</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Alertes automatiques pour les anomalies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rapprochement automatique des comptes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Bilans de contrôle générés automatiquement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Isolation par Niveau */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">
            Isolation stricte par niveau scolaire
          </h2>
          <p className="text-lg text-gray-900 mb-8 leading-relaxed">
            Academia Hub respecte l'architecture de votre établissement. Chaque niveau scolaire (Maternelle, Primaire, Secondaire) a ses propres données, ses propres modules, ses propres bilans.
          </p>
          <p className="text-lg text-gray-900 mb-8 leading-relaxed">
            Vous pouvez activer ou désactiver des modules par niveau. Vous pouvez générer des bilans séparés par niveau. Vous pouvez gérer des effectifs distincts. Tout est isolé, mais centralisé.
          </p>
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-navy-900">
            <p className="text-lg font-semibold text-navy-900 text-center">
              Aucune donnée ne peut être mélangée entre les niveaux. Chaque niveau est un environnement séparé, avec sa propre traçabilité.
            </p>
          </div>
        </div>
      </section>

      {/* Durabilité */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Durabilité et pérennité
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Academia Hub est conçu pour durer. La plateforme évolue avec votre établissement, sans rupture de service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <Database className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Architecture évolutive
              </h3>
              <p className="text-gray-700 leading-relaxed">
                L'architecture technique est conçue pour évoluer sans remettre en cause les données existantes. Les mises à jour sont non-destructives.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <Shield className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Maintenance continue
              </h3>
              <p className="text-gray-700 leading-relaxed">
                L'abonnement mensuel garantit la maintenance continue, les mises à jour de sécurité, et l'évolution de la plateforme.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <FileCheck className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Export des données
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Vous pouvez exporter toutes vos données à tout moment, dans des formats standards. Vos données ne sont jamais verrouillées.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-lg p-8 border-2 border-navy-900">
            <p className="text-lg text-gray-900 leading-relaxed text-center">
              <strong className="text-navy-900">Engagement de pérennité :</strong> Academia Hub est un service SaaS professionnel. Nous nous engageons à maintenir la plateforme opérationnelle et à assurer la continuité de service sur le long terme. Votre investissement est protégé.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-6">
            Découvrez comment Academia Hub transforme la gestion de votre établissement
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Explorez tous les modules inclus dans votre activation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/modules"
              className="inline-flex items-center justify-center bg-navy-900 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-navy-800 transition-colors"
            >
              Découvrir les modules
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-crimson-600 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors"
            >
              Activer maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlateformePage;

