import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, dto: AddToCartDto) {
    const existingItem = await this.prisma.cart_items.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: dto.product_id,
        },
      },
    });

    if (existingItem) {
      return this.prisma.cart_items.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
        },
      });
    }

    return this.prisma.cart_items.create({
      data: {
        user_id: userId,
        product_id: dto.product_id,
        quantity: dto.quantity,
      },
    });
  }

  async getMyCart(userId: number) {
    return this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }
}
