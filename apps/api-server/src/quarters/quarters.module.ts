import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuartersController } from './quarters.controller';
import { QuartersService } from './quarters.service';
import { Quarter } from './entities/quarter.entity';
import { QuartersRepository } from './quarters.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Quarter])],
  controllers: [QuartersController],
  providers: [QuartersService, QuartersRepository],
  exports: [QuartersService],
})
export class QuartersModule {}

