import React, { useState } from 'react';
import { 
  Bus, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Fuel,
  Wrench,
  Eye,
  Edit,
  Download,
  Navigation,
  Phone,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  Shield,
  Route,
  UserCheck
} from 'lucide-react';
import { VehicleModal } from '../modals';

const Transport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fleet');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const transportStats = [
    {
      title: 'Véhicules actifs',
      value: '24',
      change: '+2',
      icon: Bus,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Élèves transportés',
      value: '1,247',
      change: '+45',
      icon: Users,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Circuits actifs',
      value: '18',
      change: '+1',
      icon: Route,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Taux de ponctualité',
      value: '96.8%',
      change: '+1.2%',
      icon: Clock,
      color: 'from-orange-600 to-orange-700'
    }
  ];

  const vehicles = [
    {
      id: 'BUS-2024-001',
      registration: 'AB-123-CD',
      model: 'Mercedes Sprinter',
      capacity: 25,
      driver: 'Jean Dubois',
      route: 'Circuit Nord',
      status: 'active',
      location: 'École - Parking',
      fuel: 85,
      mileage: 45230,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      students: 23
    },
    {
      id: 'BUS-2024-002',
      registration: 'EF-456-GH',
      model: 'Iveco Daily',
      capacity: 30,
      driver: 'Marie Martin',
      route: 'Circuit Sud',
      status: 'maintenance',
      location: 'Garage municipal',
      fuel: 0,
      mileage: 38750,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-01-20',
      students: 0
    },
    {
      id: 'BUS-2024-003',
      registration: 'IJ-789-KL',
      model: 'Renault Master',
      capacity: 20,
      driver: 'Pierre Laurent',
      route: 'Circuit Est',
      status: 'active',
      location: 'En route - Arrêt 5',
      fuel: 62,
      mileage: 52100,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-07-08',
      students: 18
    }
  ];

  const routes = [
    {
      id: 'CIRCUIT-001',
      name: 'Circuit Nord',
      vehicle: 'BUS-2024-001',
      driver: 'Jean Dubois',
      stops: 8,
      distance: 25.5,
      duration: '45 min',
      students: 23,
      schedule: '07:30 - 08:15',
      status: 'active'
    },
    {
      id: 'CIRCUIT-002',
      name: 'Circuit Sud',
      vehicle: 'BUS-2024-002',
      driver: 'Marie Martin',
      stops: 12,
      distance: 32.8,
      duration: '55 min',
      students: 28,
      schedule: '07:15 - 08:10',
      status: 'suspended'
    },
    {
      id: 'CIRCUIT-003',
      name: 'Circuit Est',
      vehicle: 'BUS-2024-003',
      driver: 'Pierre Laurent',
      stops: 6,
      distance: 18.2,
      duration: '35 min',
      students: 18,
      schedule: '07:45 - 08:20',
      status: 'active'
    }
  ];

  const drivers = [
    {
      id: 'DRV-2024-001',
      name: 'Jean Dubois',
      license: 'D1234567890',
      phone: '06 12 34 56 78',
      vehicle: 'BUS-2024-001',
      route: 'Circuit Nord',
      experience: '8 ans',
      status: 'active',
      lastTraining: '2024-01-05',
      nextMedical: '2024-06-15'
    },
    {
      id: 'DRV-2024-002',
      name: 'Marie Martin',
      license: 'D0987654321',
      phone: '06 98 76 54 32',
      vehicle: 'BUS-2024-002',
      route: 'Circuit Sud',
      experience: '5 ans',
      status: 'unavailable',
      lastTraining: '2024-01-10',
      nextMedical: '2024-08-20'
    },
    {
      id: 'DRV-2024-003',
      name: 'Pierre Laurent',
      license: 'D1122334455',
      phone: '06 55 66 77 88',
      vehicle: 'BUS-2024-003',
      route: 'Circuit Est',
      experience: '12 ans',
      status: 'active',
      lastTraining: '2023-12-15',
      nextMedical: '2024-04-10'
    }
  ];

  const subscriptions = [
    {
      id: 'SUB-2024-001',
      studentName: 'Marie Dubois',
      class: '3ème A',
      route: 'Circuit Nord',
      stop: 'Arrêt Mairie',
      monthlyFee: 45,
      status: 'active',
      paymentStatus: 'paid',
      parentPhone: '06 11 22 33 44'
    },
    {
      id: 'SUB-2024-002',
      studentName: 'Pierre Martin',
      class: '2nde B',
      route: 'Circuit Sud',
      stop: 'Arrêt Église',
      monthlyFee: 50,
      status: 'active',
      paymentStatus: 'pending',
      parentPhone: '06 55 66 77 88'
    },
    {
      id: 'SUB-2024-003',
      studentName: 'Sophie Lambert',
      class: '1ère C',
      route: 'Circuit Est',
      stop: 'Arrêt Centre',
      monthlyFee: 40,
      status: 'suspended',
      paymentStatus: 'overdue',
      parentPhone: '06 99 88 77 66'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFuelColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleNewVehicle = () => {
    setIsEditMode(false);
    setSelectedVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setIsEditMode(true);
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (vehicleData: any) => {
    console.log('Saving vehicle:', vehicleData);
    setIsVehicleModalOpen(false);
    // Ici, vous implémenteriez la logique pour sauvegarder le véhicule
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Scolaire</h1>
          <p className="text-gray-600">Gestion de flotte et optimisation des trajets</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Navigation className="w-4 h-4 mr-2" />
            Suivi temps réel
          </button>
          <button 
            onClick={handleNewVehicle}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau véhicule
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {transportStats.map((stat, index) => {
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
              { id: 'fleet', label: 'Flotte', icon: Bus },
              { id: 'routes', label: 'Circuits', icon: Route },
              { id: 'drivers', label: 'Chauffeurs', icon: UserCheck },
              { id: 'subscriptions', label: 'Abonnements', icon: Users },
              { id: 'tracking', label: 'Suivi temps réel', icon: Navigation },
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
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion de la flotte</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher véhicule..."
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
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Bus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{vehicle.model}</h4>
                          <p className="text-sm text-gray-600">{vehicle.registration} • {vehicle.id}</p>
                          <p className="text-sm text-gray-500">Chauffeur: {vehicle.driver} • Circuit: {vehicle.route}</p>
                          <p className="text-sm text-gray-500">Localisation: {vehicle.location}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status === 'active' ? 'Actif' : 
                             vehicle.status === 'maintenance' ? 'Maintenance' : 'Hors service'}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Carburant</p>
                          <p className={`text-lg font-bold ${getFuelColor(vehicle.fuel)}`}>{vehicle.fuel}%</p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${vehicle.fuel > 50 ? 'bg-green-600' : vehicle.fuel > 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
                              style={{ width: `${vehicle.fuel}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Occupation</p>
                          <p className="text-lg font-bold text-blue-600">{vehicle.students}/{vehicle.capacity}</p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(vehicle.students / vehicle.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Kilométrage</p>
                          <p className="text-lg font-bold text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditVehicle(vehicle)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                          <Navigation className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Optimisation des circuits</h3>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Route className="w-4 h-4 mr-2" />
                  Nouveau circuit
                </button>
              </div>

              <div className="grid gap-4">
                {routes.map((route) => (
                  <div key={route.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <Route className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{route.name}</h4>
                          <p className="text-sm text-gray-600">Véhicule: {route.vehicle} • Chauffeur: {route.driver}</p>
                          <p className="text-sm text-gray-500">Horaires: {route.schedule}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Arrêts</p>
                          <p className="text-lg font-bold text-purple-600">{route.stops}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="text-lg font-bold text-blue-600">{route.distance} km</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Durée</p>
                          <p className="text-lg font-bold text-green-600">{route.duration}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Élèves</p>
                          <p className="text-lg font-bold text-orange-600">{route.students}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                          {route.status === 'active' ? 'Actif' : 'Suspendu'}
                        </span>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                            Optimiser
                          </button>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Carte
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des chauffeurs</h3>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Nouveau chauffeur
                </button>
              </div>

              <div className="grid gap-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{driver.name}</h4>
                          <p className="text-sm text-gray-600">Permis: {driver.license}</p>
                          <p className="text-sm text-gray-500">Téléphone: {driver.phone}</p>
                          <p className="text-sm text-gray-500">Véhicule: {driver.vehicle} • Circuit: {driver.route}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Expérience</p>
                          <p className="text-lg font-bold text-blue-600">{driver.experience}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Dernière formation</p>
                          <p className="text-sm font-medium text-gray-900">{driver.lastTraining}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Visite médicale</p>
                          <p className="text-sm font-medium text-gray-900">{driver.nextMedical}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                          {driver.status === 'active' ? 'Actif' : 'Indisponible'}
                        </span>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Contacter
                          </button>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Planning
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Abonnements transport</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Facturation
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel abonnement
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{subscription.studentName}</h4>
                          <p className="text-sm text-gray-600">{subscription.class} • {subscription.route}</p>
                          <p className="text-sm text-gray-500">Arrêt: {subscription.stop}</p>
                          <p className="text-sm text-gray-500">Contact: {subscription.parentPhone}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tarif mensuel</p>
                        <p className="text-xl font-bold text-orange-600">€{subscription.monthlyFee}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status === 'active' ? 'Actif' : 'Suspendu'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(subscription.paymentStatus)}`}>
                            {subscription.paymentStatus === 'paid' ? 'Payé' : 
                             subscription.paymentStatus === 'pending' ? 'En attente' : 'En retard'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200">
                            Facturer
                          </button>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Suivi temps réel</h3>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Navigation className="w-4 h-4 mr-2" />
                  Actualiser positions
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Carte en temps réel</h4>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Carte interactive avec positions des véhicules</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            BUS-2024-001
                          </span>
                          <span>En route - Arrêt 3/8</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            BUS-2024-002
                          </span>
                          <span>Garage - Maintenance</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            BUS-2024-003
                          </span>
                          <span>En route - Arrêt 5/6</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Alertes en cours</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Retard Circuit Nord</p>
                          <p className="text-xs text-gray-600">5 minutes de retard - Embouteillage</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Véhicule en panne</p>
                          <p className="text-xs text-gray-600">BUS-2024-002 - Problème moteur</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Notifications parents</h4>
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Notifier retard Circuit Nord
                      </button>
                      <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        Confirmer arrivée à l'école
                      </button>
                      <button className="w-full px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">
                        Alerte changement d'horaire
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Maintenance préventive</h3>
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
                        <p className="font-medium">BUS-2024-002</p>
                        <p className="text-sm text-gray-600">Calibrage requis</p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Urgent
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">BUS-2024-001</p>
                        <p className="text-sm text-gray-600">Contrôle technique</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Cette semaine
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Statistiques maintenance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coût mensuel</span>
                      <span className="font-bold">€2,340</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interventions ce mois</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de disponibilité</span>
                      <span className="font-bold text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prochaine révision</span>
                      <span className="font-bold">BUS-2024-003</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Analytics transport</h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance flotte</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">96.8%</p>
                      <p className="text-sm text-gray-600">Taux de ponctualité</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">94.2%</p>
                      <p className="text-sm text-gray-600">Disponibilité véhicules</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">87.5%</p>
                      <p className="text-sm text-gray-600">Taux d'occupation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Consommation</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Carburant mensuel</span>
                      <span className="font-bold">2,450L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Coût carburant</span>
                      <span className="font-bold">€3,675</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Consommation moyenne</span>
                      <span className="font-bold">12.5L/100km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Économies réalisées</span>
                      <span className="font-bold text-green-600">€450</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Satisfaction</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Note moyenne parents</p>
                      <p className="text-2xl font-bold text-blue-600">4.6/5</p>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Incidents ce mois</p>
                      <p className="text-2xl font-bold text-green-600">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
        isEdit={isEditMode}
        drivers={drivers.map(driver => ({ id: driver.id, name: driver.name }))}
      />
    </div>
  );
};

export default Transport;