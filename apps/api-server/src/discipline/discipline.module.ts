import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { Discipline } from './entities/discipline.entity';
import { DisciplineRepository } from './discipline.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Discipline])],
  controllers: [DisciplineController],
  providers: [DisciplineService, DisciplineRepository],
  exports: [DisciplineService],
})
export class DisciplineModule {}

