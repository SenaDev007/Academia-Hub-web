import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator pour récupérer le tenant_id depuis la requête
 * 
 * Usage:
 * @Get()
 * async findAll(@TenantId() tenantId: string) {
 *   return this.service.findAll(tenantId);
 * }
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);

/**
 * Decorator pour récupérer l'objet tenant complet
 */
export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

/**
 * Alias pour Tenant (pour compatibilité)
 */
export const GetTenant = Tenant;
