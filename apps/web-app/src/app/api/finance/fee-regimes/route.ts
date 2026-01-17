/**
 * ============================================================================
 * FEE REGIMES API PROXY
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const schoolLevelId = searchParams.get('schoolLevelId');

    if (!academicYearId || !schoolLevelId) {
      return NextResponse.json(
        { error: 'academicYearId and schoolLevelId are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/finance/fee-regimes?academicYearId=${academicYearId}&schoolLevelId=${schoolLevelId}`,
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
    console.error('Fee regimes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee regimes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/finance/fee-regimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fee regimes API error:', error);
    return NextResponse.json(
      { error: 'Failed to create fee regime' },
      { status: 500 }
    );
  }
}

