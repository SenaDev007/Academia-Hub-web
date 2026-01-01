import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportData {
  personnel: any[];
  contracts: any[];
  trainings: any[];
  evaluations: any[];
}

export class ExportService {
  /**
   * Export des données en PDF
   */
  static async exportToPDF(data: ExportData, filename: string = 'rapport-rh.pdf') {
    try {
      const doc = new jsPDF();
      
      // Titre principal
      doc.setFontSize(20);
      doc.text('Rapport RH - Academia Hub', 20, 20);
      
      // Informations générales
      doc.setFontSize(12);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
      doc.text(`Total personnel: ${data.personnel.length}`, 20, 45);
      doc.text(`Total contrats: ${data.contracts.length}`, 20, 55);
      doc.text(`Total formations: ${data.trainings.length}`, 20, 65);
      
      // Tableau du personnel
      if (data.personnel.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Liste du Personnel', 20, 20);
        
        const personnelTable = data.personnel.map(person => [
          `${person.firstName} ${person.lastName}`,
          person.position,
          person.department,
          person.contract,
          `${person.salary} F CFA`,
          person.status
        ]);
        
        (doc as any).autoTable({
          head: [['Nom', 'Poste', 'Département', 'Contrat', 'Salaire', 'Statut']],
          body: personnelTable,
          startY: 30,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] }
        });
      }
      
      // Tableau des contrats
      if (data.contracts.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Liste des Contrats', 20, 20);
        
        const contractsTable = data.contracts.map(contract => [
          contract.employeeName,
          contract.position,
          contract.contractType,
          contract.startDate,
          contract.endDate,
          `${contract.salary} F CFA`
        ]);
        
        (doc as any).autoTable({
          head: [['Employé', 'Poste', 'Type', 'Début', 'Fin', 'Salaire']],
          body: contractsTable,
          startY: 30,
          theme: 'grid',
          headStyles: { fillColor: [34, 197, 94] }
        });
      }
      
      // Sauvegarde du PDF
      doc.save(filename);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      return false;
    }
  }
  
  /**
   * Export des données en Excel
   */
  static async exportToExcel(data: ExportData, filename: string = 'rapport-rh.xlsx') {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Feuille Personnel
      if (data.personnel.length > 0) {
        const personnelSheet = data.personnel.map(person => ({
          'Nom': person.firstName,
          'Prénom': person.lastName,
          'Poste': person.position,
          'Département': person.department,
          'Type de contrat': person.contract,
          'Salaire (F CFA)': person.salary,
          'Statut': person.status,
          'Date d\'embauche': person.hireDate,
          'Téléphone': person.phone,
          'Email': person.email
        }));
        
        const wsPersonnel = XLSX.utils.json_to_sheet(personnelSheet);
        XLSX.utils.book_append_sheet(workbook, wsPersonnel, 'Personnel');
      }
      
      // Feuille Contrats
      if (data.contracts.length > 0) {
        const contractsSheet = data.contracts.map(contract => ({
          'Nom employé': contract.employeeName,
          'Poste': contract.position,
          'Type de contrat': contract.contractType,
          'Date de début': contract.startDate,
          'Date de fin': contract.endDate,
          'Salaire (F CFA)': contract.salary,
          'Heures de travail': contract.workingHours,
          'Statut': contract.status
        }));
        
        const wsContracts = XLSX.utils.json_to_sheet(contractsSheet);
        XLSX.utils.book_append_sheet(workbook, wsContracts, 'Contrats');
      }
      
      // Feuille Formations
      if (data.trainings.length > 0) {
        const trainingsSheet = data.trainings.map(training => ({
          'Titre': training.title,
          'Catégorie': training.category,
          'Formateur': training.instructor,
          'Date de début': training.startDate,
          'Date de fin': training.endDate,
          'Durée': training.duration,
          'Participants': training.participants,
          'Coût (F CFA)': training.cost,
          'Statut': training.status
        }));
        
        const wsTrainings = XLSX.utils.json_to_sheet(trainingsSheet);
        XLSX.utils.book_append_sheet(workbook, wsTrainings, 'Formations');
      }
      
      // Feuille Évaluations
      if (data.evaluations.length > 0) {
        const evaluationsSheet = data.evaluations.map(evaluation => ({
          'Nom employé': evaluation.employeeName,
          'Poste': evaluation.position,
          'Date d\'évaluation': evaluation.evaluationDate,
          'Évaluateur': evaluation.evaluator,
          'Score global': evaluation.overallScore,
          'Critères': evaluation.criteria,
          'Objectifs': evaluation.objectives,
          'Prochaine évaluation': evaluation.nextEvaluation
        }));
        
        const wsEvaluations = XLSX.utils.json_to_sheet(evaluationsSheet);
        XLSX.utils.book_append_sheet(workbook, wsEvaluations, 'Évaluations');
      }
      
      // Sauvegarde du fichier Excel
      XLSX.writeFile(workbook, filename);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      return false;
    }
  }
  
  /**
   * Export des statistiques RH
   */
  static async exportStatsToPDF(stats: any, filename: string = 'statistiques-rh.pdf') {
    try {
      const doc = new jsPDF();
      
      // Titre
      doc.setFontSize(20);
      doc.text('Statistiques RH - Academia Hub', 20, 20);
      
      // Statistiques générales
      doc.setFontSize(14);
      doc.text('Vue d\'ensemble', 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Personnel actif: ${stats.activeTeachers || 0}`, 20, 55);
      doc.text(`Masse salariale: ${stats.totalSalary?.toLocaleString() || 0} F CFA`, 20, 65);
      doc.text(`Formations ce mois: ${stats.trainingsThisMonth || 0}`, 20, 75);
      doc.text(`Satisfaction moyenne: ${stats.satisfactionScore?.toFixed(1) || 0}/5`, 20, 85);
      
      // Graphique des départements (simulation)
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Répartition par département', 20, 20);
      
      // Sauvegarde
      doc.save(filename);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export des stats:', error);
      return false;
    }
  }
}

export default ExportService;
