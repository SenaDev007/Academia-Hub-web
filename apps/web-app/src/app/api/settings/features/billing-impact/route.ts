/**
 * ============================================================================
 * API PROXY - SETTINGS FEATURES BILLING IMPACT
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/features/billing-impact`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching billing impact:', error);
    return NextResponse.json({ error: 'Failed to fetch billing impact' }, { status: 500 });
  }
}

