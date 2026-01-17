/**
 * ============================================================================
 * API PROXY - SEARCH STUDENT BY MATRICULE
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function GET(
  request: NextRequest,
  { params }: { params: { matricule: string } }
) {
  try {
    const { matricule } = params;
    const url = `${API_BASE_URL}/api/students/identifiers/search/${encodeURIComponent(matricule)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching student by matricule:', error);
    return NextResponse.json(
      { error: 'Failed to search student' },
      { status: 500 }
    );
  }
}

