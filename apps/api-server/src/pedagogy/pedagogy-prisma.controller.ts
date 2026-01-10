/**
 * ============================================================================
 * PEDAGOGY PRISMA CONTROLLER
 * ============================================================================
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PedagogyPrismaService } from './pedagogy-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('api/pedagogy')
@UseGuards(JwtAuthGuard)
export class PedagogyPrismaController {
  constructor(private readonly pedagogyService: PedagogyPrismaService) {}

  @Post('teacher-subjects')
  async createTeacherSubject(
    @TenantId() tenantId: string,
    @Body() createDto: any,
  ) {
    return this.pedagogyService.createTeacherSubject({
      ...createDto,
      tenantId,
    });
  }

  @Get('teacher-subjects/:teacherId')
  async getTeacherSubjects(
    @Param('teacherId') teacherId: string,
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.pedagogyService.getTeacherSubjects(teacherId, tenantId, academicYearId);
  }

  @Delete('teacher-subjects/:id')
  async removeTeacherSubject(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pedagogyService.removeTeacherSubject(id, tenantId);
  }

  @Post('class-subjects')
  async createClassSubject(
    @TenantId() tenantId: string,
    @Body() createDto: any,
  ) {
    return this.pedagogyService.createClassSubject({
      ...createDto,
      tenantId,
    });
  }

  @Get('class-subjects/:classId')
  async getClassSubjects(
    @Param('classId') classId: string,
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.pedagogyService.getClassSubjects(classId, tenantId, academicYearId);
  }

  @Delete('class-subjects/:id')
  async removeClassSubject(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pedagogyService.removeClassSubject(id, tenantId);
  }

  @Post('teacher-class-assignments')
  async createTeacherClassAssignment(
    @TenantId() tenantId: string,
    @Body() createDto: any,
  ) {
    return this.pedagogyService.createTeacherClassAssignment({
      ...createDto,
      tenantId,
    });
  }

  @Delete('teacher-class-assignments/:id')
  async removeTeacherClassAssignment(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pedagogyService.removeTeacherClassAssignment(id, tenantId);
  }
}

