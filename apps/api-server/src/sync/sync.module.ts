import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SchemaValidatorService } from './schema-validator.service';
import { SyncController } from './sync.controller';
import { PrismaService } from '../database/prisma.service';
import { OfflineSyncService } from './services/offline-sync.service';
import { ConflictDetectionService } from './services/conflict-detection.service';

@Module({
  providers: [
    SyncService,
    SchemaValidatorService,
    PrismaService,
    OfflineSyncService,
    ConflictDetectionService,
  ],
  controllers: [SyncController],
  exports: [
    SyncService,
    SchemaValidatorService,
    OfflineSyncService,
    ConflictDetectionService,
  ],
})
export class SyncModule {}

