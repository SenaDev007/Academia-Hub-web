/**
 * ============================================================================
 * MODULE BIBLIOTHÈQUE
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Book, Search, User, Calendar } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  borrowedBy?: string;
  dueDate?: string;
}

export default function LibraryModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/library/books?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        }
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [currentYear, currentLevel]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
  );

  return (
    <ModulePageLayout
      title="Bibliothèque"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code} | ${currentYear?.name || ''}`}
      actions={
        <>
          <button className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Ajouter un livre</span>
          </button>
        </>
      }
      filters={
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total livres</p>
              <Book className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : books.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Disponibles</p>
              <Book className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : books.filter(b => b.available).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Empruntés</p>
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : books.filter(b => !b.available).length}
            </p>
          </div>
        </div>

        {/* Liste des livres */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy-900">Catalogue</h3>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date retour
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            book.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {book.available ? 'Disponible' : 'Emprunté'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.dueDate ? new Date(book.dueDate).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModulePageLayout>
  );
}

