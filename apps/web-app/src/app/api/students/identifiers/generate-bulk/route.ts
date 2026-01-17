/**
 * ============================================================================
 * API PROXY - GENERATE BULK MATRICULES
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('countryCode') || 'BJ';
    
    const url = `${API_BASE_URL}/api/students/identifiers/generate-bulk?countryCode=${countryCode}`;

    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Error generating bulk matricules:', error);
    return NextResponse.json(
      { error: 'Failed to generate bulk matricules' },
      { status: 500 }
    );
  }
}

