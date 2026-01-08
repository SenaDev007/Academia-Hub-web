import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentFlowsService } from './payment-flows.service';
import { CreatePaymentFlowDto } from './dto/create-payment-flow.dto';
import { CreateSchoolPaymentAccountDto } from './dto/create-school-payment-account.dto';
import { PaymentFlowType, PaymentServiceProvider } from './entities/payment-flow.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('payment-flows')
@UseGuards(JwtAuthGuard)
export class PaymentFlowsController {
  constructor(private readonly paymentFlowsService: PaymentFlowsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  create(
    @Body() createDto: CreatePaymentFlowDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentFlowsService.createPaymentFlow(createDto, tenantId, user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER)
  findAll(
    @TenantId() tenantId: string,
    @Body() filters?: { flowType?: PaymentFlowType; status?: string; studentId?: string },
  ) {
    return this.paymentFlowsService.findAll(
      tenantId,
      filters?.flowType,
      filters?.status as any,
      filters?.studentId,
    );
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER)
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.paymentFlowsService.findOne(id, tenantId);
  }

  /**
   * Webhook endpoint pour Fedapay (public, sécurisé par signature)
   */
  @Post('webhooks/fedapay')
  @HttpCode(HttpStatus.OK)
  async handleFedapayWebhook(@Body() webhookData: any) {
    return this.paymentFlowsService.handleWebhook(PaymentServiceProvider.FEDAPAY, webhookData);
  }

  /**
   * Gestion des comptes de paiement école
   */
  @Post('school-accounts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  createSchoolAccount(
    @Body() createDto: CreateSchoolPaymentAccountDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentFlowsService.createSchoolPaymentAccount(createDto, tenantId, user.id);
  }

  @Get('school-accounts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  findAllSchoolAccounts(@TenantId() tenantId: string) {
    return this.paymentFlowsService.findAllSchoolPaymentAccounts(tenantId);
  }

  @Post('school-accounts/:id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  verifySchoolAccount(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentFlowsService.verifySchoolPaymentAccount(id, tenantId, user.id);
  }
}

