import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    tenantId: string,
    schoolLevelId: string, // OBLIGATOIRE
    createdBy?: string,
  ): Promise<Payment> {
    return this.paymentsRepository.create({
      ...createPaymentDto,
      tenantId,
      schoolLevelId, // OBLIGATOIRE
      createdBy,
    });
  }

  async findAll(
    tenantId: string,
    schoolLevelId: string, // OBLIGATOIRE
    studentId?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Payment[]> {
    return this.paymentsRepository.findAll(
      tenantId,
      schoolLevelId, // OBLIGATOIRE
      studentId,
      status,
      startDate,
      endDate,
    );
  }

  async findOne(id: string, tenantId: string, schoolLevelId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne(id, tenantId, schoolLevelId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    tenantId: string,
    schoolLevelId: string, // OBLIGATOIRE
  ): Promise<Payment> {
    await this.findOne(id, tenantId, schoolLevelId);
    return this.paymentsRepository.update(id, tenantId, schoolLevelId, updatePaymentDto);
  }

  async delete(id: string, tenantId: string, schoolLevelId: string): Promise<void> {
    await this.findOne(id, tenantId, schoolLevelId);
    await this.paymentsRepository.delete(id, tenantId, schoolLevelId);
  }
}

