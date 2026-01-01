import React from 'react';
import { Link } from 'react-router-dom';
import PremiumHeader from '../components/layout/PremiumHeader';
import {
  FileText,
  DollarSign,
  Users,
  AlertTriangle,
  Shield,
  Lock,
  Database,
  FileCheck,
  GraduationCap,
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
} from 'lucide-react';

/**
 * Premium Landing Page - Academia Hub
 * 
 * Landing page premium et décisionnelle pour promoteurs et directeurs d'établissements scolaires.
 * Design minimaliste institutionnel, ton autoritaire et rassurant.
 */
const PremiumLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* ====================================================================
          1. HERO SECTION — Verrouillage Immédiat
          ==================================================================== */}
      <section className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo / Brand */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-navy-900">Academia Hub</h1>
          </div>

          {/* Titre Principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-6 leading-tight max-w-4xl mx-auto">
            Dirigez votre établissement scolaire avec la rigueur d'un système professionnel.
          </h1>

          {/* Sous-titre */}
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Academia Hub est le système de gestion scolaire conçu pour les promoteurs et directeurs qui exigent la transparence, le contrôle et la traçabilité complète de leur établissement.
          </p>

          {/* CTA Principal */}
          <div className="mb-6">
            <Link
              to="/onboarding/school"
              className="inline-block bg-crimson-600 text-white px-12 py-4 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors duration-200 shadow-lg"
            >
              Démarrer l'activation — 100.000 FCFA
            </Link>
          </div>

          {/* Micro-copy sous CTA */}
          <p className="text-sm text-slate-600">
            Activation unique. Aucun engagement. Accès complet à tous les modules.
          </p>
        </div>
      </section>

      {/* ====================================================================
          2. PROBLÈME — Miroir Psychologique
          ==================================================================== */}
      <section className="py-24 md:py-32 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Titre de Section */}
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 text-center mb-16">
            Vous gérez un établissement scolaire. Voici ce que vous vivez chaque jour.
          </h2>

          {/* Grille des Problèmes */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Carte 1 : Désordre Administratif */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                L'information est dispersée, difficile à retrouver, impossible à auditer.
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Les dossiers élèves sont dans des classeurs. Les paiements dans un autre fichier. Les notes ailleurs. Chaque recherche prend du temps. Chaque vérification est un casse-tête. Vous ne savez jamais si vous avez la vue complète.
              </p>
            </div>

            {/* Carte 2 : Manque de Visibilité Financière */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Vous ne savez pas exactement où vous en êtes financièrement, en temps réel.
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Les recettes sont dans un cahier. Les dépenses dans un autre. Les soldes par niveau scolaire ? Personne ne peut vous le dire rapidement. Les bilans mensuels sont un exercice de reconstruction, pas de pilotage.
              </p>
            </div>

            {/* Carte 3 : Perte de Contrôle */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Vous perdez le contrôle opérationnel de votre établissement.
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Qui fait quoi ? Qui a accès à quoi ? Qui a modifié cette information ? Vous ne pouvez pas tracer les actions. Vous ne pouvez pas garantir l'intégrité des données. Vous dépendez de la mémoire des personnes, pas d'un système.
              </p>
            </div>

            {/* Carte 4 : Risques Humains */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Un départ, une erreur, une négligence : tout peut basculer.
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Votre secrétaire part ? Les codes d'accès sont perdus. Une erreur de saisie ? Elle se propage partout. Une négligence ? Les données sont corrompues. Vous n'avez pas de système de sauvegarde, de traçabilité, de contrôle d'accès.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. POSITIONNEMENT & AUTORITÉ
          ==================================================================== */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre de Section */}
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 text-center mb-12">
            Academia Hub : le système central de direction scolaire.
          </h2>

          {/* Paragraphe 1 */}
          <p className="text-lg text-gray-900 mb-8 leading-relaxed">
            Academia Hub n'est pas une application éducative grand public. C'est un système de gestion institutionnelle conçu pour les promoteurs et directeurs d'établissements scolaires privés qui exigent la rigueur, la transparence et le contrôle total.
          </p>

          {/* Paragraphe 2 */}
          <p className="text-lg text-gray-900 mb-8 leading-relaxed">
            Nous ne vous vendons pas des fonctionnalités isolées. Nous vous proposons un système centralisé où chaque module (scolarité, finances, RH, examens, communication) fonctionne de manière intégrée, avec une isolation stricte par niveau scolaire et une traçabilité complète de toutes les actions.
          </p>

          {/* Paragraphe 3 */}
          <p className="text-lg text-gray-900 mb-12 leading-relaxed font-semibold">
            Academia Hub est conçu pour durer. Pour évoluer avec votre établissement. Pour résister aux changements d'équipe. Pour garantir l'intégrité de vos données. Pour vous donner une vision claire, en temps réel, de l'état de votre établissement.
          </p>

          {/* Citation */}
          <blockquote className="border-l-4 border-navy-900 pl-6 italic text-xl text-slate-600 my-12">
            "Gérer un établissement scolaire, c'est gérer une entreprise. Avec des méthodes, des processus, des contrôles. Pas avec de l'improvisation."
          </blockquote>
        </div>
      </section>

      {/* ====================================================================
          4. SOLUTION — Modules
          ==================================================================== */}
      <section className="py-24 md:py-32 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Titre de Section */}
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 text-center mb-6">
            Tous les modules. Aucun bridage. Accès complet dès l'activation.
          </h2>

          {/* Sous-titre */}
          <p className="text-lg md:text-xl text-slate-600 text-center mb-16 max-w-3xl mx-auto">
            Vous n'achetez pas des fonctionnalités à l'unité. Vous activez un système complet.
          </p>

          {/* Grille des Modules */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Module 1 : Scolarité & Élèves */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Scolarité & Élèves</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Gestion complète des inscriptions, dossiers élèves, classes, effectifs. Numérotation automatique EducMaster. Isolation par niveau scolaire. Traçabilité complète.
              </p>
            </div>

            {/* Module 2 : Économat & Finance */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Économat & Finance</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Paiements, recettes, dépenses, bilans par niveau scolaire et par module. Trésorerie en temps réel. Traçabilité financière complète.
              </p>
            </div>

            {/* Module 3 : Personnel & RH */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Personnel & RH</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Gestion des enseignants, contrats, salaires, heures travaillées. Paie automatisée. Traçabilité RH complète.
              </p>
            </div>

            {/* Module 4 : Planification & Études */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Planification & Études</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Emplois du temps, planning, cahiers de textes, fiches pédagogiques. Organisation pédagogique complète.
              </p>
            </div>

            {/* Module 5 : Examens & Évaluation */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Examens & Évaluation</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Saisie des notes, calculs automatiques, bulletins, conseils de classe. Système d'évaluation complet et traçable.
              </p>
            </div>

            {/* Module 6 : Communication */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Communication</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                SMS, emails, notifications aux parents et élèves. Campagnes ciblées. Historique complet.
              </p>
            </div>

            {/* Module 7 : Bibliothèque */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Book className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Bibliothèque</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Catalogue de livres, prêts, retours. Gestion complète de la bibliothèque.
              </p>
            </div>

            {/* Module 8 : Laboratoire */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Laboratoire</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Gestion des équipements, réservations, inventaire. Suivi complet.
              </p>
            </div>

            {/* Module 9 : Transport */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bus className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Transport</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Gestion des véhicules, itinéraires, élèves transportés. Suivi complet.
              </p>
            </div>

            {/* Module 10 : Cantine */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Cantine</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Gestion des repas, menus, paiements cantine. Bilans séparés.
              </p>
            </div>

            {/* Module 11 : Infirmerie */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Infirmerie</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Dossiers médicaux, visites, traitements. Suivi médical complet.
              </p>
            </div>

            {/* Module 12 : QHSE */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">QHSE</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Qualité, Hygiène, Sécurité, Environnement. Inspections, rapports, conformité.
              </p>
            </div>

            {/* Module 13 : EduCast */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Radio className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">EduCast</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Diffusion de contenu éducatif, annonces, actualités. Communication institutionnelle.
              </p>
            </div>

            {/* Module 14 : Boutique */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center min-h-[200px] flex flex-col">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Boutique</h3>
              <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                Vente de fournitures scolaires, gestion des stocks, bilans séparés.
              </p>
            </div>
          </div>

          {/* Note Importante */}
          <div className="bg-white rounded-lg p-6 border-2 border-navy-900 text-center">
            <p className="text-base font-semibold text-navy-900">
              Tous ces modules sont inclus dans votre activation. Aucun supplément. Aucun bridage fonctionnel.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. OFFRE COMMERCIALE — Transparente
          ==================================================================== */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Titre de Section */}
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 text-center mb-12">
            Investissement transparent. Aucun coût caché.
          </h2>

          {/* Carte Activation */}
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-navy-900 mb-12">
            <h3 className="text-3xl font-bold text-navy-900 mb-3 text-center">
              Activation : 100.000 FCFA
            </h3>
            <p className="text-lg text-gray-700 text-center mb-6">
              Paiement unique. Accès complet à tous les modules. Période d'essai de 30 jours incluse.
            </p>
            <ul className="space-y-3 text-base text-gray-900">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Accès immédiat à tous les modules</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Configuration de votre établissement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Formation initiale incluse</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Support technique pendant 30 jours</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Aucun engagement au-delà de 30 jours</span>
              </li>
            </ul>
          </div>

          {/* Séparateur */}
          <div className="text-center mb-12">
            <div className="inline-block relative">
              <span className="text-lg font-semibold text-slate-600 bg-white px-4">
                Après 30 jours
              </span>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -z-10"></div>
            </div>
          </div>

          {/* Carte Abonnement */}
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-navy-900 mb-12">
            <h3 className="text-3xl font-bold text-navy-900 mb-3 text-center">
              15.000 FCFA / mois
            </h3>
            <p className="text-lg text-gray-700 text-center mb-6">
              Abonnement mensuel. Résiliable à tout moment. Aucun engagement.
            </p>
            <ul className="space-y-3 text-base text-gray-900">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Maintenance et mises à jour continues</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Sauvegardes automatiques quotidiennes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Support technique prioritaire</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Accès à toutes les nouvelles fonctionnalités</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                <span>Aucun coût supplémentaire</span>
              </li>
            </ul>
          </div>

          {/* Justification du Prix */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-navy-900 mb-6">
              Pourquoi ce prix ?
            </h3>
            <p className="text-base text-gray-900 mb-6 leading-relaxed">
              100.000 FCFA pour l'activation, c'est l'investissement initial pour configurer votre établissement dans le système, former votre équipe, migrer vos données existantes, et garantir que tout fonctionne correctement avant que vous ne commenciez à payer l'abonnement mensuel.
            </p>
            <p className="text-base text-gray-900 mb-6 leading-relaxed">
              15.000 FCFA par mois, c'est le coût de la maintenance, des mises à jour, des sauvegardes quotidiennes, du support technique, et de l'hébergement sécurisé de vos données. C'est moins que le salaire d'un secrétaire à temps partiel, mais c'est un système qui fonctionne 24/7, qui ne prend jamais de congé, et qui ne fait jamais d'erreur.
            </p>
            <p className="text-base text-gray-900 leading-relaxed">
              Nous ne vous vendons pas des licences par utilisateur. Nous ne vous facturons pas des modules à l'unité. Nous vous proposons un système complet, pour un prix fixe, transparent, sans surprise.
            </p>
          </div>

          {/* Garantie */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-navy-900 mb-4 text-center">
              Garantie de satisfaction
            </h3>
            <p className="text-lg text-navy-900 text-center">
              Si, dans les 30 premiers jours, Academia Hub ne répond pas à vos attentes, nous vous remboursons intégralement les 100.000 FCFA. Sans condition. Sans question.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CRÉDIBILITÉ & SÉCURITÉ
          ==================================================================== */}
      <section className="py-24 md:py-32 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Titre de Section */}
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 text-center mb-16">
            Vos données sont sécurisées. Votre établissement est protégé.
          </h2>

          {/* Grille des Points de Crédibilité */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Carte 1 : Architecture Professionnelle */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Architecture SaaS professionnelle
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Academia Hub est construit sur une architecture multi-tenant avec isolation stricte des données. Chaque établissement a ses propres données, inaccessibles aux autres. Base de données PostgreSQL, API REST sécurisée, authentification par rôles.
              </p>
            </div>

            {/* Carte 2 : Contrôle d'Accès */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Contrôle d'accès par rôles
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Vous définissez qui a accès à quoi. Directeur, secrétaire, comptable, enseignant : chaque rôle a ses permissions. Aucun accès non autorisé. Traçabilité complète de toutes les actions.
              </p>
            </div>

            {/* Carte 3 : Sauvegardes Automatiques */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Sauvegardes automatiques quotidiennes
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Vos données sont sauvegardées automatiquement chaque jour. En cas de problème, nous restaurons vos données en moins de 24 heures. Vos données ne sont jamais perdues.
              </p>
            </div>

            {/* Carte 4 : Traçabilité Complète */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Traçabilité complète de toutes les actions
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Chaque modification est enregistrée. Qui a fait quoi, quand, pourquoi. Vous pouvez auditer toutes les actions. Vous avez une traçabilité complète de l'historique de votre établissement.
              </p>
            </div>
          </div>

          {/* Note Technique */}
          <p className="text-sm text-slate-600 text-center italic">
            Academia Hub est une plateforme SaaS hébergée sur des serveurs sécurisés, avec chiffrement des données en transit et au repos, conformité aux standards de sécurité, et maintenance continue par une équipe technique dédiée.
          </p>
        </div>
      </section>

      {/* ====================================================================
          7. CTA FINAL — Fermeture
          ==================================================================== */}
      <section className="py-24 md:py-32 bg-navy-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Titre Principal */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Prenez la décision de professionnaliser la gestion de votre établissement.
          </h2>

          {/* Paragraphe Principal */}
          <p className="text-lg text-gray-100 mb-12 leading-relaxed max-w-2xl mx-auto">
            Academia Hub n'est pas une solution miracle. C'est un système de gestion professionnelle qui exige de votre part un investissement initial et un engagement mensuel. Mais c'est aussi la garantie d'avoir un établissement scolaire géré avec la rigueur, la transparence et le contrôle que vous exigez.
          </p>

          {/* CTA Principal */}
          <div className="mb-6">
            <Link
              to="/onboarding/school"
              className="inline-block bg-crimson-600 text-white px-14 py-5 rounded-md text-xl font-semibold hover:bg-crimson-500 transition-colors duration-200 shadow-lg"
            >
              Activer Academia Hub — 100.000 FCFA
            </Link>
          </div>

          {/* Micro-copy sous CTA */}
          <p className="text-base text-gray-300 mb-12">
            Activation unique. Période d'essai de 30 jours. Aucun engagement.
          </p>

          {/* Note Finale */}
          <p className="text-base text-gray-200 italic max-w-xl mx-auto leading-relaxed">
            Nous ne proposons pas de remise. Nous ne créons pas de fausse urgence. Nous vous proposons un système professionnel, à un prix transparent, avec une garantie de satisfaction. La décision vous appartient.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PremiumLandingPage;

