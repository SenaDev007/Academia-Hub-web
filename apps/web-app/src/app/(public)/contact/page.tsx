/**
 * Page Contact
 */

import { Metadata } from 'next';
import ContactPage from '@/components/public/ContactPage';
import { generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Contact - Support Academia Hub',
  description: 'Contactez l\'équipe Academia Hub pour toute question, démonstration ou demande de devis. Support disponible pour les établissements scolaires en Afrique de l\'Ouest.',
  keywords: ['contact Academia Hub', 'support gestion scolaire', 'demande devis école'],
  path: '/contact',
});

export default function Page() {
  return <ContactPage />;
}

