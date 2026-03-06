import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsNumber()
  @Min(0, { message: 'giá không được âm' })
  price: number;

  @IsInt()
  @Min(1)
  category_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'số lượng không được âm' })
  stock?: number;
}
