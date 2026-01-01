/**
 * ============================================================================
 * PERMISSIONS GUARD - RBAC STRICT
 * ============================================================================
 * 
 * Guard pour vérifier que l'utilisateur a toutes les permissions requises
 * 
 * ============================================================================
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      // Aucune permission requise, autoriser l'accès
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admin a accès à tout
    if (user.isSuperAdmin) {
      return true;
    }

    // Charger l'utilisateur avec ses rôles et permissions
    const userWithPermissions = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!userWithPermissions) {
      throw new ForbiddenException('User not found');
    }

    // Collecter toutes les permissions de l'utilisateur
    const userPermissions = new Set<string>();
    
    if (userWithPermissions.roles) {
      for (const role of userWithPermissions.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            userPermissions.add(permission.name);
          }
        }
      }
    }

    // Vérifier que l'utilisateur a toutes les permissions requises
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.has(permission)
    );

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(p => !userPermissions.has(p));
      throw new ForbiddenException(
        `Access denied. Missing permissions: ${missing.join(', ')}`
      );
    }

    return true;
  }
}

