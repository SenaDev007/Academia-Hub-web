import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter,
  Tag,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
  TrendingUp,
  Star,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Percent,
  Box,
  Layers,
  Users,
  FileText,
  Settings,
  Clipboard,
  RefreshCw
} from 'lucide-react';

const Boutique: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Statistiques de la boutique
  const shopStats = [
    {
      title: 'Ventes du mois',
      value: '€4,230',
      change: '+12%',
      icon: ShoppingBag,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Commandes en cours',
      value: '24',
      change: '+8',
      icon: Package,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Produits en stock',
      value: '1,247',
      change: '-15',
      icon: Box,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Panier moyen',
      value: '€45.50',
      change: '+3.2%',
      icon: ShoppingCart,
      color: 'from-orange-600 to-orange-700'
    }
  ];

  // Catégories de produits
  const categories = [
    { id: 'all', name: 'Toutes catégories' },
    { id: 'uniforms', name: 'Uniformes scolaires' },
    { id: 'supplies', name: 'Fournitures' },
    { id: 'books', name: 'Livres et manuels' },
    { id: 'electronics', name: 'Électronique' },
    { id: 'sports', name: 'Équipement sportif' },
    { id: 'snacks', name: 'Snacks et boissons' }
  ];

  // Produits
  const products = [
    {
      id: 'PROD-001',
      name: 'Uniforme scolaire - Chemise',
      category: 'uniforms',
      price: 25.00,
      stock: 120,
      variants: ['XS', 'S', 'M', 'L', 'XL'],
      description: 'Chemise blanche officielle avec logo de l\'école brodé',
      imageUrl: 'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.8,
      sales: 45,
      status: 'active'
    },
    {
      id: 'PROD-002',
      name: 'Cahier grand format - 96 pages',
      category: 'supplies',
      price: 3.50,
      stock: 350,
      variants: ['Quadrillé', 'Ligné', 'Uni'],
      description: 'Cahier grand format de qualité supérieure, couverture rigide',
      imageUrl: 'https://images.pexels.com/photos/6690827/pexels-photo-6690827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.5,
      sales: 230,
      status: 'active'
    },
    {
      id: 'PROD-003',
      name: 'Manuel de mathématiques - Terminale S',
      category: 'books',
      price: 32.00,
      stock: 85,
      variants: [],
      description: 'Manuel officiel conforme au programme national',
      imageUrl: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.7,
      sales: 78,
      status: 'active'
    },
    {
      id: 'PROD-004',
      name: 'Calculatrice scientifique',
      category: 'electronics',
      price: 18.99,
      stock: 5,
      variants: [],
      description: 'Calculatrice scientifique avec fonctions avancées pour lycéens',
      imageUrl: 'https://images.pexels.com/photos/4386325/pexels-photo-4386325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.6,
      sales: 34,
      status: 'low_stock'
    },
    {
      id: 'PROD-005',
      name: 'Ballon de football',
      category: 'sports',
      price: 15.00,
      stock: 0,
      variants: ['Taille 4', 'Taille 5'],
      description: 'Ballon de football résistant pour terrain extérieur',
      imageUrl: 'https://images.pexels.com/photos/3448250/pexels-photo-3448250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.3,
      sales: 28,
      status: 'out_of_stock'
    }
  ];

  // Commandes
  const orders = [
    {
      id: 'ORD-2024-001',
      customerName: 'Marie Dubois',
      customerType: 'Parent',
      items: 3,
      total: 45.50,
      date: '2024-01-15',
      status: 'delivered',
      paymentMethod: 'card',
      deliveryMethod: 'pickup'
    },
    {
      id: 'ORD-2024-002',
      customerName: 'Pierre Martin',
      customerType: 'Élève',
      items: 1,
      total: 3.50,
      date: '2024-01-16',
      status: 'processing',
      paymentMethod: 'mobile_money',
      deliveryMethod: 'student'
    },
    {
      id: 'ORD-2024-003',
      customerName: 'Sophie Lambert',
      customerType: 'Enseignant',
      items: 5,
      total: 78.25,
      date: '2024-01-16',
      status: 'pending',
      paymentMethod: 'school_account',
      deliveryMethod: 'pickup'
    }
  ];

  // Mouvements de stock
  const stockMovements = [
    {
      id: 'STK-2024-001',
      productName: 'Uniforme scolaire - Chemise',
      type: 'in',
      quantity: 50,
      date: '2024-01-10',
      user: 'Admin',
      reason: 'Approvisionnement'
    },
    {
      id: 'STK-2024-002',
      productName: 'Calculatrice scientifique',
      type: 'out',
      quantity: 5,
      date: '2024-01-12',
      user: 'Système',
      reason: 'Vente'
    },
    {
      id: 'STK-2024-003',
      productName: 'Manuel de mathématiques - Terminale S',
      type: 'in',
      quantity: 25,
      date: '2024-01-14',
      user: 'Admin',
      reason: 'Approvisionnement'
    }
  ];

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Fonctions utilitaires
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'low_stock': return 'Stock faible';
      case 'out_of_stock': return 'Rupture';
      case 'delivered': return 'Livrée';
      case 'processing': return 'En préparation';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'mobile_money': return 'Mobile Money';
      case 'cash': return 'Espèces';
      case 'school_account': return 'Compte école';
      default: return method;
    }
  };

  const getDeliveryMethodText = (method: string) => {
    switch (method) {
      case 'pickup': return 'Retrait sur place';
      case 'student': return 'Remise à l\'élève';
      case 'delivery': return 'Livraison à domicile';
      default: return method;
    }
  };

  const getStockMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boutique Academia</h1>
          <p className="text-gray-600">Gestion des produits, commandes et stocks</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {shopStats.map((stat, index) => {
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
              { id: 'products', label: 'Produits', icon: Tag },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart },
              { id: 'inventory', label: 'Stocks', icon: Package },
              { id: 'customers', label: 'Clients', icon: Users },
              { id: 'reports', label: 'Rapports', icon: FileText },
              { id: 'settings', label: 'Paramètres', icon: Settings }
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
              {/* Recent Sales Overview */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ventes récentes</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aujourd'hui</span>
                      <span className="font-bold text-blue-600">€345.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cette semaine</span>
                      <span className="font-bold text-blue-600">€1,245.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ce mois</span>
                      <span className="font-bold text-blue-600">€4,230.00</span>
                    </div>
                    <div className="h-40 flex items-center justify-center">
                      <BarChart3 className="w-32 h-32 text-blue-200" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Produits populaires</h3>
                  <div className="space-y-4">
                    {products
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 3)
                      .map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.sales} vendus</p>
                            </div>
                          </div>
                          <span className="font-bold text-green-600">€{product.price.toFixed(2)}</span>
                        </div>
                      ))}
                    <button className="w-full mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Voir tous les produits
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Commandes récentes</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir toutes les commandes
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commande
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            €{order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Voir
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              Facture
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Alertes de stock</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Gérer les stocks
                  </button>
                </div>
                <div className="space-y-4">
                  {products
                    .filter(product => product.status === 'low_stock' || product.status === 'out_of_stock')
                    .map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                {getStatusText(product.status)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">{product.stock} en stock</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Commander
                        </button>
                      </div>
                    ))}
                  {products.filter(product => product.status === 'low_stock' || product.status === 'out_of_stock').length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-600">Aucune alerte de stock actuellement</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{categories.find(c => c.id === product.category)?.name}</p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">€{product.price.toFixed(2)}</p>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      
                      <div className="mt-3 flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-500">{product.rating}</span>
                        </div>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{product.sales} vendus</span>
                      </div>
                      
                      {product.variants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Variantes disponibles:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.variants.map((variant, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                {variant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between">
                        <div className="text-sm text-gray-500">
                          Stock: <span className={product.stock === 0 ? 'text-red-600 font-medium' : 'font-medium'}>{product.stock}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Product Button (Mobile) */}
              <div className="md:hidden">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter un produit
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des commandes</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commande
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Articles
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paiement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Livraison
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.items} article{order.items > 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            €{order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getPaymentMethodText(order.paymentMethod)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getDeliveryMethodText(order.deliveryMethod)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Détails
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              Facture
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Processing Steps */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Processus de commande</h4>
                <div className="flex flex-wrap justify-between">
                  <div className="flex flex-col items-center p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Commande reçue</p>
                    <p className="text-sm text-gray-500">Validation initiale</p>
                  </div>
                  <div className="flex flex-col items-center p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Paiement confirmé</p>
                    <p className="text-sm text-gray-500">Transaction validée</p>
                  </div>
                  <div className="flex flex-col items-center p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Préparation</p>
                    <p className="text-sm text-gray-500">Collecte des articles</p>
                  </div>
                  <div className="flex flex-col items-center p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                      <Truck className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Livraison/Retrait</p>
                    <p className="text-sm text-gray-500">Remise au client</p>
                  </div>
                  <div className="flex flex-col items-center p-4 text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Terminée</p>
                    <p className="text-sm text-gray-500">Commande complétée</p>
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
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Inventaire
                  </button>
                  <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Mouvement de stock
                  </button>
                </div>
              </div>

              {/* Stock Levels */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Niveaux de stock</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Stock normal</h5>
                      <span className="text-2xl font-bold text-green-600">
                        {products.filter(p => p.status === 'active').length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Produits avec stock suffisant</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Stock faible</h5>
                      <span className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.status === 'low_stock').length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Produits à réapprovisionner</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Rupture</h5>
                      <span className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.status === 'out_of_stock').length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Produits indisponibles</p>
                  </div>
                </div>
              </div>

              {/* Stock Movements */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900">Mouvements de stock récents</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Référence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motif
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {movement.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockMovementTypeColor(movement.type)}`}>
                              {movement.type === 'in' ? 'Entrée' : movement.type === 'out' ? 'Sortie' : 'Ajustement'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movement.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movement.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movement.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inventory Management */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Approvisionnement</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Commande fournisseur</p>
                        <p className="text-sm text-gray-500">Créer un bon de commande</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Créer
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Réception marchandise</p>
                        <p className="text-sm text-gray-500">Enregistrer une livraison</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Enregistrer
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Ajustement de stock</p>
                        <p className="text-sm text-gray-500">Corriger les quantités</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Ajuster
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Fournisseurs</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Librairie Centrale</p>
                        <p className="text-sm text-gray-500">Livres et fournitures</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Contacter
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Textile Éducation</p>
                        <p className="text-sm text-gray-500">Uniformes scolaires</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Contacter
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Tech Éducative</p>
                        <p className="text-sm text-gray-500">Matériel électronique</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        Contacter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des clients</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </button>
                </div>
              </div>

              {/* Customer Segments */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Parents</h4>
                    <span className="text-2xl font-bold text-blue-600">245</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Achats principaux: uniformes, fournitures, manuels</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Panier moyen:</span>
                    <span className="font-medium">€65.40</span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Élèves</h4>
                    <span className="text-2xl font-bold text-purple-600">1,247</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Achats principaux: snacks, petites fournitures</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Panier moyen:</span>
                    <span className="font-medium">€8.75</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Personnel</h4>
                    <span className="text-2xl font-bold text-green-600">78</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Achats principaux: matériel pédagogique, livres</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Panier moyen:</span>
                    <span className="font-medium">€42.30</span>
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900">Clients récents</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commandes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total dépensé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dernière commande
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Marie Dubois</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Parent
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          marie.dubois@email.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €245.50
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2024-01-15
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Voir
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Contacter
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Pierre Martin</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Élève
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          pierre.martin@email.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          3
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €28.50
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2024-01-16
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Voir
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Contacter
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Sophie Lambert</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Enseignant
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          sophie.lambert@email.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          8
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €320.75
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2024-01-16
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Voir
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Contacter
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Rapports et analyses</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Période
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              {/* Sales Reports */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Ventes par catégorie</h4>
                  <div className="h-64 flex items-center justify-center">
                    <PieChart className="w-32 h-32 text-blue-200" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Uniformes
                      </span>
                      <span>35%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Fournitures
                      </span>
                      <span>25%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        Livres
                      </span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        Autres
                      </span>
                      <span>20%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Évolution des ventes</h4>
                  <div className="h-64 flex items-center justify-center">
                    <BarChart3 className="w-32 h-32 text-blue-200" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Janvier</span>
                      <span className="font-medium">€3,450</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Février</span>
                      <span className="font-medium">€4,230</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mars</span>
                      <span className="font-medium">€3,890</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avril (prévision)</span>
                      <span className="font-medium text-blue-600">€4,500</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Reports */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Résultats financiers</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Chiffre d'affaires</h5>
                      <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">€12,450</p>
                    <p className="text-sm text-gray-500">Trimestre en cours</p>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">+12% vs trimestre précédent</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Marge brute</h5>
                      <Percent className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">42.5%</p>
                    <p className="text-sm text-gray-500">Trimestre en cours</p>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">+2.3% vs trimestre précédent</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Bénéfice net</h5>
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">€5,290</p>
                    <p className="text-sm text-gray-500">Trimestre en cours</p>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">+15% vs trimestre précédent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Types */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Rapport de ventes</h5>
                  </div>
                  <p className="text-sm text-gray-600">Analyse détaillée des ventes par période, produit et client</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Rapport de stock</h5>
                  </div>
                  <p className="text-sm text-gray-600">État des stocks, rotations et valorisation</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Rapport clients</h5>
                  </div>
                  <p className="text-sm text-gray-600">Analyse du comportement d'achat et segmentation</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Rapport financier</h5>
                  </div>
                  <p className="text-sm text-gray-600">Résultats financiers, marges et rentabilité</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Paramètres de la boutique</h3>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la boutique
                      </label>
                      <input
                        type="text"
                        defaultValue="Boutique Academia"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Boutique officielle de l'établissement proposant uniformes, fournitures et matériel pédagogique."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de contact
                      </label>
                      <input
                        type="email"
                        defaultValue="boutique@ecole-exemple.fr"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        defaultValue="01 23 45 67 89"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Paramètres de paiement</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modes de paiement actifs
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Carte bancaire</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Mobile Money</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Compte école (facturation)</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Espèces</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Devise
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>EUR (€)</option>
                        <option>USD ($)</option>
                        <option>XOF (FCFA)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taux de TVA (%)
                      </label>
                      <input
                        type="number"
                        defaultValue="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Paramètres de livraison</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modes de livraison actifs
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Retrait à l'établissement</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Remise à l'élève</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Livraison à domicile</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horaires de retrait
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Lundi au vendredi: 8h-12h, 14h-17h
Mercredi: 8h-12h
Samedi: Fermé"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Délai de préparation (heures)
                      </label>
                      <input
                        type="number"
                        defaultValue="24"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Paramètres de notification</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notifications clients
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Email de confirmation de commande</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">SMS de confirmation de commande</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Notification de préparation</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Notification de disponibilité</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notifications administrateur
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Nouvelle commande</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Stock faible</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-700">Rapport quotidien</span>
                        </label>
                      </div>
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

export default Boutique;