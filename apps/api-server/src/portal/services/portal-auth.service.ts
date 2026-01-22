/**
 * ============================================================================
 * PORTAL AUTH SERVICE - AUTHENTIFICATION MULTI-PORTAILS
 * ============================================================================
 * 
 * Service pour gérer l'authentification spécifique à chaque portail
 * 
 * ============================================================================
 */

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { PortalSessionService } from './portal-session.service';
import {
  SchoolPortalLoginDto,
  TeacherPortalLoginDto,
  ParentPortalLoginDto,
  PortalType,
} from '../dto/portal-login.dto';

@Injectable()
export class PortalAuthService {
  private readonly logger = new Logger(PortalAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly portalSessionService: PortalSessionService,
  ) {}

  /**
   * Authentification Portail École
   * Email + Password pour Direction/Administration
   */
  async loginSchool(
    dto: SchoolPortalLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Vérifier que le tenant existe et est actif
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });

    if (!tenant || tenant.status !== 'active') {
      throw new UnauthorizedException('Établissement non trouvé ou inactif');
    }

    // Trouver l'utilisateur
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        tenantId: dto.tenantId,
        status: 'active',
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier le rôle (Direction/Administration uniquement)
    const allowedRoles = ['DIRECTOR', 'SUPER_DIRECTOR', 'ADMIN', 'ACCOUNTANT'];
    const userRole = user.role || '';
    if (!allowedRoles.includes(userRole)) {
      throw new UnauthorizedException(
        'Accès refusé. Ce portail est réservé à la direction et à l\'administration.',
      );
    }

    // Vérifier le mot de passe
    if (!user.passwordHash) {
      throw new UnauthorizedException('Mot de passe non configuré');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Créer une session de portail
    const session = await this.portalSessionService.createSession(
      dto.tenantId,
      PortalType.SCHOOL,
      user.id,
      ipAddress,
      userAgent,
    );

    // Générer le token JWT
    const token = this.generatePortalToken(user, PortalType.SCHOOL);

    // Mettre à jour le dernier login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      token,
      sessionId: session.id,
      portalType: PortalType.SCHOOL,
    };
  }

  /**
   * Authentification Portail Enseignant
   * Identifiant enseignant + Password
   */
  async loginTeacher(
    dto: TeacherPortalLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Vérifier que le tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });

    if (!tenant || tenant.status !== 'active') {
      throw new UnauthorizedException('Établissement non trouvé ou inactif');
    }

    // Trouver l'enseignant par matricule
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        tenantId: dto.tenantId,
        matricule: dto.teacherIdentifier,
        status: 'active',
      },
    });

    if (!teacher) {
      throw new UnauthorizedException('Identifiant enseignant invalide');
    }

    // Trouver l'utilisateur associé par email
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: dto.tenantId,
        email: teacher.email || '',
        status: 'active',
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur associé non trouvé');
    }

    // Vérifier le rôle
    if (user.role !== 'TEACHER') {
      throw new UnauthorizedException(
        'Accès refusé. Ce portail est réservé aux enseignants.',
      );
    }

    // Vérifier le mot de passe
    if (!user.passwordHash) {
      throw new UnauthorizedException('Mot de passe non configuré');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Créer une session de portail
    const session = await this.portalSessionService.createSession(
      dto.tenantId,
      PortalType.TEACHER,
      user.id,
      ipAddress,
      userAgent,
    );

    // Générer le token JWT
    const token = this.generatePortalToken(user, PortalType.TEACHER);

    // Mettre à jour le dernier login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      teacher: {
        id: teacher.id,
        matricule: teacher.matricule,
      },
      token,
      sessionId: session.id,
      portalType: PortalType.TEACHER,
    };
  }

  /**
   * Authentification Portail Parent
   * Téléphone + OTP
   */
  async loginParent(
    dto: ParentPortalLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Vérifier que le tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });

    if (!tenant || tenant.status !== 'active') {
      throw new UnauthorizedException('Établissement non trouvé ou inactif');
    }

    // Trouver le parent par téléphone
    const guardian = await this.prisma.guardian.findFirst({
      where: {
        tenantId: dto.tenantId,
        phone: dto.phone,
      },
    });

    if (!guardian) {
      throw new UnauthorizedException('Numéro de téléphone non trouvé');
    }

    // Trouver l'utilisateur associé par email
    const user = guardian.email ? await this.prisma.user.findFirst({
      where: {
        tenantId: dto.tenantId,
        email: guardian.email,
        status: 'active',
      },
    }) : null;

    // Si pas d'OTP fourni, générer et envoyer
    if (!dto.otp) {
      // TODO: Générer et envoyer OTP via SMS/WhatsApp
      const otp = this.generateOTP();
      // TODO: Stocker OTP temporairement (Redis ou table temporaire)
      // TODO: Envoyer OTP via service de communication

      this.logger.log(`OTP generated for parent ${guardian.id}: ${otp}`);

      return {
        message: 'Code OTP envoyé',
        phone: dto.phone,
        // En développement, retourner l'OTP (à retirer en production)
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    }

    // Vérifier l'OTP
    // TODO: Vérifier OTP depuis le stockage temporaire
    // Pour l'instant, on accepte n'importe quel OTP en développement
    if (process.env.NODE_ENV !== 'development') {
      // TODO: Implémenter la vérification réelle
      throw new BadRequestException('Vérification OTP non implémentée');
    }

    // Si l'OTP est valide, créer la session
    if (!user) {
      throw new UnauthorizedException('Compte parent non configuré');
    }

    // Créer une session de portail
    const session = await this.portalSessionService.createSession(
      dto.tenantId,
      PortalType.PARENT,
      user.id,
      ipAddress,
      userAgent,
    );

    // Générer le token JWT
    const token = this.generatePortalToken(user, PortalType.PARENT);

    // Mettre à jour le dernier login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      guardian: {
        id: guardian.id,
        phone: guardian.phone,
      },
      token,
      sessionId: session.id,
      portalType: PortalType.PARENT,
    };
  }

  /**
   * Génère un token JWT pour le portail
   */
  private generatePortalToken(user: any, portalType: PortalType): string {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      portalType,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '24h',
    });
  }

  /**
   * Génère un code OTP à 6 chiffres
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

