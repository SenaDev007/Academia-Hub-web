import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsRepository {
  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>,
  ) {}

  async create(roomData: Partial<Room>): Promise<Room> {
    const room = this.repository.create(roomData);
    return this.repository.save(room);
  }

  async findOne(id: string, tenantId: string): Promise<Room | null> {
    return this.repository.findOne({
      where: { id, tenantId },
    });
  }

  async findAll(tenantId: string, type?: string, status?: string): Promise<Room[]> {
    const where: any = { tenantId };
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    return this.repository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async update(id: string, tenantId: string, roomData: Partial<Room>): Promise<Room> {
    await this.repository.update({ id, tenantId }, roomData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }
}

