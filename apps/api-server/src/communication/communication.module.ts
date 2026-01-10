/**
 * ============================================================================
 * COMMUNICATION MODULE - MODULE 6
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CommunicationPrismaService } from './communication-prisma.service';
import { MessagesPrismaService } from './messages-prisma.service';
import { TemplatesPrismaService } from './templates-prisma.service';
import { SchedulingPrismaService } from './scheduling-prisma.service';
import { AutomationPrismaService } from './automation-prisma.service';
import { CommunicationPrismaController } from './communication-prisma.controller';
import { MessagesPrismaController } from './messages-prisma.controller';
import { TemplatesPrismaController } from './templates-prisma.controller';
import { SchedulingPrismaController } from './scheduling-prisma.controller';
import { AutomationPrismaController } from './automation-prisma.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CommunicationPrismaController,
    MessagesPrismaController,
    TemplatesPrismaController,
    SchedulingPrismaController,
    AutomationPrismaController,
  ],
  providers: [
    CommunicationPrismaService,
    MessagesPrismaService,
    TemplatesPrismaService,
    SchedulingPrismaService,
    AutomationPrismaService,
  ],
  exports: [
    CommunicationPrismaService,
    MessagesPrismaService,
    TemplatesPrismaService,
    SchedulingPrismaService,
    AutomationPrismaService,
  ],
})
export class CommunicationModule {}
