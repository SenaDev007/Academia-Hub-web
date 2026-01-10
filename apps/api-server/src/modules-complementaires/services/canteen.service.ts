import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Service pour le sous-module 9.1 - Cantine Scolaire
 */
@Injectable()
export class CanteenService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // MENUS
  // ============================================================================

  async createMenu(tenantId: string, academicYearId: string, data: any) {
    return this.prisma.canteenMenu.create({
      data: {
        tenantId,
        academicYearId,
        weekNumber: data.weekNumber,
        weekStartDate: new Date(data.weekStartDate),
        weekEndDate: new Date(data.weekEndDate),
        isActive: data.isActive !== false,
      },
    });
  }

  async findAllMenus(tenantId: string, academicYearId: string) {
    return this.prisma.canteenMenu.findMany({
      where: { tenantId, academicYearId },
      include: { meals: true },
      orderBy: { weekStartDate: 'desc' },
    });
  }

  async findMenu(id: string, tenantId: string) {
    const menu = await this.prisma.canteenMenu.findFirst({
      where: { id, tenantId },
      include: { meals: true },
    });
    if (!menu) throw new NotFoundException(`Menu with ID ${id} not found`);
    return menu;
  }

  async updateMenu(id: string, tenantId: string, data: any) {
    await this.findMenu(id, tenantId);
    return this.prisma.canteenMenu.update({
      where: { id },
      data: {
        weekNumber: data.weekNumber,
        weekStartDate: data.weekStartDate ? new Date(data.weekStartDate) : undefined,
        weekEndDate: data.weekEndDate ? new Date(data.weekEndDate) : undefined,
        isActive: data.isActive,
      },
    });
  }

  async deleteMenu(id: string, tenantId: string) {
    await this.findMenu(id, tenantId);
    // Soft delete
    return this.prisma.canteenMenu.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================================================
  // MEALS
  // ============================================================================

  async addMeal(menuId: string, tenantId: string, data: any) {
    const menu = await this.findMenu(menuId, tenantId);
    return this.prisma.canteenMeal.create({
      data: {
        menuId,
        dayOfWeek: data.dayOfWeek,
        mealType: data.mealType,
        name: data.name,
        description: data.description,
        price: data.price,
      },
    });
  }

  async updateMeal(id: string, menuId: string, tenantId: string, data: any) {
    await this.findMenu(menuId, tenantId);
    const meal = await this.prisma.canteenMeal.findFirst({ where: { id, menuId } });
    if (!meal) throw new NotFoundException(`Meal with ID ${id} not found`);
    return this.prisma.canteenMeal.update({
      where: { id },
      data,
    });
  }

  async deleteMeal(id: string, menuId: string, tenantId: string) {
    await this.findMenu(menuId, tenantId);
    return this.prisma.canteenMeal.delete({ where: { id } });
  }

  // ============================================================================
  // ENROLLMENTS
  // ============================================================================

  async enrollStudent(tenantId: string, academicYearId: string, data: any) {
    return this.prisma.canteenEnrollment.create({
      data: {
        tenantId,
        academicYearId,
        studentId: data.studentId,
        schoolLevelId: data.schoolLevelId,
        classId: data.classId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        mealTypes: data.mealTypes || [],
        isActive: true,
      },
    });
  }

  async findAllEnrollments(tenantId: string, academicYearId: string, filters?: any) {
    const where: any = { tenantId, academicYearId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.canteenEnrollment.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        schoolLevel: true,
        class: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateEnrollment(id: string, tenantId: string, data: any) {
    const enrollment = await this.prisma.canteenEnrollment.findFirst({
      where: { id, tenantId },
    });
    if (!enrollment) throw new NotFoundException(`Enrollment with ID ${id} not found`);

    return this.prisma.canteenEnrollment.update({
      where: { id },
      data: {
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        mealTypes: data.mealTypes,
        isActive: data.isActive,
      },
    });
  }

  // ============================================================================
  // ATTENDANCES
  // ============================================================================

  async recordAttendance(enrollmentId: string, tenantId: string, data: any, recordedBy: string) {
    const enrollment = await this.prisma.canteenEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);

    return this.prisma.canteenAttendance.upsert({
      where: {
        enrollmentId_mealDate_mealType: {
          enrollmentId,
          mealDate: new Date(data.mealDate),
          mealType: data.mealType,
        },
      },
      create: {
        enrollmentId,
        mealDate: new Date(data.mealDate),
        mealType: data.mealType,
        status: data.status || 'PRESENT',
        notes: data.notes,
        recordedBy,
      },
      update: {
        status: data.status,
        notes: data.notes,
      },
    });
  }

  async getAttendanceStats(tenantId: string, academicYearId: string, startDate?: Date, endDate?: Date) {
    const enrollments = await this.prisma.canteenEnrollment.findMany({
      where: { tenantId, academicYearId, isActive: true },
      include: {
        attendances: {
          where: {
            mealDate: {
              gte: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
              lte: endDate || new Date(),
            },
          },
        },
      },
    });

    let total = 0;
    let present = 0;
    let absent = 0;
    let excused = 0;

    enrollments.forEach((enrollment) => {
      enrollment.attendances.forEach((attendance) => {
        total++;
        if (attendance.status === 'PRESENT') present++;
        else if (attendance.status === 'ABSENT') absent++;
        else if (attendance.status === 'EXCUSED') excused++;
      });
    });

    return {
      total,
      present,
      absent,
      excused,
      attendanceRate: total > 0 ? (present / total) * 100 : 0,
    };
  }

  // ============================================================================
  // ALLERGIES
  // ============================================================================

  async addAllergy(enrollmentId: string, tenantId: string, data: any) {
    const enrollment = await this.prisma.canteenEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);

    return this.prisma.canteenAllergy.create({
      data: {
        enrollmentId,
        allergen: data.allergen,
        severity: data.severity || 'MODERATE',
        notes: data.notes,
      },
    });
  }

  async getStudentAllergies(studentId: string, tenantId: string, academicYearId: string) {
    const enrollment = await this.prisma.canteenEnrollment.findFirst({
      where: { studentId, tenantId, academicYearId },
      include: { allergies: true },
    });
    return enrollment?.allergies || [];
  }

  async findAllMeals(menuId: string, tenantId: string) {
    await this.findMenu(menuId, tenantId);
    return this.prisma.canteenMeal.findMany({
      where: { menuId },
      orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
    });
  }

  async deleteEnrollment(id: string, tenantId: string) {
    const enrollment = await this.prisma.canteenEnrollment.findFirst({
      where: { id, tenantId },
    });
    if (!enrollment) throw new NotFoundException(`Enrollment with ID ${id} not found`);

    // Soft delete
    return this.prisma.canteenEnrollment.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

