import dataService from '../dataService';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'certificate' | 'attestation' | 'bulletin' | 'list' | 'report';
  description: string;
  templatePath: string;
  variables: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  studentId?: string;
  classId?: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  generatedAt: string;
  generatedBy: string;
  variables: Record<string, any>;
  status: 'generated' | 'sent' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentGenerationRequest {
  templateId: string;
  studentIds?: string[];
  classId?: string;
  variables?: Record<string, any>;
  format?: 'pdf' | 'docx' | 'xlsx';
  includeHeader?: boolean;
  includeFooter?: boolean;
}

export interface DocumentFilters {
  studentId?: string;
  classId?: string;
  documentType?: string;
  status?: 'generated' | 'sent' | 'archived';
  dateFrom?: string;
  dateTo?: string;
  generatedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const documentsService = {
  // Récupérer tous les templates de documents
  async getTemplates() {
    try {
      const templates = await dataService.getAllDocumentTemplates();
      return {
        data: templates,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer un template par ID
  async getTemplateById(id: string) {
    try {
      const template = await dataService.getDocumentTemplateById(id);
      if (!template) {
        return {
          data: null,
          success: false,
          error: 'Template non trouvé'
        };
      }
      return {
        data: template,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du template:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Créer un nouveau template
  async createTemplate(templateData: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const template = await dataService.createDocumentTemplate(templateData);
      return {
        data: template,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Mettre à jour un template
  async updateTemplate(id: string, templateData: Partial<DocumentTemplate>) {
    try {
      const template = await dataService.updateDocumentTemplate(id, templateData);
      return {
        data: template,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du template:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer un template
  async deleteTemplate(id: string) {
    try {
      const success = await dataService.deleteDocumentTemplate(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du template:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Générer un document
  async generateDocument(request: DocumentGenerationRequest) {
    try {
      const document = await dataService.generateDocument(request);
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du document:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les documents générés
  async getGeneratedDocuments(filters?: DocumentFilters) {
    try {
      const documents = await dataService.getGeneratedDocuments(filters);
      return {
        data: documents,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer un document par ID
  async getDocumentById(id: string) {
    try {
      const document = await dataService.getGeneratedDocumentById(id);
      if (!document) {
        return {
          data: null,
          success: false,
          error: 'Document non trouvé'
        };
      }
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Télécharger un document
  async downloadDocument(id: string) {
    try {
      const document = await dataService.downloadGeneratedDocument(id);
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer un document généré
  async deleteDocument(id: string) {
    try {
      const success = await dataService.deleteGeneratedDocument(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Marquer un document comme envoyé
  async markDocumentAsSent(id: string) {
    try {
      const document = await dataService.updateGeneratedDocument(id, {
        status: 'sent'
      });
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du marquage du document:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Archiver un document
  async archiveDocument(id: string) {
    try {
      const document = await dataService.updateGeneratedDocument(id, {
        status: 'archived'
      });
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'archivage du document:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Générer un bulletin de notes
  async generateGradeReport(studentId: string, academicYear: string, semester: string) {
    try {
      const document = await dataService.generateGradeReport({
        studentId,
        academicYear,
        semester,
        templateId: 'grade-report-template'
      });
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Générer une attestation de scolarité
  async generateEnrollmentCertificate(studentId: string) {
    try {
      const document = await dataService.generateEnrollmentCertificate({
        studentId,
        templateId: 'enrollment-certificate-template'
      });
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération de l\'attestation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Générer une liste d'élèves
  async generateStudentList(classId: string, format: 'pdf' | 'xlsx' = 'pdf') {
    try {
      const document = await dataService.generateStudentList({
        classId,
        format,
        templateId: 'student-list-template'
      });
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la liste:', error);
        return {
          data: null,
          success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Générer un trombinoscope
  async generateTrombinoscope(classId: string) {
    try {
      const document = await dataService.generateTrombinoscope({
        classId,
        templateId: 'trombinoscope-template'
      });
      return {
        data: document,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du trombinoscope:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les statistiques de documents
  async getDocumentStats(schoolId: string) {
    try {
      const stats = await dataService.getDocumentStats(schoolId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
