import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsencesController } from './absences.controller';
import { AbsencesService } from './absences.service';
import { Absence } from './entities/absence.entity';
import { AbsencesRepository } from './absences.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Absence])],
  controllers: [AbsencesController],
  providers: [AbsencesService, AbsencesRepository],
  exports: [AbsencesService],
})
export class AbsencesModule {}

