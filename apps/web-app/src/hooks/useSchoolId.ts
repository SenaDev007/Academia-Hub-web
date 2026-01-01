import { useTenant } from '../contexts/TenantContext';

/**
 * Hook pour récupérer le schoolId du tenant actuel
 */
export function useSchoolId(): string {
  const { school } = useTenant();
  return school?.id || 'school-1';
}
