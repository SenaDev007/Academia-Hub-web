import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async create(createRoomDto: CreateRoomDto, tenantId: string, createdBy?: string): Promise<Room> {
    return this.roomsRepository.create({
      ...createRoomDto,
      tenantId,
      createdBy,
    });
  }

  async findAll(tenantId: string, type?: string, status?: string): Promise<Room[]> {
    return this.roomsRepository.findAll(tenantId, type, status);
  }

  async findOne(id: string, tenantId: string): Promise<Room> {
    const room = await this.roomsRepository.findOne(id, tenantId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, tenantId: string): Promise<Room> {
    await this.findOne(id, tenantId);
    return this.roomsRepository.update(id, tenantId, updateRoomDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.roomsRepository.delete(id, tenantId);
  }
}

