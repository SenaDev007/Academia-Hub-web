import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { CommunicationRepository } from './communication.repository';
import { Announcement } from './entities/announcement.entity';
import { Message } from './entities/message.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, Message]),
    AuditLogsModule,
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationRepository],
  exports: [CommunicationService, CommunicationRepository],
})
export class CommunicationModule {}

