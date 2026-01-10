/**
 * ============================================================================
 * API PROXY - MARK CNSS DECLARATION AS DECLARED
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hr/cnss/declarations/${params.id}/declare`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error marking declaration as declared:', error);
    return NextResponse.json({ error: 'Failed to mark declaration as declared' }, { status: 500 });
  }
}

