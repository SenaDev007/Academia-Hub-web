import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Global() // Global pour que PrismaService soit disponible partout
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'academia_hub'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // ✅ Désactivé pour performance (utiliser Prisma migrations)
        logging: false, // ✅ Désactivé pour performance (utiliser Prisma logging si besoin)
        ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService], // Exporter PrismaService pour qu'il soit disponible dans les autres modules
})
export class DatabaseModule {}

