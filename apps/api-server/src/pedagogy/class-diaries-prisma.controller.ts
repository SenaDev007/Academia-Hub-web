/**
 * ============================================================================
 * CLASS DIARIES PRISMA CONTROLLER
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
import { ClassDiariesPrismaService } from './class-diaries-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('api/class-diaries')
@UseGuards(JwtAuthGuard)
export class ClassDiariesPrismaController {
  constructor(private readonly classDiariesService: ClassDiariesPrismaService) {}

  @Post()
  async create(
    @TenantId() tenantId: string,
    @Body() createDto: any,
  ) {
    return this.classDiariesService.createClassDiary({
      ...createDto,
      tenantId,
    });
  }

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolLevelId') schoolLevelId?: string,
    @Query('classSubjectId') classSubjectId?: string,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.classDiariesService.findAllClassDiaries(tenantId, {
      academicYearId,
      schoolLevelId,
      classSubjectId,
      classId,
      subjectId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.classDiariesService.findClassDiaryById(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateDto: any,
  ) {
    return this.classDiariesService.updateClassDiary(id, tenantId, updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.classDiariesService.deleteClassDiary(id, tenantId);
  }
}

