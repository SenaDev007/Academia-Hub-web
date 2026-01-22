/**
 * ============================================================================
 * TENANT VALIDATION GUARD - ISOLATION STRICTE
 * ============================================================================
 * 
 * Guard pour valider l'existence et le statut du tenant
 * Renforce l'isolation inter-tenant
 * 
 * ============================================================================
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Request } from 'express';

@Injectable()
export class TenantValidationGuard implements CanActivate {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request['tenantId'];

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found');
    }

    // Valider l'existence du tenant
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found: ${tenantId}`);
    }

    // Vérifier que le tenant est actif
    if (tenant.status !== 'active') {
      throw new UnauthorizedException(
        `Tenant is not active. Status: ${tenant.status}`
      );
    }

    // Vérifier que l'utilisateur appartient bien à ce tenant
    const user = request['user'] as any;
    if (user && user.tenantId && user.tenantId !== tenantId) {
      throw new UnauthorizedException(
        'User does not belong to the specified tenant'
      );
    }

    // Attacher le tenant validé à la requête
    request['validatedTenant'] = tenant;

    return true;
  }
}

