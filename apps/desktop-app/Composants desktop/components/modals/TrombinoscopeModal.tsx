import React, { useState } from 'react';
import { X, User } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  matricule?: string;
  photo?: string | null;
  enrollmentDate?: string;
}

interface TrombinoscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

const TrombinoscopeModal: React.FC<TrombinoscopeModalProps> = ({ isOpen, onClose, students }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const classes = [...new Set(students.map(s => s.class))].sort();
  
  // Extraire les années et créer des périodes scolaires au format 2024-2025
  const enrollmentYears = students
    .map(s => s.enrollmentDate?.split('-')[0])
    .filter(Boolean)
    .map(year => parseInt(year!));
  
  const minYear = Math.min(...enrollmentYears, 2024);
  const maxYear = Math.max(...enrollmentYears, 2025);
  
  const years = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push(`${year}-${year + 1}`);
  }

  const filteredStudents = students.filter(student => {
    const studentYear = student.enrollmentDate?.split('-')[0];
    const matchesYear = !selectedYear || 
      (studentYear && selectedYear.startsWith(studentYear));
    const matchesClass = !selectedClass || student.class === selectedClass;
    return matchesYear && matchesClass;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trombinoscope des élèves</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="mb-4 flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              title="Sélectionner l'année scolaire"
            >
              <option value="">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              title="Sélectionner la classe"
            >
              <option value="">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredStudents.map(student => (
              <div key={student.id} className="text-center">
                <div className="w-32 h-32 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {student.photo ? (
                    <img 
                      src={student.photo} 
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    N° Educmaster: {student.matricule || student.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrombinoscopeModal;
