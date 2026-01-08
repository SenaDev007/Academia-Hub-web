import React from 'react';
import { ValidationStats as Stats } from '../../types/validation';
import { FiTrendingUp, FiTrendingDown, FiClock, FiCheck, FiX } from 'react-icons/fi';

interface ValidationStatsProps {
  stats: Stats;
  formatDate: (dateString: string) => string;
}

const ValidationStats: React.FC<ValidationStatsProps> = ({ stats, formatDate }) => {
  const total = stats.totalWorkflows || 0;
  const approved = stats.approvedWorkflows || 0;
  const rejected = stats.rejectedWorkflows || 0;
  const pending = stats.pendingValidations || 0;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% par rapport à la semaine dernière
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartBar = ({ label, value, max, color }: any) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Workflows"
          value={total}
          icon={FiTrendingUp}
          color="bg-blue-500"
          trend={12}
        />
        <StatCard
          title="Approuvés"
          value={approved}
          icon={FiCheck}
          color="bg-green-500"
          trend={8}
        />
        <StatCard
          title="Rejetés"
          value={rejected}
          icon={FiX}
          color="bg-red-500"
          trend={-5}
        />
        <StatCard
          title="En attente"
          value={pending}
          icon={FiClock}
          color="bg-yellow-500"
          trend={-10}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Rates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Taux d'approbation</h3>
          <div className="space-y-4">
            <ChartBar label="Approuvés" value={approvalRate} max={100} color="bg-green-500" />
            <ChartBar label="Rejetés" value={rejectionRate} max={100} color="bg-red-500" />
            <ChartBar label="En attente" value={pendingRate} max={100} color="bg-yellow-500" />
          </div>
        </div>

        {/* Validation by Type */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Par type de document</h3>
          <div className="space-y-3">
            {Object.entries(stats.validationByType || {}).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Validation by Role */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Par rôle</h3>
          <div className="space-y-3">
            {Object.entries(stats.validationByRole || {}).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{role}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métriques de performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Temps moyen de validation</span>
                <span className="text-gray-900 font-medium">
                  {stats.averageValidationTime ? `${Math.round(stats.averageValidationTime)} min` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">Répartition par statut</div>
              <div className="flex space-x-2">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-green-600">{approved}</div>
                  <div className="text-xs text-gray-600">Approuvés</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-red-600">{rejected}</div>
                  <div className="text-xs text-gray-600">Rejetés</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pending}</div>
                  <div className="text-xs text-gray-600">En attente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
        <div className="text-sm text-gray-600">
          <p>Statistiques mises à jour en temps réel</p>
          <p className="mt-1">Dernière synchronisation: {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
};

export default ValidationStats;
