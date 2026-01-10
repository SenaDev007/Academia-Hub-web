/**
 * ============================================================================
 * API PROXY - MARK PAYROLL AS PAID
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hr/payroll/${params.id}/mark-paid`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error marking payroll as paid:', error);
    return NextResponse.json({ error: 'Failed to mark payroll as paid' }, { status: 500 });
  }
}

