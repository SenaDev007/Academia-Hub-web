/**
 * Performance Metrics API Route
 * 
 * Route pour recevoir les métriques de performance
 * Usage interne uniquement (Super Admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

const API_BASE_URL = getApiBaseUrlForRoutes();

/**
 * POST /api/performance/metrics
 * 
 * Enregistre les métriques de performance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Envoyer au backend API
    const response = await fetch(`${API_BASE_URL}/performance/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': request.headers.get('X-Tenant-ID') || '',
      },
      body: JSON.stringify({ metrics }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to save metrics' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing performance metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
