import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentFlow, PaymentFlowType, PaymentFlowStatus } from './entities/payment-flow.entity';
import { SchoolPaymentAccount } from './entities/school-payment-account.entity';
import { CreatePaymentFlowDto } from './dto/create-payment-flow.dto';

@Injectable()
export class PaymentFlowsRepository {
  constructor(
    @InjectRepository(PaymentFlow)
    private readonly repository: Repository<PaymentFlow>,
  ) {}

  async create(data: CreatePaymentFlowDto & { tenantId: string; destination: string; initiatedBy?: string }): Promise<PaymentFlow> {
    const flow = this.repository.create(data);
    return this.repository.save(flow);
  }

  async findAll(
    tenantId: string,
    flowType?: PaymentFlowType,
    status?: PaymentFlowStatus,
    studentId?: string,
  ): Promise<PaymentFlow[]> {
    const where: any = { tenantId };
    if (flowType) {
      where.flowType = flowType;
    }
    if (status) {
      where.status = status;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    return this.repository.find({
      where,
      relations: ['student', 'initiatedByUser', 'tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<PaymentFlow | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['student', 'initiatedByUser', 'tenant'],
    });
  }

  async findByPspReference(pspReference: string): Promise<PaymentFlow | null> {
    return this.repository.findOne({
      where: { pspReference },
      relations: ['tenant', 'student'],
    });
  }

  async update(id: string, tenantId: string, data: Partial<PaymentFlow>): Promise<PaymentFlow> {
    await this.repository.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async updateByPspReference(pspReference: string, data: Partial<PaymentFlow>): Promise<PaymentFlow> {
    const flow = await this.findByPspReference(pspReference);
    if (!flow) {
      throw new Error(`Payment flow with PSP reference ${pspReference} not found`);
    }
    await this.repository.update({ id: flow.id }, data);
    return this.findOne(flow.id, flow.tenantId);
  }
}

@Injectable()
export class SchoolPaymentAccountsRepository {
  constructor(
    @InjectRepository(SchoolPaymentAccount)
    private readonly repository: Repository<SchoolPaymentAccount>,
  ) {}

  async create(data: Partial<SchoolPaymentAccount>): Promise<SchoolPaymentAccount> {
    const account = this.repository.create(data);
    return this.repository.save(account);
  }

  async findAll(tenantId: string): Promise<SchoolPaymentAccount[]> {
    return this.repository.find({
      where: { tenantId },
      relations: ['creator', 'verifiedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<SchoolPaymentAccount | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['creator', 'verifiedByUser'],
    });
  }

  async findActive(tenantId: string, psp?: string): Promise<SchoolPaymentAccount | null> {
    const where: any = { tenantId, isActive: true, isVerified: true };
    if (psp) {
      where.psp = psp;
    }
    return this.repository.findOne({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, tenantId: string, data: Partial<SchoolPaymentAccount>): Promise<SchoolPaymentAccount> {
    await this.repository.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

