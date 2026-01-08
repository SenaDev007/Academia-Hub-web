import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantFeaturesService } from './tenant-features.service';
import { TenantFeaturesController } from './tenant-features.controller';
import { TenantFeaturesRepository } from './tenant-features.repository';
import { TenantFeature } from './entities/tenant-feature.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AcademicTracksModule } from '../academic-tracks/academic-tracks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantFeature]),
    AuditLogsModule,
    AcademicTracksModule,
  ],
  controllers: [TenantFeaturesController],
  providers: [TenantFeaturesService, TenantFeaturesRepository],
  exports: [TenantFeaturesService, TenantFeaturesRepository],
})
export class TenantFeaturesModule {}

