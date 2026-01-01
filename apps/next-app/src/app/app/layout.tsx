/**
 * Dashboard Layout
 * 
 * Layout pour les routes protégées /app/*
 * Nécessite authentification et tenant valide
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { extractSubdomain, resolveTenant } from '@/lib/tenant/resolver';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier l'authentification
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  // Vérifier le tenant
  const subdomain = extractSubdomain();
  if (!subdomain) {
    redirect('/tenant-not-found');
  }

  const tenant = await resolveTenant(subdomain);
  if (!tenant) {
    redirect('/tenant-not-found');
  }

  // Vérifier que le tenant de la session correspond au tenant du sous-domaine
  if (session.tenant.id !== tenant.id) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient
      user={session.user}
      tenant={session.tenant}
    >
      {children}
    </DashboardLayoutClient>
  );
}

