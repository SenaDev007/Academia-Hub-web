/**
 * ============================================================================
 * LESSON PLANS PRISMA CONTROLLER
 * ============================================================================
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LessonPlansPrismaService } from './lesson-plans-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('api/lesson-plans')
@UseGuards(JwtAuthGuard)
export class LessonPlansPrismaController {
  constructor(private readonly lessonPlansService: LessonPlansPrismaService) {}

  @Post()
  async create(
    @TenantId() tenantId: string,
    @Body() createDto: any,
  ) {
    return this.lessonPlansService.createLessonPlan({
      ...createDto,
      tenantId,
    });
  }

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolLevelId') schoolLevelId?: string,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lessonPlansService.findAllLessonPlans(tenantId, {
      academicYearId,
      schoolLevelId,
      classId,
      subjectId,
      teacherId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.lessonPlansService.findLessonPlanById(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateDto: any,
  ) {
    return this.lessonPlansService.updateLessonPlan(id, tenantId, updateDto);
  }

  @Post(':id/publish')
  async publish(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.lessonPlansService.publishLessonPlan(id, tenantId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.lessonPlansService.deleteLessonPlan(id, tenantId);
  }
}

