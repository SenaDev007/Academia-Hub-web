/**
 * ============================================================================
 * API PROXY - STUDENT PAYMENT SUMMARY
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const queryString = academicYearId ? `?academicYearId=${academicYearId}` : '';

    const response = await fetch(`${API_BASE_URL}/api/finance/payments/student/${params.studentId}/summary${queryString}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching student payment summary:', error);
    return NextResponse.json({ error: 'Failed to fetch student payment summary' }, { status: 500 });
  }
}

