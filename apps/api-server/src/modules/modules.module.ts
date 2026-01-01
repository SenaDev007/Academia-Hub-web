import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { ModulesRepository } from './modules.repository';
import { Module as ModuleEntity } from './entities/module.entity';
import { SchoolLevelsModule } from '../school-levels/school-levels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleEntity]),
    SchoolLevelsModule,
  ],
  controllers: [ModulesController],
  providers: [ModulesService, ModulesRepository],
  exports: [ModulesService, ModulesRepository],
})
export class ModulesModule {}

