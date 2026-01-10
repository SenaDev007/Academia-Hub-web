/**
 * ============================================================================
 * API PROXY - GET STUDENT ID CARD
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
    const academicYearId = searchParams.get('academicYearId');

    if (!academicYearId) {
      return NextResponse.json(
        { error: 'academicYearId is required' },
        { status: 400 }
      );
    }

    const url = `${API_BASE_URL}/api/students/id-cards/${studentId}?academicYearId=${academicYearId}`;

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
    console.error('Error fetching ID card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ID card' },
      { status: 500 }
    );
  }
}

