import { Type } from 'class-transformer';
import { IsEnum, IsInt } from 'class-validator';

export enum PaymentMethod {
  COD = 'cod',
  FAKE = 'fake',
}

export class CreatePaymentDto {
  @Type(() => Number)
  @IsInt()
  order_id: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}
