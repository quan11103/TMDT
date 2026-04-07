import { promo_discount_type, promo_product_scope } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(promo_discount_type)
  discount_type: promo_discount_type;

  @Type(() => Number)
  @ValidateIf((o) => o.discount_type === promo_discount_type.PERCENT)
  @Min(0)
  @Max(100)
  @ValidateIf((o) => o.discount_type === promo_discount_type.FIXED_AMOUNT)
  @Min(0.01)
  discount_value: number;

  @IsEnum(promo_product_scope)
  product_scope: promo_product_scope;

  @ValidateIf((o) => o.product_scope === promo_product_scope.CATEGORY)
  @IsInt()
  @Min(1)
  @Type(() => Number)
  category_id?: number;

  @ValidateIf((o) => o.product_scope === promo_product_scope.PRODUCT)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  product_ids?: number[];

  @Type(() => Date)
  @IsDate()
  starts_at: Date;

  @Type(() => Date)
  @IsDate()
  ends_at: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
