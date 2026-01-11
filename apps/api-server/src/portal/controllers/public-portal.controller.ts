/**
 * ============================================================================
 * PUBLIC PORTAL CONTROLLER - API PUBLIQUE POUR RECHERCHE D'ÉCOLES
 * ============================================================================
 */

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { SchoolSearchService } from '../services/school-search.service';

@Controller('public/schools')
@Public()
export class PublicPortalController {
  constructor(
    private readonly schoolSearchService: SchoolSearchService,
  ) {}

  /**
   * Recherche publique d'établissements
   * Rate-limited, sécurisé
   */
  @Get('search')
  @Throttle({ medium: { limit: 20, ttl: 60000 } }) // 20 requêtes par minute
  async searchSchools(
    @Query('q') searchTerm: string,
    @Req() request: any,
  ) {
    const ipAddress =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress;

    return this.schoolSearchService.searchSchools(searchTerm, ipAddress);
  }
}

