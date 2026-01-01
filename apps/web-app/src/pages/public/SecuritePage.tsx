import React from 'react';
import { Link } from 'react-router-dom';
import PremiumHeader from '../../components/layout/PremiumHeader';
import {
  Shield,
  Lock,
  Database,
  FileCheck,
  CheckCircle,
  ArrowRight,
  Server,
  Key,
  HardDrive,
  Eye,
  Clock,
  AlertTriangle,
} from 'lucide-react';

/**
 * Page Sécurité & Sérieux
 * 
 * Objectif : Rassurer les institutions sur la sécurité, la méthode et la durabilité
 * Ton : Factuel, institutionnel, sans exagération
 */
const SecuritePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Sécurité des données. Méthode éprouvée. Durabilité garantie.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Academia Hub est une plateforme SaaS professionnelle, conçue selon les standards de sécurité et de traçabilité exigés par les établissements scolaires institutionnels.
          </p>
        </div>
      </section>

      {/* Sécurité des Données */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Sécurité des données
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Vos données sont protégées par des mesures de sécurité techniques et organisationnelles conformes aux standards professionnels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Architecture Multi-Tenant */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Architecture multi-tenant isolée
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chaque établissement dispose d'un environnement de données isolé. Les données d'un établissement ne sont pas accessibles aux autres, même en cas d'erreur technique.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Base de données PostgreSQL avec isolation par schéma</p>
                <p>• API REST avec authentification par token</p>
                <p>• Validation des permissions à chaque requête</p>
              </div>
            </div>

            {/* Chiffrement */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Chiffrement des données
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Les données sensibles sont chiffrées en transit (HTTPS/TLS) et au repos. Les mots de passe sont hachés avec des algorithmes sécurisés.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Chiffrement TLS 1.3 pour les communications</p>
                <p>• Hachage bcrypt pour les mots de passe</p>
                <p>• Certificats SSL valides et renouvelés</p>
              </div>
            </div>

            {/* Contrôle d'Accès */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Contrôle d'accès par rôles
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous définissez les rôles et permissions. Chaque utilisateur n'accède qu'aux données et fonctionnalités autorisées par son rôle.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Rôles personnalisables (Directeur, Secrétaire, etc.)</p>
                <p>• Permissions granulaires par module</p>
                <p>• Vérification à chaque action</p>
              </div>
            </div>

            {/* Sauvegardes */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Sauvegardes automatiques
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vos données sont sauvegardées automatiquement chaque jour. Les sauvegardes sont stockées de manière sécurisée et testées régulièrement.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Sauvegarde quotidienne automatique</p>
                <p>• Rétention de 30 jours minimum</p>
                <p>• Tests de restauration réguliers</p>
              </div>
            </div>

            {/* Monitoring */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Monitoring et alertes
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le système est surveillé 24/7. Les incidents de sécurité sont détectés et traités immédiatement. Vous êtes informés en cas d'activité suspecte.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Surveillance continue du système</p>
                <p>• Détection d'intrusions</p>
                <p>• Alertes automatiques</p>
              </div>
            </div>

            {/* Conformité */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Conformité réglementaire
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous respectons les réglementations en vigueur concernant la protection des données personnelles et la gestion des données éducatives.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Respect des réglementations locales</p>
                <p>• Protection des données personnelles</p>
                <p>• Droit à l'oubli et export des données</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traçabilité et Audit */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Traçabilité et préparation aux audits
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Toutes les actions sont enregistrées. Tous les bilans sont vérifiables. Toutes les données sont exportables.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <FileCheck className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Historique complet des actions
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chaque modification, chaque création, chaque suppression est enregistrée avec :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Identité de l'utilisateur qui a effectué l'action</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Date et heure précise de l'action</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Données avant et après modification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Contexte de l'action (module, niveau scolaire)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <Database className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Bilans et rapports vérifiables
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Tous les bilans peuvent être vérifiés et tracés :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Bilans financiers séparés par niveau et par module</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Traçabilité complète des paiements et encaissements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Export de données en formats standards (PDF, Excel, CSV)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rapports d'audit générés automatiquement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Durabilité et Maintenance */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Durabilité et maintenance continue
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Academia Hub est conçu pour durer. La maintenance et les mises à jour sont assurées de manière continue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <Clock className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Maintenance continue
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                L'abonnement mensuel inclut la maintenance continue de la plateforme :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Correction des bugs et amélioration de la stabilité</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Mises à jour de sécurité régulières</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Optimisation des performances</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Support technique prioritaire</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <ArrowRight className="w-10 h-10 text-navy-900 mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Évolutivité garantie
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                La plateforme évolue avec vos besoins :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Nouvelles fonctionnalités ajoutées régulièrement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Compatibilité avec les évolutions réglementaires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Migration des données assurée lors des mises à jour</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pas de rupture de service lors des évolutions</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-navy-900 rounded-lg p-8 text-white">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-3">
                  Engagement de continuité de service
                </h3>
                <p className="text-gray-100 leading-relaxed">
                  Academia Hub est un service SaaS professionnel. Nous nous engageons à maintenir la plateforme opérationnelle et à assurer la continuité de service. En cas d'incident majeur, nous communiquons de manière transparente et mettons en œuvre les mesures nécessaires pour rétablir le service dans les plus brefs délais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-6">
            Prêt à sécuriser la gestion de votre établissement ?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Activez Academia Hub et bénéficiez d'un système sécurisé, traçable, et auditable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-crimson-600 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors"
            >
              Activer la plateforme
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-navy-900 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-navy-800 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecuritePage;

