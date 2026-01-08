import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async create(
    createStudentDto: CreateStudentDto,
    tenantId: string,
    schoolLevelId: string,
    createdBy?: string,
  ): Promise<Student> {
    return this.studentsRepository.create({
      ...createStudentDto,
      tenantId,
      schoolLevelId, // OBLIGATOIRE
      createdBy,
    });
  }

  async findAll(tenantId: string, schoolLevelId: string, academicYearId?: string): Promise<Student[]> {
    return this.studentsRepository.findAll(tenantId, schoolLevelId, academicYearId);
  }

  async findOne(id: string, tenantId: string, schoolLevelId: string): Promise<Student> {
    const student = await this.studentsRepository.findOne(id, tenantId, schoolLevelId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    tenantId: string,
    schoolLevelId: string,
  ): Promise<Student> {
    // Verify student belongs to tenant and school level
    await this.findOne(id, tenantId, schoolLevelId);
    return this.studentsRepository.update(id, tenantId, schoolLevelId, updateStudentDto);
  }

  async delete(id: string, tenantId: string, schoolLevelId: string): Promise<void> {
    // Verify student belongs to tenant and school level
    await this.findOne(id, tenantId, schoolLevelId);
    await this.studentsRepository.delete(id, tenantId, schoolLevelId);
  }

  async findByUserId(tenantId: string, userId: string): Promise<Student[]> {
    return this.studentsRepository.findByUserId(tenantId, userId);
  }
}
