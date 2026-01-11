/**
 * ============================================================================
 * SCHOOL SEARCH COMPONENT - RECHERCHE INTELLIGENTE D'ÉTABLISSEMENT
 * ============================================================================
 * 
 * Composant de recherche d'établissement avec autocomplete
 * 
 * ============================================================================
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, GraduationCap, Loader, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface School {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  city?: string;
  schoolType?: string;
}

interface SchoolSearchProps {
  onSchoolSelect: (school: School) => void;
  selectedSchool: School | null;
  portalType: 'SCHOOL' | 'TEACHER' | 'PARENT' | null;
}

export default function SchoolSearch({
  onSchoolSelect,
  selectedSchool,
  portalType,
}: SchoolSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSchools([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({ q: searchQuery });
        const response = await fetch(`/api/public/schools/search?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Failed to search schools:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fermer les résultats en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSchoolClick = (school: School) => {
    onSchoolSelect(school);
    setShowResults(false);
    setSearchQuery(school.name);
  };

  const getSchoolTypeLabel = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'PRIMAIRE':
        return 'Primaire';
      case 'SECONDAIRE':
        return 'Secondaire';
      case 'MIXTE':
        return 'Primaire & Secondaire';
      default:
        return type || 'École';
    }
  };

  return (
    <div className="relative" ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher votre établissement..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Selected School Display */}
      {selectedSchool && !showResults && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {selectedSchool.logoUrl ? (
              <Image
                src={selectedSchool.logoUrl}
                alt={selectedSchool.name}
                width={48}
                height={48}
                className="rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-gray-900">{selectedSchool.name}</p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                {selectedSchool.city && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedSchool.city}</span>
                  </div>
                )}
                {selectedSchool.schoolType && (
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{getSchoolTypeLabel(selectedSchool.schoolType)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && schools.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSchoolClick(school)}
              className="w-full px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 text-left border-b border-gray-100 last:border-b-0 transition-colors"
            >
              {school.logoUrl ? (
                <Image
                  src={school.logoUrl}
                  alt={school.name}
                  width={40}
                  height={40}
                  className="rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{school.name}</p>
                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                  {school.city && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{school.city}</span>
                    </span>
                  )}
                  {school.schoolType && (
                    <span className="flex items-center space-x-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>{getSchoolTypeLabel(school.schoolType)}</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && schools.length === 0 && searchQuery.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            Aucun établissement trouvé pour "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}

