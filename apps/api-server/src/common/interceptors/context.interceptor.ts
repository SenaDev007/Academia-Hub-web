/**
 * ============================================================================
 * CONTEXT INTERCEPTOR - RÉSOLUTION ET VALIDATION DU CONTEXTE
 * ============================================================================
 * 
 * Interceptor global qui résout et valide le contexte complet :
 * - tenant_id
 * - school_level_id (OBLIGATOIRE)
 * - module_type (OBLIGATOIRE)
 * 
 * Interdit toute requête ambiguë (sans niveau ou sans module).
 * 
 * ============================================================================
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly contextService: RequestContextService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    // Résoudre et valider le contexte complet
    const resolvedContext = await this.contextService.resolveContext(request);

    // Attacher le contexte à la requête
    this.contextService.attachContextToRequest(request, resolvedContext);

    // Forcer l'injection du schoolLevelId dans le body pour CREATE/UPDATE
    if (request.body && typeof request.body === 'object') {
      // Empêcher la modification du schoolLevelId
      if (request.body.schoolLevelId && request.body.schoolLevelId !== resolvedContext.schoolLevelId) {
        throw new BadRequestException(
          'Cannot modify school_level_id in request body. This is a security violation.'
        );
      }
      // Injecter automatiquement si absent
      if (!request.body.schoolLevelId) {
        request.body.schoolLevelId = resolvedContext.schoolLevelId;
      }
    }

    // Forcer l'injection du schoolLevelId dans les query params
    if (request.query) {
      // Empêcher la modification du schoolLevelId
      if (request.query.schoolLevelId && request.query.schoolLevelId !== resolvedContext.schoolLevelId) {
        throw new BadRequestException(
          'Cannot specify different school_level_id in query parameters.'
        );
      }
      // Injecter automatiquement si absent
      if (!request.query.schoolLevelId) {
        request.query.schoolLevelId = resolvedContext.schoolLevelId;
      }
    }

    return next.handle();
  }
}

