import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryPolicy } from './entities/salary-policy.entity';

@Injectable()
export class SalaryPoliciesRepository {
  constructor(
    @InjectRepository(SalaryPolicy)
    private readonly repository: Repository<SalaryPolicy>,
  ) {}

  async create(policyData: Partial<SalaryPolicy>): Promise<SalaryPolicy> {
    const policy = this.repository.create(policyData);
    return this.repository.save(policy);
  }

  async findOne(id: string, countryId?: string): Promise<SalaryPolicy | null> {
    const where: any = { id };
    if (countryId) {
      where.countryId = countryId;
    }
    return this.repository.findOne({ where, relations: ['country'] });
  }

  async findByCountry(countryId: string): Promise<SalaryPolicy[]> {
    return this.repository.find({
      where: { countryId },
      relations: ['country'],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByCountry(countryId: string): Promise<SalaryPolicy | null> {
    return this.repository.findOne({
      where: { countryId, isDefault: true, isActive: true },
      relations: ['country'],
    });
  }

  async findAll(): Promise<SalaryPolicy[]> {
    return this.repository.find({
      relations: ['country'],
      order: { countryId: 'ASC', isDefault: 'DESC' },
    });
  }

  async update(id: string, countryId: string, policyData: Partial<SalaryPolicy>): Promise<SalaryPolicy> {
    await this.repository.update({ id, countryId }, policyData);
    return this.findOne(id, countryId);
  }

  async delete(id: string, countryId: string): Promise<void> {
    await this.repository.delete({ id, countryId });
  }

  async setAsDefault(id: string, countryId: string): Promise<SalaryPolicy> {
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

