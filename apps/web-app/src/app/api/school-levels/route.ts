import { NextResponse } from 'next/server';
import { getApiBaseUrlForRoutes } from '@/lib/utils/api-urls';

// Endpoint mock pour retourner une liste de niveaux scolaires
// Permet au dashboard de fonctionner en attendant l'API Nest réelle.

export async function GET() {
  const levels = [
    {
      id: 'mock-school-level-maternelle',
      code: 'MATERNELLE',
      label: 'Maternelle',
      isActive: true,
    },
    {
      id: 'mock-school-level-primary',
      code: 'PRIMAIRE',
      label: 'Primaire',
      isActive: true,
    },
    {
      id: 'mock-school-level-secondaire',
      code: 'SECONDAIRE',
      label: 'Secondaire',
      isActive: true,
    },
  ];

  return NextResponse.json(levels);
}


