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
    await this.$connect();
    this.logger.log('✅ Prisma connected with connection pooling');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Prisma disconnected');
  }
}
