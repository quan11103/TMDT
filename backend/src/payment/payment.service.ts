import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto, PaymentMethod } from './dto/create-payment-dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(userId: number, dto: CreatePaymentDto) {
    // check xem don hang co du dieu kien thanh toan khong
    const order = await this.prisma.orders.findFirst({
      where: { user_id: userId, id: dto.order_id },
    });

    if (!order)
      throw new NotFoundException(`Khong tim thay don hang ${dto.order_id}`);

    const payableStatuses = ['PENDING', 'COMFIRMED'];

    if (!payableStatuses.includes(order.status))
      throw new BadRequestException(
        `Khong the thanh toan don hang co trang thai ${order.status}`,
      );
    //Chi thanh toan don hang chua thanh cong
    const existingSuccess = await this.prisma.payments.findFirst({
      where: { status: 'SUCCESS', order_id: order.id },
    });
    if (existingSuccess)
      throw new BadRequestException('Don hang nay da duoc thanh toan');
    // Xu ly don hang theo nhieu phuong thuc
    // if(dto.method === PaymentMethod.COD) return this.handleCOD(order, dto.method);
    // if(dto.method === PaymentMethod.MOMO) return this.handleMoMo(order, dto.method);
    // if(dto.method === PaymentMethod.VNPAY) return this.handleVNPay(order, dto.method);
  }
}
