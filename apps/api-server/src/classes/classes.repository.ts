import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';

@Injectable()
export class ClassesRepository {
  constructor(
    @InjectRepository(Class)
    private readonly repository: Repository<Class>,
  ) {}

  async create(classData: Partial<Class>): Promise<Class> {
    const classEntity = this.repository.create(classData);
    return this.repository.save(classEntity);
  }

  async findOne(id: string, tenantId: string): Promise<Class | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['academicYear'],
    });
  }

  async findAll(
    tenantId: string,
    pagination: { skip: number; take: number },
    academicYearId?: string,
  ): Promise<Class[]> {
    const queryBuilder = this.repository.createQueryBuilder('class')
      .where('class.tenantId = :tenantId', { tenantId })
      .orderBy('class.name', 'ASC')
      .skip(pagination.skip)
      .take(pagination.take);
    
    if (academicYearId) {
      queryBuilder.andWhere('class.academicYearId = :academicYearId', { academicYearId });
      queryBuilder.leftJoinAndSelect('class.academicYear', 'academicYear');
    }
    
    return queryBuilder.getMany();
  }

  async count(tenantId: string, academicYearId?: string): Promise<number> {
    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }
    return this.repository.count({ where });
  }

  async update(id: string, tenantId: string, classData: Partial<Class>): Promise<Class> {
    await this.repository.update({ id, tenantId }, classData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

