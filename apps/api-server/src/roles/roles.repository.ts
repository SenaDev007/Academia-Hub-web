import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.repository.create(roleData);
    return this.repository.save(role);
  }

  async findOne(id: string, tenantId?: string | null): Promise<Role | null> {
    const where: any = { id };
    if (tenantId !== undefined) {
      where.tenantId = tenantId;
    }
    return this.repository.findOne({ where });
  }

  async findAll(tenantId?: string | null): Promise<Role[]> {
    const where: any = {};
    if (tenantId !== undefined) {
      where.tenantId = tenantId;
    }
    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findByName(name: string, tenantId?: string | null): Promise<Role | null> {
    const where: any = { name };
    if (tenantId !== undefined) {
      where.tenantId = tenantId;
    }
    return this.repository.findOne({ where });
  }

  async update(id: string, tenantId: string | null, roleData: Partial<Role>): Promise<Role> {
    await this.repository.update({ id, tenantId }, roleData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string | null): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

