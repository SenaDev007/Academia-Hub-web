import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Service pour le sous-module 9.2 - Transport Scolaire
 */
@Injectable()
export class TransportService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // VEHICLES
  // ============================================================================

  async createVehicle(tenantId: string, academicYearId: string, data: any) {
    return this.prisma.vehicle.create({
      data: {
        tenantId,
        academicYearId,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        capacity: data.capacity,
        driverId: data.driverId,
        status: data.status || 'ACTIVE',
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
      },
    });
  }

  async findAllVehicles(tenantId: string, academicYearId: string) {
    return this.prisma.vehicle.findMany({
      where: { tenantId, academicYearId },
      include: { routes: true },
      orderBy: { plateNumber: 'asc' },
    });
  }

  async findVehicle(id: string, tenantId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: { routes: { include: { stops: true } } },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle with ID ${id} not found`);
    return vehicle;
  }

  async updateVehicle(id: string, tenantId: string, data: any) {
    await this.findVehicle(id, tenantId);
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        capacity: data.capacity,
        driverId: data.driverId,
        status: data.status,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
      },
    });
  }

  // ============================================================================
  // ROUTES
  // ============================================================================

  async createRoute(tenantId: string, academicYearId: string, data: any) {
    return this.prisma.route.create({
      data: {
        tenantId,
        academicYearId,
        vehicleId: data.vehicleId,
        name: data.name,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive !== false,
      },
    });
  }

  async addRouteStop(routeId: string, tenantId: string, data: any) {
    const route = await this.prisma.route.findFirst({ where: { id: routeId, tenantId } });
    if (!route) throw new NotFoundException(`Route with ID ${routeId} not found`);

    return this.prisma.routeStop.create({
      data: {
        routeId,
        stopOrder: data.stopOrder,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        arrivalTime: data.arrivalTime,
      },
    });
  }

  // ============================================================================
  // ASSIGNMENTS
  // ============================================================================

  async assignStudent(tenantId: string, academicYearId: string, data: any) {
    return this.prisma.transportAssignment.create({
      data: {
        tenantId,
        academicYearId,
        studentId: data.studentId,
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        stopId: data.stopId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: true,
      },
    });
  }

  async recordAttendance(assignmentId: string, tenantId: string, data: any, recordedBy: string) {
    const assignment = await this.prisma.transportAssignment.findFirst({
      where: { id: assignmentId, tenantId },
    });
    if (!assignment) throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);

    return this.prisma.transportAttendance.upsert({
      where: {
        assignmentId_attendanceDate_direction: {
          assignmentId,
          attendanceDate: new Date(data.attendanceDate),
          direction: data.direction,
        },
      },
      create: {
        assignmentId,
        attendanceDate: new Date(data.attendanceDate),
        direction: data.direction,
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

  // ============================================================================
  // INCIDENTS
  // ============================================================================

  async reportIncident(tenantId: string, academicYearId: string, data: any, reportedBy: string) {
    return this.prisma.transportIncident.create({
      data: {
        tenantId,
        academicYearId,
        vehicleId: data.vehicleId,
        routeId: data.routeId,
        incidentDate: new Date(data.incidentDate),
        incidentType: data.incidentType,
        severity: data.severity || 'MEDIUM',
        description: data.description,
        affectedStudents: data.affectedStudents,
        resolved: false,
        reportedBy,
      },
    });
  }

  async getIncidents(tenantId: string, academicYearId: string, filters?: any) {
    const where: any = { tenantId, academicYearId };
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.resolved !== undefined) where.resolved = filters.resolved;

    return this.prisma.transportIncident.findMany({
      where,
      include: {
        vehicle: true,
        route: true,
        reporter: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { incidentDate: 'desc' },
    });
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async findAllRoutes(tenantId: string, academicYearId: string) {
    return this.prisma.route.findMany({
      where: { tenantId, academicYearId },
      include: {
        vehicle: true,
        stops: { orderBy: { stopOrder: 'asc' } },
        assignments: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllAssignments(tenantId: string, academicYearId: string, filters?: any) {
    const where: any = { tenantId, academicYearId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.transportAssignment.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        route: { include: { stops: true } },
        vehicle: true,
        stop: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAssignment(id: string, tenantId: string, data: any) {
    const assignment = await this.prisma.transportAssignment.findFirst({
      where: { id, tenantId },
    });
    if (!assignment) throw new NotFoundException(`Assignment with ID ${id} not found`);

    return this.prisma.transportAssignment.update({
      where: { id },
      data: {
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        stopId: data.stopId,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive,
      },
    });
  }

  async getTransportStats(tenantId: string, academicYearId: string) {
    const assignments = await this.prisma.transportAssignment.findMany({
      where: { tenantId, academicYearId, isActive: true },
      include: {
        attendances: {
          where: {
            attendanceDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        },
      },
    });

    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId, academicYearId },
      include: { assignments: { where: { isActive: true } } },
    });

    let totalAttendance = 0;
    let presentAttendance = 0;

    assignments.forEach((assignment) => {
      assignment.attendances.forEach((attendance) => {
        totalAttendance++;
        if (attendance.status === 'PRESENT') presentAttendance++;
      });
    });

    const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
    const occupiedSeats = assignments.length;
    const occupancyRate = totalCapacity > 0 ? (occupiedSeats / totalCapacity) * 100 : 0;

    return {
      totalVehicles: vehicles.length,
      activeAssignments: assignments.length,
      totalCapacity,
      occupiedSeats,
      occupancyRate,
      attendanceRate: totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0,
    };
  }
}

