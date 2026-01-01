import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract tenant_id from request
 * 
 * Usage:
 * @Get()
 * async findAll(@TenantId() tenantId: string) {
 *   return this.service.findAll(tenantId);
 * }
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);

