import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolLevelsController } from './school-levels.controller';
import { SchoolLevelsService } from './school-levels.service';
import { SchoolLevelsRepository } from './school-levels.repository';
import { SchoolLevel } from './entities/school-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolLevel])],
  controllers: [SchoolLevelsController],
  providers: [SchoolLevelsService, SchoolLevelsRepository],
  exports: [SchoolLevelsService, SchoolLevelsRepository],
})
export class SchoolLevelsModule {}

