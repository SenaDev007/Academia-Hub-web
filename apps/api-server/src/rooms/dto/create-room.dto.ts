import { IsString, IsOptional, IsInt, IsArray, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsArray()
  @IsOptional()
  equipment?: any[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

