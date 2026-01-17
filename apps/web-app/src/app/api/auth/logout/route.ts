/**
 * Logout API Route
 */

import { NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';
import { clearServerSession } from '@/lib/auth/session';

export async function POST() {
  await clearServerSession();
  return NextResponse.json({ success: true });
}

