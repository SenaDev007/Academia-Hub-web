import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';

/**
 * Header Premium - Academia Hub
 * 
 * Header fixe avec menu navigation et CTA principal
 * Design premium institutionnel
 */
const PremiumHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: '/', label: 'Accueil' },
    { path: '/plateforme', label: 'Plateforme' },
    { path: '/modules', label: 'Modules' },
    { path: '/tarification', label: 'Tarification' },
    { path: '/securite', label: 'Sécurité & Méthode' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy-900">Academia Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-navy-900 border-b-2 border-navy-900 pb-1'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Principal */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/signup"
              className="bg-crimson-600 text-white px-6 py-3 rounded-md text-base font-semibold hover:bg-crimson-500 transition-colors duration-200 shadow-lg"
            >
              Activer Academia Hub
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-navy-900 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium px-4 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'text-navy-900 bg-gray-50'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="bg-crimson-600 text-white px-4 py-3 rounded-md text-base font-semibold text-center hover:bg-crimson-500 transition-colors mt-4"
              >
                Activer Academia Hub
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default PremiumHeader;

