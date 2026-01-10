/**
 * ============================================================================
 * STUDENT ID CARD SERVICE - MODULE 1
 * ============================================================================
 * 
 * Service pour génération de cartes d'identité scolaires officielles
 * Format PDF/PNG avec QR Code vérifiable
 * 
 * ============================================================================
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StudentIdentifierService } from './student-identifier.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StudentIdCardService {
  private readonly logger = new Logger(StudentIdCardService.name);
  private puppeteer: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly identifierService: StudentIdentifierService,
  ) {
    this.loadPuppeteer();
  }

  private async loadPuppeteer() {
    try {
      this.puppeteer = await import('puppeteer');
      this.logger.log('Puppeteer loaded successfully for ID card generation');
    } catch (error) {
      this.logger.warn(
        'Puppeteer not available. PDF generation will be limited. ' +
        'Install with: npm install puppeteer',
      );
      this.puppeteer = null;
    }
  }

  /**
   * Génère une carte d'identité scolaire officielle pour un élève
   * Règle : Une carte par année scolaire (historique conservé)
   */
  async generateIdCard(
    tenantId: string,
    academicYearId: string,
    schoolLevelId: string,
    studentId: string,
    generatedBy?: string,
  ) {
    // Vérifier que l'élève existe
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        tenant: true,
        academicYear: true,
        schoolLevel: true,
        identifier: true,
        studentEnrollments: {
          where: {
            academicYearId,
            status: 'ACTIVE',
          },
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Vérifier que l'élève a un matricule global
    if (!student.identifier) {
      throw new BadRequestException(
        `Student must have a global matricule before generating ID card. Please generate matricule first.`,
      );
    }

    if (student.identifier.isOfflineGenerated && !student.identifier.synchronizedAt) {
      throw new BadRequestException(
        `Student has a temporary matricule. Please synchronize to get definitive matricule before generating ID card.`,
      );
    }

    // Vérifier qu'il n'y a pas déjà une carte pour cette année
    const existingCard = await this.prisma.studentIdCard.findFirst({
      where: {
        tenantId,
        academicYearId,
        studentId,
      },
    });

    if (existingCard && existingCard.isActive && !existingCard.isRevoked) {
      throw new BadRequestException(
        `Active ID card already exists for student ${studentId} in academic year ${academicYearId}`,
      );
    }

    // Générer le numéro de carte unique
    const cardNumber = await this.generateCardNumber(tenantId, academicYearId);

    // Générer le QR Code payload (matricule + tenant + hash de vérification)
    const qrPayload = this.generateQRPayload(
      student.identifier.globalMatricule,
      tenantId,
      studentId,
    );

    const qrHash = crypto
      .createHash('sha256')
      .update(qrPayload)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();

    // Récupérer la classe actuelle
    const currentClass = student.studentEnrollments[0]?.class;

    // Générer le HTML de la carte (face avant + arrière)
    const cardHtml = this.generateCardHtml(student, currentClass, student.identifier.globalMatricule, qrPayload);

    // Générer le PDF
    let pdfPath: string | null = null;
    let frontImagePath: string | null = null;
    let backImagePath: string | null = null;

    if (this.puppeteer) {
      const pdfBuffer = await this.renderPdfFromHtml(cardHtml);
      pdfPath = await this.savePdf(tenantId, academicYearId, cardNumber, pdfBuffer);

      // Extraire les images (face avant et arrière) depuis le PDF si nécessaire
      // Pour l'instant, on sauvegarde juste le PDF complet
    } else {
      this.logger.warn('Puppeteer not available. PDF generation skipped.');
    }

    // Date de validité (fin de l'année scolaire)
    const validUntil = student.academicYear.endDate || new Date(student.academicYear.startDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Créer la carte dans la base
    const idCard = await this.prisma.studentIdCard.create({
      data: {
        tenantId,
        academicYearId,
        schoolLevelId,
        studentId,
        cardNumber,
        qrPayload,
        qrHash,
        pdfPath,
        frontImagePath,
        backImagePath,
        validUntil,
        generatedBy,
        isActive: true,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        generator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`Generated ID card ${cardNumber} for student ${studentId}`);

    return idCard;
  }

  /**
   * Génère des cartes par lot (classe, niveau)
   */
  async generateBulkIdCards(
    tenantId: string,
    academicYearId: string,
    schoolLevelId: string,
    filters?: {
      classId?: string;
      status?: string;
    },
    generatedBy?: string,
  ) {
    const where: any = {
      tenantId,
      academicYearId,
      schoolLevelId,
      status: 'ACTIVE',
    };

    const students = await this.prisma.student.findMany({
      where,
      include: {
        identifier: {
          where: {
            isOfflineGenerated: false,
          },
        },
        studentEnrollments: {
          where: {
            academicYearId,
            status: 'ACTIVE',
            ...(filters?.classId && { classId: filters.classId }),
          },
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Filtrer les élèves qui ont déjà une carte active
    const cardsForYear = await this.prisma.studentIdCard.findMany({
      where: {
        tenantId,
        academicYearId,
        isActive: true,
        isRevoked: false,
      },
      select: {
        studentId: true,
      },
    });

    const studentsWithCardIds = new Set(cardsForYear.map((c) => c.studentId));

    const studentsWithoutCard = students.filter((student) => {
      return !studentsWithCardIds.has(student.id) && student.identifier && !student.identifier.isOfflineGenerated;
    });

    const results = await Promise.allSettled(
      studentsWithoutCard.map((student) =>
        this.generateIdCard(tenantId, academicYearId, schoolLevelId, student.id, generatedBy),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      total: studentsWithoutCard.length,
      succeeded,
      failed,
      results: results.map((r, index) => ({
        student: studentsWithoutCard[index],
        status: r.status,
        ...(r.status === 'rejected' && { error: (r as PromiseRejectedResult).reason.message }),
        ...(r.status === 'fulfilled' && { card: (r as PromiseFulfilledResult<any>).value }),
      })),
    };
  }

  /**
   * Récupère la carte d'un élève pour une année scolaire
   */
  async getStudentIdCard(
    studentId: string,
    tenantId: string,
    academicYearId: string,
  ) {
    const card = await this.prisma.studentIdCard.findFirst({
      where: {
        studentId,
        tenantId,
        academicYearId,
        isActive: true,
        isRevoked: false,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            identifier: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        schoolLevel: {
          select: {
            id: true,
            code: true,
            label: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(
        `No active ID card found for student ${studentId} in academic year ${academicYearId}`,
      );
    }

    return card;
  }

  /**
   * Récupère toutes les cartes d'un élève (historique)
   */
  async getStudentIdCardsHistory(studentId: string, tenantId: string) {
    return this.prisma.studentIdCard.findMany({
      where: { studentId, tenantId },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        schoolLevel: {
          select: {
            id: true,
            code: true,
            label: true,
          },
        },
      },
      orderBy: { academicYear: { startDate: 'desc' } },
    });
  }

  /**
   * Révoque une carte (perdue, volée, etc.)
   */
  async revokeIdCard(
    cardId: string,
    tenantId: string,
    revokedBy: string,
    reason: string,
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Revocation reason is mandatory');
    }

    const card = await this.prisma.studentIdCard.findFirst({
      where: { id: cardId, tenantId, isActive: true },
    });

    if (!card) {
      throw new NotFoundException(`Active ID card with ID ${cardId} not found`);
    }

    return this.prisma.studentIdCard.update({
      where: { id: cardId },
      data: {
        isActive: false,
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy,
        revocationReason: reason,
      },
    });
  }

  /**
   * Télécharge le PDF d'une carte
   */
  async downloadIdCardPdf(cardId: string, tenantId: string): Promise<Buffer | null> {
    const card = await this.prisma.studentIdCard.findFirst({
      where: { id: cardId, tenantId },
    });

    if (!card?.pdfPath) {
      throw new NotFoundException(`PDF file not found for card ${cardId}`);
    }

    if (!fs.existsSync(card.pdfPath)) {
      throw new NotFoundException(`PDF file not found on filesystem: ${card.pdfPath}`);
    }

    return fs.readFileSync(card.pdfPath);
  }

  /**
   * Vérifie un QR Code de carte (validation d'intégrité)
   */
  async verifyQRCode(qrPayload: string, qrHash: string): Promise<boolean> {
    const computedHash = crypto
      .createHash('sha256')
      .update(qrPayload)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();

    if (computedHash !== qrHash.toUpperCase()) {
      return false;
    }

    // Vérifier que la carte existe et est active
    const card = await this.prisma.studentIdCard.findFirst({
      where: {
        qrPayload,
        qrHash: qrHash.toUpperCase(),
        isActive: true,
        isRevoked: false,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    return !!card && card.student.status === 'ACTIVE';
  }

  /**
   * Génère le HTML de la carte (face avant + arrière)
   */
  private generateCardHtml(
    student: any,
    currentClass: any,
    matricule: string,
    qrPayload: string,
  ): string {
    const formatDate = (date: Date | null) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const academicYear = student.academicYear;
    const schoolLevel = student.schoolLevel;
    const tenant = student.tenant;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carte Scolaire - ${student.firstName} ${student.lastName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #333;
      background: #fff;
    }
    .card-container {
      display: flex;
      page-break-inside: avoid;
      margin-bottom: 20px;
    }
    .card {
      width: 85.6mm;
      height: 53.98mm;
      border: 2px solid #2563eb;
      border-radius: 8px;
      padding: 8px;
      margin: 10px;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      position: relative;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card-front {
      display: flex;
      flex-direction: column;
    }
    .card-back {
      display: flex;
      flex-direction: column;
      border-color: #059669;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
      margin-bottom: 8px;
    }
    .header h1 {
      font-size: 12pt;
      color: #2563eb;
      margin: 0;
    }
    .logo {
      font-size: 16pt;
      font-weight: bold;
      color: #2563eb;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .student-photo {
      width: 40mm;
      height: 45mm;
      border: 2px solid #2563eb;
      border-radius: 4px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      color: #666;
      margin-right: 8px;
    }
    .student-info {
      flex: 1;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 9pt;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      min-width: 60px;
    }
    .info-value {
      color: #333;
      text-align: right;
    }
    .matricule {
      font-size: 11pt;
      font-weight: bold;
      color: #2563eb;
      text-align: center;
      padding: 5px;
      background: #eff6ff;
      border-radius: 4px;
      margin-top: 5px;
    }
    .qr-code {
      width: 30mm;
      height: 30mm;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7pt;
      color: #666;
      margin: 0 auto;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 5px;
      margin-top: 5px;
      font-size: 7pt;
      color: #666;
      text-align: center;
    }
    .valid-until {
      font-size: 8pt;
      color: #059669;
      text-align: center;
      margin-top: 5px;
    }
    @media print {
      .card-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="card-container">
    <!-- Face avant -->
    <div class="card card-front">
      <div class="header">
        <div class="logo">🏫</div>
        <h1>CARTE SCOLAIRE</h1>
      </div>
      <div class="content" style="flex-direction: row;">
        <div class="student-photo">
          [PHOTO]
        </div>
        <div class="student-info">
          <div class="info-row">
            <span class="info-label">Nom:</span>
            <span class="info-value">${student.lastName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Prénom:</span>
            <span class="info-value">${student.firstName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Classe:</span>
            <span class="info-value">${currentClass?.name || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Niveau:</span>
            <span class="info-value">${schoolLevel.label || schoolLevel.code}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Année:</span>
            <span class="info-value">${academicYear.name || new Date(academicYear.startDate).getFullYear()}</span>
          </div>
          <div class="matricule">${matricule}</div>
        </div>
      </div>
      <div class="footer">
        <div>${tenant.name}</div>
      </div>
    </div>

    <!-- Face arrière -->
    <div class="card card-back">
      <div class="header">
        <div class="logo">📋</div>
        <h1>INFORMATIONS</h1>
      </div>
      <div class="content">
        <div class="info-row">
          <span class="info-label">Date de naissance:</span>
          <span class="info-value">${formatDate(student.dateOfBirth)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Sexe:</span>
          <span class="info-value">${student.gender || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Établissement:</span>
          <span class="info-value" style="font-size: 8pt;">${tenant.name}</span>
        </div>
        <div class="qr-code">
          <div style="text-align: center;">
            <div style="font-size: 20pt; margin-bottom: 5px;">📱</div>
            <div>QR Code</div>
            <div style="font-size: 6pt; margin-top: 3px;">${matricule}</div>
          </div>
        </div>
        <div class="valid-until">
          Valable jusqu'au ${formatDate(academicYear.endDate || new Date(academicYear.startDate))}
        </div>
      </div>
      <div class="footer">
        <div>Document officiel - Academia Hub</div>
        <div style="font-size: 6pt; margin-top: 2px;">QR Code vérifiable</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Génère le payload du QR Code
   */
  private generateQRPayload(globalMatricule: string, tenantId: string, studentId: string): string {
    // Format: AH:{matricule}:{tenantId}:{studentId}:{timestamp}
    const timestamp = Date.now();
    return `AH:${globalMatricule}:${tenantId}:${studentId}:${timestamp}`;
  }

  /**
   * Génère un numéro de carte unique
   */
  private async generateCardNumber(tenantId: string, academicYearId: string): Promise<string> {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${academicYearId} not found`);
    }

    const year = new Date(academicYear.startDate).getFullYear();

    // Compter les cartes générées cette année
    const count = await this.prisma.studentIdCard.count({
      where: {
        tenantId,
        academicYearId,
      },
    });

    const sequence = String(count + 1).padStart(6, '0');
    return `CARD-${year}-${sequence}`;
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
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Sauvegarde le PDF
   */
  private async savePdf(
    tenantId: string,
    academicYearId: string,
    cardNumber: string,
    pdfBuffer: Buffer,
  ): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'id-cards', tenantId, academicYearId);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `id-card-${cardNumber}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    return filePath;
  }

  /**
   * Récupère les statistiques des cartes
   */
  async getIdCardStats(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const cards = await this.prisma.studentIdCard.findMany({
      where,
      include: {
        student: {
          select: {
            status: true,
          },
        },
      },
    });

    const total = cards.length;
    const active = cards.filter((c) => c.isActive && !c.isRevoked).length;
    const revoked = cards.filter((c) => c.isRevoked).length;
    const expired = cards.filter((c) => c.validUntil && new Date(c.validUntil) < new Date()).length;

    return {
      total,
      active,
      revoked,
      expired,
      expiredRate: total > 0 ? (expired / total) * 100 : 0,
    };
  }
}

