import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class PreviewCheckoutDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  cart_item_ids: number[];

  @IsOptional()
  @IsString()
  promotion_code?: string;
}
