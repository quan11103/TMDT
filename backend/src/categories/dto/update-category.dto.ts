import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  parent_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
