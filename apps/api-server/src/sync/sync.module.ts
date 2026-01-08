import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SchemaValidatorService } from './schema-validator.service';
import { SyncController } from './sync.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [SyncService, SchemaValidatorService, PrismaService],
  controllers: [SyncController],
  exports: [SyncService, SchemaValidatorService],
})
export class SyncModule {}

