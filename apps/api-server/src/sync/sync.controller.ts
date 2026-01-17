import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SyncService, SyncRequest, SyncResponse } from './sync.service';
import { SchemaValidatorService, SchemaValidationResult } from './schema-validator.service';
import { OfflineSyncService } from './services/offline-sync.service';
import {
  OfflineSyncRequestDto,
  OfflineSyncResponseDto,
} from './dto/offline-sync.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(
    private syncService: SyncService,
    private schemaValidator: SchemaValidatorService,
    private offlineSyncService: OfflineSyncService,
  ) {}

  /**
   * Synchronisation offline → PostgreSQL (NOUVEAU)
   * 
   * Endpoint principal pour synchroniser les opérations offline
   * 
   * FLUX :
   * 1. Détection connexion disponible (middleware)
   * 2. Vérification version schéma
   * 3. Envoi opérations par ordre chronologique
   * 4. Validation serveur (tenantId & permissions)
   * 5. Appliquer règles métier serveur
   * 6. Retourner résultat par opération
   */
  @Post('offline')
  async syncOffline(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() request: OfflineSyncRequestDto,
  ): Promise<OfflineSyncResponseDto> {
    // Vérifier cohérence tenantId
    if (request.tenantId !== tenantId) {
      throw new BadRequestException('tenantId mismatch between request and authentication');
    }

    return this.offlineSyncService.syncOfflineOperations(request, user.id);
  }

  /**
   * Synchronisation montante (SQLite → PostgreSQL) [LEGACY]
   * @deprecated Utiliser POST /sync/offline à la place
   */
  @Post('up')
  async syncUp(@Body() request: SyncRequest): Promise<SyncResponse> {
    return this.syncService.syncUp(request);
  }

  /**
   * Synchronisation descendante (PostgreSQL → SQLite) [LEGACY]
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
    @Body() body: { sqliteSchemaHash: string; sqliteVersion: string },
  ): Promise<SchemaValidationResult> {
    return this.schemaValidator.validateSQLiteConformity(
      body.sqliteSchemaHash,
      body.sqliteVersion,
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

