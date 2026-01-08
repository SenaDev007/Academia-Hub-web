import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  Leaf,
  FileText,
  Clock,
  Activity,
  Eye,
  Edit,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Brain,
  Thermometer,
  Droplet,
  Wind,
  Trash2,
  Flame,
  Lightbulb,
  Clipboard,
  Award,
  PieChart,
  LineChart,
  Gauge
} from 'lucide-react';

const QHSE: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const qhseStats = [
    {
      title: 'Incidents signalés',
      value: '12',
      change: '-25%',
      icon: AlertTriangle,
      color: 'from-amber-600 to-amber-700'
    },
    {
      title: 'Audits réalisés',
      value: '8',
      change: '+2',
      icon: Clipboard,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Conformité globale',
      value: '92%',
      change: '+3.5%',
      icon: CheckCircle,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Économie d\'énergie',
      value: '15%',
      change: '+5%',
      icon: Leaf,
      color: 'from-emerald-600 to-emerald-700'
    }
  ];

  const incidents = [
    {
      id: 'INC-2024-001',
      title: 'Fuite d\'eau dans le bloc sanitaire',
      category: 'Hygiène',
      location: 'Bloc sanitaire - Bâtiment A',
      reportedBy: 'M. Dubois',
      reportDate: '2024-01-15',
      status: 'resolved',
      priority: 'medium',
      resolution: 'Plombier intervenu le 16/01, remplacement du joint défectueux',
      closedDate: '2024-01-16'
    },
    {
      id: 'INC-2024-002',
      title: 'Extincteur manquant',
      category: 'Sécurité',
      location: 'Couloir principal - Bâtiment B',
      reportedBy: 'Mme Martin',
      reportDate: '2024-01-18',
      status: 'in-progress',
      priority: 'high',
      resolution: 'Commande passée, en attente de livraison',
      closedDate: null
    },
    {
      id: 'INC-2024-003',
      title: 'Éclairage défectueux en salle informatique',
      category: 'Sécurité',
      location: 'Salle 205 - Bâtiment C',
      reportedBy: 'M. Laurent',
      reportDate: '2024-01-20',
      status: 'pending',
      priority: 'medium',
      resolution: null,
      closedDate: null
    }
  ];

  const audits = [
    {
      id: 'AUD-2024-001',
      title: 'Audit sécurité incendie',
      type: 'Interne',
      date: '2024-01-10',
      auditor: 'Équipe QHSE',
      status: 'completed',
      score: 85,
      findings: 4,
      majorNonConformities: 1,
      minorNonConformities: 3,
      report: 'Rapport_Audit_Incendie_Jan2024.pdf'
    },
    {
      id: 'AUD-2024-002',
      title: 'Audit hygiène restauration',
      type: 'Externe',
      date: '2024-01-15',
      auditor: 'Service d\'hygiène municipal',
      status: 'completed',
      score: 92,
      findings: 2,
      majorNonConformities: 0,
      minorNonConformities: 2,
      report: 'Rapport_Audit_Hygiene_Jan2024.pdf'
    },
    {
      id: 'AUD-2024-003',
      title: 'Audit environnemental',
      type: 'Interne',
      date: '2024-01-25',
      auditor: 'Comité environnement',
      status: 'scheduled',
      score: null,
      findings: null,
      majorNonConformities: null,
      minorNonConformities: null,
      report: null
    }
  ];

  const environmentalData = [
    {
      date: '2024-01',
      electricity: 4250,
      water: 320,
      waste: 850,
      recycled: 380,
      co2: 2.8
    },
    {
      date: '2023-12',
      electricity: 4500,
      water: 350,
      waste: 920,
      recycled: 360,
      co2: 3.1
    },
    {
      date: '2023-11',
      electricity: 4650,
      water: 380,
      waste: 980,
      recycled: 350,
      co2: 3.3
    }
  ];

  const safetyEquipment = [
    {
      id: 'EXT-001',
      type: 'Extincteur',
      location: 'Bâtiment A - Entrée',
      lastCheck: '2024-01-05',
      nextCheck: '2024-04-05',
      status: 'operational',
      notes: 'Extincteur à poudre 6kg'
    },
    {
      id: 'EXT-002',
      type: 'Extincteur',
      location: 'Bâtiment B - Couloir',
      lastCheck: '2024-01-05',
      nextCheck: '2024-04-05',
      status: 'operational',
      notes: 'Extincteur à poudre 6kg'
    },
    {
      id: 'ALA-001',
      type: 'Alarme incendie',
      location: 'Bâtiment A - Central',
      lastCheck: '2023-12-15',
      nextCheck: '2024-03-15',
      status: 'maintenance',
      notes: 'Remplacement batterie prévu le 25/01'
    },
    {
      id: 'KIT-001',
      type: 'Kit premiers secours',
      location: 'Infirmerie',
      lastCheck: '2024-01-10',
      nextCheck: '2024-02-10',
      status: 'operational',
      notes: 'Complet et à jour'
    }
  ];

  const aiInsights = [
    {
      id: 'AI-2024-001',
      title: 'Risque de pénurie d\'eau',
      description: 'Prédiction de pénurie d\'eau dans les 2 prochaines semaines basée sur les tendances de consommation et les prévisions météorologiques.',
      confidence: 85,
      category: 'Environnement',
      impact: 'high',
      recommendation: 'Mettre en place des mesures de restriction d\'eau et vérifier les systèmes de stockage.'
    },
    {
      id: 'AI-2024-002',
      title: 'Pic de consommation électrique',
      description: 'Détection d\'une augmentation anormale de la consommation électrique dans le bâtiment C.',
      confidence: 92,
      category: 'Environnement',
      impact: 'medium',
      recommendation: 'Vérifier les équipements électriques du bâtiment C et sensibiliser les utilisateurs.'
    },
    {
      id: 'AI-2024-003',
      title: 'Prédiction d\'épidémie grippale',
      description: 'Risque élevé d\'épidémie de grippe dans les 3 prochaines semaines basé sur les données d\'absentéisme et les tendances régionales.',
      confidence: 78,
      category: 'Hygiène',
      impact: 'high',
      recommendation: 'Renforcer les mesures d\'hygiène et prévoir une campagne de sensibilisation.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QHSE - Qualité, Hygiène, Sécurité, Environnement</h1>
          <p className="text-gray-600">Gestion intégrée avec intelligence artificielle</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Rapports
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel incident
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qhseStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
              { id: 'quality', label: 'Qualité', icon: Award },
              { id: 'hygiene', label: 'Hygiène', icon: Droplet },
              { id: 'safety', label: 'Sécurité', icon: Shield },
              { id: 'environment', label: 'Environnement', icon: Leaf },
              { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
              { id: 'audits', label: 'Audits', icon: Clipboard },
              { id: 'ai-insights', label: 'IA Insights', icon: Brain }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Tableau de bord QHSE</h3>
              
              {/* Performance globale */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                    Performance globale
                  </h4>
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-blue-600">92%</span>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="#E0E7FF" 
                          strokeWidth="10"
                        />
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="#4F46E5" 
                          strokeWidth="10"
                          strokeDasharray="283"
                          strokeDashoffset="23"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Qualité</p>
                        <p className="text-lg font-bold text-blue-600">94%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Hygiène</p>
                        <p className="text-lg font-bold text-blue-600">90%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Sécurité</p>
                        <p className="text-lg font-bold text-blue-600">95%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Environnement</p>
                        <p className="text-lg font-bold text-blue-600">88%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                    Incidents récents
                  </h4>
                  <div className="space-y-3">
                    {incidents.slice(0, 3).map((incident, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-medium text-gray-900">{incident.title}</p>
                          <p className="text-sm text-gray-600">{incident.category} • {incident.location}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status === 'resolved' ? 'Résolu' : 
                           incident.status === 'in-progress' ? 'En cours' : 'En attente'}
                        </span>
                      </div>
                    ))}
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
                      Voir tous les incidents
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-green-600" />
                    Insights IA
                  </h4>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-500' : 
                            insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          } mr-2`}></div>
                          <p className="font-medium text-gray-900">{insight.title}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Confiance: {insight.confidence}%</span>
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            Voir plus
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
                      Tous les insights IA
                    </button>
                  </div>
                </div>
              </div>

              {/* Tendances et statistiques */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    Tendances des incidents
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Graphique d'évolution des incidents par catégorie</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            Qualité
                          </span>
                          <span>-15%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Hygiène
                          </span>
                          <span>-8%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Sécurité
                          </span>
                          <span>-25%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            Environnement
                          </span>
                          <span>-12%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                    Répartition des audits
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Répartition des audits par domaine</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            Qualité
                          </span>
                          <span>35%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Hygiène
                          </span>
                          <span>25%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Sécurité
                          </span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            Environnement
                          </span>
                          <span>10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Signaler un incident</span>
                </button>
                <button className="p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors flex flex-col items-center justify-center">
                  <Clipboard className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Nouvel audit</span>
                </button>
                <button className="p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Rapports QHSE</span>
                </button>
                <button className="p-6 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors flex flex-col items-center justify-center">
                  <Brain className="w-8 h-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Analyse IA</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion de la qualité</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle action
                  </button>
                </div>
              </div>

              {/* Indicateurs de qualité */}
              <div className="grid lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Satisfaction</h5>
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">94%</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Basé sur 450 retours</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Non-conformités</h5>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-3xl font-bold text-amber-600">8</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      -25% ce mois
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">2 majeures, 6 mineures</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Actions correctives</h5>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">12/15</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">80% complétées</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Audits qualité</h5>
                    <Clipboard className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600">3</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-blue-600">Prochain: 15/02/2024</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Score moyen: 92%</p>
                </div>
              </div>

              {/* Processus qualité */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Processus qualité</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processus</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière revue</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Enseignement</div>
                          <div className="text-sm text-gray-500">Processus pédagogique</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          M. Dubois
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">95%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          10/01/2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Détails</button>
                          <button className="text-green-600 hover:text-green-900">Audit</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Évaluation</div>
                          <div className="text-sm text-gray-500">Processus d'examen</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Mme Martin
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">88%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          15/01/2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Détails</button>
                          <button className="text-green-600 hover:text-green-900">Audit</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Administration</div>
                          <div className="text-sm text-gray-500">Processus de gestion</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          M. Bernard
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">75%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          05/01/2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Détails</button>
                          <button className="text-green-600 hover:text-green-900">Audit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IA pour la qualité */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Intelligence artificielle pour la qualité
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-blue-600" />
                      Prédiction de performance
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      L'IA a analysé les tendances des 3 derniers trimestres et prédit une amélioration de 5% des résultats scolaires pour le prochain trimestre.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 87%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Analyse détaillée
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
                      Détection de décrochage
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      12 élèves identifiés à risque de décrochage scolaire basé sur l'analyse comportementale et les résultats récents.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 92%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Voir les élèves concernés
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                    Recommandations d'amélioration
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Renforcer le suivi individualisé pour les 12 élèves à risque de décrochage</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Organiser des sessions de rattrapage en mathématiques pour les classes de 4ème</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Mettre en place un système de tutorat par les pairs pour les matières scientifiques</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hygiene' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion de l'hygiène</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Planning
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau contrôle
                  </button>
                </div>
              </div>

              {/* Indicateurs d'hygiène */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Contrôles sanitaires</h5>
                    <Droplet className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">24</p>
                  <p className="text-sm text-gray-600 mt-2">Contrôles effectués ce mois</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      22 conformes
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Qualité de l'eau</h5>
                    <Droplet className="w-5 h-5 text-cyan-600" />
                  </div>
                  <p className="text-3xl font-bold text-cyan-600">100%</p>
                  <p className="text-sm text-gray-600 mt-2">Conformité des analyses</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-blue-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Dernier test: 12/01/2024
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Hygiène alimentaire</h5>
                    <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-3xl font-bold text-amber-600">95%</p>
                  <p className="text-sm text-gray-600 mt-2">Score HACCP cantine</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +3% depuis le dernier audit
                    </span>
                  </div>
                </div>
              </div>

              {/* Planning de nettoyage */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Planning de nettoyage</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fréquence</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier nettoyage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prochain</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Sanitaires Bâtiment A</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2x par jour
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Équipe entretien
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Aujourd'hui 10:30
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Aujourd'hui 15:30
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            À jour
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Salles de classe</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Quotidien
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Équipe entretien
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Hier 17:00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Aujourd'hui 17:00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Planifié
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Cantine</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Après chaque service
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Personnel restauration
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Aujourd'hui 13:30
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Demain 13:30
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            À jour
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IA pour l'hygiène */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-cyan-600" />
                  Intelligence artificielle pour l'hygiène
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-red-600" />
                      Surveillance intelligente
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Les capteurs IoT ont détecté une température anormalement élevée dans la cuisine. Risque potentiel pour la conservation des aliments.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Détecté il y a 35 min</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Voir les détails
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-purple-600" />
                      Prédiction sanitaire
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Risque accru d'épidémie de gastro-entérite dans les 2 prochaines semaines basé sur les tendances régionales et les conditions météo.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 78%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Plan de prévention
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                    Recommandations d'amélioration
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Augmenter la fréquence de nettoyage des poignées de porte pendant la période à risque</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Installer des distributeurs de gel hydroalcoolique supplémentaires dans les zones communes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Organiser une campagne de sensibilisation au lavage des mains pour les élèves</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion de la sécurité</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Protocoles
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Signaler un risque
                  </button>
                </div>
              </div>

              {/* Équipements de sécurité */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Équipements de sécurité</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Équipement</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacement</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier contrôle</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prochain contrôle</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {safetyEquipment.map((equipment, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{equipment.type}</div>
                            <div className="text-sm text-gray-500">{equipment.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {equipment.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {equipment.lastCheck}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {equipment.nextCheck}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(equipment.status)}`}>
                              {equipment.status === 'operational' ? 'Opérationnel' : 
                               equipment.status === 'maintenance' ? 'En maintenance' : 'Hors service'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Vérifier</button>
                            <button className="text-gray-600 hover:text-gray-900">Historique</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Plans d'évacuation */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Flame className="w-5 h-5 mr-2 text-red-600" />
                    Exercices d'évacuation
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Exercice incendie</p>
                        <p className="text-sm text-gray-600">Dernier: 15/12/2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Temps: 3min 45s</p>
                        <p className="text-sm text-green-600">Prochain: 15/03/2024</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Confinement PPMS</p>
                        <p className="text-sm text-gray-600">Dernier: 10/11/2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Temps: 5min 20s</p>
                        <p className="text-sm text-amber-600">Prochain: 10/02/2024</p>
                      </div>
                    </div>
                    <button className="w-full mt-2 text-center py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                      Voir tous les exercices
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Formation sécurité
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Premiers secours</p>
                        <p className="text-sm text-gray-600">Personnel formé: 15/45</p>
                      </div>
                      <div className="text-right">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">33%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Manipulation extincteurs</p>
                        <p className="text-sm text-gray-600">Personnel formé: 28/45</p>
                      </div>
                      <div className="text-right">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">62%</p>
                      </div>
                    </div>
                    <button className="w-full mt-2 text-center py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                      Planifier une formation
                    </button>
                  </div>
                </div>
              </div>

              {/* IA pour la sécurité */}
              <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-6 border border-red-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-red-600" />
                  Intelligence artificielle pour la sécurité
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-purple-600" />
                      Analyse vidéo intelligente
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Le système a détecté un comportement inhabituel près de l'entrée principale à 14:35. Vérification recommandée.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 75%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Voir la vidéo
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-blue-600" />
                      Prédiction de risques
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Risque élevé de bousculades identifié à la sortie du bâtiment B aux heures de pointe. Optimisation des flux recommandée.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 89%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Plan d'action
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                    Recommandations de sécurité
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Réorganiser les horaires de sortie du bâtiment B pour réduire les flux simultanés</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Installer un éclairage supplémentaire dans la zone de stationnement des bus</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      <span>Renforcer la surveillance pendant les récréations dans la cour principale</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'environment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion environnementale</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Rapport
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle initiative
                  </button>
                </div>
              </div>

              {/* Consommation de ressources */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Consommation de ressources</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Électricité</h5>
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{environmentalData[0].electricity} kWh</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                        -5.6% vs mois précédent
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">3.4 kWh par élève</p>
                  </div>

                  <div className="bg-cyan-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Eau</h5>
                      <Droplet className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">{environmentalData[0].water} m³</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                        -8.6% vs mois précédent
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">0.26 m³ par élève</p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Déchets</h5>
                      <Trash2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{environmentalData[0].waste} kg</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                        -7.6% vs mois précédent
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Recyclé: {environmentalData[0].recycled} kg ({Math.round((environmentalData[0].recycled / environmentalData[0].waste) * 100)}%)</p>
                  </div>
                </div>
              </div>

              {/* Empreinte carbone */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-600" />
                  Empreinte carbone
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Émissions CO₂</h5>
                      <p className="text-2xl font-bold text-green-600">{environmentalData[0].co2} tonnes</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Électricité</span>
                          <span className="font-medium">1.7 tonnes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Transport</span>
                          <span className="font-medium">0.8 tonnes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Chauffage</span>
                          <span className="font-medium">0.3 tonnes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Objectifs de réduction</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Objectif annuel</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vs année précédente</span>
                        <span className="text-sm text-green-600 font-medium">-12.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Projection fin d'année</span>
                        <span className="text-sm text-blue-600 font-medium">-15.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Initiatives environnementales */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Initiatives environnementales</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                      <h5 className="font-medium text-gray-900">Jardin pédagogique</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Création d'un jardin potager éducatif pour sensibiliser les élèves à l'agriculture durable.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Démarré: 01/10/2023</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        En cours
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Droplet className="w-5 h-5 text-blue-600" />
                      </div>
                      <h5 className="font-medium text-gray-900">Récupération eau de pluie</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Installation de systèmes de récupération d'eau de pluie pour l'arrosage des espaces verts.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Démarré: 15/11/2023</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        En cours
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <Trash2 className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h5 className="font-medium text-gray-900">Tri sélectif</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Mise en place d'un système complet de tri sélectif avec sensibilisation des élèves.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Démarré: 05/09/2023</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Terminé
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* IA pour l'environnement */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-green-600" />
                  Intelligence artificielle pour l'environnement
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-amber-600" />
                      Optimisation énergétique
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      L'IA a identifié un potentiel d'économie de 15% sur la consommation électrique en optimisant l'éclairage et la climatisation.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Économie estimée: 640€/mois</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Plan d'action
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Droplet className="w-4 h-4 mr-2 text-blue-600" />
                      Gestion de l'eau
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Détection d'une consommation d'eau anormale pendant les week-ends. Possible fuite dans le système d'irrigation.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 91%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Voir l'analyse
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-600" />
                    Objectifs environnementaux IA
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Réduction consommation électrique</span>
                        <span className="font-medium text-green-600">-15% d'ici fin 2024</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Progression: 45%</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Réduction consommation d'eau</span>
                        <span className="font-medium text-blue-600">-20% d'ici fin 2024</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Progression: 35%</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Augmentation taux de recyclage</span>
                        <span className="font-medium text-amber-600">75% d'ici fin 2024</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Progression: 60%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des incidents</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un incident..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel incident
                  </button>
                </div>
              </div>

              {/* Liste des incidents */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Incidents récents</h4>
                <div className="space-y-4">
                  {incidents.map((incident, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${
                            incident.category === 'Sécurité' ? 'bg-red-100 text-red-600' :
                            incident.category === 'Hygiène' ? 'bg-blue-100 text-blue-600' :
                            incident.category === 'Qualité' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h5 className="text-lg font-medium text-gray-900 mr-2">{incident.title}</h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(incident.priority)}`}>
                                {incident.priority === 'high' ? 'Priorité haute' : 
                                 incident.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{incident.category} • {incident.location}</p>
                            <p className="text-sm text-gray-500 mt-1">Signalé par {incident.reportedBy} le {incident.reportDate}</p>
                            {incident.resolution && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                <span className="font-medium">Résolution:</span> {incident.resolution}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {incident.status === 'resolved' ? 'Résolu' : 
                             incident.status === 'in-progress' ? 'En cours' : 'En attente'}
                          </span>
                          <div className="flex space-x-2 mt-3">
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistiques d'incidents */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                    Répartition par catégorie
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Répartition des incidents par catégorie</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Sécurité
                          </span>
                          <span>45%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            Hygiène
                          </span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            Qualité
                          </span>
                          <span>15%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Environnement
                          </span>
                          <span>10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-purple-600" />
                    Évolution mensuelle
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Évolution du nombre d'incidents</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Novembre 2023</span>
                          <span className="font-medium">18 incidents</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Décembre 2023</span>
                          <span className="font-medium">16 incidents</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Janvier 2024</span>
                          <span className="font-medium">12 incidents</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Tendance</span>
                          <span>-33% sur 3 mois</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des audits</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Planning
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel audit
                  </button>
                </div>
              </div>

              {/* Liste des audits */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Audits récents et planifiés</h4>
                <div className="space-y-4">
                  {audits.map((audit, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${
                            audit.type === 'Interne' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            <Clipboard className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h5 className="text-lg font-medium text-gray-900 mr-2">{audit.title}</h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                audit.type === 'Interne' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {audit.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Date: {audit.date} • Auditeur: {audit.auditor}</p>
                            {audit.status === 'completed' && (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">Score</p>
                                  <p className="text-sm font-medium text-gray-900">{audit.score}%</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">Non-conformités</p>
                                  <p className="text-sm font-medium text-gray-900">{audit.majorNonConformities} maj. / {audit.minorNonConformities} min.</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">Rapport</p>
                                  <button className="text-sm text-blue-600 hover:text-blue-800">
                                    Télécharger
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                            {audit.status === 'completed' ? 'Terminé' : 
                             audit.status === 'scheduled' ? 'Planifié' : 'Annulé'}
                          </span>
                          <div className="flex space-x-2 mt-3">
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistiques d'audit */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Performance par domaine
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Qualité</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Hygiène</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Sécurité</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Environnement</span>
                        <span className="font-medium">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Évolution des scores d'audit
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Évolution des scores d'audit sur 12 mois</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>T1 2023</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>T2 2023</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>T3 2023</span>
                          <span className="font-medium">88%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>T4 2023</span>
                          <span className="font-medium">92%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Intelligence Artificielle QHSE</h3>
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Actualiser l'analyse IA
                </button>
              </div>

              {/* Insights IA */}
              <div className="grid gap-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        insight.category === 'Environnement' ? 'bg-green-100 text-green-600' :
                        insight.category === 'Hygiène' ? 'bg-blue-100 text-blue-600' :
                        insight.category === 'Sécurité' ? 'bg-red-100 text-red-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <Brain className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900 mr-2">{insight.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                            {insight.impact === 'high' ? 'Impact élevé' : 
                             insight.impact === 'medium' ? 'Impact moyen' : 'Impact faible'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{insight.description}</p>
                        <div className="bg-white p-4 rounded-lg border border-purple-100">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                            Recommandation IA
                          </h5>
                          <p className="text-gray-700">{insight.recommendation}</p>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Confiance:</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${insight.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-purple-600">{insight.confidence}%</span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
                              Analyser
                            </button>
                            <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                              Appliquer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assistant IA */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  Assistant virtuel QHSE
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-3xl">
                      <p className="text-gray-700">
                        Bonjour ! Je suis votre assistant QHSE intelligent. Je peux vous aider à analyser les données, identifier les risques et proposer des améliorations. Que puis-je faire pour vous aujourd'hui ?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg shadow-sm max-w-3xl">
                      <p className="text-gray-700">
                        Quels sont les principaux risques identifiés ce mois-ci ?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-3xl">
                      <p className="text-gray-700 mb-2">
                        Basé sur mon analyse des données de janvier 2024, j'ai identifié 3 risques principaux :
                      </p>
                      <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                        <li>Risque de pénurie d'eau dans les 2 prochaines semaines (confiance: 85%)</li>
                        <li>Risque d'épidémie grippale dans les 3 prochaines semaines (confiance: 78%)</li>
                        <li>Risque de bousculades à la sortie du bâtiment B aux heures de pointe (confiance: 89%)</li>
                      </ol>
                      <p className="text-gray-700 mt-2">
                        Souhaitez-vous que je vous propose un plan d'action pour l'un de ces risques ?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Posez une question à l'assistant IA..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tableau de bord prédictif */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  Tableau de bord prédictif
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-red-600" />
                      Prévision climatique
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Prévision de fortes chaleurs dans les 2 prochaines semaines. Impact potentiel sur le confort des élèves.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 85%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Plan d'adaptation
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      Absentéisme prévu
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Pic d'absentéisme prévu pour la semaine du 5 février en raison des tendances épidémiques régionales.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 78%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Mesures préventives
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                      Consommation énergétique
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Prévision de pic de consommation électrique pour février. Recommandation d'optimisation des plages horaires.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Confiance: 91%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Plan d'économie
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-600" />
                    Objectifs QHSE prédictifs
                  </h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Basé sur l'analyse des tendances actuelles, l'IA prédit les résultats suivants pour la fin du trimestre :
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Réduction des incidents de 35%</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Amélioration du score d'audit de 5 points</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Économie d'énergie de 12%</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Pour atteindre ces objectifs, l'IA recommande les actions suivantes :
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Renforcer les contrôles de sécurité hebdomadaires</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Mettre en place une campagne de sensibilisation à l'hygiène</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Optimiser les plages d'utilisation des équipements énergivores</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QHSE;