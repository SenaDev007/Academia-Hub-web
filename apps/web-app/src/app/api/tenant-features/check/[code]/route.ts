import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Endpoint mock pour les features par tenant.
// Pour l'instant, on renvoie false par défaut, sauf pour certains codes éventuels.

export async function GET(
  _req: NextRequest,
  context: { params: { code: string } },
) {
  const { code } = context.params;

  // Activer ou non certaines features en dur si besoin
  if (code === 'BILINGUAL_TRACK') {
    return NextResponse.json(false);
  }

  return NextResponse.json(false);
}


