import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

class BannerOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  @Type(() => Number)
  @IsInt()
  sort_order: number;
}

export class ReorderBannersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BannerOrderItemDto)
  items: BannerOrderItemDto[];
}
