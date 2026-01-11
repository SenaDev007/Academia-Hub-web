/**
 * ============================================================================
 * STUDENT FEE PROFILE API PROXY - GET BY STUDENT
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');

    if (!academicYearId) {
      return NextResponse.json(
        { error: 'academicYearId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/finance/student-fee-profiles/student/${params.studentId}?academicYearId=${academicYearId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Student fee profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student fee profile' },
      { status: 500 }
    );
  }
}

