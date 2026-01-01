import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingPoliciesService } from './grading-policies.service';
import { GradingPoliciesController } from './grading-policies.controller';
import { GradingPoliciesRepository } from './grading-policies.repository';
import { GradingPolicy } from './entities/grading-policy.entity';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradingPolicy]),
    CountriesModule,
  ],
  controllers: [GradingPoliciesController],
  providers: [GradingPoliciesService, GradingPoliciesRepository],
  exports: [GradingPoliciesService, GradingPoliciesRepository],
})
export class GradingPoliciesModule {}

