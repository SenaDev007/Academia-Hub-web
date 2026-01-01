import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quarter } from './entities/quarter.entity';

@Injectable()
export class QuartersRepository {
  constructor(
    @InjectRepository(Quarter)
    private readonly repository: Repository<Quarter>,
  ) {}

  async create(quarterData: Partial<Quarter>): Promise<Quarter> {
    const quarter = this.repository.create(quarterData);
    return this.repository.save(quarter);
  }

  async findOne(id: string, tenantId: string): Promise<Quarter | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['academicYear'],
    });
  }

  async findAll(tenantId: string, academicYearId?: string): Promise<Quarter[]> {
    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }
    return this.repository.find({
      where,
      order: { number: 'ASC' },
    });
  }

  async findCurrent(tenantId: string): Promise<Quarter | null> {
    return this.repository.findOne({
      where: { tenantId, isCurrent: true },
    });
  }

  async update(id: string, tenantId: string, quarterData: Partial<Quarter>): Promise<Quarter> {
    await this.repository.update({ id, tenantId }, quarterData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

