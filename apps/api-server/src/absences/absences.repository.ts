import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Absence } from './entities/absence.entity';

@Injectable()
export class AbsencesRepository {
  constructor(
    @InjectRepository(Absence)
    private readonly repository: Repository<Absence>,
  ) {}

  async create(absenceData: Partial<Absence>): Promise<Absence> {
    const absence = this.repository.create(absenceData);
    return this.repository.save(absence);
  }

  async findOne(id: string, tenantId: string): Promise<Absence | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['student', 'class'],
    });
  }

  async findAll(tenantId: string, studentId?: string, classId?: string, startDate?: Date, endDate?: Date): Promise<Absence[]> {
    const where: any = { tenantId };
    if (studentId) {
      where.studentId = studentId;
    }
    if (classId) {
      where.classId = classId;
    }
    const query = this.repository.createQueryBuilder('absence')
      .where('absence.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('absence.student', 'student')
      .leftJoinAndSelect('absence.class', 'class');
    
    if (studentId) {
      query.andWhere('absence.studentId = :studentId', { studentId });
    }
    if (classId) {
      query.andWhere('absence.classId = :classId', { classId });
    }
    if (startDate) {
      query.andWhere('absence.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('absence.date <= :endDate', { endDate });
    }
    
    return query.orderBy('absence.date', 'DESC').getMany();
  }

  async update(id: string, tenantId: string, absenceData: Partial<Absence>): Promise<Absence> {
    await this.repository.update({ id, tenantId }, absenceData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

