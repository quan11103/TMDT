import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllOrders() {
    return await this.prisma.orders.findMany({
      include: {
        users: true,
        order_items: {
          include: {
            products: true,
          },
        },
        payments: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
