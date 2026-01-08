import React, { useState } from 'react';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import AcademicYearSelector from '../common/AcademicYearSelector';
import CurrentAcademicYearDisplay from '../common/CurrentAcademicYearDisplay';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter,
  Download,
  Upload,
  QrCode,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Eye,
  Edit,
  BarChart3,
  Users,
  TrendingUp,
  Heart,
  Bookmark,
  RefreshCw
} from 'lucide-react';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Gestion de l'année scolaire
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('library');

  const libraryStats = [
    {
      title: 'Total ouvrages',
      value: '12,847',
      change: '+234',
      icon: BookOpen,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Livres empruntés',
      value: '3,456',
      change: '+12%',
      icon: Users,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Retards',
      value: '89',
      change: '-15',
      icon: AlertTriangle,
      color: 'from-red-600 to-red-700'
    },
    {
      title: 'Réservations',
      value: '156',
      change: '+23',
      icon: Calendar,
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const books = [
    {
      id: 'BIB-2024-00001',
      title: 'Les Misérables',
      author: 'Victor Hugo',
      isbn: '978-2-07-040570-8',
      category: 'Littérature française',
      classification: '843.7 HUG',
      status: 'available',
      location: 'Rayon A-12',
      copies: 5,
      available: 3,
      rating: 4.8,
      addedDate: '2024-01-15'
    },
    {
      id: 'BIB-2024-00002',
      title: 'Mathématiques Terminale S',
      author: 'Collectif Hachette',
      isbn: '978-2-01-395847-2',
      category: 'Manuels scolaires',
      classification: '510 MAT',
      status: 'borrowed',
      location: 'Rayon M-05',
      copies: 30,
      available: 12,
      rating: 4.2,
      addedDate: '2024-01-10'
    },
    {
      id: 'BIB-2024-00003',
      title: 'Histoire de France',
      author: 'Jacques Bainville',
      isbn: '978-2-213-02321-5',
      category: 'Histoire',
      classification: '944 BAI',
      status: 'reserved',
      location: 'Rayon H-08',
      copies: 8,
      available: 2,
      rating: 4.5,
      addedDate: '2024-01-08'
    }
  ];

  const loans = [
    {
      id: 'PRET-2024-00123',
      bookTitle: 'Les Misérables',
      bookId: 'BIB-2024-00001',
      studentName: 'Marie Dubois',
      studentClass: '1ère L',
      loanDate: '2024-01-10',
      dueDate: '2024-01-24',
      status: 'active',
      daysLeft: 3,
      renewals: 0
    },
    {
      id: 'PRET-2024-00124',
      bookTitle: 'Mathématiques Terminale S',
      bookId: 'BIB-2024-00002',
      studentName: 'Pierre Martin',
      studentClass: 'Terminale S',
      loanDate: '2024-01-05',
      dueDate: '2024-01-19',
      status: 'overdue',
      daysLeft: -2,
      renewals: 1
    },
    {
      id: 'PRET-2024-00125',
      bookTitle: 'Histoire de France',
      bookId: 'BIB-2024-00003',
      studentName: 'Sophie Lambert',
      studentClass: '3ème A',
      loanDate: '2024-01-12',
      dueDate: '2024-01-26',
      status: 'active',
      daysLeft: 5,
      renewals: 0
    }
  ];

  const reservations = [
    {
      id: 'RES-2024-00045',
      bookTitle: 'Les Misérables',
      bookId: 'BIB-2024-00001',
      studentName: 'Lucas Moreau',
      studentClass: '2nde A',
      reservationDate: '2024-01-15',
      position: 1,
      estimatedDate: '2024-01-25',
      status: 'waiting'
    },
    {
      id: 'RES-2024-00046',
      bookTitle: 'Histoire de France',
      bookId: 'BIB-2024-00003',
      studentName: 'Emma Petit',
      studentClass: '1ère S',
      reservationDate: '2024-01-14',
      position: 2,
      estimatedDate: '2024-01-28',
      status: 'waiting'
    }
  ];

  const recommendations = [
    {
      bookTitle: 'Le Petit Prince',
      author: 'Antoine de Saint-Exupéry',
      reason: 'Populaire auprès des élèves de votre niveau',
      score: 95,
      category: 'Littérature française'
    },
    {
      bookTitle: 'Physique-Chimie 1ère',
      author: 'Collectif Nathan',
      reason: 'Recommandé pour vos matières',
      score: 88,
      category: 'Manuels scolaires'
    },
    {
      bookTitle: '1984',
      author: 'George Orwell',
      reason: 'Basé sur vos lectures précédentes',
      score: 92,
      category: 'Littérature étrangère'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'borrowed': return 'bg-blue-100 text-blue-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque Numérique</h1>
          <p className="text-gray-600">Gestion intelligente des ouvrages et services de prêt</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Affichage de l'année scolaire actuelle */}
          <CurrentAcademicYearDisplay variant="compact" />
          
          {/* Sélecteur d'année scolaire */}
          <AcademicYearSelector
            value={selectedAcademicYear}
            onChange={setSelectedAcademicYear}
            className="w-full sm:w-auto min-w-[200px]"
          />
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <QrCode className="w-4 h-4 mr-2" />
            Scanner
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel ouvrage
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {libraryStats.map((stat, index) => {
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
              { id: 'catalog', label: 'Catalogue', icon: BookOpen },
              { id: 'loans', label: 'Prêts en cours', icon: Users },
              { id: 'reservations', label: 'Réservations', icon: Calendar },
              { id: 'recommendations', label: 'Recommandations IA', icon: Star },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'inventory', label: 'Inventaire', icon: RefreshCw }
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
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un livre, auteur, ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes catégories</option>
                    <option value="Littérature française">Littérature française</option>
                    <option value="Manuels scolaires">Manuels scolaires</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Sciences">Sciences</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres avancés
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </button>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{book.title}</h4>
                          <p className="text-sm text-gray-600">Par {book.author}</p>
                          <p className="text-sm text-gray-500">ISBN: {book.isbn} • Cote: {book.classification}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-sm text-gray-600">Catégorie: {book.category}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Localisation: {book.location}</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">{book.rating}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                          {book.status === 'available' ? 'Disponible' : 
                           book.status === 'borrowed' ? 'Emprunté' : 
                           book.status === 'reserved' ? 'Réservé' : 'Maintenance'}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          {book.available}/{book.copies} exemplaires
                        </p>
                        <div className="flex space-x-2 mt-3">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des prêts</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Rapport prêts
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau prêt
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{loan.bookTitle}</h4>
                          <p className="text-sm text-gray-600">{loan.studentName} • {loan.studentClass}</p>
                          <p className="text-sm text-gray-500">Prêt: {loan.loanDate} • Retour: {loan.dueDate}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
                          {loan.status === 'active' ? 'En cours' : 
                           loan.status === 'overdue' ? 'En retard' : 'Retourné'}
                        </span>
                        <p className={`text-sm mt-2 ${loan.daysLeft < 0 ? 'text-red-600' : loan.daysLeft <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {loan.daysLeft < 0 ? `${Math.abs(loan.daysLeft)} jours de retard` : 
                           loan.daysLeft === 0 ? 'À retourner aujourd\'hui' :
                           `${loan.daysLeft} jours restants`}
                        </p>
                        <p className="text-sm text-gray-500">Renouvellements: {loan.renewals}</p>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Renouveler
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                            Retourner
                          </button>
                          <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">
                            Rappel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">File d'attente des réservations</h3>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Nouvelle réservation
                </button>
              </div>

              <div className="grid gap-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{reservation.position}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{reservation.bookTitle}</h4>
                          <p className="text-sm text-gray-600">{reservation.studentName} • {reservation.studentClass}</p>
                          <p className="text-sm text-gray-500">Réservé le: {reservation.reservationDate}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Position dans la file</p>
                        <p className="text-2xl font-bold text-purple-600">{reservation.position}</p>
                        <p className="text-sm text-gray-500">Disponible vers: {reservation.estimatedDate}</p>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                            Notifier
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recommandations intelligentes</h3>
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
                  <Star className="w-4 h-4 mr-2" />
                  Actualiser IA
                </button>
              </div>

              <div className="grid gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{rec.bookTitle}</h4>
                          <p className="text-sm text-gray-600">Par {rec.author}</p>
                          <p className="text-sm text-gray-500">{rec.category}</p>
                          <p className="text-sm text-blue-600 mt-1">{rec.reason}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          <span className="text-sm text-gray-600">Score IA: </span>
                          <span className="ml-1 text-lg font-bold text-blue-600">{rec.score}%</span>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${rec.score}%` }}
                          ></div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Voir détails
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                            Recommander
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Tendances de lecture IA</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Genre populaire</h5>
                    <p className="text-sm text-gray-600">Science-fiction</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Tendance montante</h5>
                    <p className="text-sm text-gray-600">Développement personnel</p>
                  </div>
                  <div className="text-center">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Coup de cœur</h5>
                    <p className="text-sm text-gray-600">Littérature contemporaine</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Analytics de la bibliothèque</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Statistiques de prêt</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prêts ce mois</span>
                      <span className="font-bold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de rotation</span>
                      <span className="font-bold">2.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée moyenne</span>
                      <span className="font-bold">12 jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de retard</span>
                      <span className="font-bold text-red-600">7.2%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Top catégories</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Manuels scolaires</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">80%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Littérature française</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full w-3/5"></div>
                        </div>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Sciences</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-purple-600 h-2 rounded-full w-2/5"></div>
                        </div>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Inventaire automatisé</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter inventaire
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Lancer inventaire
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">État de l'inventaire</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ouvrages recensés</span>
                      <span className="font-bold">12,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manquants</span>
                      <span className="font-bold text-red-600">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">En maintenance</span>
                      <span className="font-bold text-yellow-600">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernière vérification</span>
                      <span className="font-bold">15/01/2024</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Alertes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-700">23 ouvrages manquants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">45 en maintenance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Inventaire à jour</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h4>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                      Scanner par QR Code
                    </button>
                    <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                      Import par fichier
                    </button>
                    <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                      Rapport détaillé
                    </button>
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

export default Library;