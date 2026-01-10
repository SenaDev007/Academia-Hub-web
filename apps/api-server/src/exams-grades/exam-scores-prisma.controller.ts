/**
 * ============================================================================
 * EXAM SCORES PRISMA CONTROLLER - MODULE 3
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
import { ExamScoresPrismaService } from './exam-scores-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/exam-scores')
@UseGuards(JwtAuthGuard)
export class ExamScoresPrismaController {
  constructor(private readonly scoresService: ExamScoresPrismaService) {}

  @Post()
  async createOrUpdate(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createDto: any,
  ) {
    return this.scoresService.createOrUpdateScore({
      ...createDto,
      tenantId,
      recordedBy: user?.id,
    });
  }

  @Get('exam/:examId')
  async findByExam(
    @Param('examId') examId: string,
    @TenantId() tenantId: string,
    @Query('isValidated') isValidated?: string,
    @Query('search') search?: string,
  ) {
    return this.scoresService.findScoresByExam(examId, tenantId, {
      isValidated: isValidated === 'true' ? true : isValidated === 'false' ? false : undefined,
      search,
    });
  }

  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId') studentId: string,
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolLevelId') schoolLevelId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('quarterId') quarterId?: string,
    @Query('isValidated') isValidated?: string,
  ) {
    return this.scoresService.findScoresByStudent(studentId, tenantId, {
      academicYearId,
      schoolLevelId,
      subjectId,
      quarterId,
      isValidated: isValidated === 'true' ? true : isValidated === 'false' ? false : undefined,
    });
  }

  @Post('validate')
  async validateScores(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() body: { scoreIds: string[] },
  ) {
    return this.scoresService.validateScores(body.scoreIds, tenantId, user?.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.scoresService.deleteScore(id, tenantId);
  }
}

