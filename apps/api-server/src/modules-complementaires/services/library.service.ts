import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Service pour le sous-module 9.3 - Bibliothèque
 */
@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // BOOKS
  // ============================================================================

  async createBook(tenantId: string, academicYearId: string, data: any) {
    const book = await this.prisma.libraryBook.create({
      data: {
        tenantId,
        academicYearId,
        isbn: data.isbn,
        title: data.title,
        author: data.author,
        publisher: data.publisher,
        publicationYear: data.publicationYear,
        category: data.category,
        language: data.language || 'FR',
        totalCopies: data.totalCopies || 1,
        availableCopies: data.totalCopies || 1,
      },
    });

    // Créer les exemplaires
    if (data.totalCopies > 0) {
      for (let i = 1; i <= data.totalCopies; i++) {
        await this.prisma.libraryCopy.create({
          data: {
            bookId: book.id,
            copyNumber: `EX-${String(i).padStart(3, '0')}`,
            barcode: data.barcode ? `${data.barcode}-${i}` : null,
            status: 'AVAILABLE',
            condition: 'GOOD',
          },
        });
      }
    }

    return book;
  }

  async findAllBooks(tenantId: string, academicYearId: string, filters?: any) {
    const where: any = { tenantId, academicYearId };
    if (filters?.category) where.category = filters.category;
    if (filters?.author) where.author = { contains: filters.author, mode: 'insensitive' };
    if (filters?.title) where.title = { contains: filters.title, mode: 'insensitive' };

    return this.prisma.libraryBook.findMany({
      where,
      include: {
        copies: { where: { status: 'AVAILABLE' } },
        loans: { where: { status: 'ACTIVE' } },
      },
      orderBy: { title: 'asc' },
    });
  }

  // ============================================================================
  // LOANS
  // ============================================================================

  async loanBook(
    tenantId: string,
    academicYearId: string,
    data: { bookId: string; copyId: string; studentId: string; dueDate: Date },
    loanedBy: string,
  ) {
    const copy = await this.prisma.libraryCopy.findFirst({
      where: { id: data.copyId, bookId: data.bookId },
      include: { book: true },
    });

    if (!copy) throw new NotFoundException(`Copy with ID ${data.copyId} not found`);
    if (copy.status !== 'AVAILABLE') {
      throw new BadRequestException(`Copy is not available (status: ${copy.status})`);
    }

    // Créer l'emprunt
    const loan = await this.prisma.libraryLoan.create({
      data: {
        tenantId,
        academicYearId,
        bookId: data.bookId,
        copyId: data.copyId,
        studentId: data.studentId,
        loanDate: new Date(),
        dueDate: new Date(data.dueDate),
        status: 'ACTIVE',
        loanedBy,
      },
    });

    // Mettre à jour le statut de l'exemplaire et du livre
    await this.prisma.libraryCopy.update({
      where: { id: data.copyId },
      data: { status: 'LOANED' },
    });

    await this.prisma.libraryBook.update({
      where: { id: data.bookId },
      data: { availableCopies: { decrement: 1 } },
    });

    return loan;
  }

  async returnBook(loanId: string, tenantId: string, returnedBy: string) {
    const loan = await this.prisma.libraryLoan.findFirst({
      where: { id: loanId, tenantId, status: 'ACTIVE' },
      include: { copy: true, book: true },
    });

    if (!loan) throw new NotFoundException(`Active loan with ID ${loanId} not found`);

    const returnDate = new Date();
    const isOverdue = returnDate > loan.dueDate;

    // Mettre à jour l'emprunt
    const updatedLoan = await this.prisma.libraryLoan.update({
      where: { id: loanId },
      data: {
        returnDate,
        status: isOverdue ? 'OVERDUE' : 'RETURNED',
        returnedBy,
      },
    });

    // Mettre à jour l'exemplaire
    await this.prisma.libraryCopy.update({
      where: { id: loan.copyId },
      data: { status: 'AVAILABLE' },
    });

    // Mettre à jour le livre
    await this.prisma.libraryBook.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    // Créer une pénalité si en retard
    if (isOverdue) {
      const daysLate = Math.floor((returnDate.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      await this.prisma.libraryPenalty.create({
        data: {
          loanId,
          penaltyDate: returnDate,
          penaltyType: 'LATE_RETURN',
          amount: daysLate * 500, // 500 XOF par jour de retard
          description: `${daysLate} jour(s) de retard`,
        },
      });
    }

    return updatedLoan;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async getLibraryStats(tenantId: string, academicYearId: string) {
    const books = await this.prisma.libraryBook.findMany({
      where: { tenantId, academicYearId },
    });

    const loans = await this.prisma.libraryLoan.findMany({
      where: { tenantId, academicYearId },
    });

    const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
    const overdueLoans = loans.filter((l) => l.status === 'OVERDUE' || (l.status === 'ACTIVE' && new Date() > l.dueDate));

    const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const loanRate = totalCopies > 0 ? ((totalCopies - availableCopies) / totalCopies) * 100 : 0;

    return {
      totalBooks: books.length,
      totalCopies,
      availableCopies,
      loanedCopies: totalCopies - availableCopies,
      loanRate,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
    };
  }

  async findAllLoans(tenantId: string, academicYearId: string, filters?: any) {
    const where: any = { tenantId, academicYearId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.libraryLoan.findMany({
      where,
      include: {
        book: true,
        copy: true,
        student: { select: { id: true, firstName: true, lastName: true } },
        loaner: { select: { id: true, firstName: true, lastName: true } },
        returner: { select: { id: true, firstName: true, lastName: true } },
        penalties: true,
      },
      orderBy: { loanDate: 'desc' },
    });
  }

  async getOverdueLoans(tenantId: string, academicYearId: string) {
    return this.prisma.libraryLoan.findMany({
      where: {
        tenantId,
        academicYearId,
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
      },
      include: {
        book: true,
        copy: true,
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}

