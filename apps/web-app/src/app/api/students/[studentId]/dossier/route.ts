/**
 * ============================================================================
 * API PROXY - STUDENT DOSSIER
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId') || '';
    const queryString = academicYearId ? `?academicYearId=${academicYearId}` : '';
    const url = `${API_BASE_URL}/api/students/${studentId}/dossier${queryString}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dossier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dossier' },
      { status: 500 }
    );
  }
}

