import React from 'react';
import { Link } from 'react-router-dom';
import PremiumHeader from '../../components/layout/PremiumHeader';
import {
  LayoutDashboard,
  Users,
  Calculator,
  UserCheck,
  Building,
  BookOpen,
  MessageSquare,
  Book,
  FlaskConical,
  Bus,
  UtensilsCrossed,
  Heart,
  ShieldCheck,
  Radio,
  ShoppingBag,
  CheckCircle,
  ArrowRight,
  BarChart3,
  FileText,
  Calendar,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

/**
 * Page Modules
 * 
 * Objectif : Présenter tous les modules de manière claire, rassurante et structurée
 * Mention obligatoire : "Tous les modules sont inclus. Aucune option cachée."
 */
const ModulesPage: React.FC = () => {
  // Modules Principaux (7)
  const mainModules = [
    {
      icon: LayoutDashboard,
      title: 'Tableau de Bord Central',
      value: 'Vue d\'ensemble complète de votre établissement',
      features: [
        'Métriques en temps réel (effectifs, revenus, taux de réussite)',
        'Graphiques de performance et évolution des indicateurs',
        'Notifications intelligentes et alertes importantes',
        'Calendrier intégré (événements, réunions, examens)',
        'Accès rapide à tous les modules',
      ],
      benefit: 'Vision globale et décisions éclairées basées sur des données réelles.',
    },
    {
      icon: Users,
      title: 'Gestion des Élèves et Scolarité',
      value: 'Module complet pour la gestion de la vie scolaire',
      features: [
        'Inscription et admission avec génération automatique EducMaster',
        'Organisation des classes par niveau (Maternelle, Primaire, Secondaire)',
        'Suivi des absences avec notifications automatiques aux parents',
        'Gestion disciplinaire et historique complet',
        'Transferts de classe avec workflow d\'approbation',
        'Génération de documents (certificats, attestations, trombinoscopes)',
      ],
      benefit: 'Gestion centralisée de tous les élèves avec traçabilité complète.',
    },
    {
      icon: Calculator,
      title: 'Gestion Financière et Économat',
      value: 'Solution complète pour la gestion financière',
      features: [
        'Configuration des frais par niveau et classe',
        'Gestion des paiements (espèces, virement, Mobile Money, chèque)',
        'Contrôle de scolarité avec alertes automatiques pour impayés',
        'Gestion des dépenses avec workflow d\'approbation',
        'Clôture quotidienne et rapprochement automatique',
        'Trésorerie en temps réel avec prévisions',
      ],
      benefit: 'Contrôle total des finances avec transparence complète.',
    },
    {
      icon: UserCheck,
      title: 'Gestion du Personnel et RH',
      value: 'Module complet pour la gestion des ressources humaines',
      features: [
        'Fiches de personnel complètes (informations, documents, photos)',
        'Gestion des contrats (CDI, CDD, Vacation) avec signature électronique',
        'Évaluations et formations avec suivi des compétences',
        'Calcul automatique de la paie (salaires, heures supplémentaires, primes)',
        'Bulletins de paie PDF automatiques',
        'Statistiques RH et analyse des coûts de personnel',
      ],
      benefit: 'Gestion centralisée du personnel avec automatisation des processus RH.',
    },
    {
      icon: Building,
      title: 'Planification et Études',
      value: 'Solution complète pour l\'organisation pédagogique',
      features: [
        'Gestion des salles (configuration, réservation, maintenance)',
        'Catalogue des matières par niveau avec volume horaire',
        'Gestion des enseignants et assignation aux matières',
        'Génération automatique des emplois du temps avec détection de conflits',
        'Cahier journal avec templates personnalisables',
        'Fiches pédagogiques et cahier de textes',
      ],
      benefit: 'Organisation optimale des ressources et planification efficace des cours.',
    },
    {
      icon: BookOpen,
      title: 'Examens et Évaluation',
      value: 'Module complet pour la gestion des évaluations',
      features: [
        'Saisie intuitive des notes par classe et matière',
        'Génération automatique des bulletins avec calcul des moyennes et rangs',
        'Bordereaux de notes avec statistiques détaillées',
        'Conseils de classe avec procès-verbaux automatiques',
        'Tableaux d\'honneur avec critères personnalisables',
        'Statistiques et analyses de performance',
      ],
      benefit: 'Évaluation objective des élèves avec suivi des performances en temps réel.',
    },
    {
      icon: MessageSquare,
      title: 'Communication',
      value: 'Solution intégrée pour la communication avec tous les acteurs',
      features: [
        'SMS en masse avec templates personnalisables',
        'Campagnes email groupées avec suivi des ouvertures',
        'Intégration WhatsApp Business',
        'Notifications push en temps réel',
        'Analytics de communication (taux de livraison, engagement)',
      ],
      benefit: 'Communication efficace avec tous les acteurs et réduction des coûts.',
    },
  ];

  // Modules Supplémentaires (8)
  const additionalModules = [
    {
      icon: Book,
      title: 'Bibliothèque',
      value: 'Gestion complète du catalogue et des prêts',
      features: ['Catalogue des livres', 'Système de prêts et retours', 'Rappels automatiques', 'Statistiques d\'emprunt'],
    },
    {
      icon: FlaskConical,
      title: 'Laboratoire',
      value: 'Gestion des équipements et réservations',
      features: ['Gestion des équipements', 'Réservations des laboratoires', 'Inventaire automatique', 'Maintenance programmée'],
    },
    {
      icon: Bus,
      title: 'Transport',
      value: 'Gestion des véhicules et itinéraires',
      features: ['Gestion des véhicules', 'Itinéraires et conducteurs', 'Suivi des trajets', 'Maintenance préventive'],
    },
    {
      icon: UtensilsCrossed,
      title: 'Cantine',
      value: 'Gestion des repas et menus',
      features: ['Gestion des repas', 'Menus personnalisables', 'Inscriptions des élèves', 'Paiements intégrés'],
    },
    {
      icon: Heart,
      title: 'Infirmerie',
      value: 'Dossiers médicaux et visites',
      features: ['Dossiers médicaux des élèves', 'Visites médicales', 'Médicaments disponibles', 'Urgences et alertes'],
    },
    {
      icon: ShieldCheck,
      title: 'QHSE',
      value: 'Qualité, Hygiène, Sécurité, Environnement',
      features: ['Inspections régulières', 'Incidents et rapports', 'Formations sécurité', 'Conformité réglementaire'],
    },
    {
      icon: Radio,
      title: 'EduCast',
      value: 'Diffusion de contenu éducatif',
      features: ['Diffusion de contenu éducatif', 'Streaming en direct', 'Podcasts et webinaires', 'Analytics d\'écoute'],
    },
    {
      icon: ShoppingBag,
      title: 'Boutique',
      value: 'Vente de fournitures scolaires',
      features: ['Vente de fournitures scolaires', 'Gestion des stocks', 'Commandes en ligne', 'Comptabilité intégrée'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Tous les modules. Aucun bridage. Accès complet.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-4">
            Vous n'achetez pas des fonctionnalités à l'unité. Vous activez un système complet avec tous les modules inclus dès l'activation.
          </p>
          <p className="text-lg text-navy-900 font-semibold">
            15 modules complets. Aucune option cachée. Aucun supplément.
          </p>
        </div>
      </section>

      {/* Modules Principaux */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Modules Principaux
            </h2>
            <p className="text-lg text-slate-600">
              Les 7 modules essentiels pour gérer votre établissement scolaire de manière professionnelle.
            </p>
          </div>

          <div className="space-y-8">
            {mainModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-navy-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-navy-900 mb-2">
                        {module.title}
                      </h3>
                      <p className="text-lg text-slate-600 mb-4 font-medium">
                        {module.value}
                      </p>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Fonctionnalités principales :</p>
                        <ul className="space-y-2">
                          {module.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-md p-4 border-l-4 border-navy-900">
                        <p className="text-sm font-semibold text-navy-900">
                          Bénéfice : {module.benefit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modules Supplémentaires */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Modules Supplémentaires
            </h2>
            <p className="text-lg text-slate-600">
              8 modules complémentaires pour une gestion complète de tous les aspects de votre établissement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 font-medium">
                    {module.value}
                  </p>
                  <ul className="space-y-1.5">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-700">
                        <CheckCircle className="w-3 h-3 text-navy-900 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Garantie d'Accès Complet */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-navy-900 rounded-lg p-8 text-center text-white">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              Tous les modules sont inclus. Aucune option cachée.
            </h3>
            <p className="text-lg text-gray-100 mb-6 leading-relaxed">
              Lorsque vous activez Academia Hub, vous obtenez immédiatement l'accès à <strong>tous les 15 modules</strong> listés ci-dessus. Aucun supplément. Aucun bridage fonctionnel. Aucune limitation.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">15</div>
                <div className="text-sm text-gray-200">Modules complets</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-sm text-gray-200">Fonctionnalités incluses</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">0</div>
                <div className="text-sm text-gray-200">Supplément requis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-6">
            Prêt à activer tous ces modules pour votre établissement ?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Découvrez notre tarification transparente et sans surprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tarification"
              className="inline-flex items-center justify-center bg-navy-900 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-navy-800 transition-colors"
            >
              Voir la tarification
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-crimson-600 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors"
            >
              Activer Academia Hub
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModulesPage;

