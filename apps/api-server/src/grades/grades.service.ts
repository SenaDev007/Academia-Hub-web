import { Injectable, NotFoundException } from '@nestjs/common';
import { GradesRepository } from './grades.repository';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(private readonly gradesRepository: GradesRepository) {}

  async create(createGradeDto: CreateGradeDto, tenantId: string, createdBy?: string): Promise<Grade> {
    return this.gradesRepository.create({
      ...createGradeDto,
      tenantId,
      createdBy,
    });
  }

  async findAll(tenantId: string, studentId?: string, subjectId?: string, classId?: string, quarterId?: string): Promise<Grade[]> {
    return this.gradesRepository.findAll(tenantId, studentId, subjectId, classId, quarterId);
  }

  async findOne(id: string, tenantId: string): Promise<Grade> {
    const grade = await this.gradesRepository.findOne(id, tenantId);
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto, tenantId: string): Promise<Grade> {
    await this.findOne(id, tenantId);
    return this.gradesRepository.update(id, tenantId, updateGradeDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.gradesRepository.delete(id, tenantId);
  }
}

