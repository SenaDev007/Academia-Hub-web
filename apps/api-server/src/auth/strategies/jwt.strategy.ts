import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneWithRoles(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Attach tenantId, roles, and permissions to user object for use in guards/interceptors
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isSuperAdmin: user.isSuperAdmin,
      roles: user.roles || [],
      permissions: this.extractPermissions(user.roles || []),
    };
  }

  private extractPermissions(roles: any[]): string[] {
    const permissions = new Set<string>();
    for (const role of roles) {
      if (role.permissions) {
        for (const permission of role.permissions) {
          permissions.add(permission.name);
        }
      }
    }
    return Array.from(permissions);
  }
}

