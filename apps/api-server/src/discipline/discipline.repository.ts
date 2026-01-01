import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discipline } from './entities/discipline.entity';

@Injectable()
export class DisciplineRepository {
  constructor(
    @InjectRepository(Discipline)
    private readonly repository: Repository<Discipline>,
  ) {}

  async create(disciplineData: Partial<Discipline>): Promise<Discipline> {
    const discipline = this.repository.create(disciplineData);
    return this.repository.save(discipline);
  }

  async findOne(id: string, tenantId: string): Promise<Discipline | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['student', 'reporter'],
    });
  }

  async findAll(tenantId: string, studentId?: string, startDate?: Date, endDate?: Date): Promise<Discipline[]> {
    const query = this.repository.createQueryBuilder('discipline')
      .where('discipline.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('discipline.student', 'student')
      .leftJoinAndSelect('discipline.reporter', 'reporter');
    
    if (studentId) {
      query.andWhere('discipline.studentId = :studentId', { studentId });
    }
    if (startDate) {
      query.andWhere('discipline.incidentDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('discipline.incidentDate <= :endDate', { endDate });
    }
    
    return query.orderBy('discipline.incidentDate', 'DESC').getMany();
  }

  async update(id: string, tenantId: string, disciplineData: Partial<Discipline>): Promise<Discipline> {
    await this.repository.update({ id, tenantId }, disciplineData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

