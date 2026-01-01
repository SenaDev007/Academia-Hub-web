/**
 * ORION Alerts API Route
 * 
 * Récupère les alertes ORION générées par le moteur de règles
 */

import { NextRequest, NextResponse } from 'next/server';
import type { OrionAlert } from '@/types';
import {
  loadFinancialKpi,
  loadHrKpi,
  loadPedagogyKpi,
  loadSystemHealthKpi,
} from '@/lib/orion/orion-kpi.service';
import { executeOrionRules } from '@/lib/orion/orion-rule-engine';

/**
 * GET /api/orion/alerts
 * 
 * Récupère les alertes ORION
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier l'authentification et le rôle
    const tenantId = request.headers.get('X-Tenant-ID') || '';
    const level = request.nextUrl.searchParams.get('level') as 'INFO' | 'ATTENTION' | 'CRITIQUE' | null;
    const acknowledged = request.nextUrl.searchParams.get('acknowledged') === 'true';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID manquant' },
        { status: 400 }
      );
    }

    // COUCHE 1 : DONNÉES - Charger depuis les tables IA
    const period = request.nextUrl.searchParams.get('period') || undefined;
    const [financialKpi, hrKpi, pedagogyKpis, systemHealthKpi] = await Promise.all([
      loadFinancialKpi(tenantId, period),
      loadHrKpi(tenantId, period),
      loadPedagogyKpi(tenantId),
      loadSystemHealthKpi(tenantId, period),
    ]);

    // COUCHE 2 : LOGIQUE - Exécuter les règles depuis JSON
    let alerts = await executeOrionRules(
      '1.0',
      financialKpi,
      hrKpi,
      pedagogyKpis,
      systemHealthKpi
    );

    // Filtrer par niveau si demandé
    if (level) {
      alerts = alerts.filter(a => a.level === level);
    }

    // Filtrer par statut d'acquittement
    // TODO: Récupérer depuis la base de données les alertes acquittées
    if (acknowledged) {
      // Pour l'instant, on retourne toutes les alertes
      // Le backend devra gérer l'état d'acquittement
    }

    return NextResponse.json(alerts, { status: 200 });
  } catch (error: any) {
    console.error('ORION alerts error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

