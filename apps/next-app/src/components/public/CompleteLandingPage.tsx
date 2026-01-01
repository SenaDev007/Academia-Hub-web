/**
 * Complete Landing Page Component
 * 
 * Landing page officielle d'Academia Hub
 * Copywriting EXACT, mot pour mot
 * Structure stricte respectée
 * Design System premium institutionnel
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PremiumHeader from '../layout/PremiumHeader';
import InstitutionalFooter from './InstitutionalFooter';
import TestimonialsSection from './TestimonialsSection';
import AppIcon from '@/components/ui/AppIcon';
import { bgColor, textColor, typo, radius, shadow } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { getPublishedTestimonials } from '@/services/testimonial.service';
import type { Testimonial } from '@/types';

export default function CompleteLandingPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await getPublishedTestimonials(true, 3);
        setTestimonials(data);
      } catch (error) {
        console.error('Error loading testimonials:', error);
      }
    }
    loadTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      <div className="h-20" />

      {/* 1️⃣ HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/school-background.png"
            alt=""
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-[1px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 max-w-5xl mx-auto leading-tight drop-shadow-2xl">
            Gérez votre école plus rapidement,
            <br />
            avec précision et facilité.
          </h1>
          <p className={`${typo('body-large')} text-lg md:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md`}>
            Academia Hub est un système de gestion scolaire institutionnel,
            conçu pour les directeurs et promoteurs exigeants,
            de la maternelle au secondaire.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-900 text-white px-10 py-4 rounded-md font-semibold hover:bg-blue-800 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
              style={{
                animation: 'shake-interval 3s ease-in-out infinite',
              }}
            >
              Créer mon établissement
            </Link>
            <Link
              href="#contact"
              className="bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-md border-2 border-white/30 font-semibold hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            >
              Demander une démonstration
            </Link>
          </div>
        </div>
      </section>

      {/* 2️⃣ SECTION — LE PROBLÈME */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
              <AppIcon name="warning" size="dashboard" className="text-crimson-600" />
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold ${textColor('primary')} mb-6 leading-tight`}>
              Gérer une école sans système fiable est un <span className="text-crimson-600">risque</span>.
            </h2>
            <p className={`${typo('body-large')} ${textColor('secondary')} max-w-3xl mx-auto mb-12`}>
              Beaucoup d'établissements fonctionnent encore
              avec des outils dispersés et une visibilité limitée.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              'Données administratives éparpillées',
              'Finances difficiles à suivre',
              'Notes et examens complexes à consolider',
              'Dépendance à la connexion internet',
              'Manque de vision globale pour la direction',
            ].map((problem, index) => (
              <div
                key={index}
                className={cn(
                  bgColor('card'),
                  radius.card,
                  shadow.card,
                  'p-6 border border-gray-200'
                )}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AppIcon name="warning" size="menu" className="text-crimson-600" />
                  </div>
                  <p className={`${typo('body')} ${textColor('primary')} font-medium`}>
                    {problem}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className={`${typo('h3')} ${textColor('primary')} font-semibold`}>
              Une école ne peut pas être gérée à l'instinct.
            </p>
          </div>
        </div>
      </section>

      {/* 3️⃣ SECTION — LA SOLUTION ACADEMIA HUB */}
      <section className={`py-24 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-800 rounded-2xl mb-8">
            <AppIcon name="dashboard" size="dashboard" className="text-gold-500" />
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`}>
            Un système de <span className="text-gold-500">gouvernance scolaire</span>,<br />
            pas un simple logiciel.
          </h2>
              <p className={`${typo('body-large')} text-graphite-500 leading-relaxed`}>
            Academia Hub centralise l'ensemble des données de votre établissement,
            structure vos processus internes
            et vous permet de piloter votre école avec précision,
            même en l'absence de connexion internet.
          </p>
        </div>
      </section>

      {/* 4️⃣ SECTION — MODULES */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-6">
              <span className={`${typo('caption')} text-blue-900 font-semibold uppercase tracking-wide`}>
                Modules Complets
              </span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold ${textColor('primary')} mb-6 leading-tight`}>
              Tous les modules essentiels.<br />
              <span className="text-blue-900">Sans compromis</span>.
            </h2>
            <p className={`${typo('body-large')} ${textColor('secondary')} max-w-3xl mx-auto mb-12`}>
              Academia Hub intègre l'ensemble des modules nécessaires
              à une gestion scolaire moderne et rigoureuse.
            </p>
          </div>

          {/* Modules Principaux */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-gray-300 flex-1 max-w-32"></div>
              <h3 className={`${typo('h3')} ${textColor('primary')} mx-4 font-bold`}>
                Modules Principaux
              </h3>
              <div className="h-px bg-gray-300 flex-1 max-w-32"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Tableau de Bord Central', 
                  icon: 'dashboard' as const, 
                  description: 'Métriques en temps réel : effectifs, revenus, taux de réussite. Graphiques de performance, notifications intelligentes, calendrier intégré, accès rapide à tous les modules.' 
                },
                { 
                  name: 'Gestion des Élèves et Scolarité', 
                  icon: 'scolarite' as const, 
                  description: 'Inscription et admission, organisation des classes, suivi des absences, gestion disciplinaire, transferts de classe, génération de documents (certificats, attestations, trombinoscopes).' 
                },
                { 
                  name: 'Gestion Financière et Économat', 
                  icon: 'finance' as const, 
                  description: 'Configuration des frais par niveau, gestion des paiements (espèces, virement, Mobile Money), contrôle de scolarité, gestion des dépenses, clôture quotidienne, trésorerie.' 
                },
                { 
                  name: 'Planification et Études', 
                  icon: 'classes' as const, 
                  description: 'Gestion des salles, catalogue des matières, assignation des enseignants, génération automatique des emplois du temps, cahier journal, fiches pédagogiques, cahier de textes.' 
                },
                { 
                  name: 'Examens et Évaluation', 
                  icon: 'exams' as const, 
                  description: 'Saisie des notes, génération automatique des bulletins, bordereaux de notes, conseils de classe, tableaux d\'honneur, statistiques et analyses de performance.' 
                },
                { 
                  name: 'Gestion du Personnel et RH', 
                  icon: 'rh' as const, 
                  description: 'Fiches de personnel complètes, gestion des contrats (CDI, CDD, Vacation), évaluations et formations, calcul automatique de la paie, statistiques RH.' 
                },
                { 
                  name: 'Communication', 
                  icon: 'communication' as const, 
                  description: 'SMS et notifications en masse, campagnes email, intégration WhatsApp Business, notifications push, analytics de communication avec métriques de performance.' 
                },
              ].map((module, index) => (
                <div
                  key={index}
                  className={cn(
                    bgColor('card'),
                    radius.card,
                    shadow.card,
                    'p-6 border border-gray-200 hover:shadow-card-hover transition-shadow'
                  )}
                >
                  <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <AppIcon name={module.icon} size="menu" className="text-white" />
                  </div>
                  <h3 className={`${typo('body')} ${textColor('primary')} font-semibold mb-2`}>
                    {module.name}
                  </h3>
                  <p className={`${typo('body-small')} ${textColor('secondary')} text-sm leading-relaxed`}>
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Modules Supplémentaires */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-gray-300 flex-1 max-w-32"></div>
              <h3 className={`${typo('h3')} ${textColor('primary')} mx-4 font-bold`}>
                Modules Supplémentaires
              </h3>
              <div className="h-px bg-gray-300 flex-1 max-w-32"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Bibliothèque', 
                  icon: 'library' as const, 
                  description: 'Gestion du catalogue des livres, système de prêts et retours, fichier des lecteurs, rappels automatiques, statistiques d\'emprunt.' 
                },
                { 
                  name: 'Laboratoire', 
                  icon: 'laboratory' as const, 
                  description: 'Gestion des équipements, réservations des laboratoires, inventaire automatique, maintenance programmée, planning d\'occupation.' 
                },
                { 
                  name: 'Transport', 
                  icon: 'transport' as const, 
                  description: 'Gestion des véhicules, itinéraires et conducteurs, suivi des trajets, maintenance préventive, planning des transports.' 
                },
                { 
                  name: 'Cantine', 
                  icon: 'canteen' as const, 
                  description: 'Gestion des repas, menus personnalisables, inscriptions des élèves, paiements intégrés, rapports de fréquentation.' 
                },
                { 
                  name: 'Infirmerie', 
                  icon: 'infirmary' as const, 
                  description: 'Dossiers médicaux des élèves, visites médicales, médicaments disponibles, urgences et alertes, rapports médicaux.' 
                },
                { 
                  name: 'QHSE (Qualité, Hygiène, Sécurité)', 
                  icon: 'qhse' as const, 
                  description: 'Inspections régulières, incidents et rapports, formations sécurité, plans d\'action, conformité réglementaire.' 
                },
                { 
                  name: 'EduCast (Diffusion de Contenu)', 
                  icon: 'educast' as const, 
                  description: 'Diffusion de contenu éducatif, streaming en direct, podcasts et webinaires, archivage des contenus, analytics d\'écoute.' 
                },
                { 
                  name: 'Boutique', 
                  icon: 'shop' as const, 
                  description: 'Vente de fournitures scolaires, gestion des stocks, commandes en ligne, comptabilité intégrée, rapports de vente.' 
                },
              ].map((module, index) => (
                <div
                  key={index}
                  className={cn(
                    bgColor('card'),
                    radius.card,
                    shadow.card,
                    'p-6 border border-gray-200 hover:shadow-card-hover transition-shadow'
                  )}
                >
                  <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <AppIcon name={module.icon} size="menu" className="text-white" />
                  </div>
                  <h3 className={`${typo('body')} ${textColor('primary')} font-semibold mb-2`}>
                    {module.name}
                  </h3>
                  <p className={`${typo('body-small')} ${textColor('secondary')} text-sm leading-relaxed`}>
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className={`${typo('h3')} ${textColor('primary')} font-semibold mb-8`}>
              Tous les modules sont inclus.
              <br />
              Aucune option cachée. Aucun bridage.
            </p>
          </div>
        </div>
      </section>

      {/* 5️⃣ SECTION — ORION (IA DE DIRECTION) */}
      <section className={`py-24 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl mb-6 shadow-lg">
                <AppIcon name="orion" size="dashboard" className="text-white" />
              </div>
              <div className="inline-block px-3 py-1 bg-gold-500/20 rounded-full mb-4">
                <span className={`${typo('caption')} text-gold-400 font-semibold uppercase tracking-wide`}>
                  Intelligence Artificielle
                </span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`}>
                <span className="text-gold-500">ORION</span> — L'intelligence qui éclaire vos décisions.
              </h2>
              <p className={`${typo('body-large')} text-graphite-500 mb-8 leading-relaxed`}>
                ORION est l'assistant de direction intégré à Academia Hub.
                Il analyse vos données et vous aide à comprendre vos chiffres,
                anticiper les risques
                et prendre de meilleures décisions.
              </p>
              <div className="space-y-4">
                {[
                  'Résumé automatique des indicateurs clés',
                  'Alertes intelligentes',
                  'Lecture claire de la situation financière',
                ].map((point, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <AppIcon name="success" size="menu" className="text-gold-500" />
                    <span className={`${typo('body')} text-white`}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-8 border border-navy-800'
            )}>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <AppIcon name="orion" size="menu" className="text-gold-500" />
                    <span className={`${typo('body')} text-white font-semibold`}>ORION</span>
                  </div>
                  <p className={`${typo('body-small')} text-graphite-500`}>
                    "Votre taux de recouvrement a augmenté de 12% ce mois-ci. 
                    Les paiements en retard sont concentrés sur 3 classes. 
                    Recommandation : contacter les parents concernés cette semaine."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ SECTION — OFFLINE & SÉCURITÉ */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center">
                <AppIcon name="settings" size="dashboard" className="text-white" />
              </div>
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
                <AppIcon name="shield" size="dashboard" className="text-white" />
              </div>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold ${textColor('primary')} mb-6 leading-tight`}>
              Fonctionne même <span className="text-blue-900">sans internet</span>.<br />
              Vos données restent <span className="text-green-600">protégées</span>.
            </h2>
            <p className={`${typo('body-large')} ${textColor('secondary')} max-w-3xl mx-auto mb-12`}>
              Academia Hub est conçu pour les réalités du terrain.
              Toutes les opérations peuvent être effectuées hors ligne,
              puis synchronisées automatiquement dès que la connexion est rétablie.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-8 border border-gray-200'
            )}>
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <AppIcon name="settings" size="dashboard" className="text-white" />
              </div>
              <h3 className={`${typo('h4')} ${textColor('primary')} mb-4`}>Mode offline complet</h3>
              <ul className="space-y-3">
                {[
                  'Mode offline complet',
                  'Synchronisation sécurisée',
                  'Base locale + serveur central',
                  'Architecture SaaS professionnelle',
                ].map((point, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <AppIcon name="success" size="submenu" className="text-green-600" />
                    <span className={`${typo('body')} ${textColor('secondary')}`}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-8 border border-gray-200'
            )}>
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <AppIcon name="settings" size="dashboard" className="text-white" />
              </div>
              <h3 className={`${typo('h4')} ${textColor('primary')} mb-4`}>Sécurité & Conformité</h3>
              <ul className="space-y-3">
                {[
                  'Chiffrement end-to-end',
                  'Conformité RGPD',
                  'Audits de sécurité réguliers',
                  'Sauvegardes automatiques',
                ].map((point, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <AppIcon name="success" size="submenu" className="text-green-600" />
                    <span className={`${typo('body')} ${textColor('secondary')}`}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7️⃣ SECTION — TARIFICATION */}
      <section className={`py-24 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-500 rounded-full mb-6">
              <AppIcon name="finance" size="dashboard" className="text-white" />
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`}>
              Une tarification <span className="text-gold-500">claire</span>.<br />
              Assumée. Sans surprise.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* OFFRE 1 — ÉTABLISSEMENT UNIQUE */}
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-8 border-2 border-gold-500'
            )}>
              <div className="flex items-center space-x-2 mb-4">
                <AppIcon name="finance" size="menu" className="text-gold-500" />
                <h3 className={`${typo('h3')} text-white`}>Établissement unique</h3>
              </div>
              <div className="mb-6">
                <p className={`${typo('body')} text-graphite-500 mb-2`}>
                  Souscription initiale : <span className="text-white font-semibold">100 000 FCFA</span>
                </p>
                <p className={`${typo('body')} text-graphite-500`}>
                  Puis <span className="text-white font-semibold">15 000 FCFA / mois</span> après 30 jours
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Tous les modules inclus',
                  'Support professionnel',
                  'Mises à jour continues',
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <AppIcon name="success" size="submenu" className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className={`${typo('body')} text-white`}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`${bgColor('danger')} text-white w-full py-4 ${radius.button} font-semibold hover:bg-crimson-500 transition-colors inline-flex items-center justify-center`}
              >
                Souscrire via Fedapay
              </Link>
            </div>

            {/* OFFRE 2 — GROUPE SCOLAIRE */}
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-8 border border-navy-800'
            )}>
              <div className="flex items-center space-x-2 mb-4">
                <AppIcon name="classes" size="menu" className="text-graphite-500" />
                <h3 className={`${typo('h3')} text-white`}>Groupe scolaire</h3>
              </div>
              <div className="mb-6">
                <p className={`${typo('body')} text-graphite-500 mb-2`}>
                  Jusqu'à 2 écoles pour <span className="text-white font-semibold">25 000 FCFA / mois</span>
                </p>
                <p className={`${typo('body-small')} text-graphite-500`}>
                  au lieu de 30 000 FCFA.
                </p>
              </div>
              <Link
                href="/signup?plan=group"
                className={`${bgColor('card')} ${textColor('primary')} border-2 border-blue-700 w-full py-4 ${radius.button} font-semibold hover:bg-cloud transition-colors inline-flex items-center justify-center`}
              >
                Gérer plusieurs écoles
              </Link>
            </div>
          </div>

          <div className="text-center">
            <p className={`${typo('body-small')} text-graphite-500`}>
              Paiement sécurisé via Fedapay.
            </p>
          </div>
        </div>
      </section>

      {/* 8️⃣ SECTION — TÉMOIGNAGES */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
                <AppIcon name="success" size="dashboard" className="text-blue-900" />
              </div>
              <h2 className={`text-4xl md:text-5xl font-bold ${textColor('primary')} mb-6 leading-tight`}>
                Ils ont <span className="text-blue-900">structuré</span> leur établissement<br />
                avec Academia Hub.
              </h2>
            </div>
            <TestimonialsSection limit={3} featured={true} />
          </div>
        </section>
      )}

      {/* 9️⃣ SECTION — CTA FINAL */}
      <section className={`py-32 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full mb-8 shadow-xl">
            <AppIcon name="trends" size="dashboard" className="text-white" />
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-10 leading-tight`}>
            Passez à une gestion scolaire<br />
            <span className="text-gold-500">structurée</span> et <span className="text-gold-500">maîtrisée</span>.
          </h2>
          <Link
            href="/signup"
            className={`${bgColor('danger')} text-white px-12 py-5 ${radius.button} font-semibold hover:bg-crimson-500 transition-colors inline-flex items-center justify-center text-lg`}
          >
            Créer mon établissement maintenant
            <AppIcon name="trends" size="action" className="ml-2 text-white" />
          </Link>
        </div>
      </section>

      {/* 🔟 FOOTER INSTITUTIONNEL */}
      <InstitutionalFooter />
    </div>
  );
}
