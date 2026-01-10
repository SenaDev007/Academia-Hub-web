/**
 * ============================================================================
 * PAYROLL PRISMA CONTROLLER - MODULE 5
 * ============================================================================
 */

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { PayrollPrismaService } from './payroll-prisma.service';
import { TaxService } from './services/tax.service';
import { PayrollTaxService } from './services/payroll-tax.service';
import { PayrollPdfService } from './services/payroll-pdf.service';
import { HROrionService } from './services/hr-orion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { GetTenant } from '../common/decorators/get-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/hr/payroll')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PayrollPrismaController {
  constructor(
    private readonly payrollService: PayrollPrismaService,
    private readonly taxService: TaxService,
    private readonly payrollTaxService: PayrollTaxService,
    private readonly payrollPdfService: PayrollPdfService,
    private readonly hrOrionService: HROrionService,
  ) {}

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

  // ============================================================================
  // FISCALITÉ & RETENUES
  // ============================================================================

  @Post('items/:id/calculate')
  async calculatePayrollItem(
    @GetTenant() tenant: any,
    @Param('id') payrollItemId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('countryCode') countryCode: string = 'BJ',
  ) {
    return this.payrollTaxService.calculatePayrollItem(
      tenant.id,
      academicYearId,
      payrollItemId,
      countryCode,
    );
  }

  @Put('items/:id/validate')
  async validatePayrollItem(
    @GetTenant() tenant: any,
    @Param('id') payrollItemId: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollTaxService.validatePayrollItem(
      payrollItemId,
      tenant.id,
      user.id,
    );
  }

  @Put(':id/validate-with-tax')
  async validatePayrollWithTax(
    @GetTenant() tenant: any,
    @Param('id') payrollId: string,
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollTaxService.validatePayroll(
      payrollId,
      tenant.id,
      user.id,
    );
  }

  @Get('items/:id/tax-withholdings')
  async getTaxWithholdings(
    @GetTenant() tenant: any,
    @Param('id') payrollItemId: string,
  ) {
    return this.taxService.getTaxWithholdings(payrollItemId, tenant.id);
  }

  @Get('tax-stats')
  async getTaxStats(
    @GetTenant() tenant: any,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.taxService.getTaxStats(tenant.id, academicYearId);
  }

  // ============================================================================
  // BULLETINS DE PAIE PDF
  // ============================================================================

  @Post('items/:id/payslip-pdf')
  async generatePaySlipPdf(
    @GetTenant() tenant: any,
    @Param('id') payrollItemId: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollPdfService.generatePaySlipPdf(
      payrollItemId,
      tenant.id,
      user.id,
    );
  }

  @Get('items/:id/payslip-pdf')
  async getPaySlipPdf(
    @GetTenant() tenant: any,
    @Param('id') payrollItemId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.payrollPdfService.getPaySlipPdf(
      payrollItemId,
      tenant.id,
    );

    if (!pdfBuffer) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payslip-${payrollItemId}.pdf"`);
    return res.send(pdfBuffer);
  }

  // ============================================================================
  // ORION INTEGRATION
  // ============================================================================

  @Get('orion/kpis')
  async getPayrollAndTaxKPIs(
    @GetTenant() tenant: any,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.hrOrionService.getPayrollAndTaxKPIs(tenant.id, academicYearId);
  }

  @Get('orion/alerts')
  async getPayrollAndTaxAlerts(
    @GetTenant() tenant: any,
    @Query('academicYearId') academicYearId?: string,
  ) {
    const kpis = await this.hrOrionService.getPayrollAndTaxKPIs(tenant.id, academicYearId);
    return kpis.alerts;
  }
}

