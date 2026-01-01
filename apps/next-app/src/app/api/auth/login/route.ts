/**
 * Login API Route
 * 
 * Route handler pour l'authentification
 */

import { NextRequest, NextResponse } from 'next/server';
import { login, LoginCredentials } from '@/services/auth.service';
import { setServerSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    
    // Appeler le service d'authentification
    const response = await login(body);
    
    // Créer la session
    const session = {
      user: response.user,
      tenant: response.tenant,
      token: response.token,
      expiresAt: response.expiresAt,
    };
    
    // Stocker la session dans les cookies
    await setServerSession(session);
    
    return NextResponse.json({
      success: true,
      user: response.user,
      tenant: response.tenant,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la connexion' 
      },
      { status: 401 }
    );
  }
}

