import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(auditLogData: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.repository.create(auditLogData);
    return this.repository.save(auditLog);
  }

  async findOne(id: string, tenantId: string): Promise<AuditLog | null> {
    return this.repository.findOne({
      where: { id, tenantId },
    });
  }

  async findAll(tenantId: string, filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    const queryBuilder = this.repository.createQueryBuilder('audit_log')
      .where('audit_log.tenantId = :tenantId', { tenantId })
      .orderBy('audit_log.createdAt', 'DESC');

    if (filters?.userId) {
      queryBuilder.andWhere('audit_log.userId = :userId', { userId: filters.userId });
    }
    if (filters?.resource) {
      queryBuilder.andWhere('audit_log.resource = :resource', { resource: filters.resource });
    }
    if (filters?.action) {
      queryBuilder.andWhere('audit_log.action = :action', { action: filters.action });
    }
    if (filters?.startDate) {
      queryBuilder.andWhere('audit_log.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      queryBuilder.andWhere('audit_log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return queryBuilder.getMany();
  }

  async findByResource(resource: string, resourceId: string, tenantId: string): Promise<AuditLog[]> {
    return this.repository.find({
      where: { resource, resourceId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}

