// Service de génération PDF
import { api } from '../lib/api/client'; avec communication sécurisée vers Electron

export interface PDFExportOptions {
  format: 'A4' | 'A5' | 'letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  quality: 'high' | 'medium' | 'low';
  includeHeader: boolean;
  includeFooter: boolean;
  customHeader?: string;
  customFooter?: string;
}

export interface PDFDocument {
  title: string;
  content: string | HTMLElement;
  styles?: PDFStyles;
  metadata?: {
    author: string;
    subject: string;
    keywords: string[];
    creationDate: Date;
  };
}

export interface PDFStyles {
  font?: {
    family: string;
    size: number;
    color: string;
  };
  header?: {
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
  body?: {
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  table?: {
    borderColor: string;
    headerBackground: string;
    cellPadding: number;
  };
}

export interface PDFReceiptData {
  id: string;
  studentName: string;
  class: string;
  amount: number;
  date: string;
  method: string;
  type: string;
  status: string;
  reference?: string;
  reduction?: number;
  amountGiven?: number;
  change?: number;
  studentData?: {
    id: string;
    name: string;
    class: string;
    matricule: string;
    parentName: string;
    parentPhone: string;
    address: string;
    schoolYear: string;
    totalExpected: number;
    totalPaid: number;
    totalRemaining: number;
  };
  items?: Array<{
    description: string;
    amount: number;
    quantity: number;
    total: number;
  }>;
}

export interface PDFCahierJournalData {
  entries: Array<{
    id: string;
    date: string;
    matiere: string;
    classe: string;
    titre: string;
    objectifs: string;
    competences: string;
    deroulement: string;
    supports: string;
    evaluation: string;
    observations?: string;
    duree: number;
    enseignant: string;
  }>;
  schoolInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    director?: string;
  };
  period: {
    start: string;
    end: string;
  };
  format: 'individual' | 'weekly' | 'monthly';
}

export interface PDFFichePedagogiqueData {
  saNumero: string;
  date: string;
  sequenceNumero: string;
  duree: number;
  classe: string;
  matiere: string;
  titre: string;
  objectifs: string;
  competences: string;
  deroulement: string;
  evaluation: string;
  supports: string;
  observations?: string;
  enseignant: string;
  schoolInfo: {
    name: string;
    address: string;
    city: string;
  };
}

class PDFService {
  private defaultOptions: PDFExportOptions = {
    format: 'A4',
    orientation: 'portrait',
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    quality: 'high',
    includeHeader: true,
    includeFooter: true
  };

  private defaultStyles: PDFStyles = {
    font: { family: 'Arial', size: 12, color: '#000000' },
    header: { fontSize: 18, color: '#1a365d', align: 'center' },
    body: { fontSize: 11, lineHeight: 1.4, color: '#2d3748' },
    table: { borderColor: '#e2e8f0', headerBackground: '#f8f9fa', cellPadding: 8 }
  };

