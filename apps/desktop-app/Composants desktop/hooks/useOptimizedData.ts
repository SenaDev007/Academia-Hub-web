import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseOptimizedDataOptions<T> {
  data: T[];
  pageSize?: number;
  searchTerm?: string;
  searchFields?: (keyof T)[];
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  debounceMs?: number;
}

interface UseOptimizedDataReturn<T> {
  // Données optimisées
  paginatedData: T[];
  filteredData: T[];
  
  // États de pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  
  // Actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // États de chargement
  isLoading: boolean;
  isSearching: boolean;
}

export function useOptimizedData<T extends Record<string, any>>({
  data = [],
  pageSize = 10,
  searchTerm = '',
  searchFields = [],
  sortBy,
  sortOrder = 'asc',
  filters = {},
  debounceMs = 300
}: UseOptimizedDataOptions<T>): UseOptimizedDataReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce du terme de recherche
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchTerm, debounceMs]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    let filtered = [...data];

    // Filtrage par terme de recherche
    if (debouncedSearchTerm && searchFields.length > 0) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Filtrage par critères spécifiques
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          filtered = filtered.filter(item => value.includes(item[key]));
        } else if (typeof value === 'string') {
          filtered = filtered.filter(item => 
            String(item[key]).toLowerCase().includes(value.toLowerCase())
          );
        } else {
          filtered = filtered.filter(item => item[key] === value);
        }
      }
    });

    // Tri des données
    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, searchFields, filters, sortBy, sortOrder]);

  // Calcul de la pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Données paginées
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Actions de pagination
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Reset de la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters, sortBy, sortOrder]);

  return {
    paginatedData,
    filteredData,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    isLoading,
    isSearching
  };
}

// Hook spécialisé pour les images avec lazy loading
export function useLazyImages(imageUrls: string[], threshold = 0.1) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [imageRefs, setImageRefs] = useState<Map<string, HTMLImageElement>>(new Map());

  const imageObserver = useMemo(() => {
    if (typeof IntersectionObserver === 'undefined') return null;
    
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              setLoadedImages(prev => new Set([...prev, src]));
              imageObserver?.unobserve(img);
            }
          }
        });
      },
      { threshold }
    );
  }, [threshold]);

  const registerImage = useCallback((src: string, imgElement: HTMLImageElement) => {
    setImageRefs(prev => new Map([...prev, [src, imgElement]]));
    if (imageObserver) {
      imageObserver.observe(imgElement);
    }
  }, [imageObserver]);

  const cleanup = useCallback(() => {
    imageObserver?.disconnect();
  }, [imageObserver]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    loadedImages,
    registerImage,
    isImageLoaded: (src: string) => loadedImages.has(src)
  };
}
