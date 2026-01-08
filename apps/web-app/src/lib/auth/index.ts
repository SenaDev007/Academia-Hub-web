/**
 * Authentication Helper - Supabase Integration
 * 
 * Helper pour l'authentification avec Supabase dans les Server Components
 */

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { User } from '@/types';

/**
 * Récupère la session utilisateur depuis Supabase (Server Component)
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Essayer de récupérer le profil utilisateur depuis la table users
    let profile = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    } catch (dbError) {
      // Si la table n'existe pas encore, utiliser les métadonnées Supabase
      console.warn('Users table not found, using Supabase metadata:', dbError);
    }

    // Construire l'objet User selon le type attendu
    // Utiliser les métadonnées Supabase si le profil DB n'existe pas
    const userData: User = {
      id: user.id,
      email: user.email || '',
      firstName: profile?.first_name || profile?.firstName || user.user_metadata?.first_name || user.user_metadata?.firstName || '',
      lastName: profile?.last_name || profile?.lastName || user.user_metadata?.last_name || user.user_metadata?.lastName || '',
      role: profile?.role || user.user_metadata?.role || 'USER',
      tenantId: profile?.tenant_id || profile?.tenantId || user.user_metadata?.tenant_id || user.user_metadata?.tenantId || '',
      createdAt: profile?.created_at || profile?.createdAt || user.created_at || new Date().toISOString(),
      updatedAt: profile?.updated_at || profile?.updatedAt || user.updated_at || new Date().toISOString(),
    };

    return {
      user: userData,
      expires: user.user_metadata?.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Options d'authentification (compatibilité avec next-auth)
 * Note: Cette fonction est fournie pour compatibilité mais utilise Supabase
 */
export const authOptions = {
  // Cette configuration est fournie pour compatibilité
  // L'authentification réelle est gérée par Supabase
  providers: [],
};

