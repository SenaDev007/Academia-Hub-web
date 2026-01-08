import { Controller, Get, UseGuards } from '@nestjs/common';
import { BilingualAnalysisService } from './services/bilingual-analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('orion/bilingual')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrionBilingualController {
  constructor(private readonly bilingualAnalysisService: BilingualAnalysisService) {}

  @Get('comparison')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  async getComparison(@TenantId() tenantId: string) {
    return this.bilingualAnalysisService.compareAverageScores(tenantId);
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  async getStatistics(@TenantId() tenantId: string) {
    const frStats = await this.bilingualAnalysisService.getTrackStatistics(tenantId, 'FR' as any);
    const enStats = await this.bilingualAnalysisService.getTrackStatistics(tenantId, 'EN' as any);
    return { fr: frStats, en: enStats };
  }

  @Get('class-gaps')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  async getClassGaps(@TenantId() tenantId: string) {
    return this.bilingualAnalysisService.analyzePerformanceGapByClass(tenantId);
  }

  @Get('alerts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  async getAlerts(@TenantId() tenantId: string) {
    return this.bilingualAnalysisService.generateBilingualAlerts(tenantId);
  }

  @Get('report')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  async getReport(@TenantId() tenantId: string) {
    return this.bilingualAnalysisService.generateComparativeReport(tenantId);
  }
}

