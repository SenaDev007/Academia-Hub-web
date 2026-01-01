import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradingPolicy } from './entities/grading-policy.entity';

@Injectable()
export class GradingPoliciesRepository {
  constructor(
    @InjectRepository(GradingPolicy)
    private readonly repository: Repository<GradingPolicy>,
  ) {}

  async create(policyData: Partial<GradingPolicy>): Promise<GradingPolicy> {
    const policy = this.repository.create(policyData);
    return this.repository.save(policy);
  }

  async findOne(id: string, countryId?: string): Promise<GradingPolicy | null> {
    const where: any = { id };
    if (countryId) {
      where.countryId = countryId;
    }
    return this.repository.findOne({ where, relations: ['country'] });
  }

  async findByCountry(countryId: string, educationLevel?: string): Promise<GradingPolicy[]> {
    const where: any = { countryId };
    if (educationLevel) {
      where.educationLevel = educationLevel;
    }
    return this.repository.find({
      where,
      relations: ['country'],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByCountry(countryId: string, educationLevel?: string): Promise<GradingPolicy | null> {
    const where: any = { countryId, isDefault: true, isActive: true };
    if (educationLevel) {
      where.educationLevel = educationLevel;
    }
    return this.repository.findOne({
      where,
      relations: ['country'],
    });
  }

  async findAll(): Promise<GradingPolicy[]> {
    return this.repository.find({
      relations: ['country'],
      order: { countryId: 'ASC', educationLevel: 'ASC', isDefault: 'DESC' },
    });
  }

  async update(id: string, countryId: string, policyData: Partial<GradingPolicy>): Promise<GradingPolicy> {
    await this.repository.update({ id, countryId }, policyData);
    return this.findOne(id, countryId);
  }

  async delete(id: string, countryId: string): Promise<void> {
    await this.repository.delete({ id, countryId });
  }

  async setAsDefault(id: string, countryId: string): Promise<GradingPolicy> {
    // Désactiver les autres policies par défaut pour ce pays
    await this.repository.update(
      { countryId, isDefault: true },
      { isDefault: false },
    );
    // Activer cette policy comme défaut
    await this.repository.update({ id, countryId }, { isDefault: true });
    return this.findOne(id, countryId);
  }
}

