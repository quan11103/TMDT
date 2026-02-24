import { IsString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  price: number;

  @IsInt()
  category_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  stock?: number;
}
