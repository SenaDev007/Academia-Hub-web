import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  Heart,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Leaf,
  Award,
  Eye,
  Edit,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { MenuModal } from '../modals';

const Cafeteria: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menus');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const cafeteriaStats = [
    {
      title: 'Repas servis/jour',
      value: '1,247',
      change: '+45',
      icon: UtensilsCrossed,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Taux de fréquentation',
      value: '87.5%',
      change: '+3.2%',
      icon: Users,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Revenus mensuels',
      value: '€45,230',
      change: '+8%',
      icon: DollarSign,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Note satisfaction',
      value: '4.2/5',
      change: '+0.3',
      icon: Award,
      color: 'from-orange-600 to-orange-700'
    }
  ];

  const menus = [
    {
      id: 'MENU-2024-01-22-001',
      date: '2024-01-22',
      type: 'Déjeuner',
      starter: 'Salade de crudités',
      main: 'Poulet rôti aux herbes',
      side: 'Riz pilaf',
      dessert: 'Yaourt aux fruits',
      nutritionalScore: 'A',
      allergens: ['Gluten', 'Lactose'],
      cost: 4.50,
      reservations: 1156,
      status: 'confirmed'
    },
    {
      id: 'MENU-2024-01-23-001',
      date: '2024-01-23',
      type: 'Déjeuner',
      starter: 'Potage de légumes',
      main: 'Poisson grillé',
      side: 'Haricots verts',
      dessert: 'Compote de pommes',
      nutritionalScore: 'A',
      allergens: ['Poisson'],
      cost: 4.20,
      reservations: 1089,
      status: 'planned'
    },
    {
      id: 'MENU-2024-01-24-001',
      date: '2024-01-24',
      type: 'Déjeuner',
      starter: 'Salade verte',
      main: 'Bœuf bourguignon',
      side: 'Purée de pommes de terre',
      dessert: 'Tarte aux fruits',
      nutritionalScore: 'B',
      allergens: ['Gluten', 'Lactose', 'Œufs'],
      cost: 4.80,
      reservations: 1203,
      status: 'planned'
    }
  ];

  const allergies = [
    {
      studentName: 'Marie Dubois',
      class: '3ème A',
      allergies: ['Arachides', 'Fruits à coque'],
      severity: 'high',
      alternativeMenu: 'Menu sans allergènes',
      parentContact: '06 12 34 56 78',
      medicalCertificate: 'Valide'
    },
    {
      studentName: 'Pierre Martin',
      class: '2nde B',
      allergies: ['Lactose'],
      severity: 'medium',
      alternativeMenu: 'Menu sans lactose',
      parentContact: '06 98 76 54 32',
      medicalCertificate: 'Valide'
    },
    {
      studentName: 'Sophie Lambert',
      class: '1ère C',
      allergies: ['Gluten'],
      severity: 'medium',
      alternativeMenu: 'Menu sans gluten',
      parentContact: '06 55 66 77 88',
      medicalCertificate: 'À renouveler'
    }
  ];

  const inventory = [
    {
      id: 'STOCK-001',
      product: 'Poulet fermier',
      category: 'Viandes',
      quantity: 45,
      unit: 'kg',
      expiryDate: '2024-01-25',
      supplier: 'Ferme Dubois',
      cost: 8.50,
      status: 'good',
      minStock: 20
    },
    {
      id: 'STOCK-002',
      product: 'Pommes de terre',
      category: 'Légumes',
      quantity: 120,
      unit: 'kg',
      expiryDate: '2024-02-15',
      supplier: 'Maraîcher Local',
      cost: 1.20,
      status: 'good',
      minStock: 50
    },
    {
      id: 'STOCK-003',
      product: 'Lait entier',
      category: 'Produits laitiers',
      quantity: 8,
      unit: 'L',
      expiryDate: '2024-01-24',
      supplier: 'Laiterie Martin',
      cost: 1.80,
      status: 'expiring',
      minStock: 20
    }
  ];

  const payments = [
    {
      id: 'PAY-2024-001',
      studentName: 'Marie Dubois',
      class: '3ème A',
      paymentMethod: 'Carte prépayée',
      balance: 45.50,
      lastTransaction: '2024-01-20',
      monthlySpent: 89.50,
      status: 'active'
    },
    {
      id: 'PAY-2024-002',
      studentName: 'Pierre Martin',
      class: '2nde B',
      paymentMethod: 'Tickets restaurant',
      balance: 12.00,
      lastTransaction: '2024-01-19',
      monthlySpent: 76.00,
      status: 'low-balance'
    },
    {
      id: 'PAY-2024-003',
      studentName: 'Sophie Lambert',
      class: '1ère C',
      paymentMethod: 'Paiement mensuel',
      balance: 0.00,
      lastTransaction: '2024-01-15',
      monthlySpent: 95.50,
      status: 'monthly'
    }
  ];

  const waste = [
    {
      date: '2024-01-20',
      totalServed: 1156,
      totalWaste: 23.5,
      wastePercentage: 2.0,
      categories: {
        starter: 5.2,
        main: 12.8,
        side: 3.1,
        dessert: 2.4
      },
      cost: 47.50
    },
    {
      date: '2024-01-19',
      totalServed: 1089,
      totalWaste: 28.7,
      wastePercentage: 2.6,
      categories: {
        starter: 6.8,
        main: 15.2,
        side: 4.3,
        dessert: 2.4
      },
      cost: 58.20
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'low-balance': return 'bg-yellow-100 text-yellow-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNutritionalScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewMenu = () => {
    setIsEditMode(false);
    setSelectedMenu(null);
    setIsMenuModalOpen(true);
  };

  const handleEditMenu = (menu: any) => {
    setIsEditMode(true);
    setSelectedMenu(menu);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = (menuData: any) => {
    console.log('Saving menu:', menuData);
    // Ici, vous implémenteriez la logique pour sauvegarder le menu
    setIsMenuModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cantine & Restauration</h1>
          <p className="text-gray-600">Gestion nutritionnelle et opérationnelle</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Heart className="w-4 h-4 mr-2" />
            Équilibre nutritionnel
          </button>
          <button 
            onClick={handleNewMenu}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau menu
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cafeteriaStats.map((stat, index) => {
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
              { id: 'menus', label: 'Planification menus', icon: UtensilsCrossed },
              { id: 'allergies', label: 'Allergies & Régimes', icon: Heart },
              { id: 'inventory', label: 'Stocks & Commandes', icon: ShoppingCart },
              { id: 'payments', label: 'Paiements', icon: DollarSign },
              { id: 'waste', label: 'Gestion déchets', icon: Leaf },
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
          {activeTab === 'menus' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Planification des menus</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendrier
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {menus.map((menu) => (
                  <div key={menu.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{menu.type} - {menu.date}</h4>
                          <p className="text-sm text-gray-600">{menu.id}</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Entrée: <span className="text-gray-700">{menu.starter}</span></p>
                              <p className="text-gray-500">Plat: <span className="text-gray-700">{menu.main}</span></p>
                            </div>
                            <div>
                              <p className="text-gray-500">Accompagnement: <span className="text-gray-700">{menu.side}</span></p>
                              <p className="text-gray-500">Dessert: <span className="text-gray-700">{menu.dessert}</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Score nutritionnel</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNutritionalScoreColor(menu.nutritionalScore)}`}>
                            Nutri-Score {menu.nutritionalScore}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Coût</p>
                          <p className="text-lg font-bold text-green-600">€{menu.cost}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Réservations</p>
                          <p className="text-lg font-bold text-blue-600">{menu.reservations}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(menu.status)}`}>
                            {menu.status === 'confirmed' ? 'Confirmé' : 'Planifié'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Allergènes: {menu.allergens.join(', ')}</p>
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditMenu(menu)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
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
          )}

          {activeTab === 'allergies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des allergies et régimes spéciaux</h3>
                <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Heart className="w-4 h-4 mr-2" />
                  Nouvelle allergie
                </button>
              </div>

              <div className="grid gap-4">
                {allergies.map((allergy, index) => (
                  <div key={index} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{allergy.studentName}</h4>
                          <p className="text-sm text-gray-600">{allergy.class}</p>
                          <p className="text-sm text-gray-500">Allergies: {allergy.allergies.join(', ')}</p>
                          <p className="text-sm text-gray-500">Menu alternatif: {allergy.alternativeMenu}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Sévérité</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
                          {allergy.severity === 'high' ? 'Élevée' : 
                           allergy.severity === 'medium' ? 'Modérée' : 'Faible'}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Contact: {allergy.parentContact}</p>
                        <p className="text-sm text-gray-500">Certificat: {allergy.medicalCertificate}</p>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                            Menu spécial
                          </button>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-6 border border-yellow-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Protocole d'urgence allergique</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Urgence</h5>
                    <p className="text-sm text-gray-600">Appeler le 15 immédiatement</p>
                  </div>
                  <div className="text-center">
                    <Heart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Trousse d'urgence</h5>
                    <p className="text-sm text-gray-600">EpiPen disponible à l'infirmerie</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Personnel formé</h5>
                    <p className="text-sm text-gray-600">8 personnes habilitées</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des stocks</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Import fournisseur
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Nouvelle commande
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {inventory.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{item.product}</h4>
                          <p className="text-sm text-gray-600">{item.category} • {item.id}</p>
                          <p className="text-sm text-gray-500">Fournisseur: {item.supplier}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Stock</p>
                          <p className="text-lg font-bold text-blue-600">{item.quantity} {item.unit}</p>
                          <p className="text-xs text-gray-500">Min: {item.minStock} {item.unit}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Expiration</p>
                          <p className="text-sm font-medium text-gray-900">{item.expiryDate}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Coût unitaire</p>
                          <p className="text-lg font-bold text-green-600">€{item.cost}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status === 'good' ? 'Bon' : 
                             item.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Alertes stock</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Lait entier - Expire demain</p>
                        <p className="text-xs text-gray-600">8L restants</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pommes de terre - Stock faible</p>
                        <p className="text-xs text-gray-600">120kg (min: 50kg)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Commandes en cours</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Légumes frais</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Livraison demain
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Viandes</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Livrée
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Produits laitiers</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        En préparation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Système de paiement</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Rapport paiements
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Recharger carte
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{payment.studentName}</h4>
                          <p className="text-sm text-gray-600">{payment.class} • {payment.id}</p>
                          <p className="text-sm text-gray-500">Méthode: {payment.paymentMethod}</p>
                          <p className="text-sm text-gray-500">Dernière transaction: {payment.lastTransaction}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Solde</p>
                          <p className={`text-lg font-bold ${payment.balance > 20 ? 'text-green-600' : payment.balance > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            €{payment.balance}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Dépenses mensuelles</p>
                          <p className="text-lg font-bold text-purple-600">€{payment.monthlySpent}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status === 'active' ? 'Actif' : 
                             payment.status === 'low-balance' ? 'Solde faible' : 'Mensuel'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                          Recharger
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Historique
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Optimisation et gestion des déchets</h3>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Leaf className="w-4 h-4 mr-2" />
                  Rapport déchets
                </button>
              </div>

              <div className="grid gap-4">
                {waste.map((day, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-yellow-600 rounded-full flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">Déchets du {day.date}</h4>
                          <p className="text-sm text-gray-600">Repas servis: {day.totalServed}</p>
                          <p className="text-sm text-gray-500">Coût des déchets: €{day.cost}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Total déchets</p>
                          <p className="text-lg font-bold text-red-600">{day.totalWaste} kg</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Pourcentage</p>
                          <p className="text-lg font-bold text-yellow-600">{day.wastePercentage}%</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Entrées</p>
                          <p className="text-sm font-bold text-gray-900">{day.categories.starter} kg</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Plats</p>
                          <p className="text-sm font-bold text-gray-900">{day.categories.main} kg</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Desserts</p>
                          <p className="text-sm font-bold text-gray-900">{day.categories.dessert} kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Objectifs environnementaux</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Réduction déchets</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                        </div>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Produits locaux</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/5"></div>
                        </div>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Bio</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-yellow-600 h-2 rounded-full w-2/5"></div>
                        </div>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Actions d'amélioration</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Sensibilisation anti-gaspillage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Compostage des déchets organiques</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">Partenariat producteurs locaux</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">Menu végétarien hebdomadaire</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Analytics de la restauration</h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Fréquentation</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">87.5%</p>
                      <p className="text-sm text-gray-600">Taux de fréquentation</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">1,247</p>
                      <p className="text-sm text-gray-600">Repas/jour moyen</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">€4.35</p>
                      <p className="text-sm text-gray-600">Prix moyen repas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Satisfaction</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Qualité</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">4.2/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Variété</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/5"></div>
                        </div>
                        <span className="text-sm font-medium">3.8/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Service</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-purple-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">4.5/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Déchets réduits</p>
                      <p className="text-2xl font-bold text-green-600">-25%</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Revenus mensuels</p>
                      <p className="text-2xl font-bold text-blue-600">€45,230</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onSave={handleSaveMenu}
        menu={selectedMenu}
        isEdit={isEditMode}
      />
    </div>
  );
};

export default Cafeteria;