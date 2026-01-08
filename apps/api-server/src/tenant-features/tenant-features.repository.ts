import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantFeature, FeatureCode, FeatureStatus } from './entities/tenant-feature.entity';
import { CreateTenantFeatureDto } from './dto/create-tenant-feature.dto';
import { UpdateTenantFeatureDto } from './dto/update-tenant-feature.dto';

@Injectable()
export class TenantFeaturesRepository {
  constructor(
    @InjectRepository(TenantFeature)
    private readonly repository: Repository<TenantFeature>,
  ) {}

  async create(data: CreateTenantFeatureDto & { tenantId: string; enabledBy?: string }): Promise<TenantFeature> {
    const feature = this.repository.create({
      ...data,
      status: data.status || FeatureStatus.DISABLED,
      enabledAt: data.status === FeatureStatus.ENABLED ? new Date() : null,
      enabledBy: data.status === FeatureStatus.ENABLED ? data.enabledBy : null,
    });
    return this.repository.save(feature);
  }

  async findAll(tenantId: string): Promise<TenantFeature[]> {
    return this.repository.find({
      where: { tenantId },
      relations: ['enabledByUser', 'disabledByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<TenantFeature | null> {
    return this.repository.findOne({
      where: { id, tenantId },
      relations: ['enabledByUser', 'disabledByUser'],
    });
  }

  async findByCode(featureCode: FeatureCode, tenantId: string): Promise<TenantFeature | null> {
    return this.repository.findOne({
      where: { featureCode, tenantId },
      relations: ['enabledByUser', 'disabledByUser'],
    });
  }

  async isEnabled(featureCode: FeatureCode, tenantId: string): Promise<boolean> {
    const feature = await this.findByCode(featureCode, tenantId);
    return feature?.status === FeatureStatus.ENABLED;
  }

  async update(id: string, tenantId: string, data: UpdateTenantFeatureDto & { updatedBy?: string }): Promise<TenantFeature> {
    const feature = await this.findOne(id, tenantId);
    if (!feature) {
      throw new Error(`Feature ${id} not found`);
    }

    const updateData: any = { ...data };

    // Gérer les transitions de statut
    if (data.status === FeatureStatus.ENABLED && feature.status !== FeatureStatus.ENABLED) {
      updateData.enabledAt = new Date();
      updateData.enabledBy = data.updatedBy || feature.enabledBy;
      updateData.disabledAt = null;
      updateData.disabledBy = null;
    } else if (data.status === FeatureStatus.DISABLED && feature.status === FeatureStatus.ENABLED) {
      updateData.disabledAt = new Date();
      updateData.disabledBy = data.updatedBy || feature.disabledBy;
    }

    await this.repository.update({ id, tenantId }, updateData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

