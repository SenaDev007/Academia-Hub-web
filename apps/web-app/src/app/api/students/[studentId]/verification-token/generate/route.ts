/**
 * ============================================================================
 * API PROXY - GENERATE VERIFICATION TOKEN
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const body = await request.json();

    if (!body.academicYearId) {
      return NextResponse.json(
        { error: 'academicYearId is required' },
        { status: 400 }
      );
    }

    const url = `${API_BASE_URL}/api/students/${studentId}/verification-token/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating verification token:', error);
    return NextResponse.json(
      { error: 'Failed to generate verification token' },
      { status: 500 }
    );
  }
}

