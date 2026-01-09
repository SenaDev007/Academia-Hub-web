/**
 * Next.js Middleware
 * 
 * Gestion du multi-tenant et protection des routes
 * Intégration Supabase pour l'authentification
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SubscriptionStatus } from './types';
import { createClient } from '@/utils/supabase/middleware';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function extractSubdomainFromRequest(request: NextRequest): string | null {
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');

  if (!host) return null;

  if (process.env.NODE_ENV === 'development') {
    const devSubdomain = request.headers.get('x-tenant-subdomain');
    if (devSubdomain) return devSubdomain;
  }

  const parts = host.split('.');

  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    return parts[0];
  }

  return null;
}

async function resolveTenant(subdomain: string): Promise<{ id: string; slug: string; status: string; subscriptionStatus?: SubscriptionStatus } | null> {
  try {
    const response = await fetch(`${API_URL}/tenants/by-subdomain/${subdomain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const tenant = await response.json();

    if (tenant.subscriptionStatus === 'PENDING' || tenant.subscriptionStatus === 'TERMINATED') {
      return null;
    }
    if (!tenant.subscriptionStatus && (tenant.status !== 'active' && tenant.status !== 'trial')) {
      return null;
    }

    return tenant;
  } catch (error) {
    console.error('Error resolving tenant in middleware:', error);
    return null;
  }
}

const publicRoutes = [
  '/',
  '/modules',
  '/tarification',
  '/securite',
  '/contact',
  '/signup',
  '/login',
  '/admin-login', // Route publique pour le login Super Admin
  '/forgot-password',
  '/onboarding-error',
  '/testimonials', // Route publique pour les témoignages
];

// Routes admin (ne nécessitent pas de subdomain)
const adminRoutes = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomainFromRequest(request);

  // Routes Patronat : utiliser le middleware dédié
  if (pathname.startsWith('/patronat')) {
    const { patronatMiddleware } = await import('./middleware-patronat');
    return patronatMiddleware(request);
  }

  // Initialiser Supabase client pour l'authentification
  let response = NextResponse.next();
  let user = null;

  try {
    const { supabase, response: supabaseResponse } = createClient(request);
    response = supabaseResponse;

    // Rafraîchir la session utilisateur si nécessaire
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch (error) {
    // Si Supabase n'est pas configuré, continuer sans authentification
    console.warn('Supabase not configured or error:', error);
  }

  // Routes admin : pas de vérification de subdomain
  if (pathname.startsWith('/admin')) {
    // La vérification du rôle SUPER_ADMIN se fait dans le layout
    // Ajouter le pathname dans les headers pour le layout
    const adminResponse = NextResponse.next();
    adminResponse.headers.set('x-pathname', pathname);
    if (user) {
      adminResponse.headers.set('x-user-id', user.id);
    }
    return adminResponse;
  }

  // Route admin-login : toujours accessible, même avec subdomain
  if (pathname === '/admin-login' || pathname.startsWith('/admin-login')) {
    return response;
  }

  // Routes publiques
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (!subdomain) {
      return response;
    }

    if (subdomain && !pathname.startsWith('/app') && !pathname.startsWith('/admin')) {
      const mainDomain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      return NextResponse.redirect(new URL(pathname, mainDomain));
    }
  }

  // Routes app (nécessitent un subdomain)
  if (pathname.startsWith('/app')) {
    if (!subdomain) {
      const mainDomain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      return NextResponse.redirect(new URL('/login', mainDomain));
    }

    try {
      const tenant = await resolveTenant(subdomain);

      if (!tenant) {
        const mainDomain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        return NextResponse.redirect(new URL('/tenant-not-found', mainDomain));
      }

      // Créer une nouvelle réponse pour ajouter les headers
      const tenantResponse = NextResponse.next();
      tenantResponse.headers.set('X-Tenant-ID', tenant.id);
      tenantResponse.headers.set('X-Tenant-Slug', tenant.slug);
      if (tenant.subscriptionStatus) {
        tenantResponse.headers.set('X-Tenant-Subscription-Status', tenant.subscriptionStatus);
      }
      if (user) {
        tenantResponse.headers.set('X-User-ID', user.id);
      }

      return tenantResponse;
    } catch (error) {
      console.error('Error resolving tenant in middleware:', error);
      const mainDomain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      return NextResponse.redirect(new URL('/tenant-not-found', mainDomain));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
