import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService, // ✅ Injecter PrismaService pour vérifier la DB
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint - Vérifie l'état général de l'API
   */
  @Get('health')
  async getHealth() {
    // ✅ Vérifier la connexion DB
    let dbStatus = 'unknown';
    let dbError: string | null = null;
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error: any) {
      dbStatus = 'disconnected';
      dbError = error?.message || 'Database connection failed';
    }

    const isHealthy = dbStatus === 'connected';

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'academia-hub-api',
      database: {
        status: dbStatus,
        error: dbError,
      },
    };
  }

  /**
   * Readiness endpoint - Pour orchestration (Docker Compose, Kubernetes)
   * Retourne 200 seulement si l'API est prête à recevoir du trafic
   */
  @Get('ready')
  async getReady() {
    try {
      // ✅ Vérifier la connexion DB
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        ready: true,
        timestamp: new Date().toISOString(),
        service: 'academia-hub-api',
        database: 'connected',
      };
    } catch (error: any) {
      // ✅ Retourner 503 (Service Unavailable) si pas prêt
      throw new HttpException(
        {
          ready: false,
          error: 'Database not available',
          message: error?.message || 'Database connection failed',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

