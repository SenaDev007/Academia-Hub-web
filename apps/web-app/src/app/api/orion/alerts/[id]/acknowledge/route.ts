/**
 * ORION Alert Acknowledge API Route
 * 
 * Acquitte une alerte ORION
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * POST /api/orion/alerts/:id/acknowledge
 * 
 * Acquitte une alerte
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Vérifier l'authentification et le rôle
    const alertId = params.id;
    const tenantId = request.headers.get('X-Tenant-ID') || '';
    const userId = request.headers.get('X-User-ID') || 'unknown';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID manquant' },
        { status: 400 }
      );
    }

    // Déléguer au backend
    const response = await fetch(`${API_URL}/orion/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        acknowledgedBy: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'acquittement' }));
      return NextResponse.json(
        { error: error.message || 'Erreur lors de l\'acquittement de l\'alerte' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('ORION alert acknowledge error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}

