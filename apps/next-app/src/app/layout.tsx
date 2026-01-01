/**
 * Root Layout
 * 
 * Layout global de l'application Next.js
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}

