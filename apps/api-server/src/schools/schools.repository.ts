import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';

@Injectable()
export class SchoolsRepository {
  constructor(
    @InjectRepository(School)
    private readonly repository: Repository<School>,
  ) {}

  async create(schoolData: Partial<School>): Promise<School> {
    const school = this.repository.create(schoolData);
    return this.repository.save(school);
  }

  async findOne(tenantId: string): Promise<School | null> {
    return this.repository.findOne({
      where: { tenantId },
      relations: ['tenant'],
    });
  }

  async update(tenantId: string, schoolData: Partial<School>): Promise<School> {
    await this.repository.update({ tenantId }, schoolData);
    return this.findOne(tenantId);
  }
}

