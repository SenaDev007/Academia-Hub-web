/**
 * Auth Service
 * 
 * Service pour l'authentification
 */

import apiClient from '@/lib/api/client';
import type { User, Tenant, AuthSession } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSubdomain?: string;
}

export interface LoginResponse {
  user: User;
  tenant: Tenant;
  token: string;
  expiresAt: string;
}

/**
 * Authentifie un utilisateur
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

/**
 * Déconnecte l'utilisateur
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function checkAuth(): Promise<{ user: User; tenant: Tenant } | null> {
  try {
    const response = await apiClient.get<{ user: User; tenant: Tenant }>('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Rafraîchit le token
 */
export async function refreshToken(): Promise<{ token: string; expiresAt: string }> {
  const response = await apiClient.post<{ token: string; expiresAt: string }>('/auth/refresh');
  return response.data;
}

