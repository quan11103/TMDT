import { IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  cart_item_ids?: number[];
}