  /**
   * Génère un reçu de paiement en PDF
   */
  async generateReceipt(data: PDFReceiptData, options?: Partial<PDFExportOptions>): Promise<Uint8Array> {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Utiliser l'API HTTP pour la génération PDF
      try {
        // TODO: Implémenter endpoint API pour générer un PDF
        // const result = await api.pdf.generate({ type: 'receipt', ... });
        throw new Error('PDF generation not yet implemented in API');
          type: 'receipt',
          data,
          options: finalOptions
        });
      } else {
        // Mode web - fallback
        return await this.generateReceiptWeb(data, finalOptions);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du reçu:', error);
      throw new Error(`Impossible de générer le reçu: ${error}`);
    }
  }

  /**
   * Génère un cahier journal en PDF
   */
  async generateCahierJournal(data: PDFCahierJournalData, options?: Partial<PDFExportOptions>): Promise<Uint8Array> {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Utiliser l'API HTTP
      try {
        // TODO: Implémenter endpoint API pour générer un PDF
        throw new Error('PDF generation not yet implemented in API');
          data,
          options: finalOptions
        });
      } else {
        return await this.generateCahierJournalWeb(data, finalOptions);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du cahier journal:', error);
      throw new Error(`Impossible de générer le cahier journal: ${error}`);
    }
  }

  /**
   * Génère une fiche pédagogique en PDF
   */
  async generateFichePedagogique(data: PDFFichePedagogiqueData, options?: Partial<PDFExportOptions>): Promise<Uint8Array> {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Utiliser l'API HTTP
      try {
        // TODO: Implémenter endpoint API pour générer un PDF
        throw new Error('PDF generation not yet implemented in API');
          data,
          options: finalOptions
        });
      } else {
        return await this.generateFichePedagogiqueWeb(data, finalOptions);
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la fiche pédagogique:', error);
      throw new Error(`Impossible de générer la fiche pédagogique: ${error}`);
    }
  }

  /**
   * Génère un rapport générique en PDF
   */
  async generateReport(title: string, content: string, options?: Partial<PDFExportOptions>): Promise<Uint8Array> {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Utiliser l'API HTTP
      try {
        // TODO: Implémenter endpoint API pour générer un PDF
        throw new Error('PDF generation not yet implemented in API');
          data: { title, content },
          options: finalOptions
        });
      } else {
        return await this.generateReportWeb(title, content, finalOptions);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw new Error(`Impossible de générer le rapport: ${error}`);
    }
  }

  /**
   * Sauvegarde un PDF localement
   */
  async savePDF(pdfData: Uint8Array, filename: string, directory?: string): Promise<string> {
    try {
      // Utiliser l'API HTTP
      try {
        // TODO: Implémenter endpoint API pour sauvegarder un PDF
        throw new Error('PDF save not yet implemented in API');
          data: pdfData,
          filename,
          directory: directory || 'exports'
        });
      } else {
        // Mode web - téléchargement
        return await this.downloadPDF(pdfData, filename);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du PDF:', error);
      throw new Error(`Impossible de sauvegarder le PDF: ${error}`);
    }
  }

  /**
   * Prévisualise un PDF
   */
  async previewPDF(pdfData: Uint8Array, filename: string): Promise<void> {
    try {
      // Utiliser l'API HTTP
      try {
        // TODO: Implémenter endpoint API pour prévisualiser un PDF
        throw new Error('PDF preview not yet implemented in API');
          data: pdfData,
          filename
        });
      } else {
        // Mode web - ouvrir dans un nouvel onglet
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      throw new Error(`Impossible de prévisualiser le PDF: ${error}`);
    }
  }

  /**
   * Imprime un PDF
   */
  async printPDF(pdfData: Uint8Array, filename: string): Promise<void> {
    try {
      // Utiliser l'API HTTP
      try {
        // TODO: Implémenter endpoint API pour imprimer un PDF
        throw new Error('PDF print not yet implemented in API');
          data: pdfData,
          filename
        });
      } else {
        // Mode web - utiliser l'impression du navigateur
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.print();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      throw new Error(`Impossible d\'imprimer le PDF: ${error}`);
    }
  }

  // Méthodes privées pour le mode web (fallback)
  private async generateReceiptWeb(data: PDFReceiptData, options: PDFExportOptions): Promise<Uint8Array> {
    // Simulation de génération PDF en mode web
    const html = this.generateReceiptHTML(data);
    return this.htmlToPDF(html, options);
  }

  private async generateCahierJournalWeb(data: PDFCahierJournalData, options: PDFExportOptions): Promise<Uint8Array> {
    const html = this.generateCahierJournalHTML(data);
    return this.htmlToPDF(html, options);
  }

  private async generateFichePedagogiqueWeb(data: PDFFichePedagogiqueData, options: PDFExportOptions): Promise<Uint8Array> {
    const html = this.generateFichePedagogiqueHTML(data);
    return this.htmlToPDF(html, options);
  }

  private async generateReportWeb(title: string, content: string, options: PDFExportOptions): Promise<Uint8Array> {
    const html = this.generateReportHTML(title, content);
    return this.htmlToPDF(html, options);
  }

  private async htmlToPDF(html: string, options: PDFExportOptions): Promise<Uint8Array> {
    // Utiliser jsPDF pour la génération web
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: options.orientation,
        unit: 'mm',
        format: options.format.toLowerCase()
      });

      doc.html(html, {
        callback: function (doc) {
          return doc.output('arraybuffer');
        },
        margin: [options.margins.top, options.margins.left, options.margins.bottom, options.margins.right],
        x: 0,
        y: 0
      });

      return new Uint8Array();
    } catch (error) {
      throw new Error('jsPDF non disponible');
    }
  }

  private async downloadPDF(pdfData: Uint8Array, filename: string): Promise<string> {
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return filename;
  }

  // Génération HTML pour les différents types de documents
  private generateReceiptHTML(data: PDFReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reçu de Paiement - ${data.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .section { margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REÇU DE PAIEMENT</h1>
          <p>N°: ${data.id}</p>
          <p>Date: ${new Date(data.date).toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="section">
          <h3>Élève: ${data.studentName}</h3>
          <p>Classe: ${data.class}</p>
          <p>Montant: ${data.amount} FCFA</p>
        </div>
        
        <div class="section">
          <table class="table">
            <thead>
              <tr><th>Description</th><th>Montant</th></tr>
            </thead>
            <tbody>
              ${data.items?.map(item => `
                <tr><td>${item.description}</td><td>${item.total} FCFA</td></tr>
              `).join('') || `<tr><td>${data.type}</td><td>${data.amount} FCFA</td></tr>`}
            </tbody>
          </table>
        </div>
        
        <div class="total">
          Total: ${data.amount} FCFA
        </div>
      </body>
      </html>
    `;
  }

  private generateCahierJournalHTML(data: PDFCahierJournalData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cahier Journal - ${data.period.start} au ${data.period.end}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .entry { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
          .entry-header { font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CAHIER JOURNAL</h1>
          <h2>${data.schoolInfo.name}</h2>
          <p>Période: ${data.period.start} au ${data.period.end}</p>
        </div>
        
        ${data.entries.map(entry => `
          <div class="entry">
            <div class="entry-header">
              ${entry.date} - ${entry.matiere} - ${entry.classe}
            </div>
            <p><strong>Titre:</strong> ${entry.titre}</p>
            <p><strong>Objectifs:</strong> ${entry.objectifs}</p>
            <p><strong>Durée:</strong> ${entry.duree} minutes</p>
            <p><strong>Enseignant:</strong> ${entry.enseignant}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }

  private generateFichePedagogiqueHTML(data: PDFFichePedagogiqueData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fiche Pédagogique - ${data.titre}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 20px 0; }
          .section h3 { color: #1a365d; border-bottom: 2px solid #1a365d; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RÉPUBLIQUE DU BÉNIN</h1>
          <h2>Ministère de l'Enseignement Maternel et Primaire</h2>
          <h3>FICHE PÉDAGOGIQUE</h3>
        </div>
        
        <div class="section">
          <h3>Identification</h3>
          <p>SA N°: ${data.saNumero}</p>
          <p>Date: ${data.date}</p>
          <p>Classe: ${data.classe}</p>
          <p>Matière: ${data.matiere}</p>
          <p>Durée: ${data.duree} minutes</p>
        </div>
        
        <div class="section">
          <h3>Titre de la séance</h3>
          <p>${data.titre}</p>
        </div>
        
        <div class="section">
          <h3>Objectifs pédagogiques</h3>
          <p>${data.objectifs}</p>
        </div>
        
        <div class="section">
          <h3>Déroulement de la séance</h3>
          <p>${data.deroulement}</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateReportHTML(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
      </body>
      </html>
    `;
  }
}

export const pdfService = new PDFService();

// Types pour l'API Electron
declare global {
  interface Window {
    electronAPI?: {
      generatePDF: (params: {
        type: string;
        data: any;
        options: PDFExportOptions;
      }) => Promise<Uint8Array>;
      savePDF: (params: {
        data: Uint8Array;
        filename: string;
        directory?: string;
      }) => Promise<string>;
      previewPDF: (params: {
        data: Uint8Array;
        filename: string;
      }) => Promise<void>;
      printPDF: (params: {
        data: Uint8Array;
        filename: string;
      }) => Promise<void>;
    };
  }
}
