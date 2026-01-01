/**
 * ============================================================================
 * ROLES DECORATOR - RBAC STRICT
 * ============================================================================
 * 
 * Decorator pour spécifier les rôles requis pour accéder à une route
 * 
 * Usage:
 * @Roles('admin', 'super_admin')
 * @Get()
 * async findAll() { ... }
 * 
 * ============================================================================
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
