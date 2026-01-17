/**
 * ============================================================================
 * API PROXY - ACTIVE CONTRACT BY STAFF
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function GET(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hr/contracts/staff/${params.staffId}/active`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching active contract:', error);
    return NextResponse.json({ error: 'Failed to fetch active contract' }, { status: 500 });
  }
}

