/**
 * Onboarding API Route
 * 
 * Gère la création complète d'un établissement :
 * - Création du tenant
 * - Génération du sous-domaine
 * - Création de l'utilisateur administrateur
 * - Activation du compte
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';
import { generateSubdomain, generateUniqueSubdomain, validateSubdomain } from '@/lib/utils/subdomain';

const API_URL = getApiBaseUrl();

interface OnboardingRequest {
  // Informations établissement
  schoolName: string;
  schoolType: string;
  address?: string;
  city?: string;
  country: string;
  phone: string;
  email: string;
  
  // Responsable principal
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  password: string;
  
  // Paiement
  paymentId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

/**
 * POST /api/onboarding
 * 
 * Crée un établissement complet après paiement réussi
 */
export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json();

    // Validation des champs obligatoires
    if (!body.schoolName || !body.responsibleEmail || !body.password) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // Générer le sous-domaine
    const baseSubdomain = generateSubdomain(body.schoolName);
    
    // Vérifier la disponibilité du sous-domaine
    const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/tenants/by-subdomain/${subdomain}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        // Si 404, le sous-domaine est disponible
        return response.status === 404;
      } catch {
        // En cas d'erreur, considérer comme disponible
        return true;
      }
    };

    const uniqueSubdomain = await generateUniqueSubdomain(
      baseSubdomain,
      checkSubdomainAvailability
    );

    // Valider le sous-domaine final
    const validation = validateSubdomain(uniqueSubdomain);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Créer le tenant via l'API backend
    const tenantResponse = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.schoolName,
        subdomain: uniqueSubdomain,
        slug: uniqueSubdomain,
        status: 'trial', // Période d'essai de 30 jours
        country: body.country || 'BJ',
        city: body.city,
        address: body.address,
        phone: body.phone,
        email: body.email,
        schoolType: body.schoolType,
      }),
    });

    if (!tenantResponse.ok) {
      const error = await tenantResponse.json().catch(() => ({ message: 'Erreur lors de la création du tenant' }));
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la création du tenant' },
        { status: tenantResponse.status }
      );
    }

    const tenant = await tenantResponse.json();

    // Créer l'utilisateur administrateur principal
    const userResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.responsibleEmail,
        password: body.password,
        firstName: body.responsibleName.split(' ')[0] || body.responsibleName,
        lastName: body.responsibleName.split(' ').slice(1).join(' ') || '',
        phone: body.responsiblePhone,
        role: 'admin',
        tenantId: tenant.id,
        isPrimaryAdmin: true,
      }),
    });

    if (!userResponse.ok) {
      // Si la création de l'utilisateur échoue, supprimer le tenant créé
      await fetch(`${API_URL}/tenants/${tenant.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});

      const error = await userResponse.json().catch(() => ({ message: 'Erreur lors de la création de l\'utilisateur' }));
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
        { status: userResponse.status }
      );
    }

    const user = await userResponse.json();

    // Retourner les informations de création
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
      },
      user: {
        id: user.id,
        email: user.email,
      },
      redirectUrl: `https://${uniqueSubdomain}.academiahub.com/app`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    
    // Gestion des erreurs spécifiques
    let errorMessage = 'Erreur interne lors de l\'onboarding';
    let statusCode = 500;

    if (error.message?.includes('sous-domaine')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('email')) {
      errorMessage = 'Cet email est déjà utilisé';
      statusCode = 409;
    } else if (error.message?.includes('tenant')) {
      errorMessage = 'Erreur lors de la création du tenant';
      statusCode = 500;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/onboarding/check-subdomain?subdomain=xxx
 * 
 * Vérifie la disponibilité d'un sous-domaine
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json(
      { error: 'Paramètre subdomain requis' },
      { status: 400 }
    );
  }

  // Valider le format
  const validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    return NextResponse.json(
      { available: false, error: validation.error },
      { status: 400 }
    );
  }

  // Vérifier la disponibilité
  const API_URL = getApiBaseUrl();
  
  try {
    const response = await fetch(`${API_URL}/tenants/by-subdomain/${subdomain}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    // Si 404, le sous-domaine est disponible
    const available = response.status === 404;

    return NextResponse.json({
      available,
      subdomain,
    });
  } catch (error) {
    // En cas d'erreur, considérer comme disponible
    return NextResponse.json({
      available: true,
      subdomain,
    });
  }
}

