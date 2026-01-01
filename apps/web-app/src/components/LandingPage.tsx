import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Zap,
  Smartphone,
  Cloud,
  Clock,
  School
} from 'lucide-react';
import Header from './layout/Header';
import AnimatedHero from './AnimatedHero';
import styles from './LandingPage.module.css';
import { 
  logoFedaPay, 
  mtnMoney, 
  moovMoney, 
  celtiisCash, 
  visa, 
  mastercard, 
  examenEleves 
} from '../utils/imagePaths';

const LandingPage: React.FC = () => {


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section avec arrière-plan moderne */}
      <div className={styles.heroBackground}>
        {/* Overlay sombre avec dégradé moderne */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        
        {/* Éléments décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <AnimatedHero />
        </div>
      </div>

      {/* Features Section - Design académique sombre */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-blue-900/30 border border-blue-800/50 text-blue-300 rounded-full text-sm font-medium">
                🚀 Fonctionnalités premium
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
              Tout ce dont votre établissement a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">besoin</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Des outils puissants et intuitifs conçus spécifiquement pour la gestion scolaire moderne.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Scolarité & Élèves",
                description: "Gestion complète des élèves, inscriptions, dossiers et suivis personnalisés.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BookOpen,
                title: "Examens & Évaluation",
                description: "Planification des examens, saisie des notes, bulletins et statistiques.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: BarChart3,
                title: "Statistiques & Analytics",
                description: "Tableaux de bord intelligents avec insights en temps réel sur la performance.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: MessageSquare,
                title: "Communication",
                description: "Messagerie intégrée avec parents, élèves et enseignants via SMS et email.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Calendar,
                title: "Études & Planification",
                description: "Planning des cours, emplois du temps et gestion des salles de classe.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: ShieldCheck,
                title: "QHSE & Sécurité",
                description: "Gestion de la qualité, hygiène, sécurité et conformité réglementaire.",
                color: "from-teal-500 to-green-500"
              },
              {
                icon: Cloud,
                title: "Économat & Finance",
                description: "Gestion financière complète avec budgets, dépenses et rapports comptables.",
                color: "from-sky-500 to-blue-500"
              },
              {
                icon: Smartphone,
                title: "Mobile & Cloud",
                description: "Accès sécurisé depuis n'importe où, sur tous vos appareils avec synchronisation.",
                color: "from-gray-500 to-slate-500"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Methods Section - Design académique sombre */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-indigo-900/30 border border-indigo-800/50 text-indigo-300 rounded-full text-sm font-medium">
                💳 Solutions de paiement
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
              Paiements <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">simplifiés</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Solutions de paiement sécurisées et adaptées au contexte africain.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Carte principale FedaPay */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
              <div className="flex items-center mb-6">
                <img 
                  src={logoFedaPay} 
                  alt="FedaPay" 
                  className="w-16 h-16 object-contain mr-4"
                  title="FedaPay"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-100">FedaPay</h3>
                </div>
              </div>
              
              <p className="text-gray-200 mb-8 text-lg leading-relaxed">
                Solution de paiement mobile et carte bancaire intégrée, permettant des transactions 
                sécurisées dans toute l'Afrique de l'Ouest avec des taux compétitifs.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span className="font-medium text-gray-200">Paiements instantanés et sécurisés</span>
                </div>
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span className="font-medium text-gray-200">Support multi-devises (XOF, USD, EUR)</span>
                </div>
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span className="font-medium text-gray-200">API robuste et documentation complète</span>
                </div>
              </div>
            </div>
            
            {/* Grille des méthodes de paiement */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-gray-100 mb-6">Méthodes acceptées</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* MTN Mobile Money */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <img 
                    src={mtnMoney} 
                    alt="MTN Mobile Money" 
                    className="w-12 h-12 object-contain mb-4"
                    title="MTN Mobile Money"
                  />
                  <h5 className="font-semibold text-gray-100">MTN Money</h5>
                  <p className="text-sm text-gray-300">Mobile Money</p>
                </div>

                {/* Moov Money */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <img 
                    src={moovMoney} 
                    alt="Moov Money" 
                    className="w-12 h-12 object-contain mb-4"
                    title="Moov Money"
                  />
                  <h5 className="font-semibold text-gray-100">Moov Money</h5>
                  <p className="text-sm text-gray-300">Mobile Money</p>
                </div>

                {/* Celtiis Cash */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <img 
                    src={celtiisCash} 
                    alt="Celtiis Cash" 
                    className="w-12 h-12 object-contain mb-4"
                    title="Celtiis Cash"
                  />
                  <h5 className="font-semibold text-gray-100">Celtiis Cash</h5>
                  <p className="text-sm text-gray-300">Mobile Money</p>
                </div>

                {/* Cartes Bancaires */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <img 
                    src={visa} 
                    alt="Visa" 
                    className="w-12 h-12 object-contain mb-4"
                    title="Visa"
                  />
                  <h5 className="font-semibold text-gray-100">Visa</h5>
                  <p className="text-sm text-gray-300">Carte bancaire</p>
                </div>

                {/* Mastercard */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <img 
                    src={mastercard} 
                    alt="Mastercard" 
                    className="w-12 h-12 object-contain mb-4"
                    title="Mastercard"
                  />
                  <h5 className="font-semibold text-gray-100">Mastercard</h5>
                  <p className="text-sm text-gray-300">Carte bancaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Design moderne et premium */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium">
                💰 Formules transparentes
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
              Des prix <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">adaptés</span> à vos besoins
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Des formules flexibles qui évoluent avec votre établissement. 
              Aucun frais caché, résiliation à tout moment.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
                {
                name: "Pack d'Essai",
                price: "Gratuit",
                period: "15 jours",
                description: "Découvrez toutes les fonctionnalités gratuitement",
                features: [
                  "Accès complet à tous les modules",
                  "Gestion des élèves et notes",
                  "Communication parents",
                  "Rapports de base",
                  "Support par email",
                  "Formation en ligne incluse"
                ],
                badge: "Gratuit",
                popular: false,
                color: "from-green-600 to-green-700"
              },
              {
                name: "Pack Premium",
                price: "10.000",
                period: "F CFA/mois",
                description: "Solution complète pour votre établissement",
                features: [
                  "Tous les modules inclus",
                  "IA intégrée avancée",
                  "Support prioritaire 24/7",
                  "Analytics avancés",
                  "Multi-utilisateurs illimités",
                  "API complète",
                  "Formation sur site",
                  "Sauvegarde automatique",
                  "Personnalisation avancée"
                ],
                badge: "Populaire",
                popular: true,
                color: "from-blue-600 to-purple-600"
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl shadow-xl p-8 transition-all duration-500 ${
                  plan.popular 
                    ? 'scale-105 ring-2 ring-purple-500 ring-offset-4 ring-offset-gray-900' 
                    : 'hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-100 mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-6 text-lg">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-100">{plan.price}</span>
                    <span className="text-gray-300 text-lg ml-2">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-gray-200">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mr-3 mt-0.5 flex-shrink-0`}>
                        <CheckCircle className="text-white w-4 h-4" />
                      </div>
                      <span className="text-base leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/register/school"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                      : 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {plan.price === "Gratuit" ? "Commencer l'essai" : "Choisir ce plan"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ExamTrack Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900">
        {/* Background with subtle pattern and gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 z-0">
          {/* Pattern removed - file doesn't exist */}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 dark:bg-blue-700 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header with animated underline */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-3">Gestion des Examens Simplifié</h2>
              <div className="h-1 w-1/3 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full transform transition-all duration-300 group-hover:w-1/2"></div>
            </div>
          </div>
          
          {/* Content Container with glass effect */}
          <div className="bg-slate-800/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-700/30 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image Column with overlay and animation */}
              <div className="lg:col-span-4 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 z-10 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <img 
                  src={examenEleves} 
                  alt="Élèves en salle d'examen" 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                  <span className="text-white text-lg font-bold px-4 py-2 rounded-lg bg-blue-600/80 backdrop-blur-sm">
                    Découvrir ExamTrack
                  </span>
                </div>
              </div>
              
              {/* Content Column */}
              <div className="lg:col-span-8 p-8 lg:p-12">
                <div className="space-y-8">
                  {/* Feature 1 */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-100 mb-2">Saisie des notes simplifiée</h3>
                      <p className="text-gray-200 leading-relaxed">
                        Interface intuitive permettant aux enseignants de saisir rapidement les notes 
                        par classe, matière et élève avec validation automatique.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-100 mb-2">Génération automatique des bulletins</h3>
                      <p className="text-gray-200 leading-relaxed">
                        Création instantanée de bulletins officiels conformes aux normes éducatives 
                        avec calcul automatique des moyennes et rangs.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-100 mb-2">Statistiques et tableaux d'honneur</h3>
                      <p className="text-gray-200 leading-relaxed">
                        Analyses détaillées des performances et génération automatique des tableaux 
                        d'honneur avec export PDF professionnel.
                      </p>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-100 mb-2">Conseils de classe avec IA</h3>
                      <p className="text-gray-200 leading-relaxed">
                        Recommandations intelligentes basées sur l'IA pour améliorer 
                        les performances des élèves et optimiser l'enseignement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-10">
                  <Link 
                    to="/register/school"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span>Explorer ExamTrack</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Design moderne avec preuves sociales */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-indigo-900/30 text-indigo-300 rounded-full text-sm font-medium">
                ✨ Ils nous font confiance
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
              Rejoignez plus de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">500 établissements</span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Des écoles maternelles aux universités, découvrez pourquoi des milliers 
              d'éducateurs choisissent Academia Hub Pro chaque jour.
            </p>
          </div>
          
          {/* Statistiques de confiance */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <School className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">500+</div>
              <div className="text-gray-200">Établissements</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Users className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">50K+</div>
              <div className="text-gray-200">Élèves gérés</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Zap className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">99.9%</div>
              <div className="text-gray-200">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Clock className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">24/7</div>
              <div className="text-gray-200">Support</div>
            </div>
          </div>
          
          {/* Logos des établissements partenaires */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center text-gray-100 mb-8">
              Établissements partenaires
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">LFM</span>
                </div>
                <span className="text-sm text-gray-200">La Fraternité</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">CSL</span>
                </div>
                <span className="text-sm text-gray-200">Collège Saint-Louis</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">LPI</span>
                </div>
                <span className="text-sm text-gray-200">Lycée Père Irénée</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">ESG</span>
                </div>
                <span className="text-sm text-gray-200">École Sainte Germaine</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">UAC</span>
                </div>
                <span className="text-sm text-gray-200">Université d'Abomey-Calavi</span>
              </div>
            </div>
          </div>
          
          {/* Témoignages */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">M.A</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-100">Marie Ahou</div>
                  <div className="text-sm text-gray-200">Directrice, École Primaire</div>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "Academia Hub Pro a transformé notre gestion scolaire. Les bulletins sont générés en quelques clics !"
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">K.S</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-100">Koffi Samuel</div>
                  <div className="text-sm text-gray-200">Proviseur, Lycée Moderne</div>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "Le module examens avec IA nous fait gagner des heures chaque trimestre. Un outil indispensable !"
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">A.D</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-100">Aminata Diallo</div>
                  <div className="text-sm text-gray-200">Censeur, Collège Privé</div>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "Support réactif et interface intuitive. Nos enseignants se sont adaptés en quelques jours."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Design académique sombre renforcé */}
      <section className="py-32 bg-gradient-to-br from-gray-950 via-slate-900 to-blue-950 relative overflow-hidden">
        {/* Éléments décoratifs animés */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20">
                🚀 Commencez dès aujourd'hui
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">révolutionner</span> votre gestion scolaire ?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Rejoignez plus de 500 établissements qui ont déjà transformé leur administration scolaire avec notre plateforme IA.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link 
              to="/register/flow" 
              className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center"
            >
              Commencer l'essai gratuit
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-5 rounded-2xl font-semibold text-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              📞 Réserver une démo
            </button>
          </div>
          
          {/* Avantages de l'essai */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3 text-white">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
                <h4 className="text-gray-100 font-bold mb-2">Essai gratuit 15 jours</h4>
                <p className="text-gray-300 text-sm">Accès complet à toutes les fonctionnalités</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3 text-white">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
                <h4 className="text-gray-100 font-bold mb-2">Sécurité maximale</h4>
                <p className="text-gray-300 text-sm">Protection des données garantie</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3 text-white">
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
                <h4 className="text-gray-100 font-bold mb-2">Support 24/7</h4>
                <p className="text-gray-300 text-sm">Assistance technique dédiée</p>
            </div>
          </div>
          
          {/* Garantie */}
          <div className="mt-12 text-center">
            <p className="text-blue-200 text-lg">
              ✅ Garantie 30 jours satisfait ou remboursé
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;