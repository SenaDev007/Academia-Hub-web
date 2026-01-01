/**
 * ============================================================================
 * AUDIT LOG INTERCEPTOR - TRACABILITÉ COMPLÈTE
 * ============================================================================
 * 
 * Interceptor pour logger automatiquement toutes les actions sensibles
 * 
 * Actions loggées :
 * - CREATE, UPDATE, DELETE sur toutes les ressources
 * - Accès aux données sensibles (finances, HR, etc.)
 * - Changements de permissions/rôles
 * - Connexions/déconnexions
 * 
 * ============================================================================
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../audit-logs/entities/audit-log.entity';
import { Request } from 'express';

// Actions sensibles à logger
const SENSITIVE_ACTIONS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const SENSITIVE_RESOURCES = [
  'students',
  'teachers',
  'users',
  'roles',
  'permissions',
  'payments',
  'expenses',
  'grades',
  'exams',
  'fee-configurations',
  'tenants',
];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, query } = request;
    const user = request['user'];
    const tenantId = request['tenantId'];

    // Déterminer si cette action doit être loggée
    const shouldLog = this.shouldLogAction(method, url);

    if (!shouldLog) {
      return next.handle();
    }

    // Extraire les informations de la requête
    const resource = this.extractResource(url);
    const action = this.mapHttpMethodToAction(method);
    const resourceId = params?.id || body?.id || null;
    const changes = this.extractChanges(method, body, query);

    // Logger de manière asynchrone (ne pas bloquer la requête)
    this.logAsync({
      tenantId,
      userId: user?.id || null,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'] || null,
    });

    return next.handle().pipe(
      tap({
        error: (error) => {
          // Logger aussi les erreurs
          this.logAsync({
            tenantId,
            userId: user?.id || null,
            action: `${action}_FAILED`,
            resource,
            resourceId,
            changes: { error: error.message },
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'] || null,
          });
        },
      }),
    );
  }

  private shouldLogAction(method: string, url: string): boolean {
    // Logger toutes les actions sensibles
    if (SENSITIVE_ACTIONS.includes(method)) {
      return true;
    }

    // Logger l'accès aux ressources sensibles
    const resource = this.extractResource(url);
    if (SENSITIVE_RESOURCES.includes(resource)) {
      return true;
    }

    return false;
  }

  private extractResource(url: string): string {
    // Extraire le nom de la ressource depuis l'URL
    // Ex: /api/students/123 -> students
    const parts = url.split('/').filter(Boolean);
    const apiIndex = parts.indexOf('api');
    if (apiIndex !== -1 && parts[apiIndex + 1]) {
      return parts[apiIndex + 1];
    }
    return 'unknown';
  }

  private mapHttpMethodToAction(method: string): string {
    const mapping: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };
    return mapping[method] || method;
  }

  private extractChanges(method: string, body: any, query: any): Record<string, any> | null {
    if (method === 'GET') {
      // Pour les GET, logger les filtres/paramètres de recherche
      return query && Object.keys(query).length > 0 ? query : null;
    }

    // Pour POST/PATCH/PUT, logger les changements
    if (body && typeof body === 'object') {
      // Exclure les champs sensibles (mots de passe, etc.)
      const sanitized = { ...body };
      delete sanitized.password;
      delete sanitized.passwordHash;
      delete sanitized.passwordConfirmation;
      return Object.keys(sanitized).length > 0 ? sanitized : null;
    }

    return null;
  }

  private getClientIp(request: Request): string | null {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket.remoteAddress || null;
  }

  private async logAsync(data: {
    tenantId: string | null;
    userId: string | null;
    action: string;
    resource: string;
    resourceId: string | null;
    changes: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<void> {
    try {
      await this.auditLogRepository.save({
        tenantId: data.tenantId || 'system',
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });
    } catch (error) {
      // Ne pas faire échouer la requête si le log échoue
      console.error('Failed to create audit log:', error);
    }
  }
}

