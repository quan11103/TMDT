import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const PRODUCT_SORT_VALUES = [
  'newest',
  'price_asc',
  'price_desc',
] as const;
export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(PRODUCT_SORT_VALUES)
  sort?: ProductSort = 'newest';
}
