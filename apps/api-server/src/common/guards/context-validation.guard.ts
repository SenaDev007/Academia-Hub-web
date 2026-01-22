/**
 * ============================================================================
 * CONTEXT VALIDATION GUARD - INTERDIT LES REQUÊTES AMBIGUËS
 * ============================================================================
 * 
 * Guard qui interdit toute requête ambiguë :
 * - Sans tenant_id
 * - Sans school_level_id
 * - Sans module_type
 * 
 * Ce guard doit être appliqué GLOBALEMENT pour garantir
 * qu'aucune requête ne passe sans contexte complet.
 * 
 * ============================================================================
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

@Injectable()
export class ContextValidationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ignorer les routes publiques
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Vérifier que le contexte a été résolu par ContextInterceptor
    const contextData = request['context'];
    
    if (!contextData) {
      // Le contexte n'a pas été résolu, vérifier manuellement
      const user = request['user'] as any;
      const tenantId = request['tenantId'] || 
                       request.headers['x-tenant-id'] ||
                       user?.tenantId;

      if (!tenantId) {
        throw new ForbiddenException(
          'Tenant ID is required. Please provide X-Tenant-ID header or authenticate.'
        );
      }

      const schoolLevelId = request['schoolLevelId'] ||
                            request.headers['x-school-level-id'] ||
                            request.query?.schoolLevelId ||
                            request.body?.schoolLevelId;

      if (!schoolLevelId) {
        throw new BadRequestException(
          'School Level ID is required. All operations must be scoped to a school level. ' +
          'Please provide X-School-Level-ID header or schoolLevelId query parameter.'
        );
      }

      const moduleType = request['moduleType'] ||
                         request.headers['x-module-type'];

      if (!moduleType) {
        throw new BadRequestException(
          'Module type is required. All operations must be scoped to a module. ' +
          'Please provide X-Module-Type header or use a module-specific route.'
        );
      }
    } else {
      // Le contexte a été résolu, vérifier qu'il est complet
      if (!contextData.tenantId) {
        throw new ForbiddenException('Tenant ID is missing from context');
      }

      if (!contextData.schoolLevelId) {
        throw new BadRequestException(
          'School Level ID is missing from context. All operations must be scoped to a school level.'
        );
      }

      if (!contextData.moduleType) {
        throw new BadRequestException(
          'Module type is missing from context. All operations must be scoped to a module.'
        );
      }
    }

    return true;
  }
}

