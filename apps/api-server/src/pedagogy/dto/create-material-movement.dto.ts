import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';

export enum MaterialMovementType {
  PURCHASE = 'PURCHASE',
  ASSIGNMENT = 'ASSIGNMENT',
  RETURN = 'RETURN',
  REPLACEMENT = 'REPLACEMENT',
  DAMAGE = 'DAMAGE',
  DECOMMISSION = 'DECOMMISSION',
}

export class CreateMaterialMovementDto {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsEnum(MaterialMovementType)
  movementType: MaterialMovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
