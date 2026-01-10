/**
 * ============================================================================
 * PAYROLL PRISMA CONTROLLER - MODULE 5
 * ============================================================================
 */

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PayrollPrismaService } from './payroll-prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { GetTenant } from '../common/decorators/get-tenant.decorator';

@Controller('api/hr/payroll')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PayrollPrismaController {
  constructor(private readonly payrollService: PayrollPrismaService) {}

  @Post()
  async createPayroll(@GetTenant() tenant: any, @Body() data: any) {
    return this.payrollService.createPayroll({
      ...data,
      tenantId: tenant.id,
    });
  }

  @Get()
  async findAllPayrolls(
    @GetTenant() tenant: any,
    @Query('academicYearId') academicYearId?: string,
    @Query('status') status?: string,
  ) {
    return this.payrollService.findAllPayrolls(tenant.id, {
      academicYearId,
      status,
    });
  }

  @Get('statistics')
  async getPayrollStatistics(
    @GetTenant() tenant: any,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.payrollService.getPayrollStatistics(tenant.id, academicYearId);
  }

  @Get(':id')
  async findPayrollById(@GetTenant() tenant: any, @Param('id') id: string) {
    return this.payrollService.findPayrollById(id, tenant.id);
  }

  @Post(':id/items')
  async addPayrollItem(@GetTenant() tenant: any, @Param('id') payrollId: string, @Body() data: any) {
    return this.payrollService.addPayrollItem({
      ...data,
      tenantId: tenant.id,
      payrollId,
    });
  }

  @Put(':id/validate')
  async validatePayroll(@GetTenant() tenant: any, @Param('id') id: string, @Body() body: { processedBy: string }) {
    return this.payrollService.validatePayroll(id, tenant.id, body.processedBy);
  }

  @Put(':id/mark-paid')
  async markPayrollAsPaid(@GetTenant() tenant: any, @Param('id') id: string) {
    return this.payrollService.markPayrollAsPaid(id, tenant.id);
  }

  @Post('items/:id/salary-slip')
  async generateSalarySlip(@GetTenant() tenant: any, @Param('id') payrollItemId: string, @Body() body: { issuedBy: string }) {
    return this.payrollService.generateSalarySlip(payrollItemId, tenant.id, body.issuedBy);
  }
}

