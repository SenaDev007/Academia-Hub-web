/**
 * ============================================================================
 * STUDENT ARREAR CONTROLLER
 * ============================================================================
 */

import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { StudentArrearService } from './student-arrear.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('api/finance/student-arrears')
@UseGuards(JwtAuthGuard)
export class StudentArrearController {
  constructor(private readonly arrearService: StudentArrearService) {}

  @Post('generate')
  async generateArrears(
    @Body() data: {
      fromAcademicYearId: string;
      toAcademicYearId: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.arrearService.generateArrearsForYear(
      user.tenantId || '',
      data.fromAcademicYearId,
      data.toAcademicYearId,
    );
  }

  @Get('student/:studentId')
  async getStudentArrears(
    @Param('studentId') studentId: string,
    @Query('toAcademicYearId') toAcademicYearId: string,
  ) {
    return this.arrearService.getStudentArrears(studentId, toAcademicYearId);
  }

  @Get()
  async getAllArrears(
    @Query('toAcademicYearId') toAcademicYearId: string,
    @Query('status') status?: string,
    @CurrentUser() user: User,
  ) {
    return this.arrearService.getAllArrears(
      user.tenantId || '',
      toAcademicYearId,
      status,
    );
  }

  @Get('stats')
  async getArrearStats(
    @Query('toAcademicYearId') toAcademicYearId: string,
    @CurrentUser() user: User,
  ) {
    return this.arrearService.getArrearStats(
      user.tenantId || '',
      toAcademicYearId,
    );
  }
}

