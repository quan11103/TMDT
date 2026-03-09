import { IsEnum, IsInt, Min } from 'class-validator';

export enum PaymentMethod {
  COD = 'cod',
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
}

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  order_id: number;

  @IsEnum(PaymentMethod, {
    message: `Phương thức thanh toán phải là ${Object.values(PaymentMethod).join(', ')}`,
  })
  method: PaymentMethod;
}
