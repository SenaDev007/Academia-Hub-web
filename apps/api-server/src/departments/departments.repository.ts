import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsRepository {
  constructor(
    @InjectRepository(Department)
    private readonly repository: Repository<Department>,
  ) {}

  async create(departmentData: Partial<Department>): Promise<Department> {
    const department = this.repository.create(departmentData);
    return this.repository.save(department);
  }

  async findOne(id: string, tenantId: string): Promise<Department | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['manager'],
    });
  }

  async findAll(tenantId: string): Promise<Department[]> {
    return this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, tenantId: string, departmentData: Partial<Department>): Promise<Department> {
    await this.repository.update({ id, tenantId }, departmentData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

