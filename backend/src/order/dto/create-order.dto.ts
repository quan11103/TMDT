import { IsArray, IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsInt({ each: true })
  cart_item_ids: number[];

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsString()
  note?: string;
}
