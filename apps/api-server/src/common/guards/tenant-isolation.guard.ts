/**
 * ============================================================================
 * TENANT ISOLATION GUARD - ISOLATION STRICTE INTER-TENANT
 * ============================================================================
 * 
 * Guard pour garantir l'isolation stricte des données entre tenants
 * Vérifie que toutes les requêtes incluent le tenant_id correct
 * 
 * ============================================================================
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request['tenantId'];
    const user = request['user'];
    const body = request.body;
    const params = request.params;
    const query = request.query;

    // Vérifier que le tenant_id est présent
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    // Vérifier que l'utilisateur appartient au tenant
    const userTyped = user as any;
    if (userTyped && userTyped.tenantId && userTyped.tenantId !== tenantId) {
      throw new ForbiddenException(
        'User tenant mismatch. Access denied for security reasons.'
      );
    }

    // Vérifier que le body ne contient pas de tenant_id différent
    if (body && body.tenantId && body.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Cannot modify tenant_id in request body. This is a security violation.'
      );
    }

    // Vérifier que les query params ne contiennent pas de tenant_id différent
    if (query && query.tenantId && query.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Cannot specify different tenant_id in query parameters.'
      );
    }

    // Forcer le tenant_id dans le body pour les opérations CREATE/UPDATE
    if (body && typeof body === 'object' && !body.tenantId) {
      body.tenantId = tenantId;
    }

    return true;
  }
}

