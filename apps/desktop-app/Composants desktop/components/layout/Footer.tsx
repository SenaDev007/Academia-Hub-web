import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, Shield, Book, Users, CreditCard, Building2, MessageSquare } from 'lucide-react';
import { visa, mastercard, moovMoney, celtiisCash, logoFedaPay } from '../../utils/imagePaths';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <GraduationCap className="relative w-10 h-10 text-blue-500" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Academia Hub
              </span>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              Plateforme de gestion éducative complète, 
              innovante et sécurisée pour optimiser 
              l'administration scolaire.
            </p>
            <div className="flex space-x-6 mt-4">
              {[
                { 
                  icon: Facebook, 
                  name: 'Facebook',
                  href: "https://web.facebook.com/profile.php?id=61577143661930" 
                },
                { 
                  icon: Twitter, 
                  name: 'Twitter',
                  href: "https://twitter.com" 
                },
                { 
                  icon: Linkedin, 
                  name: 'LinkedIn',
                  href: "https://linkedin.com" 
                },
                { 
                  icon: Instagram, 
                  name: 'Instagram',
                  href: "https://instagram.com" 
                },
                { 
                  icon: Youtube, 
                  name: 'YouTube',
                  href: "https://youtube.com" 
                },
              ].map(({ icon: Icon, name, href }, index) => (
                <a 
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-full transition-all duration-300 hover:scale-110"
                  aria-label={`Suivez-nous sur ${name}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Solutions
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Accueil", href: "/", icon: Building2 },
                { name: "Fonctionnalités", href: "/features", icon: Book },
                { name: "Tarifs", href: "/pricing", icon: CreditCard },
                { name: "Témoignages", href: "/testimonials", icon: Users },
                { name: "Blog", href: "/blog", icon: Shield },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Assistance
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Centre d'aide", href: "/help-center" },
                { name: "Documentation", href: "/documentation" },
                { name: "Tutoriels", href: "/tutorials" },
                { name: "FAQ", href: "/faq" },
                { name: "Statut des services", href: "/status" },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Contactez-nous
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400">Téléphone</p>
                  <a href="tel:+2290195722234" className="text-white hover:text-blue-400 transition-colors flex items-center">
                    +229 01 95 72 22 34
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Email</p>
                  <a href="mailto:contact@yehiortech.com" className="text-white hover:text-blue-300 transition-colors">
                    contact@yehiortech.com
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Adresse</p>
                  <p className="text-white">Parakou, Bénin</p>
                </div>
              </li>
            </ul>
            <div className="flex space-x-6 mt-4">
              <a href="https://instagram.com/yehiortech" target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6 text-white hover:text-blue-500 transition-colors" />
              </a>
              <a href="https://facebook.com/yehiortech" target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:scale-110 transition-transform">
                <Facebook className="w-6 h-6 text-white hover:text-blue-500 transition-colors" />
              </a>
              <a href="https://twitter.com/yehiortech" target="_blank" rel="noopener noreferrer" title="Twitter" className="hover:scale-110 transition-transform">
                <Twitter className="w-6 h-6 text-white hover:text-blue-500 transition-colors" />
              </a>
              <a href="https://linkedin.com/company/yehiortech" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:scale-110 transition-transform">
                <Linkedin className="w-6 h-6 text-white hover:text-blue-500 transition-colors" />
              </a>
              <a href="https://youtube.com/@yehiortech" target="_blank" rel="noopener noreferrer" title="YouTube" className="hover:scale-110 transition-transform">
                <Youtube className="w-6 h-6 text-white hover:text-blue-500 transition-colors" />
              </a>
              <a href="https://m.me/yehiortech" target="_blank" rel="noopener noreferrer" title="Messenger" className="hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white hover:text-blue-500 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              &copy; {currentYear} Academia Hub. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">
              <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                FAQ
              </Link>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">
                Conditions
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
          <div className="mt-3 text-center md:text-left">
            <p className="text-white/40 text-xs">
              Développé avec passion par YEHI OR Tech
            </p>
          </div>

          <div className="mt-8 md:mt-0 text-center md:text-right">
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <img src={visa} alt="Visa" className="h-6" />
              </div>
              <div className="bg-white p-2 rounded-md shadow-sm">
                <img 
                  src={moovMoney} 
                  alt="Moov Money" 
                  className="h-6 w-auto object-contain"
                  title="Moov Money"
                />
              </div>
              <div className="bg-white p-2 rounded-md shadow-sm">
                <img 
                  src={celtiisCash} 
                  alt="Celtiis Cash" 
                  className="h-6 w-auto object-contain"
                  title="Celtiis Cash"
                />
              </div>
              <div className="bg-white p-2 rounded-md shadow-sm">
                <img 
                  src={visa} 
                  alt="Visa" 
                  className="h-5 w-auto object-contain"
                  title="Visa"
                />
              </div>
              <div className="bg-white p-2 rounded-md shadow-sm">
                <img 
                  src={mastercard} 
                  alt="MasterCard" 
                  className="h-5 w-auto object-contain"
                  title="MasterCard"
                />
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end space-x-2 mt-3">
              <p className="text-gray-500 text-xs">Paiement sécurisé avec FedaPay</p>
              <img 
                src={logoFedaPay} 
                alt="FedaPay" 
                className="h-4 w-auto object-contain"
                title="FedaPay"
              />
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;