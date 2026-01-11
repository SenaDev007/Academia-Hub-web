/**
 * ============================================================================
 * API PROXY - PUBLIC VERIFICATION
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const url = `${API_BASE_URL}/api/public/verify/${token}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
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
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token', isValid: false },
      { status: 500 }
    );
  }
}

