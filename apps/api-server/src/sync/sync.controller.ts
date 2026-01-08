import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { SyncService, SyncRequest, SyncResponse } from './sync.service';
import { SchemaValidatorService, SchemaValidationResult } from './schema-validator.service';

@Controller('sync')
export class SyncController {
  constructor(
    private syncService: SyncService,
    private schemaValidator: SchemaValidatorService
  ) {}

  /**
   * Synchronisation montante (SQLite → PostgreSQL)
   */
  @Post('up')
  async syncUp(@Body() request: SyncRequest): Promise<SyncResponse> {
    return this.syncService.syncUp(request);
  }

  /**
   * Synchronisation descendante (PostgreSQL → SQLite)
   */
  @Post('down')
  async syncDown(@Body() request: SyncRequest): Promise<SyncResponse> {
    return this.syncService.syncDown(request);
  }

  /**
   * Validation de conformité (sans sync)
   */
  @Post('validate')
  async validate(
    @Body() body: { sqliteSchemaHash: string; sqliteVersion: string }
  ): Promise<SchemaValidationResult> {
    return this.schemaValidator.validateSQLiteConformity(
      body.sqliteSchemaHash,
      body.sqliteVersion
    );
  }

  /**
   * Récupère le hash du schéma Prisma actuel
   */
  @Get('schema-hash')
  async getSchemaHash(): Promise<{ hash: string }> {
    return {
      hash: this.schemaValidator.getPrismaSchemaHash(),
    };
  }
}

