import { api } from '../../../lib/api/client';

/**
 * Students Service
 * Service layer for student-related API calls
 */
export const studentsService = {
  /**
   * Get all students
   */
  getAll: async () => {
    return api.students.getAll();
  },

  /**
   * Get a student by ID
   */
  getById: async (id: string) => {
    return api.students.getById(id);
  },

  /**
   * Create a new student
   */
  create: async (studentData: any) => {
    return api.students.create(studentData);
  },

  /**
   * Update a student
   */
  update: async (id: string, studentData: any) => {
    return api.students.update(id, studentData);
  },

  /**
   * Delete a student
   */
  delete: async (id: string) => {
    return api.students.delete(id);
  },
};

