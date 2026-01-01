import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';

@Injectable()
export class TeachersRepository {
  constructor(
    @InjectRepository(Teacher)
    private readonly repository: Repository<Teacher>,
  ) {}

  async create(teacherData: Partial<Teacher>): Promise<Teacher> {
    const teacher = this.repository.create(teacherData);
    return this.repository.save(teacher);
  }

  async findOne(id: string, tenantId: string): Promise<Teacher | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['department', 'subject', 'academicYear'],
    });
  }

  async findAll(tenantId: string, departmentId?: string, status?: string): Promise<Teacher[]> {
    const where: any = { tenantId };
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (status) {
      where.status = status;
    }
    return this.repository.find({
      where,
      relations: ['department'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async update(id: string, tenantId: string, teacherData: Partial<Teacher>): Promise<Teacher> {
    await this.repository.update({ id, tenantId }, teacherData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

