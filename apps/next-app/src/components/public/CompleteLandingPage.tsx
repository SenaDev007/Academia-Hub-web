/**
 * Complete Landing Page Component
 * 
 * Landing page officielle d'Academia Hub
 * Copywriting EXACT, mot pour mot
 * Structure stricte respectée
 * Design System premium institutionnel
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PremiumHeader from '../layout/PremiumHeader';
import InstitutionalFooter from './InstitutionalFooter';
import TestimonialsSection from './TestimonialsSection';
import EducationalParticles from './EducationalParticles';
import AnimatedTestimonials from './AnimatedTestimonials';
import VideoPlayerModal from './VideoPlayerModal';
import OrionParticles from './OrionParticles';
import AppIcon from '@/components/ui/AppIcon';
import TypingAnimation from '@/components/ui/TypingAnimation';
import { bgColor, textColor, typo, radius, shadow } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

// Component for Module Card with Read More functionality
function ModuleCard({ 
  module, 
  colors 
}: { 
  module: { name: string; icon: string; description: string };
  colors: { from: string; to: string; icon: string; border: string };
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionLength = module.description.length;
  const truncatedLength = Math.floor(descriptionLength / 2);
  const truncatedDescription = module.description.substring(0, truncatedLength);
  const shouldTruncate = descriptionLength > 100; // Only truncate if description is long enough

  return (
    <div
      className={cn(
        bgColor('card'),
        'p-8 rounded-2xl border-2 border-gray-200',
        'shadow-lg hover:shadow-2xl',
        colors.border,
        'hover:-translate-y-2',
        'transition-all duration-300 ease-out',
        'group',
        'bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/20'
      )}
    >
      <div className={cn(
        'w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-6',
        'shadow-lg group-hover:shadow-xl',
        'group-hover:scale-110 group-hover:rotate-3',
        'transition-all duration-300',
        colors.from,
        colors.to
      )}>
        <AppIcon name={module.icon as any} size="menu" className="text-white group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className={cn(
        typo('base'),
        textColor('primary'),
        'font-bold mb-3 leading-tight transition-colors duration-300',
        `group-hover:${colors.icon}`
      )}>
        {module.name}
      </h3>
      <div>
        <p className={`${typo('small')} ${textColor('secondary')} text-sm leading-relaxed`}>
          {shouldTruncate && !isExpanded ? (
            <>
              {truncatedDescription}...
            </>
          ) : (
            module.description
          )}
        </p>
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={cn(
              'mt-2 text-sm font-semibold transition-all duration-200',
              'text-blue-600 hover:text-blue-700 hover:underline',
              'focus:outline-none'
            )}
          >
            {isExpanded ? 'Lire moins' : 'Lire plus'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CompleteLandingPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
        
        {/* Educational Particles */}
        <EducationalParticles />
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center -mt-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 max-w-5xl mx-auto leading-tight drop-shadow-2xl">
            Gérez votre école plus rapidement,
            <br />
            avec précision et facilité.
          </h1>
          <p className={`${typo('large')} text-lg md:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md`}>
            Academia Hub est un système de gestion scolaire institutionnel,
            conçu pour les directeurs et promoteurs exigeants,
            de la maternelle au secondaire.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-10 py-4 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              style={{
                animation: 'shake-interval 3s ease-in-out infinite',
              }}
            >
              <AppIcon name="userPlus" size="action" className="text-white" />
              S'inscrire
            </Link>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-md border-2 border-white/30 font-semibold hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <AppIcon name="playCircle" size="action" className="text-white" />
              Voir Academia Hub
            </button>
          </div>
        </div>
      </section>

      {/* 2️⃣ SECTION — LE PROBLÈME */}
      <section className="py-32 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 -mt-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl mb-8 shadow-lg">
              <AppIcon name="warning" size="dashboard" className="text-crimson-600" />
            </div>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${textColor('primary')} mb-8 leading-tight`}>
              <TypingAnimation
                text="Gérer une école sans système fiable est un risque."
                speed={50}
                repeatDelay={5000}
                highlightWord="risque"
                highlightClassName="text-crimson-600"
                highlightUnderline={true}
              />
            </h2>
            <p className={`${typo('large')} ${textColor('secondary')} max-w-3xl mx-auto mb-16 text-lg`}>
              Beaucoup d'établissements fonctionnent encore
              avec des outils dispersés et une visibilité limitée.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { text: 'Données administratives éparpillées', icon: 'spreadsheet' as const },
              { text: 'Finances difficiles à suivre', icon: 'finance' as const },
              { text: 'Notes et examens complexes à consolider', icon: 'exams' as const },
              { text: 'Dépendance à la connexion internet', icon: 'wifiOff' as const },
              { text: 'Manque de vision globale pour la direction', icon: 'dashboard' as const },
            ].map((problem, index) => (
              <div
                key={index}
                className={cn(
                  bgColor('card'),
                  'p-8 rounded-2xl border-2 border-gray-200',
                  'shadow-lg hover:shadow-2xl',
                  'hover:border-crimson-300 hover:-translate-y-2',
                  'transition-all duration-300 ease-out',
                  'group cursor-pointer',
                  'bg-white hover:bg-gradient-to-br hover:from-white hover:to-red-50/30'
                )}
              >
                <div className="flex items-start space-x-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:from-red-100 group-hover:to-red-200">
                    <AppIcon name={problem.icon} size="menu" className="text-crimson-600 group-hover:text-crimson-700 transition-colors duration-300" />
                  </div>
                  <p className={`${typo('base')} ${textColor('primary')} font-semibold leading-relaxed pt-2 group-hover:text-crimson-700 transition-colors duration-300`}>
                    {problem.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-8 border-t border-gray-200">
            <p className={`${typo('h2')} ${textColor('primary')} font-bold`}>
              Une école ne peut pas être gérée à l'instinct.
            </p>
          </div>
        </div>
      </section>

      {/* 3️⃣ SECTION — LA SOLUTION ACADEMIA HUB */}
      <section className={`py-32 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-10">
            <Image
              src="/images/logo-Academia Hub.png"
              alt="Academia Hub"
              width={120}
              height={120}
              className="w-30 h-30 object-contain"
              priority
            />
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight`}>
            Un système de <span className="text-gold-500 relative inline-block">
              <span className="relative z-10">gouvernance scolaire</span>
              <span className="absolute bottom-1 left-0 right-0 h-4 bg-gold-500/20 -rotate-1"></span>
            </span>,<br />
            <span className="text-white/90">pas une simple application.</span>
          </h2>
          <p className={`${typo('large')} text-white leading-relaxed text-lg max-w-3xl mx-auto`}>
            Academia Hub centralise l'ensemble des données de votre établissement,
            structure vos processus internes
            et vous permet de piloter votre école avec précision,
            même en l'absence de connexion internet.
          </p>
        </div>
      </section>

      {/* 4️⃣ SECTION — MODULES */}
      <section className="py-32 bg-gradient-to-b from-white via-cloud to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-8 leading-tight`}>
              Modules de gestion scolaire
            </h2>
            <p className={`${typo('large')} ${textColor('secondary')} max-w-3xl mx-auto mb-16 text-lg`}>
              Academia Hub intègre l'ensemble des modules nécessaires
              à une gestion scolaire moderne et rigoureuse.
            </p>
          </div>

          {/* Modules Principaux */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-12">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent flex-1 max-w-40"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              ].map((module, index) => {
                // Toutes les icônes utilisent le bleu primaire du logo
                const colors = { 
                  from: 'from-blue-600', 
                  to: 'to-blue-700', 
                  icon: 'text-blue-600', 
                  border: 'hover:border-blue-600' 
                };
                
                return (
                  <ModuleCard
                    key={index}
                    module={module}
                    colors={colors}
                  />
                );
              })}
            </div>
            
            {/* Voir tout Button */}
            <div className="text-center mt-12">
              <Link
                href="/modules"
                className="bg-blue-600 text-white px-10 py-4 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Voir tout
                <AppIcon name="arrowRight" size="action" className="text-white" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5️⃣ SECTION — ORION (IA DE DIRECTION) */}
      <section className={`py-32 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-20 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex flex-col items-center justify-center mb-4 relative">
                <div className="absolute inset-0 bg-gold-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 w-56 h-56">
                  {/* Background particles container - behind image */}
                  <OrionParticles />
                  <Image
                    src="/images/ORION-Academia-Hub.png"
                    alt="ORION"
                    width={224}
                    height={224}
                    className="w-56 h-56 object-contain absolute top-0 left-0 z-10 drop-shadow-2xl"
                  />
                </div>
                <div className="w-56 flex items-center justify-center px-5 py-2 bg-gradient-to-r from-gold-500/20 to-gold-600/20 rounded-full border border-gold-500/30 shadow-lg -mt-0 relative z-10">
                  <span className={`${typo('caption')} font-bold uppercase tracking-wider`}>
                    Je suis <span className="text-gold-500">ORION</span>
                  </span>
                </div>
              </div>
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight`}>
                <span className="text-gold-500 relative inline-block">
                  <span className="relative z-10">L'intelligence</span>
                  <span className="absolute bottom-1 left-0 right-0 h-4 bg-gold-500/20 -rotate-1"></span>
                </span> qui éclaire vos décisions.
              </h2>
              <p className={`${typo('large')} text-white mb-2 leading-relaxed text-lg`}>
                <span className="text-gold-500">ORION</span> est l'assistant de direction intégré à Academia Hub.
                Il analyse vos données et vous aide à comprendre vos chiffres,
                anticiper les risques
                et prendre de meilleures décisions.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div className={cn(
                'p-10 rounded-3xl border-2 border-gold-500/30',
                'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md',
                'shadow-2xl relative overflow-hidden',
                'hover:shadow-3xl transition-all duration-300'
              )}>
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-bl-full blur-xl"></div>
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-600/5 rounded-br-full blur-xl"></div>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-500/30 to-gold-600/30 rounded-xl flex items-center justify-center border-2 border-gold-500/40 shadow-lg">
                        <Image
                          src="/images/ORION-Academia-Hub.png"
                          alt="ORION"
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <span className={`${typo('base')} text-white font-bold text-lg`}>ORION</span>
                    </div>
                    <div className="relative pl-6 border-l-2 border-gold-500/40">
                      <p className={`${typo('base')} text-white leading-relaxed italic`}>
                        "Votre taux de recouvrement a augmenté de 12% ce mois-ci. 
                        Les paiements en retard sont concentrés sur 3 classes. 
                        Recommandation : contacter les parents concernés cette semaine."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                {[
                  'Résumé automatique des indicateurs clés',
                  'Alertes intelligentes',
                  'Lecture claire de la situation financière',
                ].map((point, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-gold-500/30 group-hover:scale-110 transition-transform duration-300">
                      <AppIcon name="success" size="menu" className="text-gold-500" />
                    </div>
                    <span className={`${typo('base')} text-white font-medium`}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ SECTION — OFFLINE & SÉCURITÉ */}
      <section className="py-32 bg-gradient-to-b from-white via-cloud to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl border-2 border-blue-700/30">
                <AppIcon name="wifiOff" size="dashboard" className="text-white" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-xl border-2 border-green-500/30">
                <AppIcon name="shieldCheck" size="dashboard" className="text-white" />
              </div>
            </div>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${textColor('primary')} mb-8 leading-tight`}>
              Fonctionne même <span className="text-blue-900 relative inline-block">
                <span className="relative z-10">sans internet</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-blue-900/10 -rotate-1"></span>
              </span>.<br />
              Vos données restent <span className="text-green-600 relative inline-block">
                <span className="relative z-10">protégées</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-green-600/10 -rotate-1"></span>
              </span>.
            </h2>
            <p className={`${typo('large')} ${textColor('secondary')} max-w-3xl mx-auto mb-16 text-lg`}>
              Academia Hub est conçu pour les réalités du terrain.
              Toutes les opérations peuvent être effectuées hors ligne,
              puis synchronisées automatiquement dès que la connexion est rétablie.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-10 border-2 border-blue-200 hover:border-blue-400 hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden'
            )}>
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-900/5 rounded-bl-full"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AppIcon name="wifiOff" size="dashboard" className="text-white" />
                </div>
                <h3 className={`${typo('h3')} ${textColor('primary')} mb-6 font-bold`}>Mode offline complet</h3>
                <ul className="space-y-4">
                  {[
                    'Mode offline complet',
                    'Synchronisation sécurisée',
                    'Base locale + serveur central',
                    'Architecture SaaS professionnelle',
                  ].map((point, index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AppIcon name="success" size="submenu" className="text-green-600" />
                      </div>
                      <span className={`${typo('base')} ${textColor('secondary')} leading-relaxed`}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-10 border-2 border-green-200 hover:border-green-400 hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden'
            )}>
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-600/5 rounded-bl-full"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AppIcon name="shieldCheck" size="dashboard" className="text-white" />
                </div>
                <h3 className={`${typo('h3')} ${textColor('primary')} mb-6 font-bold`}>Sécurité & Conformité</h3>
                <ul className="space-y-4">
                  {[
                    'Chiffrement end-to-end',
                    'Conformité RGPD',
                    'Audits de sécurité réguliers',
                    'Sauvegardes automatiques',
                  ].map((point, index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AppIcon name="success" size="submenu" className="text-green-600" />
                      </div>
                      <span className={`${typo('base')} ${textColor('secondary')} leading-relaxed`}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7️⃣ SECTION — TARIFICATION */}
      <section className={`py-32 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl mb-10 shadow-2xl border-2 border-gold-400/30">
              <AppIcon name="tag" size="dashboard" className="text-white" />
            </div>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight`}>
              Une tarification <span className="text-gold-500 relative inline-block">
                <span className="relative z-10">claire</span>
                <span className="absolute bottom-1 left-0 right-0 h-4 bg-gold-500/20 -rotate-1"></span>
              </span>.<br />
              Assumée. Sans surprise.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            {/* OFFRE 1 — ÉTABLISSEMENT UNIQUE */}
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-10 border-2 border-gold-500 relative overflow-hidden group hover:shadow-2xl transition-all duration-300'
            )}>
              {/* Decorative gold accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-gold-500 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-xl flex items-center justify-center border border-gold-500/30">
                    <AppIcon name="finance" size="menu" className="text-gold-500" />
                  </div>
                  <h3 className={`${typo('h2')} text-white font-bold`}>Établissement unique</h3>
                </div>
                <div className="mb-8 p-6 bg-white/5 rounded-xl border border-gold-500/20">
                  <p className={`${typo('base')} text-graphite-500 mb-3`}>
                    Souscription initiale : <span className="text-white font-bold text-lg">100 000 FCFA</span>
                  </p>
                  <p className={`${typo('base')} text-graphite-500`}>
                    Puis <span className="text-white font-bold text-lg">15 000 FCFA / mois</span> après 30 jours
                  </p>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    'Tous les modules inclus',
                    'Support professionnel',
                    'Mises à jour continues',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-500/30">
                        <AppIcon name="success" size="submenu" className="text-green-400" />
                      </div>
                      <span className={`${typo('base')} text-white leading-relaxed`}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="bg-crimson-600 text-white w-full py-4 rounded-subtle font-semibold hover:bg-crimson-500 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Souscrire via Fedapay
                </Link>
              </div>
            </div>

            {/* OFFRE 2 — GROUPE SCOLAIRE */}
            <div className={cn(
              bgColor('card'),
              radius.card,
              shadow.card,
              'p-10 border-2 border-blue-600/30 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:border-blue-600/50'
            )}>
              {/* Decorative blue accent */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-br-full"></div>
              <div className="absolute top-4 left-4 w-2 h-2 bg-blue-600 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                    <AppIcon name="building" size="menu" className="text-blue-400" />
                  </div>
                  <h3 className={`${typo('h2')} text-white font-bold`}>Groupe scolaire</h3>
                </div>
                <div className="mb-8 p-6 bg-white/5 rounded-xl border border-blue-600/20">
                  <p className={`${typo('base')} text-graphite-500 mb-3`}>
                    Jusqu'à 2 écoles pour <span className="text-white font-bold text-lg">25 000 FCFA / mois</span>
                  </p>
                  <p className={`${typo('small')} text-graphite-500`}>
                    au lieu de <span className="line-through text-graphite-600">30 000 FCFA</span>.
                  </p>
                </div>
                <Link
                  href="/signup?plan=group"
                  className={`${bgColor('card')} ${textColor('primary')} border-2 border-blue-600 w-full py-4 ${radius.button} font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105`}
                >
                  Gérer plusieurs écoles
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-white/10">
            <p className={`${typo('base')} text-graphite-500 leading-relaxed`}>
              Paiement sécurisé via Fedapay.
            </p>
          </div>
        </div>
      </section>

      {/* 8️⃣ SECTION — TÉMOIGNAGES */}
      <section className="py-32 bg-gradient-to-b from-white to-cloud px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl mb-10 shadow-2xl border-2 border-blue-200/50">
              <AppIcon name="success" size="dashboard" className="text-blue-900" />
            </div>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${textColor('primary')} mb-8 leading-tight`}>
              Ils ont <span className="text-blue-900 relative inline-block">
                <span className="relative z-10">structuré</span>
                <span className="absolute bottom-1 left-0 right-0 h-4 bg-blue-900/20 -rotate-1"></span>
              </span> leur établissement<br />
              avec Academia Hub.
            </h2>
            <p className={`${typo('large')} ${textColor('secondary')} max-w-3xl mx-auto text-lg leading-relaxed`}>
              Découvrez les témoignages authentiques de directeurs et promoteurs qui ont transformé leur gestion scolaire.
            </p>
          </div>

          {/* Animated Testimonials Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className={`${typo('h3')} ${textColor('primary')} mb-4 font-bold`}>
                Témoignages en direct
              </h3>
              <p className={`${typo('base')} ${textColor('secondary')} max-w-2xl mx-auto`}>
                Exemples de retours d'expérience de nos utilisateurs
              </p>
            </div>
            <AnimatedTestimonials />
          </div>

          {/* Static Testimonials Grid */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h3 className={`${typo('h3')} ${textColor('primary')} mb-4 font-bold`}>
                Tous les témoignages
              </h3>
            </div>
            <TestimonialsSection limit={3} featured={true} />
          </div>
        </div>
      </section>

      {/* 9️⃣ SECTION — CTA FINAL */}
      <section className={`py-32 ${bgColor('sidebar')} ${textColor('inverse')} px-4 sm:px-6 lg:px-8 relative`}>
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
            className="bg-crimson-600 text-white px-12 py-5 rounded-subtle font-semibold hover:bg-crimson-500 transition-colors inline-flex items-center justify-center text-lg shadow-xl hover:shadow-2xl"
          >
            Créer mon établissement maintenant
            <AppIcon name="trends" size="action" className="ml-2 text-white" />
          </Link>
        </div>
        {/* Séparateur visuel élégant */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent"></div>
          <div className="h-px bg-blue-800/80"></div>
        </div>
      </section>

      {/* Espacement de séparation */}
      <div className="h-16 bg-gradient-to-b from-blue-900 via-blue-900 to-blue-900"></div>

      {/* 🔟 FOOTER INSTITUTIONNEL */}
      <div className="bg-blue-900 border-t-2 border-gold-500/20">
        <InstitutionalFooter />
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="/videos/academia-hub-presentation.mp4"
        thumbnailUrl="/images/Miniature Présentation Academia Hub.png"
        title="Présentation Academia Hub"
      />
    </div>
  );
}
