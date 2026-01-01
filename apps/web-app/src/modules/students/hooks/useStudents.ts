import { useState, useEffect } from 'react';
import { api } from '../../../lib/api/client';

/**
 * Hook to fetch all students
 * TODO: Migrate to React Query when @tanstack/react-query is installed
 */
export function useStudents() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.students.getAll()
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, isLoading: loading, error };
}

