/**
 * Roles Guard
 * 
 * Guard pour vérifier les rôles des utilisateurs
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true; // Pas de rôle requis
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Vérifier si l'utilisateur est Super Admin
    if (requiredRoles.includes('SUPER_ADMIN')) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { isSuperAdmin: true, role: true },
      });

      return dbUser?.isSuperAdmin === true || dbUser?.role === 'SUPER_ADMIN';
    }

    // Vérifier les autres rôles
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    return requiredRoles.includes(dbUser?.role || '');
  }
}
