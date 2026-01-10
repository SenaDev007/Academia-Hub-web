/**
 * ============================================================================
 * API PROXY - FEE CATEGORY BY ID
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finance/fees/categories/${params.id}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fee category:', error);
    return NextResponse.json({ error: 'Failed to fetch fee category' }, { status: 500 });
  }
}

