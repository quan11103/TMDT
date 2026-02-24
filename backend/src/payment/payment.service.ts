import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto, PaymentMethod } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(dto: CreatePaymentDto) {
    const order = await this.prisma.orders.findUnique({
      where: { id: dto.order_id },
    });

    if (!order) throw new BadRequestException('Order not found');

    const existingPayment = await this.prisma.payments.findFirst({
      where: { order_id: dto.order_id },
    });

    if (existingPayment)
      throw new BadRequestException('Payment already exists for this order');

    const payment = await this.prisma.payments.create({
      data: {
        order_id: dto.order_id,
        method: dto.payment_method,
        amount: order.total_amount,
        status:
          dto.payment_method === PaymentMethod.COD ? 'pending' : 'success',
        paid_at: dto.payment_method === PaymentMethod.FAKE ? new Date() : null,
      },
    });

    if (dto.payment_method === PaymentMethod.FAKE) {
      await this.prisma.orders.update({
        where: { id: dto.order_id },
        data: { status: 'paid' },
      });
    }

    return payment;
  }
}
