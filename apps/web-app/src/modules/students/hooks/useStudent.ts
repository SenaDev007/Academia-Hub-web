import { useState, useEffect } from 'react';
import { api } from '../../../lib/api/client';

/**
 * Hook to fetch a single student by ID
 * TODO: Migrate to React Query when @tanstack/react-query is installed
 */
export function useStudent(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    api.students.getById(id)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  return { data, isLoading: loading, error };
}

