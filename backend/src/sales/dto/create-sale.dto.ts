import { sale_apply_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
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

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discount_percent: number;

  @IsEnum(sale_apply_type)
  apply_type: sale_apply_type;

  @ValidateIf((o) => o.apply_type !== sale_apply_type.ALL)
  @IsInt()
  @Min(1)
  @Type(() => Number)
  target_id?: number;

  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
