/**
 * Root Layout
 * 
 * Layout global de l'application Next.js
 */

import type { Metadata } from 'next';
import { Inter, Dancing_Script } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Academia Hub - Système de Gestion Scolaire Premium',
  description: 'Plateforme SaaS de gestion scolaire pour établissements privés',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${dancingScript.variable}`}>{children}</body>
    </html>
  );
}

