import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { GradesRepository } from './grades.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Grade])],
  controllers: [GradesController],
  providers: [GradesService, GradesRepository],
  exports: [GradesService],
})
export class GradesModule {}

