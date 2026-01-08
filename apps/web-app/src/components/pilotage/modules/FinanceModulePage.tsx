/**
 * ============================================================================
 * MODULE FINANCES & ÉCONOMAT
 * ============================================================================
 * 
 * Wireframe :
 * [ Finances – Niveau : Secondaire ]
 * 
 * [ Résumé ]
 * Recettes | Impayés | Dépenses | Solde
 * 
 * [ Paiements ]
 * ┌────────────────────────────────────────┐
 * │ Élève | Montant | Période | Statut     │
 * └────────────────────────────────────────┘
 * 
 * [ Actions ]
 * - Enregistrer paiement
 * - Générer reçu
 * - Voir historique
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Receipt, History, DollarSign, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  period: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  date: string;
}

interface FinanceSummary {
  revenue: number;
  unpaid: number;
  expenses: number;
  balance: number;
}

export default function FinanceModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFinanceData = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        // Charger le résumé
        const summaryResponse = await fetch(
          `/api/general/revenue?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary({
            revenue: summaryData.total || 0,
            unpaid: 0, // TODO: Calculer les impayés
            expenses: 0, // TODO: Charger les dépenses
            balance: summaryData.total || 0,
          });
        }

        // Charger les paiements
        const paymentsResponse = await fetch(
          `/api/payments?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error('Failed to load finance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinanceData();
  }, [currentYear, currentLevel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: 'Payé',
      PENDING: 'En attente',
      FAILED: 'Échoué',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ModulePageLayout
      title="Finances & Économat"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code}`}
      actions={
        <>
          <button className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Enregistrer paiement</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Receipt className="w-4 h-4" />
            <span>Générer reçu</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <History className="w-4 h-4" />
            <span>Voir historique</span>
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Recettes</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : formatCurrency(summary?.revenue || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Impayés</p>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : formatCurrency(summary?.unpaid || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Dépenses</p>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : formatCurrency(summary?.expenses || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Solde</p>
              <DollarSign className="w-5 h-5 text-navy-900" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : formatCurrency(summary?.balance || 0)}
            </p>
          </div>
        </div>

        {/* Paiements */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy-900">Paiements</h3>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-400">Chargement...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}

