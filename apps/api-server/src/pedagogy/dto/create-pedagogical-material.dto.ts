import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum MaterialCategory {
  BOOK = 'BOOK',
  TEACHER_GUIDE = 'TEACHER_GUIDE',
  OFFICIAL_DOCUMENT = 'OFFICIAL_DOCUMENT',
  DIDACTIC_SUPPORT = 'DIDACTIC_SUPPORT',
  LAB_MATERIAL = 'LAB_MATERIAL',
  OTHER = 'OTHER',
}

export class CreatePedagogicalMaterialDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  schoolLevelId: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
