import { Injectable, NotFoundException } from '@nestjs/common';
import { DisciplineRepository } from './discipline.repository';
import { Discipline } from './entities/discipline.entity';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplineService {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async create(createDisciplineDto: CreateDisciplineDto, tenantId: string, createdBy?: string, reportedBy?: string): Promise<Discipline> {
    return this.disciplineRepository.create({
      ...createDisciplineDto,
      tenantId,
      createdBy,
      reportedBy: reportedBy || createdBy,
    });
  }

  async findAll(tenantId: string, studentId?: string, startDate?: Date, endDate?: Date): Promise<Discipline[]> {
    return this.disciplineRepository.findAll(tenantId, studentId, startDate, endDate);
  }

  async findOne(id: string, tenantId: string): Promise<Discipline> {
    const discipline = await this.disciplineRepository.findOne(id, tenantId);
    if (!discipline) {
      throw new NotFoundException(`Discipline record with ID ${id} not found`);
    }
    return discipline;
  }

  async update(id: string, updateDisciplineDto: UpdateDisciplineDto, tenantId: string): Promise<Discipline> {
    await this.findOne(id, tenantId);
    return this.disciplineRepository.update(id, tenantId, updateDisciplineDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.disciplineRepository.delete(id, tenantId);
  }
}

