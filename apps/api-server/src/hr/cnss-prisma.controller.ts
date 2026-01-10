/**
 * ============================================================================
 * CNSS PRISMA CONTROLLER - MODULE 5
 * ============================================================================
 */

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CNSSPrismaService } from './cnss-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { GetTenant } from '../common/decorators/get-tenant.decorator';

@Controller('api/hr/cnss')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CNSSPrismaController {
  constructor(private readonly cnssService: CNSSPrismaService) {}

  // Employee CNSS
  @Post('employees')
  async activateCNSS(@GetTenant() tenant: any, @Body() data: any) {
    return this.cnssService.activateCNSS({
      ...data,
      tenantId: tenant.id,
    });
  }

  @Put('employees/:staffId/deactivate')
  async deactivateCNSS(@GetTenant() tenant: any, @Param('staffId') staffId: string) {
    return this.cnssService.deactivateCNSS(staffId, tenant.id);
  }

  @Get('employees')
  async findAllEmployeeCNSS(
    @GetTenant() tenant: any,
    @Query('isActive') isActive?: string,
  ) {
    return this.cnssService.findAllEmployeeCNSS(tenant.id, {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  // CNSS Rates
  @Post('rates')
  async setCNSSRate(@Body() data: any) {
    return this.cnssService.setCNSSRate(data);
  }

  @Get('rates/:countryCode')
  async getCurrentCNSSRate(@Param('countryCode') countryCode: string) {
    return this.cnssService.getCurrentCNSSRate(countryCode);
  }

  // CNSS Declarations
  @Post('declarations')
  async createCNSSDeclaration(@GetTenant() tenant: any, @Body() data: any) {
    return this.cnssService.createCNSSDeclaration({
      ...data,
      tenantId: tenant.id,
    });
  }

  @Get('declarations')
  async findAllCNSSDeclarations(
    @GetTenant() tenant: any,
    @Query('academicYearId') academicYearId?: string,
    @Query('status') status?: string,
  ) {
    return this.cnssService.findAllCNSSDeclarations(tenant.id, {
      academicYearId,
      status,
    });
  }

  @Put('declarations/:id/declare')
  async markDeclarationAsDeclared(@GetTenant() tenant: any, @Param('id') id: string) {
    return this.cnssService.markDeclarationAsDeclared(id, tenant.id);
  }

  @Put('declarations/:id/mark-paid')
  async markDeclarationAsPaid(
    @GetTenant() tenant: any,
    @Param('id') id: string,
    @Body() body: { paymentReference: string; paymentProofPath?: string },
  ) {
    return this.cnssService.markDeclarationAsPaid(id, tenant.id, body.paymentReference, body.paymentProofPath);
  }
}

