import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.repository.create(permissionData);
    return this.repository.save(permission);
  }

  async findOne(id: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Permission[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.repository.find({
      where: { resource },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, permissionData: Partial<Permission>): Promise<Permission> {
    await this.repository.update({ id }, permissionData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

