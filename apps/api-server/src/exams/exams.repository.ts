import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './entities/exam.entity';

@Injectable()
export class ExamsRepository {
  constructor(
    @InjectRepository(Exam)
    private readonly repository: Repository<Exam>,
  ) {}

  async create(examData: Partial<Exam>): Promise<Exam> {
    const exam = this.repository.create(examData);
    return this.repository.save(exam);
  }

  async findOne(id: string, tenantId: string): Promise<Exam | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['subject', 'class', 'academicYear', 'quarter'],
    });
  }

  async findAll(tenantId: string, classId?: string, subjectId?: string, academicYearId?: string): Promise<Exam[]> {
    const where: any = { tenantId };
    if (classId) {
      where.classId = classId;
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }
    return this.repository.find({
      where,
      relations: ['subject', 'class'],
      order: { examDate: 'DESC' },
    });
  }

  async update(id: string, tenantId: string, examData: Partial<Exam>): Promise<Exam> {
    await this.repository.update({ id, tenantId }, examData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

