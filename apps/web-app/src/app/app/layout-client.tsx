/**
 * App Layout Client Component
 * 
 * Composant client pour gérer le flow post-login
 * Wrapper autour du layout serveur
 */

'use client';

import { PostLoginFlowWrapper } from '@/components/loading/PostLoginFlowWrapper';
import type { User, Tenant } from '@/types';

export interface AppLayoutClientProps {
  children: React.ReactNode;
  user: User;
  tenant: Tenant;
}

/**
 * Layout client pour l'application
 * 
 * Gère le flow post-login avant d'afficher le contenu
 */
export default function AppLayoutClient({
  children,
  user,
  tenant,
}: AppLayoutClientProps) {
  return (
    <PostLoginFlowWrapper user={user} tenant={tenant}>
      {children}
    </PostLoginFlowWrapper>
  );
}
