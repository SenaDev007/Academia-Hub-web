/**
 * ============================================================================
 * PUBLIC VERIFICATION CONTROLLER - API PUBLIQUE DE VÉRIFICATION
 * ============================================================================
 * 
 * Controller pour l'API publique de vérification (sans authentification)
 * Permet de vérifier l'identité d'un élève via un token QR Code
 * 
 * ============================================================================
 */

import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PublicVerificationService } from '../services/public-verification.service';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/public/verify')
export class PublicVerificationController {
  constructor(
    private readonly verificationService: PublicVerificationService,
  ) {}

  /**
   * GET /api/public/verify/:token
   * Vérifie un token et retourne les données minimales de l'élève
   * API PUBLIQUE - Pas d'authentification requise
   */
  @Public()
  @Get(':token')
  async verifyToken(@Param('token') token: string) {
    const result = await this.verificationService.verifyToken(token);
    
    if (!result.isValid) {
      return {
        isValid: false,
        isExpired: result.isExpired,
        message: result.isExpired ? 'Token expiré' : 'Token invalide',
      };
    }

    return {
      isValid: true,
      student: result.student,
    };
  }
}

