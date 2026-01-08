import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface WorkloadData {
  name: string;
  heures: number;
  max: number;
  status: 'underloaded' | 'optimal' | 'overloaded' | 'critical';
}

interface WorkloadChartProps {
  data: WorkloadData[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ data }) => {
  // Couleurs selon le statut
  const getBarColor = (status: WorkloadData['status']) => {
    switch (status) {
      case 'underloaded': return '#F59E0B'; // Yellow
      case 'optimal': return '#10B981'; // Green
      case 'overloaded': return '#F97316'; // Orange
      case 'critical': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statusLabels = {
        underloaded: 'Sous-chargé',
        optimal: 'Optimal',
        overloaded: 'Surchargé',
        critical: 'Critique'
      };

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Charge: <span className="font-medium">{data.heures}h / {data.max}h</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Statut: <span className={`font-medium ${
              data.status === 'critical' ? 'text-red-600' :
              data.status === 'overloaded' ? 'text-orange-600' :
              data.status === 'optimal' ? 'text-green-600' :
              'text-yellow-600'
            }`}>
              {statusLabels[data.status as keyof typeof statusLabels]}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Utilisation: {Math.round((data.heures / data.max) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 40
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            label={{ value: 'Heures/semaine', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Ligne de référence pour le maximum recommandé */}
          <ReferenceLine 
            y={25} 
            stroke="#EF4444" 
            strokeDasharray="5 5"
            label={{ value: "Max recommandé (25h)", position: "topRight" }}
          />
          
          {/* Ligne de référence pour le minimum recommandé */}
          <ReferenceLine 
            y={15} 
            stroke="#10B981" 
            strokeDasharray="5 5"
            label={{ value: "Min recommandé (15h)", position: "topRight" }}
          />
          
          <Bar 
            dataKey="heures" 
            radius={[4, 4, 0, 0]}
            stroke="#ffffff"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Légende compacte */}
      <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Sous-chargé (&lt;15h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Optimal (15-25h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Surchargé (25-30h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Critique (&gt;30h)</span>
        </div>
      </div>
    </div>
  );
};

export default WorkloadChart;
