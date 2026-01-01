import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamsRepository } from './exams.repository';
import { Exam } from './entities/exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly examsRepository: ExamsRepository) {}

  async create(createExamDto: CreateExamDto, tenantId: string, createdBy?: string): Promise<Exam> {
    return this.examsRepository.create({
      ...createExamDto,
      tenantId,
      createdBy,
    });
  }

  async findAll(tenantId: string, classId?: string, subjectId?: string, academicYearId?: string): Promise<Exam[]> {
    return this.examsRepository.findAll(tenantId, classId, subjectId, academicYearId);
  }

  async findOne(id: string, tenantId: string): Promise<Exam> {
    const exam = await this.examsRepository.findOne(id, tenantId);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto, tenantId: string): Promise<Exam> {
    await this.findOne(id, tenantId);
    return this.examsRepository.update(id, tenantId, updateExamDto);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.examsRepository.delete(id, tenantId);
  }
}

