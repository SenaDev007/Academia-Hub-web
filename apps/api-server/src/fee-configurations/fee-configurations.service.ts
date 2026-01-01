import { Injectable, NotFoundException } from '@nestjs/common';
import { FeeConfigurationsRepository } from './fee-configurations.repository';
import { FeeConfiguration } from './entities/fee-configuration.entity';
import { CreateFeeConfigurationDto } from './dto/create-fee-configuration.dto';
import { UpdateFeeConfigurationDto } from './dto/update-fee-configuration.dto';

@Injectable()
export class FeeConfigurationsService {
  constructor(private readonly feeConfigurationsRepository: FeeConfigurationsRepository) {}

  async create(createFeeConfigurationDto: CreateFeeConfigurationDto, tenantId: string, createdBy?: string): Promise<FeeConfiguration> {
    return this.feeConfigurationsRepository.create({
      ...createFeeConfigurationDto,
      tenantId,
      createdBy,
    });
  }

  async findAll(tenantId: string, classId?: string, academicYearId?: string): Promise<FeeConfiguration[]> {
    return this.feeConfigurationsRepository.findAll(tenantId, classId, academicYearId);
  }

  async findOne(id: string, tenantId: string): Promise<FeeConfiguration> {
    const feeConfiguration = await this.feeConfigurationsRepository.findOne(id, tenantId);
    if (!feeConfiguration) {
      throw new NotFoundException(`Fee configuration with ID ${id} not found`);
    }
    return feeConfiguration;
  }

  async update(id: string, updateFeeConfigurationDto: UpdateFeeConfigurationDto, tenantId: string): Promise<FeeConfiguration> {
    await this.findOne(id, tenantId);
    return this.feeConfigurationsRepository.update(id, tenantId, updateFeeConfigurationDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.feeConfigurationsRepository.delete(id, tenantId);
  }
}

