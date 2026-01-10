/**
 * ============================================================================
 * API PROXY - DEACTIVATE CNSS
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hr/cnss/employees/${params.staffId}/deactivate`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deactivating CNSS:', error);
    return NextResponse.json({ error: 'Failed to deactivate CNSS' }, { status: 500 });
  }
}

