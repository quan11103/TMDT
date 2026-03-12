import { payment_method } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  order_id: number;

  @IsEnum(payment_method, {
    message: `Phương thức thanh toán phải là ${Object.values(payment_method).join(', ')}`,
  })
  method: payment_method;
}
