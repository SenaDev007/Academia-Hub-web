/**
 * ============================================================================
 * MODULE ÉLÈVES & SCOLARITÉ
 * ============================================================================
 * 
 * Wireframe :
 * [ Élèves – Niveau : Primaire | Année : 2024-2025 ]
 * 
 * [Filtres] Classe ▼ | Statut ▼ | Recherche
 * 
 * ┌────────────────────────────────────────┐
 * │ Table élèves (photo, nom, classe, état)│
 * └────────────────────────────────────────┘
 * 
 * [ Panneau latéral – Dossier élève ]
 * - Infos générales
 * - Scolarité
 * - Discipline
 * - Finances
 * - Documents
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, User, BookOpen, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  classId: string;
  className: string;
  status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'EXPELLED' | 'INACTIVE';
}

export default function StudentsModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    classId: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    const loadStudents = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/students?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [currentYear, currentLevel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800';
      case 'TRANSFERRED':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif',
      GRADUATED: 'Diplômé',
      TRANSFERRED: 'Transféré',
      EXPELLED: 'Exclu',
      INACTIVE: 'Inactif',
    };
    return labels[status] || status;
  };

  const filteredStudents = students.filter((student) => {
    if (filters.classId && student.classId !== filters.classId) return false;
    if (filters.status && student.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <ModulePageLayout
      title="Élèves & Scolarité"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code} | ${currentYear?.name || ''}`}
    >
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Zone principale */}
        <div className="flex-1 flex flex-col">
          {/* Filtres */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Toutes les classes</option>
                {/* TODO: Charger les classes */}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="GRADUATED">Diplômé</option>
                <option value="TRANSFERRED">Transféré</option>
                <option value="EXPELLED">Exclu</option>
                <option value="INACTIVE">Inactif</option>
              </select>
            </div>
          </div>

          {/* Table élèves */}
          <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Chargement...</div>
              </div>
            ) : (
              <div className="overflow-auto h-full">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedStudent?.id === student.id ? 'bg-navy-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={`${student.firstName} ${student.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.className}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              student.status
                            )}`}
                          >
                            {getStatusLabel(student.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panneau latéral - Dossier élève */}
        {selectedStudent && (
          <div className="w-96 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedStudent.photo ? (
                    <img
                      src={selectedStudent.photo}
                      alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedStudent.className}</p>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <button className="flex items-center space-x-2 text-sm font-medium text-navy-900">
                  <User className="w-4 h-4" />
                  <span>Infos générales</span>
                </button>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-navy-900">
                  <BookOpen className="w-4 h-4" />
                  <span>Scolarité</span>
                </button>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-navy-900">
                  <AlertCircle className="w-4 h-4" />
                  <span>Discipline</span>
                </button>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-navy-900">
                  <DollarSign className="w-4 h-4" />
                  <span>Finances</span>
                </button>
              </div>
              <div>
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-navy-900">
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePageLayout>
  );
}

