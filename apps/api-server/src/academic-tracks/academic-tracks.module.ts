import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicTracksService } from './academic-tracks.service';
import { AcademicTracksController } from './academic-tracks.controller';
import { AcademicTracksRepository } from './academic-tracks.repository';
import { AcademicTrack } from './entities/academic-track.entity';
import { StudentAcademicTrack } from './entities/student-academic-track.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicTrack, StudentAcademicTrack]),
  ],
  controllers: [AcademicTracksController],
  providers: [AcademicTracksService, AcademicTracksRepository],
  exports: [AcademicTracksService, AcademicTracksRepository],
})
export class AcademicTracksModule {}

