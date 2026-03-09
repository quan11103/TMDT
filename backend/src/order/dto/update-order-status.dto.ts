import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `Status phải là một trong ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
