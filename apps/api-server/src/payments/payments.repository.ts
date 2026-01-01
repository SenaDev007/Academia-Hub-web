import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.repository.create(paymentData);
    return this.repository.save(payment);
  }

  async findOne(id: string, tenantId: string, schoolLevelId: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { id, tenantId, schoolLevelId }, // OBLIGATOIRE : Isolation par niveau
      relations: ['student', 'feeConfiguration'],
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
    const query = this.repository.createQueryBuilder('payment')
      .where('payment.tenantId = :tenantId', { tenantId })
      .andWhere('payment.schoolLevelId = :schoolLevelId', { schoolLevelId }) // OBLIGATOIRE
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('payment.feeConfiguration', 'feeConfiguration');
    
    if (studentId) {
      query.andWhere('payment.studentId = :studentId', { studentId });
    }
    if (status) {
      query.andWhere('payment.status = :status', { status });
    }
    if (startDate) {
      query.andWhere('payment.paymentDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('payment.paymentDate <= :endDate', { endDate });
    }
    
    return query.orderBy('payment.paymentDate', 'DESC').getMany();
  }

  async update(
    id: string,
    tenantId: string,
    schoolLevelId: string, // OBLIGATOIRE
    paymentData: Partial<Payment>,
  ): Promise<Payment> {
    await this.repository.update({ id, tenantId, schoolLevelId }, paymentData);
    return this.findOne(id, tenantId, schoolLevelId);
  }

  async delete(id: string, tenantId: string, schoolLevelId: string): Promise<void> {
    await this.repository.delete({ id, tenantId, schoolLevelId });
  }
}

