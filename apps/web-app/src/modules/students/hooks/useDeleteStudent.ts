import { useState } from 'react';
import { api } from '../../../lib/api/client';

/**
 * Hook to delete a student
 * TODO: Migrate to React Query when @tanstack/react-query is installed
 */
export function useDeleteStudent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.students.delete(id);
      setLoading(false);
      return id;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  return { mutate, isLoading: loading, error };
}

