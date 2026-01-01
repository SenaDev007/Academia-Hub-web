/**
 * Premium Header Component
 * 
 * Header moderne, professionnel et attrayant pour les pages publiques
 * Design premium institutionnel avec animations subtiles
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { bgColor, textColor, typo } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function PremiumHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
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
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white border-b border-gray-200 shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-105"
          >
            <div className="relative">
              <Image
                src="/images/logo-Academia Hub.png"
                alt="Academia Hub"
                width={44}
                height={44}
                className="h-11 w-auto transition-opacity duration-200 group-hover:opacity-90"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={`${typo('h3')} ${textColor('primary')} font-bold leading-tight`}>
                Academia Hub
              </span>
              <span className={`${typo('caption')} ${textColor('muted')} hidden sm:block`}>
                Gestion scolaire institutionnelle
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(item.path)
                    ? 'text-blue-900 bg-cloud'
                    : 'text-graphite-700 hover:text-blue-900 hover:bg-cloud'
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-900 rounded-full" />
                )}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-gray-200">
              <Link
                href="/signup"
                className={cn(
                  'bg-blue-900 text-white px-6 py-2.5 rounded-md',
                  'font-semibold hover:bg-blue-800 transition-all duration-200',
                  'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
                  'inline-flex items-center space-x-2'
                )}
              >
                <span>Activer Academia Hub</span>
                <AppIcon name="trends" size="submenu" className="text-white" />
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                'p-2.5 rounded-lg',
                textColor('primary'),
                'hover:bg-gray-100 transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2'
              )}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <AppIcon name="close" size="menu" className="text-blue-900" />
              ) : (
                <AppIcon name="menu" size="menu" className="text-blue-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn(bgColor('card'), 'border-t border-gray-200 shadow-lg')}>
          <nav className="flex flex-col px-4 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                  isActive(item.path)
                    ? 'text-blue-900 bg-cloud font-semibold'
                    : 'text-graphite-700 hover:text-blue-900 hover:bg-cloud'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'bg-blue-900 text-white w-full py-3 rounded-md',
                  'font-semibold hover:bg-blue-800 transition-all duration-200',
                  'shadow-sm hover:shadow-md',
                  'inline-flex items-center justify-center space-x-2'
                )}
              >
                <span>Activer Academia Hub</span>
                <AppIcon name="trends" size="submenu" className="text-white" />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
