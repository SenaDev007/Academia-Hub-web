import { Injectable, NotFoundException } from '@nestjs/common';
import { TeachersRepository } from './teachers.repository';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly teachersRepository: TeachersRepository) {}

  async create(createTeacherDto: CreateTeacherDto, tenantId: string, createdBy?: string): Promise<Teacher> {
    return this.teachersRepository.create({
      ...createTeacherDto,
      tenantId,
      createdBy,
    });
  }

  async findAll(tenantId: string, departmentId?: string, status?: string): Promise<Teacher[]> {
    return this.teachersRepository.findAll(tenantId, departmentId, status);
  }

  async findOne(id: string, tenantId: string): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne(id, tenantId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto, tenantId: string): Promise<Teacher> {
    await this.findOne(id, tenantId);
    return this.teachersRepository.update(id, tenantId, updateTeacherDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.teachersRepository.delete(id, tenantId);
  }
}

