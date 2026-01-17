/**
 * ============================================================================
 * API PROXY - SETTINGS FEATURES ENABLE
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function POST(
  request: NextRequest,
  { params }: { params: { featureCode: string } }
) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/settings/features/${params.featureCode}/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error enabling feature:', error);
    return NextResponse.json({ error: 'Failed to enable feature' }, { status: 500 });
  }
}

