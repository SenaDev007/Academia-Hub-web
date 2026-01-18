/**
 * Auth Module
 * 
 * Module d'authentification avec OTP contextuel
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { OtpService } from './services/otp.service';
import { DeviceTrackingService } from './services/device-tracking.service';
import { DeviceSessionService } from './services/device-session.service';
import { SmsService } from './services/sms.service';
import { OtpController } from './controllers/otp.controller';
import { AdminDevicesController } from './controllers/admin-devices.controller';
import { ContextualAuthGuard } from './guards/contextual-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PrismaService,
    SmsService,
    OtpService,
    DeviceTrackingService,
    DeviceSessionService,
    ContextualAuthGuard,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [OtpController, AdminDevicesController],
  exports: [
    SmsService,
    OtpService,
    DeviceTrackingService,
    DeviceSessionService,
    ContextualAuthGuard,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
