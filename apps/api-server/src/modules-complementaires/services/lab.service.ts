import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Service pour le sous-module 9.4 - Laboratoires
 */
@Injectable()
export class LabService {
  constructor(private readonly prisma: PrismaService) {}

  async createLab(tenantId: string, academicYearId: string, data: any) {
    return this.prisma.lab.create({
      data: {
        tenantId,
        academicYearId,
        name: data.name,
        description: data.description,
        location: data.location,
        capacity: data.capacity,
        isActive: data.isActive !== false,
      },
    });
  }

  async addEquipment(labId: string, tenantId: string, data: any) {
    const lab = await this.prisma.lab.findFirst({ where: { id: labId, tenantId } });
    if (!lab) throw new NotFoundException(`Lab with ID ${labId} not found`);

    // Récupérer l'année scolaire active du lab
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'desc' },
    });
    if (!academicYear) throw new NotFoundException('No active academic year found');

    return this.prisma.labEquipment.create({
      data: {
        labId,
        academicYearId: academicYear.id,
        name: data.name,
        equipmentType: data.equipmentType,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        quantity: data.quantity || 1,
        condition: data.condition || 'GOOD',
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
        nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : null,
      },
    });
  }

  async reserveLab(labId: string, tenantId: string, data: any, reservedBy: string) {
    const lab = await this.prisma.lab.findFirst({ where: { id: labId, tenantId, isActive: true } });
    if (!lab) throw new NotFoundException(`Active lab with ID ${labId} not found`);

    // Vérifier les conflits de réservation
    const conflictingReservation = await this.prisma.labReservation.findFirst({
      where: {
        labId,
        reservationDate: new Date(data.reservationDate),
        status: { not: 'CANCELLED' },
        OR: [
          {
            startTime: { lte: data.startTime },
            endTime: { gte: data.startTime },
          },
          {
            startTime: { lte: data.endTime },
            endTime: { gte: data.endTime },
          },
        ],
      },
    });

    if (conflictingReservation) {
      throw new BadRequestException('Lab is already reserved for this time slot');
    }

    // Récupérer l'année scolaire active
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'desc' },
    });
    if (!academicYear) throw new NotFoundException('No active academic year found');

    return this.prisma.labReservation.create({
      data: {
        labId,
        academicYearId: academicYear.id,
        reservedBy: reservedBy || undefined,
        reservationDate: new Date(data.reservationDate),
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        status: data.status || 'CONFIRMED',
      },
    });
  }

  async reportIncident(equipmentId: string, tenantId: string, data: any, reportedBy: string) {
    const equipment = await this.prisma.labEquipment.findFirst({
      where: { id: equipmentId },
      include: { lab: true },
    });

    if (!equipment || equipment.lab.tenantId !== tenantId) {
      throw new NotFoundException(`Equipment with ID ${equipmentId} not found`);
    }

    return this.prisma.labIncident.create({
      data: {
        equipmentId,
        incidentDate: new Date(data.incidentDate),
        incidentType: data.incidentType,
        severity: data.severity || 'MEDIUM',
        description: data.description,
        resolved: false,
        reportedBy,
      },
    });
  }

  async findAllLabs(tenantId: string, academicYearId: string) {
    return this.prisma.lab.findMany({
      where: { tenantId, academicYearId, isActive: true },
      include: {
        equipment: true,
        reservations: {
          where: {
            reservationDate: { gte: new Date() },
            status: { not: 'CANCELLED' },
          },
          orderBy: { reservationDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllEquipment(labId: string, tenantId: string) {
    const lab = await this.prisma.lab.findFirst({ where: { id: labId, tenantId } });
    if (!lab) throw new NotFoundException(`Lab with ID ${labId} not found`);

    return this.prisma.labEquipment.findMany({
      where: { labId },
      include: {
        maintenance: { orderBy: { maintenanceDate: 'desc' }, take: 5 },
        incidents: { where: { resolved: false }, orderBy: { incidentDate: 'desc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateEquipment(id: string, labId: string, tenantId: string, data: any) {
    await this.findAllEquipment(labId, tenantId);
    const equipment = await this.prisma.labEquipment.findFirst({ where: { id, labId } });
    if (!equipment) throw new NotFoundException(`Equipment with ID ${id} not found`);

    return this.prisma.labEquipment.update({
      where: { id },
      data: {
        name: data.name,
        condition: data.condition,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
        nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : undefined,
      },
    });
  }

  async getLabStats(tenantId: string, academicYearId: string) {
    const labs = await this.prisma.lab.findMany({
      where: { tenantId, academicYearId, isActive: true },
      include: {
        equipment: true,
        reservations: {
          where: {
            reservationDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
            status: { not: 'CANCELLED' },
          },
        },
      },
    });

    const totalEquipment = labs.reduce((sum, lab) => sum + lab.equipment.length, 0);
    const equipmentInMaintenance = labs.reduce(
      (sum, lab) => sum + lab.equipment.filter((e) => e.condition === 'OUT_OF_ORDER').length,
      0,
    );

    return {
      totalLabs: labs.length,
      totalEquipment,
      equipmentInMaintenance,
      utilizationRate: labs.length > 0
        ? (labs.reduce((sum, lab) => sum + lab.reservations.length, 0) / labs.length) * 100
        : 0,
    };
  }
}

