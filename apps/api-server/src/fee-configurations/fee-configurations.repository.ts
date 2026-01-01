import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeConfiguration } from './entities/fee-configuration.entity';

@Injectable()
export class FeeConfigurationsRepository {
  constructor(
    @InjectRepository(FeeConfiguration)
    private readonly repository: Repository<FeeConfiguration>,
  ) {}

  async create(feeConfigurationData: Partial<FeeConfiguration>): Promise<FeeConfiguration> {
    const feeConfiguration = this.repository.create(feeConfigurationData);
    return this.repository.save(feeConfiguration);
  }

  async findOne(id: string, tenantId: string): Promise<FeeConfiguration | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['class', 'academicYear'],
    });
  }

  async findAll(tenantId: string, classId?: string, academicYearId?: string): Promise<FeeConfiguration[]> {
    const where: any = { tenantId };
    if (classId) {
      where.classId = classId;
    }
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }
    return this.repository.find({
      where,
      relations: ['class', 'academicYear'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, tenantId: string, feeConfigurationData: Partial<FeeConfiguration>): Promise<FeeConfiguration> {
    await this.repository.update({ id, tenantId }, feeConfigurationData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

