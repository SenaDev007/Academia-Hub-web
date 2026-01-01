import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryPoliciesService } from './salary-policies.service';
import { SalaryPoliciesController } from './salary-policies.controller';
import { SalaryPoliciesRepository } from './salary-policies.repository';
import { SalaryPolicy } from './entities/salary-policy.entity';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalaryPolicy]),
    CountriesModule,
  ],
  controllers: [SalaryPoliciesController],
  providers: [SalaryPoliciesService, SalaryPoliciesRepository],
  exports: [SalaryPoliciesService, SalaryPoliciesRepository],
})
export class SalaryPoliciesModule {}

