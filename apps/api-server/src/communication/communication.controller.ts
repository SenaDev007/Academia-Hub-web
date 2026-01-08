import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { AnnouncementStatus } from './entities/announcement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  // Announcements
  @Post('announcements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  createAnnouncement(
    @Body() createDto: CreateAnnouncementDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.communicationService.createAnnouncement(createDto, tenantId, user.id);
  }

  @Get('announcements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  findAllAnnouncements(
    @TenantId() tenantId: string,
    @Body() filters?: { schoolLevelId?: string; status?: AnnouncementStatus },
  ) {
    return this.communicationService.findAllAnnouncements(
      tenantId,
      filters?.schoolLevelId,
      filters?.status,
    );
  }

  @Get('announcements/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  findOneAnnouncement(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.communicationService.findOneAnnouncement(id, tenantId);
  }

  @Patch('announcements/:id/publish')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR)
  publishAnnouncement(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.communicationService.publishAnnouncement(id, tenantId, user.id);
  }

  // Messages
  @Post('messages')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  createMessage(
    @Body() createDto: CreateMessageDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.communicationService.createMessage(createDto, tenantId, user.id);
  }

  @Get('messages')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  findAllMessages(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.communicationService.findAllMessages(tenantId, user.id);
  }

  @Patch('messages/:id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  markAsRead(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.communicationService.markMessageAsRead(id, tenantId, user.id);
  }
}

