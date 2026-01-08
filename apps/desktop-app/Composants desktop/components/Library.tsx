import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter,
  Download,
  Upload,
  QrCode,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Users,
  TrendingUp,
  Heart,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { BookModal, LoanModal, ConfirmModal, AlertModal } from './modals';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const students = [
    { id: 'STD-001', name: 'Marie Dubois (1ère L)' },
    { id: 'STD-002', name: 'Pierre Martin (Terminale S)' },
    { id: 'STD-003', name: 'Sophie Lambert (3ème A)' },
    { id: 'STD-004', name: 'Lucas Moreau (2nde A)' },
    { id: 'STD-005', name: 'Emma Petit (1ère S)' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'borrowed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'maintenance': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'returned': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  const handleAddBook = () => {
    setIsEditMode(false);
    setSelectedBook(null);
    setIsBookModalOpen(true);
  };

  const handleEditBook = (book: any) => {
    setIsEditMode(true);
    setSelectedBook(book);
    setIsBookModalOpen(true);
  };

  const handleDeleteBook = (book: any) => {
    setSelectedBook(book);
    setIsConfirmModalOpen(true);
  };

  const handleAddLoan = () => {
    setIsEditMode(false);
    setSelectedLoan(null);
    setIsLoanModalOpen(true);
  };

  const handleSaveBook = (book: any) => {
    // Here you would typically save to your backend
    console.log('Saving book:', book);
    setIsAlertModalOpen(true);
  };

  const handleSaveLoan = (loan: any) => {
    // Here you would typically save to your backend
    console.log('Saving loan:', loan);
    setIsAlertModalOpen(true);
  };

  const confirmDeleteBook = () => {
    // Here you would typically delete from your backend
    console.log('Deleting book:', selectedBook);
    setIsConfirmModalOpen(false);
    setIsAlertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bibliothèque Numérique</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestion intelligente des ouvrages et services de prêt</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <QrCode className="w-4 h-4 mr-2" />
            Scanner
          </button>
          <button 
            onClick={handleAddBook}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
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
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
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
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher un livre, auteur, ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">Toutes catégories</option>
                    <option value="Littérature française">Littérature française</option>
                    <option value="Manuels scolaires">Manuels scolaires</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Sciences">Sciences</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres avancés
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </button>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{book.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Par {book.author}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">ISBN: {book.isbn} • Cote: {book.classification}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Catégorie: {book.category}</span>
                            <span className="mx-2 text-gray-400 dark:text-gray-600">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Localisation: {book.location}</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{book.rating}/5</span>
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {book.available}/{book.copies} exemplaires
                        </p>
                        <div className="flex space-x-2 mt-3">
                          <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditBook(book)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteBook(book)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Gestion des prêts</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download className="w-4 h-4 mr-2" />
                    Rapport prêts
                  </button>
                  <button 
                    onClick={handleAddLoan}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau prêt
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{loan.bookTitle}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{loan.studentName} • {loan.studentClass}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Prêt: {loan.loanDate} • Retour: {loan.dueDate}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
                          {loan.status === 'active' ? 'En cours' : 
                           loan.status === 'overdue' ? 'En retard' : 'Retourné'}
                        </span>
                        <p className={`text-sm mt-2 ${loan.daysLeft < 0 ? 'text-red-600 dark:text-red-400' : loan.daysLeft <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                          {loan.daysLeft < 0 ? `${Math.abs(loan.daysLeft)} jours de retard` : 
                           loan.daysLeft === 0 ? 'À retourner aujourd\'hui' :
                           `${loan.daysLeft} jours restants`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Renouvellements: {loan.renewals}</p>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50">
                            Renouveler
                          </button>
                          <button className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50">
                            Retourner
                          </button>
                          <button className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/50">
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

          {/* Other tabs content would go here */}
        </div>
      </div>

      {/* Modals */}
      <BookModal 
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSave={handleSaveBook}
        book={selectedBook}
        isEdit={isEditMode}
      />

      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSave={handleSaveLoan}
        loan={selectedLoan}
        isEdit={isEditMode}
        books={books.map(book => ({ id: book.id, title: book.title }))}
        students={students}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBook}
        title="Supprimer cet ouvrage ?"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedBook?.title}" ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Opération réussie"
        message="L'opération a été effectuée avec succès."
        type="success"
      />
    </div>
  );
};

export default Library;