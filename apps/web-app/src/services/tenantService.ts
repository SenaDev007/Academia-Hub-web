/**
 * Service for managing multi-tenant functionality
 */

import { School } from '../types/tenant';

/**
 * Get the current subdomain from the URL
 */
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // For localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check if using a subdomain pattern like tenant.localhost:3000
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'app') {
      return parts[0];
    }
    
    // Alternative: check for subdomain in URL path for local development
    // e.g., localhost:3000/tenant/example
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'tenant') {
      return pathParts[2];
    }
    
    return null;
  }
  
  // Production environment
  const parts = hostname.split('.');
  
  // Check if it's a subdomain
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
    return parts[0];
  }
  
  return null;
};

/**
 * Fetch school information by subdomain
 */
export const fetchSchoolBySubdomain = async (subdomain: string): Promise<School> => {
  try {
    // In a real implementation, you would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulated response
    return {
      id: `school-${subdomain}`,
      name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/-/g, ' '),
      subdomain,
      plan: 'professional',
      status: 'active',
      settings: {
        theme: 'default',
        language: 'fr'
      }
    };
  } catch (error) {
    console.error('Failed to fetch school by subdomain:', error);
    throw new Error('École non trouvée');
  }
};

/**
 * Check if a subdomain is available
 */
export const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
  try {
    // In a real implementation, you would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulated response - consider some subdomains as taken
    const takenSubdomains = ['ecole', 'lycee', 'college', 'universite', 'admin', 'app', 'www'];
    return !takenSubdomains.includes(subdomain);
  } catch (error) {
    console.error('Failed to check subdomain availability:', error);
    throw new Error('Erreur lors de la vérification du sous-domaine');
  }
};

/**
 * Create a new school (tenant)
 */
export const createSchool = async (schoolData: Partial<School>): Promise<School> => {
  try {
    // In a real implementation, you would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulated response
    return {
      id: `school-${Date.now()}`,
      name: schoolData.name || 'Nouvelle École',
      subdomain: schoolData.subdomain || 'nouvelle-ecole',
      plan: schoolData.plan || 'starter',
      status: 'pending_payment',
      settings: schoolData.settings || {
        theme: 'default',
        language: 'fr'
      }
    };
  } catch (error) {
    console.error('Failed to create school:', error);
    throw new Error('Erreur lors de la création de l\'école');
  }
};

/**
 * Update school information
 */
export const updateSchool = async (schoolId: string, schoolData: Partial<School>): Promise<School> => {
  try {
    // In a real implementation, you would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulated response
    return {
      id: schoolId,
      name: schoolData.name || 'École Mise à Jour',
      subdomain: schoolData.subdomain || 'ecole-mise-a-jour',
      plan: schoolData.plan || 'professional',
      status: schoolData.status || 'active',
      settings: {
        ...schoolData.settings
      }
    };
  } catch (error) {
    console.error('Failed to update school:', error);
    throw new Error('Erreur lors de la mise à jour de l\'école');
  }
};