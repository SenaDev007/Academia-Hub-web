import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, FileText, Award, Download, Calendar, BarChart3 } from 'lucide-react';

const AnalyticsPanel = ({ onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedMetric, setSelectedMetric] = useState('creation');

  const stats = {
    creation: {
      total: 124,
      evolution: '+12%',
      repartition: [
        { label: 'Mathématiques', value: 28, color: 'bg-blue-500' },
        { label: 'Français', value: 24, color: 'bg-green-500' },
        { label: 'Sciences', value: 18, color: 'bg-purple-500' },
        { label: 'Histoire-Géo', value: 16, color: 'bg-orange-500' },
        { label: 'Autres', value: 38, color: 'bg-gray-500' }
      ]
    },
    validation: {
      taux: 92,
      delaiMoyen: '2.3 jours',
      repartition: [
        { label: 'Validées directement', value: 68, color: 'bg-green-500' },
        { label: 'Avec corrections', value: 24, color: 'bg-orange-500' },
        { label: 'Rejetées', value: 8, color: 'bg-red-500' }
      ]
    },
    conformite: {
      scoreAPC: 85,
      evolution: '+5%',
      criteres: [
        { nom: 'Compétences définies', score: 92 },
        { nom: 'Objectifs mesurables', score: 88 },
        { nom: 'Phases respectées', score: 95 },
        { nom: 'Durées cohérentes', score: 78 },
        { nom: 'Matériel adapté', score: 82 }
      ]
    }
  };

  const enseignants = [
    { nom: 'M. KOUASSI Jean', fiches: 18, taux: 94, conformite: 88 },
    { nom: 'Mme ADJOVI Marie', fiches: 16, taux: 100, conformite: 92 },
    { nom: 'M. DOSSOU Paul', fiches: 14, taux: 86, conformite: 85 },
    { nom: 'Mme TOSSOU Sylvie', fiches: 12, taux: 92, conformite: 90 },
    { nom: 'M. KPOTCHOU André', fiches: 10, taux: 80, conformite: 82 }
  ];

  const renderMetricChart = (data, title) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${item.color}`}></div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <span className="font-medium">{item.value}{typeof item.value === 'number' && item.value < 100 ? '%' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au tableau de bord
          </button>
          <h2 className="text-xl font-semibold">Analyses & Rapports</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6" />
            <span className="text-sm opacity-90">Fiches créées</span>
          </div>
          <div className="text-3xl font-bold">{stats.creation.total}</div>
          <div className="text-sm opacity-90">{stats.creation.evolution} vs période précédente</div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm opacity-90">Taux de validation</span>
          </div>
          <div className="text-3xl font-bold">{stats.validation.taux}%</div>
          <div className="text-sm opacity-90">Délai moyen: {stats.validation.delaiMoyen}</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6" />
            <span className="text-sm opacity-90">Conformité APC</span>
          </div>
          <div className="text-3xl font-bold">{stats.conformite.scoreAPC}%</div>
          <div className="text-sm opacity-90">{stats.conformite.evolution} vs période précédente</div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6" />
            <span className="text-sm opacity-90">Enseignants actifs</span>
          </div>
          <div className="text-3xl font-bold">{enseignants.length}</div>
          <div className="text-sm opacity-90">Sur 24 enseignants</div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-3 gap-6">
        {renderMetricChart(stats.creation.repartition, 'Répartition par matière')}
        {renderMetricChart(stats.validation.repartition, 'Statuts de validation')}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Critères de conformité APC</h3>
          <div className="space-y-3">
            {stats.conformite.criteres.map((critere, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{critere.nom}</span>
                  <span className="text-sm font-medium">{critere.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${critere.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des performances par enseignant */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Performance par enseignant</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiches créées</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux validation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conformité APC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enseignants.map((enseignant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{enseignant.nom}</td>
                  <td className="px-6 py-4">{enseignant.fiches}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      enseignant.taux >= 90 ? 'bg-green-100 text-green-800' :
                      enseignant.taux >= 80 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {enseignant.taux}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${enseignant.conformite}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{enseignant.conformite}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;