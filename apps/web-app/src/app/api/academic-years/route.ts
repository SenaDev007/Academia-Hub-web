import { NextResponse } from 'next/server';

// Endpoint mock pour retourner une liste d'années scolaires
// Permet au dashboard de fonctionner en attendant l'API Nest réelle.

export async function GET() {
  const now = new Date();
  const currentYearStart = new Date(now.getFullYear(), 8, 1); // 1er septembre
  const currentYearEnd = new Date(now.getFullYear() + 1, 6, 30); // 30 juin

  const years = [
    {
      id: 'mock-academic-year-current',
      name: `${currentYearStart.getFullYear()}-${currentYearEnd.getFullYear()}`,
      startDate: currentYearStart.toISOString(),
      endDate: currentYearEnd.toISOString(),
      isCurrent: true,
    },
  ];

  return NextResponse.json(years);
}


