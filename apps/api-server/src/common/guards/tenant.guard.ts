import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard to extract and validate tenant_id from request
 * 
 * Resolves tenant from:
 * 1. Subdomain (e.g., school-a.academiahub.com)
 * 2. X-Tenant-ID header
 * 3. JWT token payload (after authentication)
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = this.extractTenantId(request);

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found');
    }

    // Attach tenantId to request for use in controllers/services
    request['tenantId'] = tenantId;
    return true;
  }

  private extractTenantId(request: Request): string | undefined {
    // Option 1: From subdomain (e.g., school-a.academiahub.com)
    const host = request.headers.host;
    if (host && host.includes('.')) {
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        // First part is the tenant slug/id
        // TODO: Resolve slug to tenant_id via database lookup
        return parts[0];
      }
    }

    // Option 2: From X-Tenant-ID header
    const tenantIdHeader = request.headers['x-tenant-id'];
    if (tenantIdHeader && typeof tenantIdHeader === 'string') {
      return tenantIdHeader;
    }

    // Option 3: From JWT payload (after authentication)
    // This is typically handled by an AuthGuard that decodes the JWT
    // and attaches user/tenant info to the request
    if (request['user'] && request['user'].tenantId) {
      return request['user'].tenantId;
    }

    return undefined;
  }
}
