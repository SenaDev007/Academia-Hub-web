/**
 * Dashboard Principal
 * 
 * Page d'accueil du dashboard après authentification
 * Affiche le contexte, les indicateurs clés et l'accès aux modules
 */

import { getServerSession } from '@/lib/auth/session';
import { extractSubdomain } from '@/lib/tenant/resolver';
import DashboardPage from '@/components/dashboard/DashboardPage';

export default async function Page() {
  const session = await getServerSession();
  const subdomain = extractSubdomain();
  
  if (!session) {
    return null; // Le layout gère la redirection
  }

  return (
    <DashboardPage 
      user={session.user}
      tenant={session.tenant}
      subdomain={subdomain || ''}
    />
  );
}

