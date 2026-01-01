/**
 * Utility Functions
 * 
 * Fonctions utilitaires pour Academia Hub
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 * 
 * Combine les classes CSS de manière intelligente,
 * en résolvant les conflits Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

