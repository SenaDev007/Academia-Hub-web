/**
 * ============================================================================
 * API PROXY - VALIDATE STAFF DOCUMENT
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hr/staff/documents/${params.id}/validate`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error validating document:', error);
    return NextResponse.json({ error: 'Failed to validate document' }, { status: 500 });
  }
}

