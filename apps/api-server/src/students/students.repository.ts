import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
  ) {}

  async create(studentData: Partial<Student>): Promise<Student> {
    const student = this.repository.create(studentData);
    return this.repository.save(student);
  }

  async findOne(id: string, tenantId: string, schoolLevelId: string): Promise<Student | null> {
    return this.repository.findOne({
      where: { id, tenantId, schoolLevelId },
    });
  }

  async findAll(tenantId: string, schoolLevelId: string, academicYearId?: string): Promise<Student[]> {
    const where: any = { tenantId, schoolLevelId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }
    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    tenantId: string,
    schoolLevelId: string,
    studentData: Partial<Student>,
  ): Promise<Student> {
    await this.repository.update({ id, tenantId, schoolLevelId }, studentData);
    return this.findOne(id, tenantId, schoolLevelId);
  }

  async delete(id: string, tenantId: string, schoolLevelId: string): Promise<void> {
    await this.repository.delete({ id, tenantId, schoolLevelId });
  }

  async findByUserId(tenantId: string, userId: string): Promise<Student[]> {
    return this.repository.find({
      where: { tenantId, createdBy: userId },
    });
  }
}

