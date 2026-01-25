/**
 * ============================================================================
 * APP LAYOUT - LAYOUT PRINCIPAL DE L'APPLICATION
 * ============================================================================
 * 
 * Layout pour toutes les pages de l'application authentifiée
 * Utilise PilotageLayout pour la structure complète
 * ============================================================================
 */

import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getServerSession } from '@/lib/auth/session';
import { ModalProvider } from '@/components/modules/blueprint/modals/ModalProvider';
import AppLayoutClient from './layout-client';
import type { User, Tenant } from '@/types';

// ✅ Lazy load du layout lourd pour améliorer le temps de chargement initial
const PilotageLayout = dynamic(
  () => import('@/components/pilotage/PilotageLayout'),
  {
    ssr: true, // ✅ Garder SSR pour le SEO
  }
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Charger le tenant depuis la session ou la base de données
  const user = session.user as User;
  const tenant: Tenant = {
    id: user.tenantId || '',
    name: 'Mon École', // TODO: Charger depuis la DB
    subdomain: '', // TODO: Charger depuis la DB
    subscriptionStatus: 'ACTIVE_SUBSCRIBED', // TODO: Charger depuis la DB
    createdAt: new Date().toISOString(),
    trialEndsAt: null,
    nextPaymentDueAt: null,
  };

  return (
    <ModalProvider>
      <AppLayoutClient user={user} tenant={tenant}>
        <PilotageLayout user={user} tenant={tenant}>
          {children}
        </PilotageLayout>
      </AppLayoutClient>
    </ModalProvider>
  );
}
