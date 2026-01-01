import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';

@Injectable()
export class CountriesRepository {
  constructor(
    @InjectRepository(Country)
    private readonly repository: Repository<Country>,
  ) {}

  async create(countryData: Partial<Country>): Promise<Country> {
    const country = this.repository.create(countryData);
    return this.repository.save(country);
  }

  async findOne(id: string): Promise<Country | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Country | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findDefault(): Promise<Country | null> {
    return this.repository.findOne({ where: { isDefault: true, isActive: true } });
  }

  async findAll(activeOnly: boolean = false): Promise<Country[]> {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }
    return this.repository.find({
      where,
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async update(id: string, countryData: Partial<Country>): Promise<Country> {
    await this.repository.update({ id }, countryData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  /**
   * Définit un pays comme pays par défaut
   * Désactive le précédent pays par défaut si nécessaire
   */
  async setAsDefault(id: string): Promise<Country> {
    // Désactiver tous les autres pays par défaut
    await this.repository.update({ isDefault: true }, { isDefault: false });
    // Activer ce pays comme défaut
    await this.repository.update({ id }, { isDefault: true });
    return this.findOne(id);
  }
}

