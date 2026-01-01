import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassesRepository } from './classes.repository';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepository: ClassesRepository) {}

  async create(createClassDto: CreateClassDto, tenantId: string, createdBy?: string): Promise<Class> {
    return this.classesRepository.create({
      ...createClassDto,
      tenantId,
      createdBy,
    });
  }

  async findAll(tenantId: string, academicYearId?: string): Promise<Class[]> {
    return this.classesRepository.findAll(tenantId, academicYearId);
  }

  async findOne(id: string, tenantId: string): Promise<Class> {
    const classEntity = await this.classesRepository.findOne(id, tenantId);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async update(id: string, updateClassDto: UpdateClassDto, tenantId: string): Promise<Class> {
    await this.findOne(id, tenantId);
    return this.classesRepository.update(id, tenantId, updateClassDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.classesRepository.delete(id, tenantId);
  }
}

