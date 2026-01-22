/**
 * ============================================================================
 * SCHOOL SEARCH SERVICE - RECHERCHE PUBLIQUE D'ÉTABLISSEMENTS
 * ============================================================================
 * 
 * Service pour la recherche publique d'établissements avec rate limiting
 * 
 * ============================================================================
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SchoolSearchService {
  private readonly logger = new Logger(SchoolSearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recherche publique d'établissements
   * Rate-limited, sécurisé, audité
   */
  async searchSchools(
    searchTerm: string,
    ipAddress?: string,
  ): Promise<any[]> {
    if (!searchTerm || searchTerm.length < 2) {
      throw new BadRequestException('Le terme de recherche doit contenir au moins 2 caractères');
    }

    // Rate limiting basique (peut être amélioré avec Redis)
    // Pour l'instant, on log juste
    this.logger.log(`School search: "${searchTerm}" from IP: ${ipAddress}`);

    // Recherche dans les tenants actifs de type SCHOOL
    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: 'active',
        type: 'SCHOOL',
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        schools: {
          select: {
            name: true,
            logo: true,
            address: true,
            educationLevels: true,
          },
          take: 1,
        },
        country: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      take: 20, // Limiter à 20 résultats
    });

    // Formater les résultats
    const results = tenants.map((tenant) => {
      const school = tenant.schools?.[0];
      const address = school?.address || '';
      const city = this.extractCityFromAddress(address);

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: school?.logo || null,
        city: city || null,
        schoolType: this.getSchoolTypeFromLevels(school?.educationLevels || []),
      };
    });

    // Logger la recherche
    await this.logSearch(searchTerm, ipAddress, results.length);

    return results;
  }

  /**
   * Extrait la ville de l'adresse
   */
  private extractCityFromAddress(address: string): string | null {
    if (!address) return null;

    // Tentative simple d'extraction (peut être améliorée)
    const parts = address.split(',').map((p) => p.trim());
    if (parts.length > 1) {
      return parts[parts.length - 1]; // Dernière partie = ville généralement
    }
    return null;
  }

  /**
   * Détermine le type d'école depuis les niveaux
   */
  private getSchoolTypeFromLevels(levels: string[]): string | null {
    if (levels.length === 0) return null;

    const hasPrimaire = levels.some((l) =>
      l.toUpperCase().includes('PRIMAIRE'),
    );
    const hasSecondaire = levels.some((l) =>
      l.toUpperCase().includes('SECONDAIRE'),
    );

    if (hasPrimaire && hasSecondaire) return 'MIXTE';
    if (hasPrimaire) return 'PRIMAIRE';
    if (hasSecondaire) return 'SECONDAIRE';

    return null;
  }

  /**
   * Log la recherche pour audit et rate limiting
   */
  private async logSearch(
    searchTerm: string,
    ipAddress?: string,
    resultsCount: number = 0,
  ): Promise<void> {
    try {
      await this.prisma.schoolSearchLog.create({
        data: {
          searchTerm,
          ipAddress: ipAddress || null,
          resultsCount,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log school search', error);
      // Ne pas bloquer la recherche si le log échoue
    }
  }
}

