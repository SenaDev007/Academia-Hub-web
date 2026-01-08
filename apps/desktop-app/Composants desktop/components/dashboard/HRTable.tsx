import React from 'react';
import { 
  UserCheck, 
  Phone, 
  Eye, 
  Edit, 
  Award, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  hireDate: string;
  contract: string;
  salary: string;
  phone: string;
  email: string;
  status: string;
  performance: number;
}

interface HRTableProps {
  personnel: Person[];
  sortField: 'name' | 'hireDate' | 'salary' | 'department' | 'status';
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onSort: (field: 'name' | 'hireDate' | 'salary' | 'department' | 'status') => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onEditTeacher: (person: Person) => void;
  onNewEvaluation: () => void;
  getStatusColor: (status: string) => string;
}

const HRTable: React.FC<HRTableProps> = ({
  personnel,
  sortField,
  sortDirection,
  currentPage,
  itemsPerPage,
  totalPages,
  startIndex,
  endIndex,
  onSort,
  onPageChange,
  onItemsPerPageChange,
  onEditTeacher,
  onNewEvaluation,
  getStatusColor
}) => {
  return (
    <div className="space-y-4">
      {/* En-têtes de colonnes avec tri */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="col-span-3">
            <button
              onClick={() => onSort('name')}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <span>Nom & Poste</span>
              {sortField === 'name' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="w-4 h-4 text-blue-500" /> : 
                  <ArrowDown className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => onSort('department')}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <span>Département</span>
              {sortField === 'department' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="w-4 h-4 text-blue-500" /> : 
                  <ArrowDown className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => onSort('hireDate')}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <span>Date d'embauche</span>
              {sortField === 'hireDate' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="w-4 h-4 text-blue-500" /> : 
                  <ArrowDown className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => onSort('salary')}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <span>Salaire</span>
              {sortField === 'salary' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="w-4 h-4 text-blue-500" /> : 
                  <ArrowDown className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => onSort('status')}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <span>Statut</span>
              {sortField === 'status' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="w-4 h-4 text-blue-500" /> : 
                  <ArrowDown className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
      </div>

      {/* Liste du personnel paginée */}
      {personnel.map((person) => (
        <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{person.firstName} {person.lastName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{person.position}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{person.phone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {person.department}
              </span>
            </div>
            
            <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
              {new Date(person.hireDate).toLocaleDateString('fr-FR')}
            </div>
            
            <div className="col-span-2 font-medium text-green-600 dark:text-green-400">
              {person.salary} F CFA
            </div>
            
            <div className="col-span-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                {person.status === 'active' ? 'Actif' : 
                 person.status === 'on-leave' ? 'En congé' : 'Inactif'}
              </span>
            </div>
            
            <div className="col-span-1 flex justify-center space-x-1">
              <button className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors duration-200">
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onEditTeacher(person)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={onNewEvaluation}
                className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
              >
                <Award className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Éléments par page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Précédent
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                if (totalPages <= 5) return page;
                if (currentPage <= 3) return page;
                if (currentPage >= totalPages - 2) return totalPages - 4 + page;
                return currentPage - 2 + page;
              }).map(page => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Suivant
            </button>
          </div>
          
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {startIndex + 1}-{endIndex} sur {personnel.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRTable;
