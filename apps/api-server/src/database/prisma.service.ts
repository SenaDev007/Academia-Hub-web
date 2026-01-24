import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

/**
 * PrismaService avec optimisations de performance
 * 
 * - Connection pooling configuré via DATABASE_URL
 * - Logging des requêtes lentes en développement
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService?: ConfigService) {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      errorFormat: 'pretty',
    });

    // Middleware pour logger les requêtes lentes
    this.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      // Logger les requêtes > 200ms
      if (duration > 200 && process.env.LOG_SLOW_QUERIES === 'true') {
        this.logger.warn(
          `⚠️  SLOW QUERY: ${params.model}.${params.action} took ${duration}ms`,
        );
      }

      return result;
    });
  }

  async onModuleInit() {
    try {
      // ✅ Tenter la connexion
      await this.$connect();
      this.logger.log('✅ Prisma connected with connection pooling');
      
      // ✅ Vérifier la connexion avec un test
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Database connection verified');
    } catch (error: any) {
      this.logger.error('❌ Failed to connect to database', error);
      this.logger.error(`   Error: ${error?.message || 'Unknown error'}`);
      this.logger.error('   Please check:');
      this.logger.error('   - PostgreSQL is running');
      this.logger.error('   - DATABASE_URL is correct in .env');
      this.logger.error('   - Database exists and migrations are applied');
      
      // ✅ En développement, on peut continuer (pour permettre le démarrage)
      // En production, on devrait arrêter l'application
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('❌ Fatal: Database connection required in production');
        process.exit(1);
      } else {
        this.logger.warn('⚠️  Continuing without database (development mode)');
        // L'erreur sera propagée mais l'app peut continuer
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Prisma disconnected');
  }
}
