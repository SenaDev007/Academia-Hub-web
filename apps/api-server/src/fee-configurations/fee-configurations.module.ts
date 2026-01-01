import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeConfigurationsController } from './fee-configurations.controller';
import { FeeConfigurationsService } from './fee-configurations.service';
import { FeeConfiguration } from './entities/fee-configuration.entity';
import { FeeConfigurationsRepository } from './fee-configurations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FeeConfiguration])],
  controllers: [FeeConfigurationsController],
  providers: [FeeConfigurationsService, FeeConfigurationsRepository],
  exports: [FeeConfigurationsService],
})
export class FeeConfigurationsModule {}

