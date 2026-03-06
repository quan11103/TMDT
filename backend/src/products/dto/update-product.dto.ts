import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'giá không được âm' })
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  category_id?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'số lượng không được âm' })
  stock?: number;

  // admin có thể ẩn/hiện product
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
