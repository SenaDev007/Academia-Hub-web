/**
 * ============================================================================
 * DAILY LOGS PRISMA CONTROLLER
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
import { DailyLogsPrismaService } from './daily-logs-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('api/daily-logs')
@UseGuards(JwtAuthGuard)
export class DailyLogsPrismaController {
  constructor(private readonly dailyLogsService: DailyLogsPrismaService) {}

  @Post()
  async create(
    @TenantId() tenantId: string,
    @Body() createDto: any,
  ) {
    return this.dailyLogsService.createDailyLog({
      ...createDto,
      tenantId,
    });
  }

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolLevelId') schoolLevelId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('classId') classId?: string,
    @Query('validated') validated?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dailyLogsService.findAllDailyLogs(tenantId, {
      academicYearId,
      schoolLevelId,
      teacherId,
      classId,
      validated: validated === 'true' ? true : validated === 'false' ? false : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.dailyLogsService.findDailyLogById(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateDto: any,
  ) {
    return this.dailyLogsService.updateDailyLog(id, tenantId, updateDto);
  }

  @Post(':id/validate')
  async validate(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() body: { validatedBy: string },
  ) {
    return this.dailyLogsService.validateDailyLog(id, tenantId, body.validatedBy);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.dailyLogsService.deleteDailyLog(id, tenantId);
  }
}

