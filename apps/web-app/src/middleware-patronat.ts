/**
 * Middleware Patronat - Protection des routes
 * 
 * Vérifie l'authentification et les permissions
 * pour les routes /patronat/* (sauf marketing)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { canAccessRoute } from '@/lib/patronat/permissions';
import type { PatronatRole } from '@/lib/patronat/permissions';

// Routes marketing (publiques)
const marketingRoutes = [
  '/patronat-examens',
  '/patronat/register',
  '/patronat/login',
  '/patronat/checkout',
];

// Routes protégées
const protectedRoutes = [
  '/patronat/dashboard',
  '/patronat/schools',
  '/patronat/exams',
  '/patronat/candidates',
  '/patronat/centers',
  '/patronat/documents',
  '/patronat/question-bank',
  '/patronat/reports',
  '/patronat/orion',
  '/patronat/settings',
];

export async function patronatMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes marketing : pas de protection
  if (marketingRoutes.some(route => pathname.startsWith(route) || pathname === route)) {
    return NextResponse.next();
  }

  // Routes protégées : vérifier auth et permissions
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      const { supabase, response: supabaseResponse } = createClient(request);
      
      // Vérifier l'authentification
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const loginUrl = new URL('/patronat/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // TODO: Récupérer le rôle depuis la DB (table patronat_users)
      // Pour l'instant, utiliser un rôle par défaut
      const userRole: PatronatRole = 'PATRONAT_ADMIN'; // À remplacer par la vraie logique

      // Vérifier les permissions
      if (!canAccessRoute(userRole, pathname)) {
        return NextResponse.json(
          { error: 'Accès refusé. Permissions insuffisantes.' },
          { status: 403 }
        );
      }

      // Ajouter les headers pour le layout
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      response.headers.set('X-User-ID', user.id);
      response.headers.set('X-User-Role', userRole);
      
      return response;
    } catch (error) {
      console.error('Patronat middleware error:', error);
      const loginUrl = new URL('/patronat/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

