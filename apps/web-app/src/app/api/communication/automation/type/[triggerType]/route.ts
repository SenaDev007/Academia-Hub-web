/**
 * ============================================================================
 * API PROXY - ACTIVE TRIGGERS BY TYPE
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { triggerType: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/communication/automation/type/${params.triggerType}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching triggers by type:', error);
    return NextResponse.json({ error: 'Failed to fetch triggers by type' }, { status: 500 });
  }
}

