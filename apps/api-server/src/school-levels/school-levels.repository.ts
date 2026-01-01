import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolLevel, SchoolLevelType } from './entities/school-level.entity';

@Injectable()
export class SchoolLevelsRepository {
  constructor(
    @InjectRepository(SchoolLevel)
    private readonly repository: Repository<SchoolLevel>,
  ) {}

  async create(data: Partial<SchoolLevel>): Promise<SchoolLevel> {
    const schoolLevel = this.repository.create(data);
    return this.repository.save(schoolLevel);
  }

  async findAll(tenantId: string): Promise<SchoolLevel[]> {
    return this.repository.find({
      where: { tenantId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<SchoolLevel | null> {
    return this.repository.findOne({
      where: { id, tenantId },
    });
  }

  async findByType(
    tenantId: string,
    type: SchoolLevelType,
  ): Promise<SchoolLevel | null> {
    return this.repository.findOne({
      where: { tenantId, type },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<SchoolLevel>,
  ): Promise<SchoolLevel> {
    await this.repository.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }

  /**
   * Initialiser les niveaux scolaires par défaut pour un tenant
   */
  async initializeDefaultLevels(tenantId: string): Promise<SchoolLevel[]> {
    const defaultLevels = [
      {
        tenantId,
        type: SchoolLevelType.MATERNELLE,
        name: 'Maternelle',
        abbreviation: 'MAT',
        order: 0,
        description: 'Niveau maternelle (3-6 ans)',
      },
      {
        tenantId,
        type: SchoolLevelType.PRIMAIRE,
        name: 'Primaire',
        abbreviation: 'PRI',
        order: 1,
        description: 'Niveau primaire (6-12 ans)',
      },
      {
        tenantId,
        type: SchoolLevelType.SECONDAIRE,
        name: 'Secondaire',
        abbreviation: 'SEC',
        order: 2,
        description: 'Niveau secondaire (12-18 ans)',
      },
    ];

    const created = [];
    for (const levelData of defaultLevels) {
      const existing = await this.findByType(tenantId, levelData.type);
      if (!existing) {
        const level = await this.create(levelData);
        created.push(level);
      } else {
        created.push(existing);
      }
    }

    return created;
  }
}

