/**
 * ============================================================================
 * API PROXY - GENERATE STUDENT MATRICULE
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('countryCode') || 'BJ';
    
    const url = `${API_BASE_URL}/api/students/identifiers/${studentId}/generate?countryCode=${countryCode}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating matricule:', error);
    return NextResponse.json(
      { error: 'Failed to generate matricule' },
      { status: 500 }
    );
  }
}

