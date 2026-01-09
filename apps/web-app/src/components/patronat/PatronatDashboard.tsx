/**
 * PatronatDashboard Component
 * 
 * Cockpit institutionnel avec KPI et ORION
 */

'use client';

import { useState, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

interface KPIData {
  schoolsCount: number;
  candidatesCount: number;
  activeExamsCount: number;
  criticalAlerts: number;
}

export default function PatronatDashboard({ tenantId }: { tenantId: string }) {
  const [kpiData, setKpiData] = useState<KPIData>({
    schoolsCount: 0,
    candidatesCount: 0,
    activeExamsCount: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Charger les KPI depuis l'API
    const loadKPIs = async () => {
      try {
        // const response = await fetch(`/api/patronat/kpis?tenantId=${tenantId}`);
        // const data = await response.json();
        // setKpiData(data);
        
        // Données mock pour l'instant
        setKpiData({
          schoolsCount: 12,
          candidatesCount: 1245,
          activeExamsCount: 3,
          criticalAlerts: 2,
        });
      } catch (error) {
        console.error('Error loading KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, [tenantId]);

  const kpiCards = [
    {
      title: 'Écoles rattachées',
      value: kpiData.schoolsCount,
      icon: 'building' as const,
      color: 'blue',
      trend: '+2 ce mois',
    },
    {
      title: 'Candidats',
      value: kpiData.candidatesCount.toLocaleString(),
      icon: 'scolarite' as const,
      color: 'green',
      trend: '+156 cette semaine',
    },
    {
      title: 'Examens actifs',
      value: kpiData.activeExamsCount,
      icon: 'exams' as const,
      color: 'purple',
      trend: 'En cours',
    },
    {
      title: 'Alertes critiques',
      value: kpiData.criticalAlerts,
      icon: 'warning' as const,
      color: 'red',
      trend: 'À traiter',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de votre organisation des examens
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className={cn(
              'bg-white rounded-lg border border-gray-200 p-6',
              'shadow-sm hover:shadow-md transition-shadow'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                kpi.color === 'blue' && 'bg-blue-100',
                kpi.color === 'green' && 'bg-green-100',
                kpi.color === 'purple' && 'bg-purple-100',
                kpi.color === 'red' && 'bg-red-100'
              )}>
                <AppIcon
                  name={kpi.icon}
                  size="dashboard"
                  className={cn(
                    kpi.color === 'blue' && 'text-blue-600',
                    kpi.color === 'green' && 'text-green-600',
                    kpi.color === 'purple' && 'text-purple-600',
                    kpi.color === 'red' && 'text-red-600'
                  )}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {kpi.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : kpi.value}
              </p>
              <p className="text-xs text-gray-500">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bloc ORION */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-lg flex items-center justify-center">
            <AppIcon name="sparkles" size="menu" className="text-gold-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ORION</h2>
            <p className="text-sm text-gray-600">Analyse automatique et alertes</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Résumé automatique */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Résumé automatique
            </p>
            <p className="text-sm text-blue-800">
              Votre taux d'inscription a augmenté de 8% ce mois. 
              Les examens CEP et BEPC sont en cours d'organisation. 
              2 alertes nécessitent votre attention.
            </p>
          </div>

          {/* Alertes prioritaires */}
          {kpiData.criticalAlerts > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-2">
                Alertes prioritaires ({kpiData.criticalAlerts})
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-red-800">
                  • Incohérence détectée : 5 candidats sans école assignée
                </li>
                <li className="text-sm text-red-800">
                  • Centre d'examen "Littoral" : capacité dépassée
                </li>
              </ul>
              <button className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900">
                Voir toutes les alertes →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:shadow-sm transition-all">
          <AppIcon name="building" size="menu" className="text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">Rattacher une école</p>
          <p className="text-sm text-gray-600 mt-1">Ajouter une nouvelle école</p>
        </button>
        <button className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:shadow-sm transition-all">
          <AppIcon name="exams" size="menu" className="text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">Créer un examen</p>
          <p className="text-sm text-gray-600 mt-1">Organiser un nouvel examen</p>
        </button>
        <button className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:shadow-sm transition-all">
          <AppIcon name="document" size="menu" className="text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">Générer des documents</p>
          <p className="text-sm text-gray-600 mt-1">Listes, relevés, attestations</p>
        </button>
      </div>
    </div>
  );
}

