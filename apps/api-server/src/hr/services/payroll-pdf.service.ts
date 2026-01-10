/**
 * ============================================================================
 * PAYROLL PDF SERVICE - MODULE 5
 * ============================================================================
 * 
 * Service pour la génération de bulletins de paie PDF officiels
 * 
 * ============================================================================
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PayrollPdfService {
  private readonly logger = new Logger(PayrollPdfService.name);
  private puppeteer: any = null;

  constructor(private readonly prisma: PrismaService) {
    this.loadPuppeteer();
  }

  private async loadPuppeteer() {
    try {
      this.puppeteer = await import('puppeteer');
      this.logger.log('Puppeteer loaded successfully for payroll PDF generation');
    } catch (error) {
      this.logger.warn(
        'Puppeteer not available. PDF generation will be limited. ' +
        'Install with: npm install puppeteer',
      );
      this.puppeteer = null;
    }
  }

  /**
   * Génère un bulletin de paie PDF officiel
   */
  async generatePaySlipPdf(payrollItemId: string, tenantId: string, userId: string) {
    const payrollItem = await this.prisma.payrollItem.findFirst({
      where: { id: payrollItemId, tenantId },
      include: {
        staff: {
          include: {
            employeeCNSS: true,
          },
        },
        payroll: {
          include: {
            tenant: true,
            academicYear: true,
            schoolLevel: true,
          },
        },
        taxWithholdings: {
          include: {
            taxRate: true,
          },
        },
        salarySlip: true,
      },
    });

    if (!payrollItem) {
      throw new NotFoundException(`Payroll item with ID ${payrollItemId} not found`);
    }

    // Vérifier que la paie est validée
    if (payrollItem.status !== 'VALIDATED') {
      throw new BadRequestException(
        `Cannot generate pay slip for payroll item with status ${payrollItem.status}. Must be VALIDATED.`,
      );
    }

    // Générer le numéro de reçu si pas déjà fait
    let salarySlip = payrollItem.salarySlip;
    if (!salarySlip) {
      const receiptNumber = await this.generateReceiptNumber(tenantId);
      salarySlip = await this.prisma.salarySlip.create({
        data: {
          payrollItemId,
          receiptNumber,
          period: payrollItem.payroll.month,
          issuedBy: userId,
        },
      });
    }

    // Générer le HTML du bulletin
    const html = this.generatePaySlipHtml(payrollItem, salarySlip);

    // Convertir en PDF
    if (!this.puppeteer) {
      throw new BadRequestException(
        'PDF generation is not available. Please install Puppeteer: npm install puppeteer',
      );
    }

    const pdfBuffer = await this.renderPdfFromHtml(html);

    // Sauvegarder le PDF
    const filePath = await this.savePdf(
      tenantId,
      payrollItem.payroll.month,
      salarySlip.receiptNumber,
      pdfBuffer,
    );

    // Mettre à jour le bulletin
    const updatedSlip = await this.prisma.salarySlip.update({
      where: { id: salarySlip.id },
      data: {
        filePath,
        pdfGenerated: true,
        pdfGeneratedAt: new Date(),
        content: JSON.stringify(this.extractPaySlipData(payrollItem, salarySlip)),
      },
    });

    return {
      ...updatedSlip,
      pdfBuffer,
    };
  }

  /**
   * Génère le HTML du bulletin de paie
   */
  private generatePaySlipHtml(payrollItem: any, salarySlip: any): string {
    const { staff, payroll } = payrollItem;
    const tenant = payroll.tenant;
    const academicYear = payroll.academicYear;

    // Calcul des montants
    const grossSalary = Number(payrollItem.grossSalary);
    const cnssEmployee = Number(payrollItem.cnssEmployee);
    const irppAmount = Number(payrollItem.irppAmount);
    const otherDeductions = Number(payrollItem.otherDeductions);
    const totalDeductions = Number(payrollItem.totalDeductions);
    const netSalary = Number(payrollItem.netSalary);

    // Format de date
    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin de Paie - ${staff.firstName} ${staff.lastName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      color: #333;
      padding: 20px;
      background: #fff;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 18pt;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 9pt;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .employee-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-label {
      font-weight: bold;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
      color: #2563eb;
    }
    .amount {
      text-align: right;
      font-weight: bold;
    }
    .total-row {
      background-color: #f9fafb;
      font-weight: bold;
      font-size: 12pt;
    }
    .net-amount {
      color: #059669;
      font-size: 14pt;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
    }
    .signature {
      text-align: center;
      margin-top: 40px;
    }
    .signature-line {
      border-top: 1px solid #333;
      width: 200px;
      margin: 0 auto;
      padding-top: 5px;
    }
    @media print {
      body {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BULLETIN DE PAIE</h1>
    <div class="header-info">
      <div>
        <strong>Établissement:</strong> ${tenant.name || 'N/A'}<br>
        <strong>Année scolaire:</strong> ${academicYear.name || 'N/A'}<br>
        <strong>Période:</strong> ${formatDate(payroll.startDate)} - ${formatDate(payroll.endDate)}
      </div>
      <div>
        <strong>N° Reçu:</strong> ${salarySlip.receiptNumber}<br>
        <strong>Date d'émission:</strong> ${formatDate(salarySlip.issuedAt)}<br>
        <strong>Mois:</strong> ${payroll.month}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">IDENTITÉ DE L'EMPLOYÉ</div>
    <div class="employee-info">
      <div>
        <div class="info-row">
          <span class="info-label">Nom:</span>
          <span class="info-value">${staff.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Prénom:</span>
          <span class="info-value">${staff.firstName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Matricule:</span>
          <span class="info-value">${staff.employeeNumber}</span>
        </div>
      </div>
      <div>
        <div class="info-row">
          <span class="info-label">Fonction:</span>
          <span class="info-value">${staff.position || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type de contrat:</span>
          <span class="info-value">${staff.contractType || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">N° CNSS:</span>
          <span class="info-value">${staff.employeeCNSS?.cnssNumber || 'N/A'}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">RÉMUNÉRATION</div>
    <table>
      <thead>
        <tr>
          <th>Élément</th>
          <th class="amount">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Salaire de base</td>
          <td class="amount">${Number(payrollItem.baseSalary).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        <tr>
          <td>Heures supplémentaires</td>
          <td class="amount">${Number(payrollItem.overtimeAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        <tr>
          <td>Primes</td>
          <td class="amount">${Number(payrollItem.bonuses).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        <tr class="total-row">
          <td><strong>BRUT TOTAL</strong></td>
          <td class="amount"><strong>${grossSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">RETENUES</div>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th class="amount">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>CNSS (Part employé)</td>
          <td class="amount">- ${cnssEmployee.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        <tr>
          <td>IRPP</td>
          <td class="amount">- ${irppAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        ${otherDeductions > 0 ? `
        <tr>
          <td>Autres retenues</td>
          <td class="amount">- ${otherDeductions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td><strong>TOTAL RETENUES</strong></td>
          <td class="amount"><strong>- ${totalDeductions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">RÉCAPITULATIF</div>
    <table>
      <tbody>
        <tr>
          <td>Brut imposable</td>
          <td class="amount">${Number(payrollItem.taxableAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</td>
        </tr>
        <tr class="total-row net-amount">
          <td><strong>NET À PAYER</strong></td>
          <td class="amount"><strong>${netSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>
      <strong>Mode de paiement:</strong> ${payrollItem.status === 'PAID' ? 'Payé' : 'À payer'}<br>
      ${payrollItem.paidAt ? `<strong>Date de paiement:</strong> ${formatDate(payrollItem.paidAt)}` : ''}
    </div>
    <div class="signature">
      <div class="signature-line">
        <strong>Signature employeur</strong>
      </div>
    </div>
  </div>

  <div style="margin-top: 20px; font-size: 8pt; color: #666; text-align: center;">
    <p>Document généré automatiquement par Academia Hub</p>
    <p>Ce document est un document officiel et non modifiable après génération</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Convertit le HTML en PDF
   */
  private async renderPdfFromHtml(html: string): Promise<Buffer> {
    if (!this.puppeteer) {
      throw new BadRequestException('Puppeteer is not available');
    }

    const browser = await this.puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Sauvegarde le PDF sur le système de fichiers
   */
  private async savePdf(
    tenantId: string,
    period: string,
    receiptNumber: string,
    pdfBuffer: Buffer,
  ): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pay-slips', tenantId, period);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `payslip-${receiptNumber}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    return filePath;
  }

  /**
   * Récupère le PDF d'un bulletin de paie
   */
  async getPaySlipPdf(payrollItemId: string, tenantId: string): Promise<Buffer | null> {
    const payrollItem = await this.prisma.payrollItem.findFirst({
      where: { id: payrollItemId, tenantId },
      include: {
        salarySlip: true,
      },
    });

    if (!payrollItem?.salarySlip?.filePath) {
      return null;
    }

    if (!fs.existsSync(payrollItem.salarySlip.filePath)) {
      throw new NotFoundException('PDF file not found on filesystem');
    }

    return fs.readFileSync(payrollItem.salarySlip.filePath);
  }

  /**
   * Génère un numéro de reçu unique
   */
  private async generateReceiptNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Compter les bulletins générés ce mois
    const count = await this.prisma.salarySlip.count({
      where: {
        period: `${year}-${month}`,
        payrollItem: {
          tenantId,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `BP-${year}${month}-${sequence}`;
  }

  /**
   * Extrait les données du bulletin pour stockage
   */
  private extractPaySlipData(payrollItem: any, salarySlip: any): any {
    return {
      receiptNumber: salarySlip.receiptNumber,
      period: salarySlip.period,
      employee: {
        name: `${payrollItem.staff.firstName} ${payrollItem.staff.lastName}`,
        employeeNumber: payrollItem.staff.employeeNumber,
        position: payrollItem.staff.position,
      },
      amounts: {
        grossSalary: Number(payrollItem.grossSalary),
        cnssEmployee: Number(payrollItem.cnssEmployee),
        irppAmount: Number(payrollItem.irppAmount),
        otherDeductions: Number(payrollItem.otherDeductions),
        totalDeductions: Number(payrollItem.totalDeductions),
        netSalary: Number(payrollItem.netSalary),
      },
      issuedAt: salarySlip.issuedAt,
    };
  }
}

