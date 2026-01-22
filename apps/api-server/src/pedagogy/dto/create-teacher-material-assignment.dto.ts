import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';

export enum MaterialCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  USED = 'USED',
  DAMAGED = 'DAMAGED',
}

export class CreateTeacherMaterialAssignmentDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsString()
  @IsNotEmpty()
  schoolLevelId: string;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(MaterialCondition)
  conditionAtIssue: MaterialCondition;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  signed?: boolean;
}
