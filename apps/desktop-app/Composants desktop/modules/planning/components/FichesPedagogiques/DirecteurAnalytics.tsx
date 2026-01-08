import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, FileText, Award, Download, Calendar, BarChart3, Clock, CheckCircle } from 'lucide-react';

const DirecteurAnalytics = ({ onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('trimestre');
  const [selectedMetric, setSelectedMetric] = useState('validation');

  const stats = {
    validation: {
      total: 124,
      validees: 98,
      corrigees: 18,
      rejetees: 8,
      delaiMoyen: '2.3 jours',
      tauxValidation: 79
    },
    enseignants: [
      { nom: 'M. KOUASSI Jean', fiches: 18, tauxValidation: 94, conformiteAPC: 88, delaiMoyen: '1.2 jours' },
      { nom: 'Mme ADJOVI Marie', fiches: 16, tauxValidation: 100, conformiteAPC: 92, delaiMoyen: '0.8 jours' },
      { nom: 'M. DOSSOU Paul', fiches: 14, tauxValidation: 86, conformiteAPC: 85, delaiMoyen: '2.1 jours' },
      { nom: 'Mme TOSSOU Sylvie', fiches: 12, tauxValidation: 92, conformiteAPC: 90, delaiMoyen: '1.5 jours' },
      { nom: 'M. KPOTCHOU André', fiches: 10, tauxValidation: 80, conformiteAPC: 82, delaiMoyen: '3.2 jours' }
    ],
    matieres: [
      { nom: 'Mathématiques', fiches: 28, conformite: 88, validees: 24 },
      { nom: 'Français', fiches: 24, conformite: 92, validees: 22 },
      { nom: 'Sciences Physiques', fiches: 18, conformite: 85, validees: 15 },
      { nom: 'SVT', fiches: 16, conformite: 90, validees: 14 },
      { nom: 'Histoire-Géo', fiches: 14, conformite: 83, validees: 11 }
    ],
    conformiteAPC: {
      scoreGlobal: 87,
      evolution: '+5%',
      criteres: [
        { nom: 'Compétences définies', score: 92, evolution: '+3%' },
        { nom: 'Objectifs mesurables', score: 88, evolution: '+7%' },
        { nom: 'Phases respectées', score: 95, evolution: '+2%' },
        { nom: 'Durées cohérentes', score: 78, evolution: '+8%' },
        { nom: 'Matériel adapté', score: 82, evolution: '+4%' },
        { nom: 'Stratégies variées', score: 85, evolution: '+6%' }
      ]
    }
  };

  const renderMetricChart = (data, title, type = 'bar') => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm font-medium">{item.nom || item.label}</span>
              <span className="font-medium">
                {type === 'percentage' ? `${item.score || item.value}%` : item.fiches || item.value}
              </span>
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
          <h2 className="text-xl font-semibold">Analyses et Rapports Directeur</h2>
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
          
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            <Download className="w-4 h-4" />
            Export Rapport
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6" />
            <span className="text-sm opacity-90">Total fiches</span>
          </div>
          <div className="text-3xl font-bold">{stats.validation.total}</div>
          <div className="text-sm opacity-90">ce trimestre</div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6" />
            <span className="text-sm opacity-90">Taux validation</span>
          </div>
          <div className="text-3xl font-bold">{stats.validation.tauxValidation}%</div>
          <div className="text-sm opacity-90">fiches acceptées</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6" />
            <span className="text-sm opacity-90">Conformité APC</span>
          </div>
          <div className="text-3xl font-bold">{stats.conformiteAPC.scoreGlobal}%</div>
          <div className="text-sm opacity-90">{stats.conformiteAPC.evolution} vs précédent</div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-sm opacity-90">Délai moyen</span>
          </div>
          <div className="text-3xl font-bold">{stats.validation.delaiMoyen}</div>
          <div className="text-sm opacity-90">de validation</div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6" />
            <span className="text-sm opacity-90">Enseignants actifs</span>
          </div>
          <div className="text-3xl font-bold">{stats.enseignants.length}</div>
          <div className="text-sm opacity-90">sur 24 total</div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-3 gap-6">
        {renderMetricChart(stats.matieres, 'Performance par matière')}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Statuts des validations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Validées</span>
              </div>
              <span className="font-medium">{stats.validation.validees}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">À corriger</span>
              </div>
              <span className="font-medium">{stats.validation.corrigees}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Rejetées</span>
              </div>
              <span className="font-medium">{stats.validation.rejetees}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Critères APC</h3>
          <div className="space-y-3">
            {stats.conformiteAPC.criteres.slice(0, 4).map((critere, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{critere.nom}</span>
                  <span className="text-sm font-medium">{critere.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiches soumises</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux validation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conformité APC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Délai moyen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.enseignants.map((enseignant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{enseignant.nom}</td>
                  <td className="px-6 py-4">{enseignant.fiches}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      enseignant.tauxValidation >= 90 ? 'bg-green-100 text-green-800' :
                      enseignant.tauxValidation >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {enseignant.tauxValidation}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${enseignant.conformiteAPC}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{enseignant.conformiteAPC}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{enseignant.delaiMoyen}</td>
                  <td className="px-6 py-4">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Recommandations d'amélioration
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Points forts</h4>
            <div className="space-y-2 text-sm text-green-700">
              <p>• Excellent respect des phases obligatoires (95%)</p>
              <p>• Bonne formulation des objectifs (88%)</p>
              <p>• Amélioration continue de la conformité APC (+5%)</p>
              <p>• Délai de validation respecté</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Axes d'amélioration</h4>
            <div className="space-y-2 text-sm text-orange-700">
              <p>• Diversifier les stratégies d'enseignement</p>
              <p>• Améliorer la cohérence des durées</p>
              <p>• Former sur les compétences transversales</p>
              <p>• Encourager l'utilisation de matériel varié</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirecteurAnalytics;