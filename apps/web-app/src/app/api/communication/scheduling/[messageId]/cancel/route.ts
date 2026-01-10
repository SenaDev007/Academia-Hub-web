/**
 * ============================================================================
 * API PROXY - CANCEL SCHEDULED MESSAGE
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/communication/scheduling/${params.messageId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error cancelling scheduled message:', error);
    return NextResponse.json({ error: 'Failed to cancel scheduled message' }, { status: 500 });
  }
}

