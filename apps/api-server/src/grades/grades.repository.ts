import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradesRepository {
  constructor(
    @InjectRepository(Grade)
    private readonly repository: Repository<Grade>,
  ) {}

  async create(gradeData: Partial<Grade>): Promise<Grade> {
    const grade = this.repository.create(gradeData);
    return this.repository.save(grade);
  }

  async findOne(id: string, tenantId: string): Promise<Grade | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['student', 'exam', 'subject', 'class', 'academicYear', 'quarter'],
    });
  }

  async findAll(tenantId: string, studentId?: string, subjectId?: string, classId?: string, quarterId?: string): Promise<Grade[]> {
    const where: any = { tenantId };
    if (studentId) {
      where.studentId = studentId;
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (classId) {
      where.classId = classId;
    }
    if (quarterId) {
      where.quarterId = quarterId;
    }
    return this.repository.find({
      where,
      relations: ['student', 'subject', 'exam'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, tenantId: string, gradeData: Partial<Grade>): Promise<Grade> {
    await this.repository.update({ id, tenantId }, gradeData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

