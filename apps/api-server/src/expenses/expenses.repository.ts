import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
  ) {}

  async create(expenseData: Partial<Expense>): Promise<Expense> {
    const expense = this.repository.create(expenseData);
    return this.repository.save(expense);
  }

  async findOne(id: string, tenantId: string): Promise<Expense | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['approver', 'creator'],
    });
  }

  async findAll(tenantId: string, category?: string, status?: string, startDate?: Date, endDate?: Date): Promise<Expense[]> {
    const query = this.repository.createQueryBuilder('expense')
      .where('expense.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('expense.approver', 'approver')
      .leftJoinAndSelect('expense.creator', 'creator');
    
    if (category) {
      query.andWhere('expense.category = :category', { category });
    }
    if (status) {
      query.andWhere('expense.status = :status', { status });
    }
    if (startDate) {
      query.andWhere('expense.expenseDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('expense.expenseDate <= :endDate', { endDate });
    }
    
    return query.orderBy('expense.expenseDate', 'DESC').getMany();
  }

  async update(id: string, tenantId: string, expenseData: Partial<Expense>): Promise<Expense> {
    await this.repository.update({ id, tenantId }, expenseData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

