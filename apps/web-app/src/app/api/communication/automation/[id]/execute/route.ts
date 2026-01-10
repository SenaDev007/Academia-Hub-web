/**
 * ============================================================================
 * API PROXY - RECORD TRIGGER EXECUTION
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/communication/automation/${params.id}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error recording trigger execution:', error);
    return NextResponse.json({ error: 'Failed to record trigger execution' }, { status: 500 });
  }
}

