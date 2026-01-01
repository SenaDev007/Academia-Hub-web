import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  Shield,
  BookOpen,
  Clock,
  Wrench,
  Eye,
  Edit,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { EquipmentModal } from '../modals';

const Laboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const labStats = [
    {
      title: 'Équipements actifs',
      value: '247',
      change: '+12',
      icon: FlaskConical,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Séances planifiées',
      value: '156',
      change: '+8',
      icon: Calendar,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Maintenances dues',
      value: '23',
      change: '-5',
      icon: Wrench,
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      title: 'Taux d\'utilisation',
      value: '87.5%',
      change: '+3.2%',
      icon: Activity,
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const equipment = [
    {
      id: 'LAB-2024-00001',
      name: 'Microscope optique Zeiss',
      category: 'Optique',
      location: 'Labo SVT - Paillasse 1',
      status: 'operational',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      acquisitionDate: '2023-09-15',
      value: 2500,
      utilization: 85,
      reservations: 3
    },
    {
      id: 'LAB-2024-00002',
      name: 'Balance de précision Sartorius',
      category: 'Mesure',
      location: 'Labo Chimie - Paillasse 3',
      status: 'maintenance',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-01-20',
      acquisitionDate: '2023-08-20',
      value: 1800,
      utilization: 92,
      reservations: 0
    },
    {
      id: 'LAB-2024-00003',
      name: 'Spectrophotomètre UV-Vis',
      category: 'Analyse',
      location: 'Labo Physique - Armoire A',
      status: 'operational',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-07-05',
      acquisitionDate: '2023-10-12',
      value: 4200,
      utilization: 78,
      reservations: 5
    }
  ];

  const sessions = [
    {
      id: 'TP-2024-00045',
      title: 'TP Chimie Organique - Synthèse',
      class: 'Terminale S',
      teacher: 'M. Dubois',
      date: '2024-01-22',
      time: '14:00-16:00',
      laboratory: 'Labo Chimie',
      students: 15,
      equipment: ['Balance de précision', 'Hotte aspirante', 'Verrerie'],
      status: 'scheduled',
      safetyLevel: 'medium'
    },
    {
      id: 'TP-2024-00046',
      title: 'Observation cellulaire',
      class: '2nde A',
      teacher: 'Mme Martin',
      date: '2024-01-23',
      time: '10:00-11:00',
      laboratory: 'Labo SVT',
      students: 20,
      equipment: ['Microscopes optiques', 'Lames préparées'],
      status: 'scheduled',
      safetyLevel: 'low'
    },
    {
      id: 'TP-2024-00047',
      title: 'Optique géométrique',
      class: '1ère S',
      teacher: 'M. Laurent',
      date: '2024-01-24',
      time: '08:00-10:00',
      laboratory: 'Labo Physique',
      students: 18,
      equipment: ['Banc d\'optique', 'Lentilles', 'Sources lumineuses'],
      status: 'in-progress',
      safetyLevel: 'low'
    }
  ];

  const safetyProtocols = [
    {
      id: 'PROT-001',
      title: 'Manipulation produits chimiques',
      category: 'Chimie',
      level: 'high',
      lastUpdate: '2024-01-10',
      compliance: 98,
      trainedPersonnel: 12
    },
    {
      id: 'PROT-002',
      title: 'Utilisation équipements électriques',
      category: 'Physique',
      level: 'medium',
      lastUpdate: '2024-01-08',
      compliance: 95,
      trainedPersonnel: 15
    },
    {
      id: 'PROT-003',
      title: 'Manipulation échantillons biologiques',
      category: 'SVT',
      level: 'medium',
      lastUpdate: '2024-01-12',
      compliance: 100,
      trainedPersonnel: 8
    }
  ];

  const evaluations = [
    {
      id: 'EVAL-2024-001',
      title: 'TP Chimie - Dosage acide-base',
      class: 'Terminale S',
      date: '2024-01-20',
      students: 15,
      averageScore: 14.5,
      completionRate: 100,
      skillsAssessed: ['Manipulation', 'Calculs', 'Analyse']
    },
    {
      id: 'EVAL-2024-002',
      title: 'TP SVT - Observation mitose',
      class: '1ère S',
      date: '2024-01-18',
      students: 18,
      averageScore: 13.2,
      completionRate: 94,
      skillsAssessed: ['Observation', 'Schématisation', 'Interprétation']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewEquipment = () => {
    setIsEditMode(false);
    setSelectedEquipment(null);
    setIsEquipmentModalOpen(true);
  };

  const handleEditEquipment = (equipment: any) => {
    setIsEditMode(true);
    setSelectedEquipment(equipment);
    setIsEquipmentModalOpen(true);
  };

  const handleSaveEquipment = (equipmentData: any) => {
    console.log('Saving equipment:', equipmentData);
    setIsEquipmentModalOpen(false);
    // Ici, vous implémenteriez la logique pour sauvegarder l'équipement
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratoire & Équipements</h1>
          <p className="text-gray-600">Gestion intelligente des équipements et sécurité</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Shield className="w-4 h-4 mr-2" />
            Protocoles sécurité
          </button>
          <button 
            onClick={handleNewEquipment}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel équipement
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {labStats.map((stat, index) => {
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
              { id: 'equipment', label: 'Équipements', icon: FlaskConical },
              { id: 'sessions', label: 'Séances TP', icon: Calendar },
              { id: 'safety', label: 'Sécurité', icon: Shield },
              { id: 'evaluations', label: 'Évaluations TP', icon: Award },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Inventaire des équipements</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher équipement..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {equipment.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.category} • {item.id}</p>
                          <p className="text-sm text-gray-500">{item.location}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status === 'operational' ? 'Opérationnel' : 
                             item.status === 'maintenance' ? 'Maintenance' : 'Hors service'}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Utilisation</p>
                          <p className="text-lg font-bold text-blue-600">{item.utilization}%</p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.utilization}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Réservations</p>
                          <p className="text-lg font-bold text-green-600">{item.reservations}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Prochaine maintenance</p>
                          <p className="text-sm font-medium text-gray-900">{item.nextMaintenance}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEquipment(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Planning des séances TP</h3>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle séance
                </button>
              </div>

              <div className="grid gap-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-600">{session.class} • {session.teacher}</p>
                          <p className="text-sm text-gray-500">{session.date} • {session.time} • {session.laboratory}</p>
                          <p className="text-sm text-gray-500">Équipements: {session.equipment.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Élèves</p>
                            <p className="text-lg font-bold text-blue-600">{session.students}</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Sécurité</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSafetyLevelColor(session.safetyLevel)}`}>
                              {session.safetyLevel === 'low' ? 'Faible' : 
                               session.safetyLevel === 'medium' ? 'Moyen' : 'Élevé'}
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Statut</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                              {session.status === 'scheduled' ? 'Planifié' : 
                               session.status === 'in-progress' ? 'En cours' : 
                               session.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Modifier
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                            Démarrer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Protocoles de sécurité</h3>
                <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Nouveau protocole
                </button>
              </div>

              <div className="grid gap-4">
                {safetyProtocols.map((protocol) => (
                  <div key={protocol.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{protocol.title}</h4>
                          <p className="text-sm text-gray-600">{protocol.category} • {protocol.id}</p>
                          <p className="text-sm text-gray-500">Dernière mise à jour: {protocol.lastUpdate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Niveau</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSafetyLevelColor(protocol.level)}`}>
                            {protocol.level === 'low' ? 'Faible' : 
                             protocol.level === 'medium' ? 'Moyen' : 'Élevé'}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Conformité</p>
                          <p className="text-lg font-bold text-green-600">{protocol.compliance}%</p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${protocol.compliance}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Personnel formé</p>
                          <p className="text-lg font-bold text-blue-600">{protocol.trainedPersonnel}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                          Voir protocole
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Former personnel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-6 border border-yellow-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Registre de sécurité</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Inspections</h5>
                    <p className="text-sm text-gray-600">Dernière: 15/01/2024</p>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Incidents</h5>
                    <p className="text-sm text-gray-600">0 ce mois</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Formations</h5>
                    <p className="text-sm text-gray-600">35 personnes formées</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Évaluations pratiques</h3>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Award className="w-4 h-4 mr-2" />
                  Nouvelle évaluation
                </button>
              </div>

              <div className="grid gap-4">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{evaluation.title}</h4>
                          <p className="text-sm text-gray-600">{evaluation.class} • {evaluation.date}</p>
                          <p className="text-sm text-gray-500">Compétences: {evaluation.skillsAssessed.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Élèves</p>
                          <p className="text-lg font-bold text-blue-600">{evaluation.students}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Moyenne</p>
                          <p className="text-lg font-bold text-green-600">{evaluation.averageScore}/20</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Taux de réussite</p>
                          <p className="text-lg font-bold text-purple-600">{evaluation.completionRate}%</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                          Voir résultats
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Exporter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Planification maintenance</h3>
                <button className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  <Wrench className="w-4 h-4 mr-2" />
                  Planifier maintenance
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Maintenances dues</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">Balance de précision</p>
                        <p className="text-sm text-gray-600">Calibrage requis</p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Urgent
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">Microscope Zeiss #3</p>
                        <p className="text-sm text-gray-600">Nettoyage optique</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Cette semaine
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Maintenance préventive</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Équipements sous contrat</span>
                      <span className="font-bold">156/247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interventions ce mois</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de disponibilité</span>
                      <span className="font-bold text-green-600">96.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Analytics du laboratoire</h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Utilisation équipements</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Microscopes</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Balances</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Spectrophotomètres</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-purple-600 h-2 rounded-full w-3/5"></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance TP</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">14.2/20</p>
                      <p className="text-sm text-gray-600">Moyenne générale TP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">96%</p>
                      <p className="text-sm text-gray-600">Taux de réussite</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">156</p>
                      <p className="text-sm text-gray-600">Séances ce mois</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Sécurité</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">0 incident ce mois</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">100% conformité protocoles</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">35 personnes formées</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSave={handleSaveEquipment}
        equipment={selectedEquipment}
        isEdit={isEditMode}
      />
    </div>
  );
};

export default Laboratory;