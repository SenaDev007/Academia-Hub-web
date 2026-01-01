import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';

@Injectable()
export class AcademicYearsRepository {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly repository: Repository<AcademicYear>,
  ) {}

  async create(academicYearData: Partial<AcademicYear>): Promise<AcademicYear> {
    const academicYear = this.repository.create(academicYearData);
    return this.repository.save(academicYear);
  }

  async findOne(id: string, tenantId: string): Promise<AcademicYear | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['quarters'],
    });
  }

  async findAll(tenantId: string): Promise<AcademicYear[]> {
    return this.repository.find({
      where: { tenantId },
      order: { startDate: 'DESC' },
    });
  }

  async findCurrent(tenantId: string): Promise<AcademicYear | null> {
    return this.repository.findOne({
      where: { tenantId, isCurrent: true },
    });
  }

  async update(id: string, tenantId: string, academicYearData: Partial<AcademicYear>): Promise<AcademicYear> {
    await this.repository.update({ id, tenantId }, academicYearData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

