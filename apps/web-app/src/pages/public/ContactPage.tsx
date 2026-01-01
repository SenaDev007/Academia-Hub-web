import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PremiumHeader from '../../components/layout/PremiumHeader';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  ArrowRight, 
  Building, 
  User,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';

/**
 * Page Contact
 * 
 * Objectif : Filtrer naturellement les prospects non sérieux
 * Message institutionnel, formulaire sobre, pas de promesse de réponse instantanée
 */
const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    function: '',
    email: '',
    phone: '',
    school: '',
    schoolType: '',
    requestType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Intégrer avec l'API backend
    console.log('Form submitted:', formData);
    
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <PremiumHeader />
      
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Contact institutionnel
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-4">
            Academia Hub est une plateforme de gestion scolaire destinée aux promoteurs et directeurs d'établissements privés.
          </p>
          <p className="text-lg text-gray-900 font-medium">
            Pour toute question stratégique ou demande d'accompagnement, notre équipe est à votre écoute.
          </p>
        </div>
      </section>

      {/* Message de Filtrage */}
      <section className="py-12 bg-gray-50 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 border-l-4 border-navy-900">
            <p className="text-base text-gray-900 leading-relaxed">
              <strong className="text-navy-900">Note importante :</strong> Academia Hub n'est pas un outil grand public. 
              Nous privilégions les échanges constructifs avec les décideurs (promoteurs, directeurs, gestionnaires) 
              qui recherchent une solution professionnelle de gestion institutionnelle. 
              Si votre décision est prise, vous pouvez <Link to="/signup" className="text-crimson-600 hover:text-crimson-500 font-semibold">activer directement la plateforme</Link> sans attendre.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
              <Mail className="w-8 h-8 text-navy-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Email</h3>
              <p className="text-slate-600 text-sm">contact@academiahub.com</p>
              <p className="text-xs text-gray-500 mt-2">Réponse sous 48h ouvrées</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
              <Phone className="w-8 h-8 text-navy-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Téléphone</h3>
              <p className="text-slate-600 text-sm">+229 XX XX XX XX</p>
              <p className="text-xs text-gray-500 mt-2">Lun-Ven, 8h-17h (GMT+1)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
              <MapPin className="w-8 h-8 text-navy-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Adresse</h3>
              <p className="text-slate-600 text-sm">Cotonou, Bénin</p>
              <p className="text-xs text-gray-500 mt-2">Sur rendez-vous uniquement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {!isSubmitted ? (
            <div className="bg-white rounded-lg p-8 md:p-12 border border-gray-200 shadow-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-3">
                  Demander un échange professionnel
                </h2>
                <p className="text-base text-slate-600 mb-2">
                  Remplissez ce formulaire pour toute question stratégique ou demande d'accompagnement.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-4">
                  <Clock className="w-4 h-4" />
                  <span>Réponse sous 48 heures ouvrées</span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <label htmlFor="function" className="block text-sm font-medium text-gray-900 mb-2">
                      Fonction *
                    </label>
                    <select
                      id="function"
                      name="function"
                      required
                      value={formData.function}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                    >
                      <option value="">Sélectionnez votre fonction</option>
                      <option value="promoteur">Promoteur</option>
                      <option value="directeur">Directeur</option>
                      <option value="gestionnaire">Gestionnaire</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                      placeholder="votre.email@etablissement.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-900 mb-2">
                      Nom de l'établissement *
                    </label>
                    <input
                      type="text"
                      id="school"
                      name="school"
                      required
                      value={formData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                      placeholder="Nom de votre établissement"
                    />
                  </div>

                  <div>
                    <label htmlFor="schoolType" className="block text-sm font-medium text-gray-900 mb-2">
                      Type d'établissement *
                    </label>
                    <select
                      id="schoolType"
                      name="schoolType"
                      required
                      value={formData.schoolType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="maternelle">Maternelle</option>
                      <option value="primaire">Primaire</option>
                      <option value="secondaire">Secondaire</option>
                      <option value="mixte">Mixte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="requestType" className="block text-sm font-medium text-gray-900 mb-2">
                    Type de demande *
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    required
                    value={formData.requestType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                  >
                    <option value="">Sélectionnez le type de demande</option>
                    <option value="demo">Demande de démonstration</option>
                    <option value="pricing">Question sur la tarification</option>
                    <option value="technical">Question technique</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                    Votre message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-900 focus:border-navy-900"
                    placeholder="Décrivez votre besoin, votre question ou votre demande d'accompagnement..."
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600">
                    En soumettant ce formulaire, vous acceptez que nous traitions vos données pour répondre à votre demande. 
                    Vos données ne seront pas utilisées à d'autres fins ni partagées avec des tiers.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy-900 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-navy-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer la demande
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 md:p-12 border border-gray-200 shadow-sm text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-navy-900 mb-4">
                Demande envoyée avec succès
              </h2>
              <p className="text-base text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto">
                Votre demande a été transmise à notre équipe. Nous vous répondrons sous 48 heures ouvrées à l'adresse email que vous avez fournie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center bg-navy-900 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-navy-800 transition-colors"
                >
                  Retour à l'accueil
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center bg-crimson-600 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors"
                >
                  Activer Academia Hub
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alternative : Activation Directe */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 border-2 border-navy-900">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Alternative : Activation directe
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Si votre décision est prise et que vous souhaitez activer Academia Hub sans attendre, 
                vous pouvez procéder directement à la souscription.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <CheckCircle className="w-8 h-8 text-navy-900 mb-4" />
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  Activation immédiate
                </h3>
                <p className="text-sm text-gray-700">
                  Accès à tous les modules dès le paiement de la souscription initiale.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <CheckCircle className="w-8 h-8 text-navy-900 mb-4" />
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  Période d'essai de 30 jours
                </h3>
                <p className="text-sm text-gray-700">
                  Testez la plateforme sans engagement. Garantie de remboursement.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-crimson-600 text-white px-10 py-5 rounded-md text-lg font-semibold hover:bg-crimson-500 transition-colors shadow-lg"
              >
                Activer Academia Hub maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <p className="text-sm text-slate-600 mt-4">
                Ou consultez la <Link to="/tarification" className="text-crimson-600 hover:text-crimson-500 font-semibold">tarification</Link> et les <Link to="/modules" className="text-crimson-600 hover:text-crimson-500 font-semibold">modules</Link> avant de vous décider.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

