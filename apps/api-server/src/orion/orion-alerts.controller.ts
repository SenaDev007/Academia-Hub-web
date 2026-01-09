import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { OrionAlertsService } from './services/orion-alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orion/alerts')
@UseGuards(JwtAuthGuard)
export class OrionAlertsController {
  constructor(private readonly orionAlertsService: OrionAlertsService) {}

  @Get()
  async getActiveAlerts(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.orionAlertsService.getActiveAlerts(tenantId, academicYearId);
  }

  @Post('generate')
  async generateAlerts(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.orionAlertsService.generateAllAlerts(tenantId, academicYearId);
  }

  @Post(':id/acknowledge')
  async acknowledgeAlert(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    await this.orionAlertsService.acknowledgeAlert(id, tenantId, user?.id);
    return { success: true };
  }
}

