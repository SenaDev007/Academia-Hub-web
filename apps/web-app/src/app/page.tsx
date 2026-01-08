/**
 * Page d'accueil (Landing Page)
 * 
 * Landing page unique, longue, premium et orientée conversion
 * Toutes les sections sur une seule page (scroll vertical)
 */

import { Metadata } from 'next';
import CompleteLandingPage from '@/components/public/CompleteLandingPage';
import StructuredData from '@/components/public/StructuredData';

export const metadata: Metadata = {
  title: 'Academia Hub - Plateforme de Gestion Scolaire Premium',
  description: 'Découvrez Academia Hub, la plateforme SaaS complète de gestion scolaire pour établissements privés en Afrique. Administration, finances, pédagogie, RH, ORION (IA) et mode offline. Conçue pour les directeurs et promoteurs exigeants.',
  keywords: [
    'gestion scolaire',
    'logiciel école',
    'plateforme SaaS éducation',
    'gestion établissement scolaire',
    'système gestion scolaire Afrique',
    'ORION IA éducation',
    'gestion scolaire offline',
    'Academia Hub',
    'gestion scolaire Bénin',
    'gestion scolaire Afrique de l\'Ouest',
  ],
  openGraph: {
    title: 'Academia Hub - Plateforme de Gestion Scolaire Premium',
    description: 'Plateforme SaaS complète de gestion scolaire pour établissements privés. Administration, finances, pédagogie, RH, ORION (IA) et mode offline.',
    url: '/',
    siteName: 'Academia Hub',
    images: [
      {
        url: '/images/logo-Academia Hub.png',
        width: 1200,
        height: 630,
        alt: 'Academia Hub - Plateforme de Gestion Scolaire',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academia Hub - Plateforme de Gestion Scolaire Premium',
    description: 'Plateforme SaaS complète de gestion scolaire pour établissements privés en Afrique.',
    images: ['/images/logo-Academia Hub.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <CompleteLandingPage />
    </>
  );
}

