import { apiClient } from './config';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  settings?: Record<string, any>;
}

export interface SchoolSettings {
  academicYear?: string;
  gradingSystem?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export const schoolsService = {
  async getSchools(params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }) {
    const response = await apiClient.get('/schools', { params });
    return response.data;
  },

  async getSchool(id: string): Promise<School> {
    const response = await apiClient.get(`/schools/${id}`);
    return response.data;
  },

  async createSchool(data: CreateSchoolData): Promise<School> {
    const response = await apiClient.post('/schools', data);
    return response.data;
  },

  async updateSchool(id: string, data: Partial<CreateSchoolData>): Promise<School> {
    const response = await apiClient.put(`/schools/${id}`, data);
    return response.data;
  },

  async deleteSchool(id: string): Promise<void> {
    await apiClient.delete(`/schools/${id}`);
  },

  async getSchoolSettings(schoolId: string): Promise<SchoolSettings> {
    const response = await apiClient.get(`/schools/${schoolId}/settings`);
    return response.data;
  },

  async updateSchoolSettings(schoolId: string, settings: SchoolSettings): Promise<SchoolSettings> {
    const response = await apiClient.put(`/schools/${schoolId}/settings`, settings);
    return response.data;
  },

  async uploadLogo(schoolId: string, file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await apiClient.post(`/schools/${schoolId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getDashboard(schoolId: string): Promise<any> {
    const response = await apiClient.get(`/schools/${schoolId}/dashboard`);
    return response.data;
  }
};
