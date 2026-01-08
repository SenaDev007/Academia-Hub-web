/**
 * Root Layout
 * 
 * Layout global de l'application Next.js
 * 
 * ⚠️ NEXT.JS = WEB UNIQUEMENT
 * Aucune dépendance Electron ou Desktop
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ElectronCompatProvider } from '@/components/providers/ElectronCompatProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Academia Hub - Plateforme de gestion scolaire',
  description: 'La plateforme de gestion scolaire qui structure, contrôle et sécurise vos établissements. Conçue pour les directeurs et promoteurs exigeants.',
  keywords: ['gestion scolaire', 'ERP éducation', 'Academia Hub', 'gestion établissement'],
  authors: [{ name: 'Academia Hub' }],
  creator: 'YEHI OR Tech',
  publisher: 'Academia Hub',
  icons: {
    icon: '/images/logo-Academia-Hub.ico',
    shortcut: '/images/logo-Academia-Hub.ico',
    apple: '/images/logo-Academia-Hub.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://academiahub.com',
    siteName: 'Academia Hub',
    title: 'Academia Hub - Plateforme de gestion scolaire',
    description: 'La plateforme de gestion scolaire qui structure, contrôle et sécurise vos établissements.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academia Hub - Plateforme de gestion scolaire',
    description: 'La plateforme de gestion scolaire qui structure, contrôle et sécurise vos établissements.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/images/logo-Academia-Hub.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/images/logo-Academia-Hub.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <ElectronCompatProvider>
          {children}
        </ElectronCompatProvider>
      </body>
    </html>
  );
}
