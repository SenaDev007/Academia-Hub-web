import { IsString, IsDateString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class CreateExamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  examType?: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsString()
  @IsOptional()
  academicYearId?: string;

  @IsString()
  @IsOptional()
  quarterId?: string;

  @IsDateString()
  @IsOptional()
  examDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;

  @IsUUID()
  @IsOptional()
  academicTrackId?: string;
}

