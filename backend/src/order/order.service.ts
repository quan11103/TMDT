import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    if (!dto.cart_item_ids?.length)
      throw new BadRequestException('No cart items selected');

    const cartItems = await this.prisma.cart_items.findMany({
      where: {
        user_id: userId,
        id: { in: dto.cart_item_ids },
      },
      include: {
        products: true,
      },
    });

    if (!cartItems.length) throw new BadRequestException('Cart items is empty');

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.products.price),
      0,
    );

    const order = await this.prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
      },
    });

    await this.prisma.order_items.createMany({
      data: cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.products.price,
      })),
    });

    await this.prisma.cart_items.deleteMany({
      where: { id: { in: cartItems.map((item) => item.id) } },
    });

    return order;
  }

  async getMyOrders(userId: number) {
    return this.prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
        payments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
