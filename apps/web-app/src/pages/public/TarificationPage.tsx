import React from 'react';
import { Link } from 'react-router-dom';
import PremiumHeader from '../../components/layout/PremiumHeader';
import { 
  CheckCircle, 
  ArrowRight, 
  CreditCard, 
  Shield, 
  Zap, 
  Database,
  Users,
  TrendingUp,
  X,
} from 'lucide-react';

/**
 * Page Tarification
 * 
 * Objectif : Présenter la tarification de façon assumée, claire et rationnelle
 * Stratégie : Justifier la valeur sans se défendre, répondre aux objections implicites
 */
const TarificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Tarification transparente. Aucune ambiguïté.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-4">
            Un investissement initial. Un abonnement mensuel. C'est tout. Aucun coût caché. Aucune remise.
          </p>
          <p className="text-lg text-navy-900 font-semibold">
            Positionnement premium assumé. Valeur justifiée.
          </p>
        </div>
      </section>

      {/* Bloc 1 : Souscription Initiale */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 md:p-12 border-2 border-navy-900 shadow-xl">
            {/* En-tête avec prix */}
            <div className="text-center mb-10">
              <div className="inline-block bg-navy-900 text-white px-4 py-2 rounded-md text-sm font-semibold mb-4">
                ÉTAPE 1 : SOUSCRIPTION INITIALE
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                Souscription initiale
              </h2>
              <div className="text-6xl font-bold text-navy-900 mb-2">
                100.000 FCFA
              </div>
              <p className="text-xl text-slate-600 font-medium">
                Paiement unique. Aucun engagement.
              </p>
            </div>

            {/* Explication de la valeur */}
            <div className="mb-8">
              <p className="text-lg text-gray-900 mb-6 leading-relaxed text-center font-medium">
                Cette souscription initiale de <strong className="text-navy-900">100.000 FCFA</strong> est l'investissement pour activer Academia Hub dans votre établissement. C'est un paiement unique qui donne accès immédiat à <strong className="text-navy-900">tous les 15 modules</strong>.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">
                  Ce que vous obtenez immédiatement :
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Accès complet</span>
                      <p className="text-sm text-gray-700">Tous les 15 modules débloqués dès l'activation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Configuration</span>
                      <p className="text-sm text-gray-700">Paramétrage de votre établissement par notre équipe</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Formation</span>
                      <p className="text-sm text-gray-700">Formation initiale de votre équipe incluse</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Période d'essai</span>
                      <p className="text-sm text-gray-700">30 jours pour tester sans engagement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Support technique</span>
                      <p className="text-sm text-gray-700">Assistance dédiée pendant 30 jours</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Migration des données</span>
                      <p className="text-sm text-gray-700">Import de vos données existantes si nécessaire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Justification rationnelle */}
            <div className="bg-navy-50 rounded-lg p-6 mb-8 border-l-4 border-navy-900">
              <p className="text-base text-gray-900 leading-relaxed">
                <strong className="text-navy-900">Pourquoi 100.000 FCFA ?</strong> C'est le coût de l'activation professionnelle de votre établissement dans le système. Configuration, formation, migration des données, vérification que tout fonctionne : c'est un investissement initial qui garantit que vous démarrez correctement. Après cette activation, vous ne payez que l'abonnement mensuel.
              </p>
            </div>

            {/* CTA Principal */}
            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-crimson-600 text-white px-10 py-5 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors shadow-lg w-full md:w-auto"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Souscrire maintenant – 100.000 FCFA
              </Link>
              <p className="text-sm text-slate-600 mt-3">
                Paiement sécurisé via Fedapay • Aucun engagement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Séparateur */}
      <section className="py-12 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-6">
                <span className="text-lg font-semibold text-slate-600">
                  Après 30 jours d'essai
                </span>
              </div>
            </div>
          </div>
          <p className="text-base text-slate-600 mt-4">
            Si Academia Hub répond à vos attentes, l'abonnement mensuel démarre automatiquement.
          </p>
        </div>
      </section>

      {/* Bloc 2 : Abonnement Mensuel */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 border-2 border-navy-900">
            {/* En-tête avec prix */}
            <div className="text-center mb-10">
              <div className="inline-block bg-navy-900 text-white px-4 py-2 rounded-md text-sm font-semibold mb-4">
                ÉTAPE 2 : ABONNEMENT MENSUEL
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                Abonnement mensuel
              </h2>
              <div className="text-6xl font-bold text-navy-900 mb-2">
                15.000 FCFA
              </div>
              <p className="text-xl text-slate-600 font-medium">
                Par mois. Résiliable à tout moment.
              </p>
            </div>

            {/* Explication de la valeur */}
            <div className="mb-8">
              <p className="text-lg text-gray-900 mb-6 leading-relaxed text-center font-medium">
                L'abonnement mensuel de <strong className="text-navy-900">15.000 FCFA</strong> démarre automatiquement après vos 30 jours d'essai. C'est le coût de la maintenance continue, des mises à jour, et du support technique de votre système.
              </p>
              
              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">
                  Ce que vous obtenez chaque mois :
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Maintenance continue</span>
                      <p className="text-sm text-gray-700">Système maintenu, optimisé, sécurisé 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Mises à jour</span>
                      <p className="text-sm text-gray-700">Nouvelles fonctionnalités et améliorations régulières</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Sauvegardes quotidiennes</span>
                      <p className="text-sm text-gray-700">Vos données sauvegardées automatiquement chaque jour</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Support technique</span>
                      <p className="text-sm text-gray-700">Assistance prioritaire en cas de besoin</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Hébergement sécurisé</span>
                      <p className="text-sm text-gray-700">Vos données hébergées sur serveurs sécurisés</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-900 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-base font-semibold text-gray-900">Évolutions incluses</span>
                      <p className="text-sm text-gray-700">Accès à toutes les nouvelles fonctionnalités</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Justification rationnelle */}
            <div className="bg-navy-50 rounded-lg p-6 mb-8 border-l-4 border-navy-900">
              <p className="text-base text-gray-900 leading-relaxed">
                <strong className="text-navy-900">Pourquoi 15.000 FCFA par mois ?</strong> C'est moins que le salaire d'un secrétaire à temps partiel, mais c'est un système qui fonctionne 24/7, qui ne prend jamais de congé, qui ne fait jamais d'erreur, et qui évolue constamment. C'est le coût de la maintenance professionnelle d'un système de gestion institutionnelle.
              </p>
            </div>

            {/* Conditions */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 text-center">
                <strong className="text-navy-900">Résiliable à tout moment.</strong> Aucun engagement. Aucun préavis. L'abonnement se renouvelle automatiquement chaque mois via Fedapay. Vous pouvez arrêter quand vous voulez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Justification Rationnelle de la Valeur */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-4 text-center">
            Pourquoi ce prix ? Justification rationnelle.
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12">
            Nous assumons notre tarification. Voici pourquoi elle est justifiée.
          </p>
          
          <div className="space-y-8">
            {/* Justification Souscription */}
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    100.000 FCFA : Investissement initial justifié
                  </h3>
                  <p className="text-base text-gray-900 leading-relaxed">
                    Cette somme couvre l'activation professionnelle de votre établissement : configuration du système selon votre structure, formation de votre équipe, migration de vos données existantes si nécessaire, et vérification que tout fonctionne correctement. C'est un investissement unique qui garantit que vous démarrez avec un système opérationnel, pas avec un logiciel à configurer vous-même.
                  </p>
                </div>
              </div>
            </div>

            {/* Justification Abonnement */}
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    15.000 FCFA par mois : Coût de maintenance professionnelle
                  </h3>
                  <p className="text-base text-gray-900 leading-relaxed mb-4">
                    C'est le coût de la maintenance continue d'un système SaaS professionnel : hébergement sécurisé, sauvegardes quotidiennes, mises à jour régulières, support technique, évolution du système. C'est moins qu'un salaire à temps partiel, mais c'est un système qui fonctionne 24/7, qui ne prend jamais de congé, qui ne fait jamais d'erreur, et qui évolue constamment.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-navy-900">
                    <p className="text-sm text-gray-900 font-medium">
                      <strong>Comparaison :</strong> Un secrétaire à temps partiel coûte environ 50.000 FCFA par mois. Academia Hub coûte 15.000 FCFA par mois et fait le travail de plusieurs personnes, 24 heures sur 24, sans erreur, sans congé, sans formation à prévoir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ce que nous ne faisons PAS */}
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    Ce que nous ne faisons pas
                  </h3>
                  <ul className="space-y-3 text-base text-gray-900">
                    <li className="flex items-start">
                      <X className="w-5 h-5 text-crimson-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Nous ne vendons pas des licences par utilisateur (prix fixe, quel que soit le nombre d'utilisateurs)</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 text-crimson-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Nous ne facturons pas des modules à l'unité (tous les modules sont inclus)</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 text-crimson-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Nous ne créons pas de fausses urgences (pas de remise limitée dans le temps)</span>
                    </li>
                    <li className="flex items-start">
                      <X className="w-5 h-5 text-crimson-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Nous ne cachons pas de coûts (prix transparent, sans surprise)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Positionnement */}
            <div className="bg-navy-900 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4 text-center">
                Positionnement premium assumé
              </h3>
              <p className="text-lg text-gray-100 leading-relaxed text-center max-w-3xl mx-auto">
                Academia Hub n'est pas un logiciel low-cost. C'est un système de gestion institutionnelle professionnel, conçu pour les établissements qui exigent la rigueur, la transparence, et le contrôle total. Notre tarification reflète cette qualité. Nous assumons ce positionnement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Réponses aux Objections Implicites */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-4 text-center">
            Réponses aux questions fréquentes
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12">
            Les objections implicites, répondues avec transparence.
          </p>

          <div className="space-y-6">
            {/* Objection 1 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-navy-900 mb-3">
                "Pourquoi payer 100.000 FCFA d'activation ?"
              </h3>
              <p className="text-base text-gray-900 leading-relaxed">
                Parce que l'activation d'Academia Hub dans votre établissement nécessite un travail professionnel : configuration du système selon votre structure, formation de votre équipe, migration de vos données, vérification que tout fonctionne. Ce n'est pas un simple clic. C'est un service professionnel qui garantit que vous démarrez correctement.
              </p>
            </div>

            {/* Objection 2 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-navy-900 mb-3">
                "15.000 FCFA par mois, c'est cher ?"
              </h3>
              <p className="text-base text-gray-900 leading-relaxed">
                C'est moins qu'un salaire à temps partiel. Mais c'est un système qui fonctionne 24/7, qui ne prend jamais de congé, qui ne fait jamais d'erreur, et qui évolue constamment. Comparez avec le coût d'un secrétaire, d'un comptable, ou d'un système informatique à maintenir vous-même. 15.000 FCFA par mois pour un système complet, c'est un investissement rationnel.
              </p>
            </div>

            {/* Objection 3 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-navy-900 mb-3">
                "Y a-t-il des remises ou promotions ?"
              </h3>
              <p className="text-base text-gray-900 leading-relaxed">
                Non. Nous ne proposons pas de remise. Nous ne créons pas de fausses urgences. Notre tarification est fixe, transparente, et assumée. Si vous êtes prêt à investir dans un système professionnel, le prix est clair. Si vous cherchez une solution low-cost, Academia Hub n'est pas pour vous.
              </p>
            </div>

            {/* Objection 4 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-navy-900 mb-3">
                "Que se passe-t-il si je ne suis pas satisfait ?"
              </h3>
              <p className="text-base text-gray-900 leading-relaxed">
                Si, dans les 30 premiers jours, Academia Hub ne répond pas à vos attentes, nous vous remboursons intégralement les 100.000 FCFA. Sans condition. Sans question. C'est notre garantie de satisfaction. Vous testez pendant 30 jours. Si ça ne vous convient pas, vous récupérez votre investissement initial.
              </p>
            </div>

            {/* Objection 5 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-navy-900 mb-3">
                "Puis-je arrêter l'abonnement mensuel ?"
              </h3>
              <p className="text-base text-gray-900 leading-relaxed">
                Oui. À tout moment. Sans préavis. Sans condition. Vous résiliez quand vous voulez. L'abonnement se renouvelle automatiquement chaque mois, mais vous pouvez l'arrêter à tout moment. Aucun engagement. Aucune pénalité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Garantie de Satisfaction */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 md:p-12 border-2 border-navy-900 shadow-lg">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-navy-900 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy-900 mb-4">
                Garantie de satisfaction
              </h3>
            </div>
            <p className="text-lg text-gray-900 leading-relaxed text-center mb-6">
              Si, dans les <strong className="text-navy-900">30 premiers jours</strong>, Academia Hub ne répond pas à vos attentes, nous vous remboursons intégralement les <strong className="text-navy-900">100.000 FCFA</strong>.
            </p>
            <div className="bg-navy-50 rounded-lg p-6 border-l-4 border-navy-900">
              <p className="text-base text-gray-900 text-center font-semibold">
                Sans condition. Sans question. C'est notre engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Récapitulatif des Coûts */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-navy-900">
            <h3 className="text-2xl font-bold text-navy-900 mb-6 text-center">
              Récapitulatif des coûts
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Souscription initiale</p>
                  <p className="text-sm text-slate-600">Paiement unique</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-navy-900">100.000 FCFA</p>
                  <p className="text-sm text-slate-600">Une seule fois</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Abonnement mensuel</p>
                  <p className="text-sm text-slate-600">Après 30 jours d'essai</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-navy-900">15.000 FCFA</p>
                  <p className="text-sm text-slate-600">Par mois</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 mt-6">
                <p className="text-sm text-gray-700 text-center">
                  <strong className="text-navy-900">Total la première année :</strong> 100.000 FCFA (activation) + 165.000 FCFA (11 mois d'abonnement) = <strong className="text-navy-900">265.000 FCFA</strong>
                </p>
                <p className="text-xs text-slate-600 text-center mt-2">
                  Soit environ 22.000 FCFA par mois en moyenne la première année
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-navy-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à investir dans un système professionnel ?
          </h2>
          <p className="text-lg text-gray-100 mb-4 leading-relaxed max-w-2xl mx-auto">
            Academia Hub n'est pas une solution low-cost. C'est un système de gestion institutionnelle professionnel, à un prix transparent et assumé.
          </p>
          <p className="text-base text-gray-200 mb-8">
            Commencez par la souscription initiale. Aucun engagement. Période d'essai de 30 jours incluse. Garantie de remboursement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-crimson-600 text-white px-10 py-5 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors shadow-lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Souscrire maintenant – 100.000 FCFA
            </Link>
            <Link
              to="/modules"
              className="inline-flex items-center justify-center bg-white/10 text-white px-8 py-5 rounded-md text-base font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Voir tous les modules
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          <p className="text-sm text-gray-300 mt-6">
            Paiement sécurisé via Fedapay • Aucun engagement • Garantie 30 jours
          </p>
        </div>
      </section>
    </div>
  );
};

export default TarificationPage;

