/**
 * ============================================================================
 * API PROXY - GET CNSS RATE
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { countryCode: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hr/cnss/rates/${params.countryCode}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CNSS rate:', error);
    return NextResponse.json({ error: 'Failed to fetch CNSS rate' }, { status: 500 });
  }
}

