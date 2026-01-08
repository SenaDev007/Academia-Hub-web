import { useState } from 'react';
import { api } from '../../../lib/api/client';

/**
 * Hook to update a student
 * TODO: Migrate to React Query when @tanstack/react-query is installed
 */
export function useUpdateStudent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async ({ id, data }: { id: string; data: any }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.students.update(id, data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  return { mutate, isLoading: loading, error };
}

