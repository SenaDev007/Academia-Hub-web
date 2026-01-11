/**
 * ============================================================================
 * API PROXY - REVOKE ID CARD
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const { cardId } = params;
    const body = await request.json();
    
    if (!body.reason || body.reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Revocation reason is mandatory' },
        { status: 400 }
      );
    }

    const url = `${API_BASE_URL}/api/students/id-cards/${cardId}/revoke`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error revoking ID card:', error);
    return NextResponse.json(
      { error: 'Failed to revoke ID card' },
      { status: 500 }
    );
  }
}

